import { getCurrentSpan } from "@elysia/opentelemetry";

type CommandHookContext<Input, Output> = {
  input: Input;
  durationMs: number;
  result?: Output;
  error?: unknown;
};

export abstract class Command<Input, Output> {
  protected constructor(private name: string) {}

  abstract handle(data: Input): Promise<Output> | Output;

  protected onSuccess(_context: CommandHookContext<Input, Output>): Promise<void> | void {}

  protected onError(_context: CommandHookContext<Input, Output>): Promise<void> | void {}

  protected onSettled(_context: CommandHookContext<Input, Output>): Promise<void> | void {}

  private createHookContext(data: Input, durationMs: number, result?: Output, error?: unknown) {
    return {
      input: data,
      durationMs,
      ...(result !== undefined ? { result } : {}),
      ...(error !== undefined ? { error } : {}),
    } satisfies CommandHookContext<Input, Output>;
  }

  private async runHook(
    hook: "onSuccess" | "onError" | "onSettled",
    callback: () => Promise<void> | void,
  ) {
    const span = getCurrentSpan();

    span?.addEvent("commandHookCalled", {
      "command.name": this.name,
      "command.hook": hook,
    });

    try {
      await callback();

      span?.addEvent("commandHookCompleted", {
        "command.name": this.name,
        "command.hook": hook,
        "command.success": true,
      });
    } catch (error) {
      span?.recordException(error as Error);
      span?.addEvent("commandHookCompleted", {
        "command.name": this.name,
        "command.hook": hook,
        "command.success": false,
        "command.error": error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  async run(data: Input): Promise<Output> {
    const span = getCurrentSpan();
    const startTime = performance.now();
    const getDurationMs = () => performance.now() - startTime;
    let result: Output | undefined;
    let error: unknown;

    span?.addEvent("commandCalled", {
      "command.name": this.name,
    });

    try {
      result = await this.handle(data);
    } catch (caughtError) {
      error = caughtError;
    }

    if (error === undefined) {
      try {
        await this.runHook("onSuccess", () =>
          this.onSuccess(this.createHookContext(data, getDurationMs(), result)),
        );
      } catch (hookError) {
        error = hookError;
      }
    } else {
      try {
        await this.runHook("onError", () => this.onError({ input: data, error, durationMs: getDurationMs() }));
      } catch {
        // Preserve the original command failure if an error hook also fails.
      }
    }

    try {
      await this.runHook("onSettled", () => this.onSettled(this.createHookContext(data, getDurationMs(), result, error)));
    } catch (hookError) {
      if (error === undefined) {
        error = hookError;
      }
    }

    if (error === undefined) {
      span?.addEvent("commandCompleted", {
        "command.name": this.name,
        "command.success": true,
        "command.duration_ms": getDurationMs(),
      });

      return result as Output;
    }

    if (error instanceof Error) {
      span?.recordException(error);
    }

    span?.addEvent("commandCompleted", {
      "command.name": this.name,
      "command.success": false,
      "command.duration_ms": getDurationMs(),
      "command.error": error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

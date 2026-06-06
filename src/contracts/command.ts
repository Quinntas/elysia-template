import { getCurrentSpan } from "@elysia/opentelemetry";

export abstract class Command<Input, Output> {
  protected constructor(private name: string) {}

  abstract handle(data: Input): Promise<Output> | Output;

  async run(data: Input): Promise<Output> {
    const span = getCurrentSpan();
    const startTime = performance.now();

    span?.addEvent("commandCalled", {
      "command.name": this.name,
    });

    try {
      const result = await this.handle(data);

      span?.addEvent("commandCompleted", {
        "command.name": this.name,
        "command.success": true,
        "command.duration_ms": performance.now() - startTime,
      });

      return result as Output;
    } catch (error) {
      span?.recordException(error as Error);
      span?.addEvent("commandCompleted", {
        "command.name": this.name,
        "command.success": false,
        "command.duration_ms": performance.now() - startTime,
        "command.error": error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}

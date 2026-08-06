import { describe, expect, it } from "bun:test";
import { Command } from "./command";

class SuccessfulCommand extends Command<{ id: string }, { ok: true }> {
  readonly events: string[] = [];

  constructor() {
    super("SuccessfulCommand");
  }

  override handle(_data: { id: string }) {
    this.events.push("handle");
    return { ok: true } as const;
  }

  override onSuccess() {
    this.events.push("onSuccess");
  }

  override onSettled() {
    this.events.push("onSettled");
  }
}

class FailingCommand extends Command<{ id: string }, { ok: true }> {
  readonly events: string[] = [];

  constructor() {
    super("FailingCommand");
  }

  override handle(_data: { id: string }): never {
    this.events.push("handle");
    throw new Error("boom");
  }

  override onError() {
    this.events.push("onError");
  }

  override onSettled() {
    this.events.push("onSettled");
  }
}

describe("Command", () => {
  it("runs success hooks after handle", async () => {
    const command = new SuccessfulCommand();

    await expect(command.run({ id: "1" })).resolves.toEqual({ ok: true });
    expect(command.events).toEqual(["handle", "onSuccess", "onSettled"]);
  });

  it("runs error hooks after a failure and rethrows the original error", async () => {
    const command = new FailingCommand();

    await expect(command.run({ id: "1" })).rejects.toThrow("boom");
    expect(command.events).toEqual(["handle", "onError", "onSettled"]);
  });
});

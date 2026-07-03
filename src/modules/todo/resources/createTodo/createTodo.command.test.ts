import { describe, expect, it } from "bun:test";
import { TodoRepo } from "../../repo/todo.repo";
import { CreateTodoCommand } from "./createTodo.command";

describe("CreateTodoCommand", () => {
  const todo = {
    id: "todo-1",
    title: "Test todo",
    completed: false,
    userId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  it("returns the created todo wrapped in a data object", async () => {
    let receivedInput: Parameters<typeof TodoRepo.createTodo>[0] | undefined;

    const createTodo: typeof TodoRepo.createTodo = async (data) => {
      receivedInput = data;
      return todo;
    };

    const command = new CreateTodoCommand(createTodo);

    const data = await command.handle({ title: "Test todo", userId: "user-1" });

    expect(receivedInput).toEqual({ title: "Test todo", userId: "user-1" });
    expect(data).toEqual({ data: todo });
  });
});

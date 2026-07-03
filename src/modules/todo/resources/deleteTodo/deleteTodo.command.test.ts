import { describe, expect, it } from "bun:test";
import { TodoRepo } from "../../repo/todo.repo";
import { DeleteTodoCommand } from "./deleteTodo.command";

describe("DeleteTodoCommand", () => {
  const todo = {
    id: "todo-1",
    title: "Test todo",
    completed: false,
    userId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  it("returns the deleted todo wrapped in a data object", async () => {
    let receivedInput: Parameters<typeof TodoRepo.deleteTodoById>[0] | undefined;

    const deleteTodoById: typeof TodoRepo.deleteTodoById = async (data) => {
      receivedInput = data;
      return todo;
    };

    const command = new DeleteTodoCommand(deleteTodoById);

    const data = await command.handle({ id: "todo-1", userId: "user-1" });

    expect(receivedInput).toEqual({ id: "todo-1", userId: "user-1" });
    expect(data).toEqual({ data: todo });
  });

  it("throws when the todo does not exist", () => {
    const deleteTodoById: typeof TodoRepo.deleteTodoById = async () => {
      return undefined;
    };

    const command = new DeleteTodoCommand(deleteTodoById);

    return expect(command.handle({ id: "todo-1", userId: "user-1" })).rejects.toMatchObject({
      props: { status: 404 },
    });
  });
});

import { describe, expect, it } from "bun:test";
import { TodoRepo } from "../../repo/todo.repo";
import { UpdateTodoCommand } from "./updateTodo.command";

describe("UpdateTodoCommand", () => {
  const todo = {
    id: "todo-1",
    title: "Updated todo",
    completed: true,
    userId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  it("returns the updated todo wrapped in a data object", async () => {
    let receivedInput: Parameters<typeof TodoRepo.updateTodoById>[0] | undefined;

    const updateTodoById: typeof TodoRepo.updateTodoById = async (data) => {
      receivedInput = data;
      return todo;
    };

    const command = new UpdateTodoCommand(updateTodoById);

    const data = await command.handle({
      id: "todo-1",
      userId: "user-1",
      changes: { title: "Updated todo", completed: true },
    });

    expect(receivedInput).toEqual({
      id: "todo-1",
      userId: "user-1",
      changes: { title: "Updated todo", completed: true },
    });
    expect(data).toEqual({ data: todo });
  });

  it("throws when the todo does not exist", () => {
    const updateTodoById: typeof TodoRepo.updateTodoById = async () => {
      return undefined;
    };

    const command = new UpdateTodoCommand(updateTodoById);

    return expect(
      command.handle({
        id: "todo-1",
        userId: "user-1",
        changes: { title: "Updated todo" },
      }),
    ).rejects.toMatchObject({ props: { status: 404 } });
  });
});

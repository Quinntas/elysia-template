import { describe, expect, it } from "bun:test";
import { GetTodosCommand } from "./getTodos.command";
import { TodoRepo } from "../../repo/todo.repo";

describe("GetTodosCommand", () => {
  const todos = [
    {
      id: "todo-1",
      title: "Test todo",
      completed: false,
      userId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    },
  ];

  it("returns todos wrapped in a data object", async () => {
    let receivedUserId: string | undefined;

    const getTodosByUserId: typeof TodoRepo.getTodosByUserId = async (userId) => {
      receivedUserId = userId;
      return todos;
    };

    const command = new GetTodosCommand(getTodosByUserId);

    const data = await command.handle({ userId: "user-1" });

    expect(receivedUserId).toBe("user-1");
    expect(data).toEqual({ data: todos });
  });
});

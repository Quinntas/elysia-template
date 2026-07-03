import { and, eq } from "drizzle-orm";
import { TodoInsertSchema, TodoSelectSchema, TodoUpdateSchema, todoSchema } from "./todo.schema";
import { db } from "../../../start/db";

export namespace TodoRepo {
  export async function createTodo(data: TodoInsertSchema) {
    const [todo] = await db.insert(todoSchema).values(data).returning();
    return todo;
  }

  export async function getTodosByUserId(userId: string) {
    return db.select().from(todoSchema).where(eq(todoSchema.userId, userId));
  }

  export async function updateTodoById(data: {
    id: string;
    userId: string;
    changes: TodoUpdateSchema;
  }): Promise<TodoSelectSchema | undefined> {
    const [todo] = await db
      .update(todoSchema)
      .set(data.changes)
      .where(and(eq(todoSchema.id, data.id), eq(todoSchema.userId, data.userId)))
      .returning();

    return todo;
  }

  export async function deleteTodoById(data: {
    id: string;
    userId: string;
  }): Promise<TodoSelectSchema | undefined> {
    const [todo] = await db
      .delete(todoSchema)
      .where(and(eq(todoSchema.id, data.id), eq(todoSchema.userId, data.userId)))
      .returning();

    return todo;
  }
}

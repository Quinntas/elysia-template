import { eq } from "drizzle-orm";
import { todoSchema } from "./todo.schema";
import { db } from "../../../start/db";

export namespace TodoRepo {
  export async function getTodosByUserId(userId: string) {
    return db.select().from(todoSchema).where(eq(todoSchema.userId, userId));
  }
}

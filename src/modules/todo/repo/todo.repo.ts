import { eq } from "drizzle-orm";
import { Repo } from "../../../contracts/repo";
import { todoSchema } from "./todo.schema";

export class TodoRepo extends Repo {
  getTodosByUserId(userId: string) {
    return this.db.select().from(todoSchema).where(eq(todoSchema.userId, userId));
  }
}

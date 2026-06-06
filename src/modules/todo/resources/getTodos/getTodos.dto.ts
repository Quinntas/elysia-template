import type { Static } from "@sinclair/typebox";
import { selectTodoSchema } from "../../repo/todo.schema";

export interface GetTodosInput {
  userId: string;
}

export interface GetTodosOutput {
  data: Static<typeof selectTodoSchema>[];
}

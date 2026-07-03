import type { Static } from "@sinclair/typebox";
import { selectTodoSchema } from "../../repo/todo.schema";

export interface DeleteTodoInput {
  id: string;
  userId: string;
}

export interface DeleteTodoOutput {
  data: Static<typeof selectTodoSchema>;
}

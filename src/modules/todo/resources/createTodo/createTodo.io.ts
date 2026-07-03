import type { Static } from "@sinclair/typebox";
import { selectTodoSchema } from "../../repo/todo.schema";

export interface CreateTodoInput {
  title: string;
  userId: string;
}

export interface CreateTodoOutput {
  data: Static<typeof selectTodoSchema>;
}

import type { Static } from "typebox";
import { selectTodoSchema, TodoUpdateSchema } from "../../repo/todo.schema";

export interface UpdateTodoInput {
  id: string;
  userId: string;
  changes: TodoUpdateSchema;
}

export interface UpdateTodoOutput {
  data: Static<typeof selectTodoSchema>;
}

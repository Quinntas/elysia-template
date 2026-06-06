import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";

import { users } from "../../auth/repo/auth.schema";
import { baseColumns } from "../../shared/repo/baseColumns";
import { createSelectSchema } from "drizzle-typebox";

export const todoSchema = pgTable(
  "todos",
  {
    ...baseColumns(),
    title: text("title").notNull(),
    completed: boolean("completed").default(false).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("todos_userId_idx").on(table.userId)],
);

export const selectTodoSchema = createSelectSchema(todoSchema);

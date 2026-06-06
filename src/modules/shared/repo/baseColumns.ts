import { text, timestamp } from "drizzle-orm/pg-core";

export const baseColumns = () => {
  return {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  };
};

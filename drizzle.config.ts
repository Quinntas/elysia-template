import { defineConfig } from "drizzle-kit";
import { env } from "./src/start/env";

export default defineConfig({
  out: "./migrations",
  schema: ["./src/modules/**/**/repo/*.schema.ts", "./src/modules/**/repo/*.schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});

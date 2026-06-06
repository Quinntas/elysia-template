import { instrumentDrizzle } from "@kubiks/otel-drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DrizzleCache } from "../adapters/drizzleCache";
import { cache } from "./cache";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(instrumentDrizzle(pool), { cache: new DrizzleCache(cache) });

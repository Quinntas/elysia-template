import dotenv from "dotenv";
import { Static, Type } from "@sinclair/typebox";
import { Parse } from "@sinclair/typebox/value";

dotenv.config();

export const envSchema = Type.Object({
  DATABASE_URL: Type.String({ minLength: 1 }),
  REDIS_URL: Type.String({ minLength: 1 }),
});

export type Env = Static<typeof envSchema>;

export const env = Parse(envSchema, {
  DATABASE_URL: process.env["DATABASE_URL"],
  REDIS_URL: process.env["REDIS_URL"],
});

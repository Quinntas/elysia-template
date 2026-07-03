import { Redis } from "../adapters/redis";
import { env } from "./env";

export const cache = new Redis(env.REDIS_URL);

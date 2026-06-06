import { Redis } from "../adapters/redis";

export const cache = new Redis(process.env.REDIS_URL!);

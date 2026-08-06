import { Cache } from "../contracts/cache";
import { Redis as IORedis } from "ioredis";

export class Redis extends Cache {
  private readonly clientInstance: IORedis;

  get client(): IORedis {
    return this.clientInstance;
  }

  constructor(url: string) {
    super();
    this.clientInstance = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  get(key: string): Promise<string | null> {
    return this.clientInstance.get(key);
  }

  async set(
    key: string,
    value: number | string | Record<PropertyKey, unknown>,
    expiresIn: number = 3600,
  ): Promise<void> {
    let val;

    switch (typeof value) {
      case "number":
      case "string":
        val = value;
        break;
      case "object":
        val = JSON.stringify(value);
        break;
      default:
        throw new Error("Invalid value type");
    }

    await this.clientInstance.set(key, val, "EX", expiresIn);
  }

  async delete(key: string): Promise<void> {
    await this.clientInstance.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.clientInstance.keys(pattern);
  }
}

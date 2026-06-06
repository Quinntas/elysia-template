import { Cache } from "../contracts/cache";
import { Redis as IORedis } from "ioredis";

export class Redis extends Cache {
  private readonly _client: IORedis;

  get client(): IORedis {
    return this._client;
  }

  constructor(url: string) {
    super();
    this._client = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  get(key: string): Promise<string | null> {
    return this._client.get(key);
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

    await this._client.set(key, val, "EX", expiresIn);
  }

  async delete(key: string): Promise<void> {
    await this._client.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this._client.keys(pattern);
  }
}

import { type Tracer, trace } from "@opentelemetry/api";
import { getTableName, is, Table } from "drizzle-orm";
import { safeJsonStringifyWithAnyPrimitive } from "../utils/jsonStringy.utils";
import { Cache } from "../contracts/cache";

export type CacheConfig = {
  /** expire time, in seconds */
  ex?: number;
  /** expire time, in milliseconds */
  px?: number;
  /** Unix time (sec) at which the key will expire */
  exat?: number;
  /** Unix time (ms) at which the key will expire */
  pxat?: number;
  /** retain existing TTL when updating a key */
  keepTtl?: boolean;
  /** options for HEXPIRE (hash-field TTL) */
  hexOptions?: "NX" | "XX" | "GT" | "LT" | "nx" | "xx" | "gt" | "lt";
};

export class DrizzleCache {
  private readonly tracer: Tracer;
  private globalTtl: number = 60;
  // This object will be used to store which query keys were used
  // for a specific table, so we can later use it for invalidation.
  private usedTablesPerKey: Record<string, string[]> = {};

  constructor(private readonly cache: Cache) {
    this.tracer = trace.getTracer("drizzle-cache");
  }

  // For the strategy, we have two options:
  // - 'explicit': The cache is used only when .$withCache() is added to a query.
  // - 'all': All queries are cached globally.
  // The default behavior is 'explicit'.
  strategy(): "explicit" | "all" {
    return "all";
  }

  // This function accepts query and parameters that cached into key param,
  // allowing you to retrieve response values for this query from the cache.
  async get(key: string): Promise<unknown[] | undefined> {
    return this.tracer.startActiveSpan(
      "drizzle.cache.get",
      {
        attributes: {
          key,
        },
      },
      async (span) => {
        const res = await this.cache.get(key);
        span.setAttribute("hit", !!res);
        span.end();
        return res ? JSON.parse(res) : undefined;
      },
    );
  }

  // This function accepts several options to define how cached data will be stored:
  // - 'key': A hashed query and parameters.
  // - 'response': An array of values returned by Drizzle from the database.
  // - 'tables': An array of tables involved in the select queries. This information is needed for cache invalidation.
  //
  // For example, if a query uses the "users" and "posts" tables, you can store this information. Later, when the app executes
  // any mutation statements on these tables, you can remove the corresponding key from the cache.
  // If you're okay with eventual consistency for your queries, you can skip this option.
  async put(
    key: string,
    response: unknown,
    tables: string[],
    isTag: boolean,
    config?: CacheConfig,
  ): Promise<void> {
    await this.tracer.startActiveSpan(
      "drizzle.cache.put",
      {
        attributes: {
          key,
          isTag,
          tables: safeJsonStringifyWithAnyPrimitive(tables) ?? "null",
          config: safeJsonStringifyWithAnyPrimitive(config) ?? "null",
        },
      },
      async (span) => {
        const ttl = config?.ex ?? (config?.px ? Math.ceil(config.px / 1000) : this.globalTtl);

        await this.cache.set(key, JSON.stringify(response), ttl);

        for (const table of tables) {
          const keys = this.usedTablesPerKey[table];
          if (keys === undefined) {
            this.usedTablesPerKey[table] = [key];
          } else {
            keys.push(key);
          }
        }
        span.end();
      },
    );
  }

  // This function is called when insert, update, or delete statements are executed.
  // You can either skip this step or invalidate queries that used the affected tables.
  //
  // The function receives an object with two keys:
  // - 'tags': Used for queries labeled with a specific tag, allowing you to invalidate by that tag.
  // - 'tables': The actual tables affected by the insert, update, or delete statements,
  //   helping you track which tables have changed since the last cache update.
  async onMutate(params: {
    tags: string | string[];
    tables: string | string[] | Table<never> | Table<never>[];
  }): Promise<void> {
    await this.tracer.startActiveSpan(
      "drizzle.cache.onMutate",
      {
        attributes: {
          tags: safeJsonStringifyWithAnyPrimitive(params.tags) ?? "null",
        },
      },
      async (span) => {
        const tagsArray = params.tags
          ? Array.isArray(params.tags)
            ? params.tags
            : [params.tags]
          : [];
        const tablesArray = params.tables
          ? Array.isArray(params.tables)
            ? params.tables
            : [params.tables]
          : [];

        const keysToDelete = new Set<string>();

        for (const table of tablesArray) {
          const tableName = is(table, Table) ? getTableName(table) : (table as string);
          const keys = this.usedTablesPerKey[tableName] ?? [];
          for (const key of keys) keysToDelete.add(key);
        }

        span.setAttribute("keysToDelete", keysToDelete.size);

        if (keysToDelete.size > 0 || tagsArray.length > 0) {
          for (const tag of tagsArray) {
            await this.cache.delete(tag);
          }

          for (const key of keysToDelete) {
            await this.cache.delete(key);
          }

          for (const table of tablesArray) {
            const tableName = is(table, Table) ? getTableName(table) : (table as string);
            this.usedTablesPerKey[tableName] = [];
          }
        }
        span.end();
      },
    );
  }
}

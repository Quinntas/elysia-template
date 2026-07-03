export type CacheTypes = number | string | Record<PropertyKey, unknown>;

export abstract class Cache {
  abstract get(key: string): Promise<string | null>;

  abstract set(key: string, value: CacheTypes, expiresIn: number): Promise<void>;

  abstract delete(key: string): Promise<void>;

  abstract keys(pattern: string): Promise<string[]>;

  async it<T extends CacheTypes>(
    key: string,
    handler: () => Promise<T>,
    expiresIn: number = 3600,
    deserializer: (value: string) => T = JSON.parse,
    serializer: (value: T) => string = JSON.stringify,
  ) {
    const value = await this.get(key);

    if (value) return deserializer(value);

    const newValue = await handler();

    await this.set(key, serializer(newValue), expiresIn);

    return newValue;
  }
}

type CacheMethodThis = { constructor: { name: string } };
type CacheMethodSignature<Args extends unknown[], Return extends CacheTypes> = (
  ...args: Args
) => Promise<Return>;

export function CacheMethod(cache: Cache, expiresIn: number = 3600, keyPrefix?: string) {
  return <Args extends unknown[], Return extends CacheTypes>(
    target: CacheMethodThis,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<CacheMethodSignature<Args, Return>>,
  ) => {
    const originalMethod = descriptor.value;

    if (!originalMethod) {
      throw new Error(`Missing method descriptor for ${propertyKey}`);
    }

    descriptor.value = async function (this: CacheMethodThis, ...args: Args): Promise<Return> {
      const className = target.constructor.name;
      const argsKey = args.map((arg) => JSON.stringify(arg)).join(",");
      const prefix = keyPrefix ? `${keyPrefix}.` : "";
      const key = `${prefix}${className}.${propertyKey}.${argsKey}`;

      return cache.it(key, () => originalMethod.apply(this, args), expiresIn);
    };
  };
}

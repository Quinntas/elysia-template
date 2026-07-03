export function safeJsonStringify(obj: unknown) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return null;
  }
}

export function safeJsonStringifyWithAnyPrimitive(prim: unknown) {
  switch (typeof prim) {
    case "object":
      return safeJsonStringify(prim);
    case "string":
    case "number":
      return prim;
    case "undefined":
      return null;
    case "boolean":
      return String(prim);
    default:
      return null;
  }
}

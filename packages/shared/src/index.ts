export function isObject(value): value is Record<any, any> {
  return typeof value === "object" && value !== null;
}

export function isFunction(value): value is Function {
  return typeof value === "function";
}

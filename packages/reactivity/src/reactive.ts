import { isObject } from "@wowowo-vue/shared";
import { mutableHandlers } from "./baseHandler";
import { ReactiveFlags } from "./constants";

const reactiveMap = new WeakMap();

function createReactiveObject(target) {
  if (!isObject(target)) return target;
  if (target[ReactiveFlags.IS_REACTIVE]) return target;
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target) {
  return createReactiveObject(target);
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

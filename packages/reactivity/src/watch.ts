import {
  isArray,
  isMap,
  isSet,
  isFunction,
  isObject,
  isPlainObject,
} from "@wowowo-vue/shared";
import { isRef } from "./ref";
import { isReactive } from "./reactive";
import { ReactiveEffect } from "./effect";

type WatchCallback<V = any, OV = any> = (
  value: V,
  oldValue: OV,
  onCleanup: (cleanupFn: () => void) => void,
) => any;

interface WatchOptions {
  immediate?: boolean;
  deep?: boolean | number;
}

export function watch(
  source: object | Function,
  cb?: WatchCallback,
  options: WatchOptions = {},
) {
  const { immediate, deep } = options;

  const reactiveGetter = (source: object) => {
    if (deep) return source;
    if (deep === false || deep === 0) return traverse(source, 1);
    return traverse(source);
  };

  let effect: ReactiveEffect;
  let getter: () => any;

  if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source);
  } else if (isFunction(source)) {
    if (cb) {
      getter = source as () => any;
    }
  }

  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = () => traverse(baseGetter(), depth);
  }

  let oldValue;

  const job = () => {
    if (cb) {
      const newValue = effect.run();
      cb(newValue, oldValue, () => {});
      oldValue = newValue;
    } else {
      effect.run();
    }
  };

  effect = new ReactiveEffect(getter, job);
  if (cb) {
    if (immediate) job();
    else oldValue = effect.run();
  } else effect.run();
}

function traverse(
  value: unknown,
  depth: number = Infinity,
  seen?: Map<unknown, number>,
): unknown {
  if (depth <= 0 || !isObject(value)) return value;

  seen = seen || new Map();
  if ((seen.get(value) || 0) >= depth) return value;
  seen.set(value, depth);
  depth--;

  if (isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
  }

  return value;
}

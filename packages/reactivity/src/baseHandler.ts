import { isObject } from "@wowowo-vue/shared";
import { reactive } from "./reactive";
import { track, trigger } from "./reactiveEffect";

export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true;
    track(target, key);
    const value = Reflect.get(target, key, receiver);
    return isObject(value) ? reactive(value) : value;
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) trigger(target, key, value, oldValue);
    return result;
  },
};

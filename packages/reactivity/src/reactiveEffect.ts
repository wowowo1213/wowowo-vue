import { activeEffect, trackEffect, triggerEffects } from "./effect";

const targetMap = new WeakMap(); // 存放依赖收集的关系

export const createDep = (cleanup: Function, key: String) => {
  const dep = new Map() as any;
  // cleanup函数用于清理不需要的属性
  dep.cleanup = cleanup;
  // 这边给个key，我们方便清晰的看到结构，但是源码没有，我们主要为了调试
  dep.wowowo_my_key = key;
  return dep;
};

export function track(target, key) {
  // activeEffect 存在，说明需要收集，没有的话说明这个key是在effect外访问的，不用收集
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));

  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));

  // 将activeEffect放入dep中，后续可以根据值的变化触发dep中的activeEffect
  trackEffect(activeEffect, dep);
}

export function trigger(target, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) triggerEffects(dep);
}

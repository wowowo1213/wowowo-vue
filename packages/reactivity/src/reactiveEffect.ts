import { activeSub, trackEffect, triggerEffects } from "./effect";

const targetMap = new WeakMap();

export const createDep = (cleanup: Function, key: String) => {
  const dep = new Map() as any;
  dep.cleanup = cleanup;
  return dep;
};

export function track(target, key) {
  if (!activeSub) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));

  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)));

  trackEffect(activeSub, dep);
}

export function trigger(target, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) triggerEffects(dep);
}

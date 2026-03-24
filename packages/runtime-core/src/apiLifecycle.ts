import {
  currentInstance,
  setCurrentInstance,
  unsetCurrentInstance,
} from "./component";

export enum LifecycleHooks {
  BEFORE_MOUNT = "bm",
  MOUNTED = "m",
  BEFORE_UPDATE = "bu",
  UPDATED = "u",
  BEFORE_UNMOUNT = "bum",
  UNMOUNTED = "um",
  DEACTIVATED = "da",
  ACTIVATED = "a",
}

export function injectHook(type: LifecycleHooks, hook: Function, target) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrapHook = () => {
      setCurrentInstance(currentInstance);
      hook.call(target);
      unsetCurrentInstance();
    };
    hooks.push(wrapHook);
  }
}

function createHook(lifecycle: LifecycleHooks) {
  return (hook, target = currentInstance) => {
    injectHook(lifecycle, (...args: unknown[]) => hook(...args), target);
  };
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);
export const onBeforeUnmount = createHook(LifecycleHooks.BEFORE_UNMOUNT);
export const onUnmounted = createHook(LifecycleHooks.UNMOUNTED);

export function invokerArray(fns) {
  for (const fn of fns) {
    fn();
  }
}

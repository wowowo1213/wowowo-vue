import { isObject } from '@wowowo-vue/shared';
import { ReactiveFlags, mutableHandlers } from './baseHandler';

// 根据对象target记录代理后的结果proxy，然后复用
// 这样的话我们调用 reactive 这个函数的时候，传入一个相同的obj的地址时
// 我们直接返回缓存的结果，而不是new一个对象
const reactiveMap = new WeakMap();

function createReactiveObject(target) {
  // 因为还有shallowReactive
  // 所以到这边统一判断是不是对象
  if (!isObject(target)) return target;
  // 这边传入的target是一个被代理的对象的时候，我们这边会触发get，因为访问了属性
  // 这个解决方法很巧妙啊
  if (target[ReactiveFlags.IS_REACTIVE]) return target;
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target) {
  return createReactiveObject(target);
}

// ref中使用
export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

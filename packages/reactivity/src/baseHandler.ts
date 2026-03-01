import { isObject } from "@wowowo-vue/shared";
import { reactive } from "./reactive";
import { track, trigger } from "./reactiveEffect";

// 这个用来判断当我们的target是一个reactive的时候(proxy)直接返回target
export enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) return true;

    // 这边处理effect中的属性依赖收集
    // 收集这个对象上的key属性，和effect关联在一起
    track(target, key);

    // return target[key]; 这个是错误的，不完善，vue3的响应式原理笔记有写过
    // 因为这样当我们访问这个target里的某个get函数的时候，这个函数里面可能依赖了this.a这个属性
    // 然后我们通过Reflect.get就能实现到receiver获取到这个a这个key，触发更新，因为会再次触发proxy的get
    // 不然的话target[key]只会触发get函数这一个的key对应的视图更新
    // 当用户修改a的时候，那么这个get函数对应的视图是不会更新的
    const value = Reflect.get(target, key, receiver);
    // 这边如果key对应的值是一个对象的话，那么再次调用reactive
    // 这边是懒代理，只有访问这个属性的时候才会被代理，一开始不会无脑递归
    return isObject(value) ? reactive(value) : value;
  },
  set(target, key, value, receiver) {
    // 在set函数中找到属性，让对应的effect执行
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    // 需要触发更新
    if (oldValue !== value) trigger(target, key, value, oldValue);

    // 返回true表示set成功，不然会报错
    // 而Reflect.set自身返回的就是布尔值
    return result;
  },
};

// packages/shared/src/index.ts
var isObject = (val) => val !== null && typeof val === "object";

// packages/reactivity/src/effect.ts
var activeEffect;
function preCleanEffect(effect2) {
  effect2._depsLength = 0;
  effect2._trackId++;
}
function postCleanEffect(effect2) {
  if (effect2.deps.length > effect2._depsLength) {
    for (let i = effect2._depsLength; i < effect2.deps.length; i++) {
      cleanDepEffect(effect2.deps[i], effect2);
    }
    effect2.deps.length = effect2._depsLength;
  }
}
var ReactiveEffect = class {
  // public 表示把属性放到实例上
  // fn为用户编写的函数
  // scheduler为fn中依赖的数据发生变化后调用的更新函数，用来更新视图
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    // 用于记录当前effect执行次数，方便进行deps中的dep去除
    this._trackId = 0;
    // 用于保证deps的添加顺序，也就是索引值
    this._depsLength = 0;
    // 这个_running用来判断是否正在运行
    this._running = 0;
    // 用于记录存放的依赖
    this.deps = [];
    // active表示是否设置effect是响应式的
    this.active = true;
  }
  run() {
    if (!this.active) return this.fn();
    let lastEffect = activeEffect;
    try {
      activeEffect = this;
      preCleanEffect(this);
      this._running++;
      return this.fn();
    } finally {
      this._running--;
      postCleanEffect(this);
      activeEffect = lastEffect;
    }
  }
  // effect.stop方法停止所有的effect，不参加响应式处理
  stop() {
    this.active = false;
  }
};
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  runner();
  if (options) Object.assign(_effect, options);
  return runner;
}
function cleanDepEffect(dep, effect2) {
  dep.delete(effect2);
  if (dep.size === 0) dep.cleanup();
}
function trackEffect(effect2, dep) {
  if (dep.get(effect2) === effect2._trackId) return;
  dep.set(effect2, effect2._trackId);
  const oldDep = effect2.deps[effect2._depsLength];
  if (oldDep !== dep) {
    if (oldDep) cleanDepEffect(oldDep, effect2);
    effect2.deps[effect2._depsLength++] = dep;
  } else {
    effect2._depsLength++;
  }
}
function triggerEffects(dep) {
  for (const effect2 of dep.keys()) {
    if (!effect2.scheduler || effect2._running) return;
    effect2.scheduler();
  }
}

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
var createDep = (cleanup, key) => {
  const dep = /* @__PURE__ */ new Map();
  dep.cleanup = cleanup;
  dep.wowowo_my_key = key;
  return dep;
};
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, dep = createDep(() => depsMap.delete(key), key));
  trackEffect(activeEffect, dep);
}
function trigger(target, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) triggerEffects(dep);
}

// packages/reactivity/src/baseHandler.ts
var mutableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) return true;
    track(target, key);
    const value = Reflect.get(target, key, receiver);
    return isObject(value) ? reactive(value) : value;
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) trigger(target, key, value, oldValue);
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function createReactiveObject(target) {
  if (!isObject(target)) return target;
  if (target["__v_isReactive" /* IS_REACTIVE */]) return target;
  if (reactiveMap.has(target)) return reactiveMap.get(target);
  const proxy = new Proxy(target, mutableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
function reactive(target) {
  return createReactiveObject(target);
}
function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

// packages/reactivity/src/ref.ts
function ref(value) {
  return createRef(value);
}
function createRef(value) {
  return new RefImpl(value);
}
var RefImpl = class {
  // 用来收集对应的dep
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.__v_isRef = true;
    this._value = toReactive(rawValue);
  }
  get value() {
    return this._value;
  }
  set value(newValue) {
    if (newValue === this.rawValue) return;
    this.rawValue = newValue;
    this._value = newValue;
  }
};
export {
  activeEffect,
  effect,
  reactive,
  ref,
  toReactive,
  trackEffect,
  triggerEffects
};
//# sourceMappingURL=reactivity.js.map

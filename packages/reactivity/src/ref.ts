import { toReactive } from "./reactive";
import { activeSub, trackEffect, triggerEffects } from "./effect";
import { createDep } from "./reactiveEffect";
import { ReactiveFlags } from "./constants";

declare const RefSymbol: unique symbol;

export interface Ref<T = any, S = T> {
  get value(): T;
  set value(_: S);
  [RefSymbol]: true;
}

export function isRef(r: any): r is Ref {
  return r && r[ReactiveFlags.IS_REF];
}

class RefImpl {
  public readonly [ReactiveFlags.IS_REF] = true;
  public _value;
  public dep;
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (newValue === this.rawValue) return;
    this.rawValue = newValue;
    this._value = newValue;
    triggerRefValue(this);
  }
}

export function ref(value) {
  return createRef(value);
}

function createRef(value) {
  return new RefImpl(value);
}

export function trackRefValue(ref) {
  if (activeSub)
    trackEffect(
      activeSub,
      (ref.dep = createDep(() => (ref.dep = undefined), "undefined")),
    );
}

export function triggerRefValue(ref) {
  const dep = ref.dep;
  if (dep) triggerEffects(dep);
}

class ObjectRefImpl {
  public __v_isRef = true;
  constructor(
    public _object,
    public _key,
  ) {}
  get value() {
    return this._object[this._key];
  }
  set value(newValue) {
    if (this._object[this._key] === newValue) return;
    this._object[this._key] = newValue;
  }
}

export function toRef(object, key) {
  return new ObjectRefImpl(object, key);
}

export function toRefs(object) {
  const res = {};
  for (let key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) continue;
    res[key] = toRef(object, key);
  }
  return res;
}

export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target, key, receiver) {
      const r = Reflect.get(target, key, receiver);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if (oldValue.__v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    },
  });
}

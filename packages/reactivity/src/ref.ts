import { toReactive } from "./reactive";
import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { createDep } from "./reactiveEffect";

class RefImpl {
  public __v_isRef = true; // 增加ref标识
  public _value; // 用来保存ref的值
  public dep; // 用来收集对应的dep
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

function trackRefValue(ref) {
  if (activeEffect)
    trackEffect(
      activeEffect,
      (ref.dep = createDep(() => (ref.dep = undefined), "undefined")),
    );
}

function triggerRefValue(ref) {
  const dep = ref.dep;
  if (dep) triggerEffects(dep);
}

class ObjectRefImpl {
  public __v_isRef = true; // 增加ref标识
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

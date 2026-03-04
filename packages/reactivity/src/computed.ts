import { ReactiveEffect } from "./effect";
import { isFunction } from "@wowowo-vue/shared";

class ComputedRefImpl {
  public _value;
  public effect;
  constructor(
    getter,
    public setter,
  ) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {},
    );
  }
  get value() {
    return this.effect.run();
  }
  set value(v) {
    this.setter(v);
  }
}

export function computed(getterOrOptions) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}

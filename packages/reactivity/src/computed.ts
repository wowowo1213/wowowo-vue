import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";
import { isFunction } from "@wowowo-vue/shared";

class ComputedRefImpl {
  public _value;
  public effect;
  public dep;
  constructor(
    getter,
    public setter,
  ) {
    this.effect = new ReactiveEffect(
      () => getter(this._value),
      () => {
        triggerRefValue(this);
      },
    );
  }
  get value() {
    if (this.effect.dirty) {
      this._value = this.effect.run();
      trackRefValue(this);
    }
    return this._value;
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

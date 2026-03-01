import { toReactive } from './reactive';

export function ref(value) {
  return createRef(value);
}

function createRef(value) {
  return new RefImpl(value);
}

class RefImpl {
  public __v_isRef = true; // 增加ref标识
  public _value; // 用来保存ref的值
  public dep; // 用来收集对应的dep
  constructor(public rawValue) {
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
}

import { isObject } from "@wowowo-vue/shared";

export default function patchStyle(
  el: HTMLElement,
  prevValue: unknown,
  nextValue: unknown,
) {
  if (isObject(nextValue)) {
    const style = el.style;
    for (const key in nextValue) {
      style[key] = nextValue[key];
    }
    if (isObject(prevValue)) {
      for (const key in prevValue) {
        if (nextValue[key] == null) style[key] = null;
      }
    }
  }
}

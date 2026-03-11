export default function patchStyle(
  el: HTMLElement,
  prevValue: unknown,
  nextValue: unknown,
) {
  if (typeof nextValue !== "object") return;
  const style = el.style;
  for (const key in nextValue) {
    style[key] = nextValue[key];
  }
  if (prevValue && typeof prevValue === "object") {
    for (const key in prevValue) {
      if (nextValue[key] == null) style[key] = null;
    }
  }
}

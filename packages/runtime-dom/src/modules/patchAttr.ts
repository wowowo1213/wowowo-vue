export default function patchAttr(
  el: HTMLElement,
  key: string,
  value: unknown,
) {
  if (value) el.removeAttribute(key);
  else if (typeof value === "string") el.setAttribute(key, value);
}

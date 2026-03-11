export default function patchAttr(
  el: HTMLElement,
  key: string,
  value: string | null,
) {
  if (value == null) el.removeAttribute(key);
  else if (typeof value === "string") el.setAttribute(key, value);
}

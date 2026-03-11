export default function patchClass(el: HTMLElement, value: unknown) {
  if (value == null) el.removeAttribute("class");
  else if (typeof value === "string") el.className = value;
}

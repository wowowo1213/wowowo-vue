function createInvoker(value) {
  const invoker = (e) => invoker.value(e);
  invoker.value = value;
  return invoker;
}

export default function patchEvent(
  el: HTMLElement,
  name: string,
  nextValue: unknown,
) {
  const invokers = el._vei || (el._vei = {});
  const existingInvoker = invokers[name];
  const eventName = name.slice(2).toLowerCase();

  if (nextValue) {
    if (existingInvoker) {
      existingInvoker.value = nextValue;
    } else {
      const invoker = (invokers[name] = createInvoker(nextValue));
      el.addEventListener(eventName, invoker);
    }
  } else if (existingInvoker) {
    el.removeEventListener(eventName, existingInvoker);
    invokers[name] = undefined;
  }
}

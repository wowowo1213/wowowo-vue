import { hasOwn, isFunction, ShapeFlags } from "@wowowo-vue/shared";
import { reactive, proxyRefs } from "@wowowo-vue/reactivity";

export function createInstance(vnode) {
  const instance = {
    data: null,
    vnode,
    render: null,
    subTree: null,
    isMounted: false,
    update: null,
    propsOption: vnode.type.props,
    props: {},
    attrs: {},
    slots: {},
    proxy: null,
    next: null,
    setupState: null,
  };
  return instance;
}

function initProps(instance, rawProps) {
  const props = {};
  const attrs = {};
  const propsOption = instance.propsOption || {};
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      if (key in propsOption) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }
  instance.props = reactive(props);
  instance.attrs = attrs;
}

function initSlots(instance, children) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children;
  }
}

const publicProperty = {
  $attrs: (instance) => instance.attrs,
  $slots: (instance) => instance.slots,
};

const handler = {
  get(target, key) {
    const { data, props, setupState } = target;
    if (data && hasOwn(data, key)) {
      return data[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    } else if (setupState && hasOwn(setupState, key)) {
      return setupState[key];
    }
    const getter = publicProperty[key];
    if (getter) {
      return getter(target);
    }
  },
  set(target, key, value) {
    const { data, props, setupState } = target;
    if (data && hasOwn(data, key)) {
      data[key] = value;
    } else if (props && hasOwn(props, key)) {
      console.error("props are readonly");
      return false;
    } else if (setupState && hasOwn(setupState, key)) {
      setupState[key] = value;
    }
    return true;
  },
};

export function setupComponent(instance) {
  const { vnode } = instance;
  initProps(instance, vnode.props);
  initSlots(instance, vnode.children);
  instance.proxy = new Proxy(instance, handler);
  let { data, render, setup } = vnode.type;
  if (setup) {
    const setupContext = {};
    const setupResult = setup(instance.props, setupContext);
    if (isFunction(setupResult)) {
      instance.render = setupResult;
    } else {
      instance.setupState = proxyRefs(setupResult);
    }
  }
  if (!isFunction(data)) {
    console.warn("data must be a function");
    data = () => {};
  }
  instance.data = reactive(data.call(instance.proxy));
  if (!instance.render) instance.render = render;
}

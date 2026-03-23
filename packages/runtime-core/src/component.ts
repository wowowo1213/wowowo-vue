import { hasOwn, isFunction } from "@wowowo-vue/shared";
import { reactive } from "@wowowo-vue/reactivity";

export function createInstance(vnode) {
  const instance = {
    data: null,
    vnode,
    render: null,
    subTree: null,
    isMounted: false,
    update: null,
    component: null,
    propsOption: vnode.type.props,
    props: {},
    attrs: {},
    proxy: null,
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

const publicProperty = {
  $attrs: (instance) => instance.attrs,
};

const handler = {
  get(target, key) {
    const { data, props } = target;
    if (data && hasOwn(data, key)) {
      return data[key];
    } else if (props && hasOwn(props, key)) {
      return props[key];
    }
    const getter = publicProperty[key];
    if (getter) {
      return getter(target);
    }
  },
  set(target, key, value) {
    const { data, props } = target;
    if (data && hasOwn(data, key)) {
      data[key] = value;
    } else if (props && hasOwn(props, key)) {
      console.error("props are readonly");
      return false;
    }
    return true;
  },
};

export function setupComponent(instance) {
  const { vnode } = instance;
  initProps(instance, vnode.props);
  instance.proxy = new Proxy(instance, handler);
  let { data, render } = vnode.type;
  if (!isFunction(data)) {
    console.warn("data must be a function");
    data = () => {};
  }
  instance.data = reactive(data.call(instance.proxy));
  instance.render = render;
}

import { isObject, isString, ShapeFlags } from "@wowowo-vue/shared";

export const Text = Symbol("text");
export const Fragment = Symbol("Fragment");

export function isVNode(value: any) {
  return value ? value.__v_isVNode === true : false;
}

export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}

export function createVnode(
  type: string | null,
  props?,
  children?: string | object | null,
) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
      ? ShapeFlags.STATEFUL_COMPONENT
      : 0;
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    key: props?.key,
    el: null,
    component: null,
    shapeFlag,
  };

  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else if (isObject(children)) {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
    } else {
      children = String(children);
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
  }

  return vnode;
}

import { isString, ShapeFlags } from "@wowowo-vue/shared";

export function isVNode(value: any) {
  return value ? value.__v_isVNode === true : false;
}

export function createVnode(
  type: string | null,
  props?,
  children?: string | object | null,
) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    key: props?.key,
    el: null,
    shapeFlag,
  };

  if (children) {
    if (Array.isArray(children)) {
      vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children);
      vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
  }

  return vnode;
}

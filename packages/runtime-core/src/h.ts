import { isString, ShapeFlags } from "@wowowo-vue/shared";

export function h(type, propsOrChildren?, children?) {}

function createVnode(type: string | null, props, children) {
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
    }
  }

  return vnode;
}

import { ShapeFlags } from "@wowowo-vue/shared";
import { isSameVNodeType } from "./createVnode";

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    patchProp: hostPatchProp,
  } = renderOptions;

  function render(vnode, container) {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    }
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  }

  function unmount(vnode) {
    hostRemove(vnode.el);
  }

  function patch(n1, n2, container) {
    if (n1 == n2) return;

    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1);
      n1 = null;
    }

    processElement(n1, n2, container);
  }

  function processElement(n1, n2, container) {
    if (n1 === null) mountElement(n2, container);
    else patchElement(n1, n2, container);
  }

  function mountElement(vnode, container) {
    const { type, children, props, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) hostSetElementText(el, children);
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) mountChildren(children, el);

    hostInsert(el, container);
  }

  function mountChildren(children: Array<unknown>, container: Node) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  }

  function patchElement(n1, n2, container) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, container);
  }

  function patchProps(oldProps, newProps, el) {
    for (const key in newProps) {
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  }

  function patchChildren(n1, n2, container) {}

  return {
    render,
  };
}

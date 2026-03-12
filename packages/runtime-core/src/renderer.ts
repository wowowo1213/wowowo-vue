import { ShapeFlags } from "@wowowo-vue/shared";

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
    patch(container._vnode || null, vnode, container);
    container._vnode = vnode;
  }

  function patch(n1, n2, container) {
    if (n1 == n2) return;
    if (n1 === null) mountElement(n2, container);
  }

  function mountElement(vnode, container) {
    const { type, children, props, shapeFlags } = vnode;
    const el = hostCreateElement(type);

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) hostSetElementText(el, children);
    else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN)
      mountChildren(children, el);

    hostInsert(el, container);
  }

  function mountChildren(children: Array<unknown>, container: Node) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container);
    }
  }

  return {
    render,
  };
}

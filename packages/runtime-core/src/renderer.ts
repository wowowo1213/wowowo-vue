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
    else patchElement(n1, n2);
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

  function mountChildren(children: Array<unknown>, el: Node) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el);
    }
  }

  function patchElement(n1, n2) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, el);
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

  function patchChildren(n1, n2, el) {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1, c2, el);
      } else {
        if (c1) hostSetElementText(el, "");
        mountChildren(c2, el);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      } else if (c1) {
        hostSetElementText(el, "");
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      unmount(child);
    }
  }

  function patchKeyedChildren(c1, c2, el) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
  }

  return {
    render,
  };
}

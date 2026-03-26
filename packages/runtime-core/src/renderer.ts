import { ShapeFlags, PatchFlags } from "@wowowo-vue/shared";
import { isSameVNodeType, Text, Fragment } from "./createVnode";
import getSequence from "./seq";
import { ReactiveEffect } from "@wowowo-vue/reactivity";
import { queueJob } from "./scheduler";
import { createInstance, setupComponent } from "./component";
import { invokerArray } from "./apiLifecycle";

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
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
    } else {
      patch(container._vnode || null, vnode, container);
      container._vnode = vnode;
    }
  }

  function unmount(vnode) {
    const { shapeFlag } = vnode;
    if (vnode.type === Fragment) unmountChildren(vnode.children);
    else if (shapeFlag & ShapeFlags.COMPONENT) {
      unmount(vnode.component.subTree);
    } else hostRemove(vnode.el);
  }

  function patch(n1, n2, container, anchor = null) {
    if (n1 == n2) return;

    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1);
      n1 = null;
    }

    const { type, shapeFlag } = n2;
    if (type === Text) processText(n1, n2, container);
    if (type === Fragment) processFragment(n1, n2, container);
    else {
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(n1, n2, container, anchor);
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        processComponent(n1, n2, container, anchor);
      }
    }
  }

  function processText(n1, n2, container) {
    if (n1 == null) {
      n2.el = hostCreateText(n2.children);
      hostInsert(n2.el, container);
    } else {
      const el = (n2.el = n1.el);
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children);
      }
    }
  }

  function processFragment(n1, n2, container) {
    if (n1 == null) {
      mountChildren(n2.children, container);
    } else {
      patchChildren(n1, n2, container);
    }
  }

  function processComponent(n1, n2, container, anchor) {
    if (n1 == null) {
      mountComponent(n2, container, anchor);
    } else {
      updateComponent(n1, n2);
    }
  }

  function mountComponent(vnode, container, anchor) {
    const instance = (vnode.component = createInstance(vnode));
    setupComponent(instance);
    setupRenderEffect(instance, container, anchor);
  }

  function setupRenderEffect(instance, container, anchor) {
    const { render } = instance;
    const componentUpdateFn = () => {
      const { bm, m } = instance;
      if (!instance.isMounted) {
        if (bm) {
          invokerArray(bm);
        }

        const subTree = render.call(instance.proxy, instance.proxy);
        patch(null, subTree, container, anchor);
        instance.isMounted = true;
        instance.subTree = subTree;

        if (m) {
          invokerArray(m);
        }
      } else {
        const { next, bu, u } = instance;
        if (next) {
          updateComponentPreRender(instance, next);
        }

        if (bu) {
          invokerArray(bu);
        }

        const subTree = render.call(instance.proxy, instance.proxy);
        patch(instance.subTree, subTree, container, anchor);
        instance.subTree = subTree;

        if (u) {
          invokerArray(u);
        }
      }
    };
    const effect = new ReactiveEffect(componentUpdateFn, () =>
      queueJob(update),
    );
    const update = (instance.update = () => effect.run());
    update();
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldComponentUpdate(n1, n2)) {
      instance.next = n2;
      instance.update();
    }
  }

  function shouldComponentUpdate(n1, n2) {
    const { props: prevProps, children: prevChildren } = n1;
    const { props: nextProps, children: nextChildren } = n2;
    if (prevChildren || nextChildren) return true;
    if (prevProps === nextProps) return false;
    return hasPropsChange(prevProps, nextProps);
  }

  function updateComponentPreRender(instance, next) {
    instance.next = null;
    instance.vnode = next;
    updateProps(instance, instance.props, next.props);
  }

  function updateProps(instance, prevProps, nextProps) {
    if (hasPropsChange(prevProps, nextProps)) {
      for (const key in nextProps) {
        instance.props[key] = nextProps[key];
      }
      for (const key in instance.props) {
        if (!(key in nextProps)) delete instance.props[key];
      }
    }
  }

  function hasPropsChange(prevProps, nextProps) {
    const key1 = Object.keys(prevProps);
    const key2 = Object.keys(nextProps);
    if (key1.length !== key2.length) return true;
    for (const key of key2) {
      if (prevProps[key] !== nextProps[key]) return true;
    }
    return false;
  }

  function processElement(n1, n2, container, anchor) {
    if (n1 === null) mountElement(n2, container, anchor);
    else patchElement(n1, n2, anchor);
  }

  function mountElement(vnode, container, anchor) {
    const { type, children, props, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) hostSetElementText(el, children);
    else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) mountChildren(children, el);

    hostInsert(el, container, anchor);
  }

  function mountChildren(children: Array<unknown>, el: Node) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el);
    }
  }

  function patchElement(n1, n2, anchor) {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const { patchFlag, dynamicChildren } = n2;
    if (patchFlag) {
      if (patchFlag & PatchFlags.TEXT) {
        if (n1.children !== n2.children) hostSetElementText(el, n2.children);
      } else if (patchFlag & PatchFlags.STYLE) {
      }
    } else {
      patchProps(oldProps, newProps, el);
    }

    if (dynamicChildren) {
      patchBlockChildren(n1, n2, el, anchor);
    } else {
      patchChildren(n1, n2, el);
    }
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

    if (i > e1 && i <= e2) {
      const nextPos = e2 + 1;
      const anchor = c2[nextPos]?.el;
      while (i <= e2) {
        patch(null, c2[i], el, anchor);
        i++;
      }
    } else if (i > e2 && i <= e1) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }

    let s1 = i;
    let s2 = i;
    const keyToNewIndexMap = new Map();
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldMapIndex = new Array(toBePatched).fill(0);

    for (let i = s2; i <= e2; i++) {
      const vnode = c2[i];
      keyToNewIndexMap.set(vnode.key, i);
    }
    for (let i = s1; i <= e1; i++) {
      const vnode = c1[i];
      const newIndex = keyToNewIndexMap.get(vnode.key);
      if (newIndex === undefined) {
        unmount(vnode);
      } else {
        newIndexToOldMapIndex[newIndex - s2] = i + 1;
        patch(vnode, c2[newIndex], el);
      }
    }

    let increasingSeq = getSequence(newIndexToOldMapIndex);
    let j = increasingSeq.length - 1;
    for (let i = toBePatched - 1; i >= 0; i--) {
      const newIndex = s2 + i;
      const anchor = c2[newIndex + 1]?.el;
      const vnode = c2[newIndex];
      if (!vnode.el) {
        patch(null, vnode, el, anchor);
      } else {
        if (i === increasingSeq[j]) j--;
        else hostInsert(vnode.el, el, anchor);
      }
    }
  }

  function patchBlockChildren(n1, n2, el, anchor) {
    for (let i = 0; i < n2.dynamicChildren.length; i++) {
      patch(n1.dynamicChildren[i], n2.dynamicChildren[i], el, anchor);
    }
  }

  return {
    render,
  };
}

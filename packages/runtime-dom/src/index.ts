import { nodeOps } from "./nodeOps";
import patchProp from "./patchProp";
import { createRenderer } from "@wowowo-vue/runtime-core";

const renderOptions = Object.assign({ patchProp }, nodeOps);
export const render = (vnode: object, container: Node) => {
  return createRenderer(renderOptions).render(vnode, container);
};

export * from "@wowowo-vue/runtime-core";
export * from "@wowowo-vue/reactivity";

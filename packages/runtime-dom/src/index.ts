export * from "@wowowo-vue/reactivity";

import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const renderOptions = Object.assign(nodeOps, patchProp);
function createRenderer(options) {}

// createRenderer(renderOptions).render();

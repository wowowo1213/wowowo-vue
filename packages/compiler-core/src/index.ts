import { NodeTypes } from "./ast";

export function parse(template) {
  const context = createPsrseContext(template);
  return createRoot(parseChildren(context));
}

function createPsrseContext(content) {
  return {
    originalSource: content,
    source: content,
    line: 1,
    column: 1,
    offset: 0,
  };
}

function parseChildren(context) {
  const nodes = [];
  while (!isEnd(context)) {
    const c = context.source;
    let node;
    if (c.startsWith("{{")) {
      node = "表达式";
    } else if (c[0] === "<") {
      node = "元素";
    } else {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}

function isEnd(context) {
  return !context.source;
}

function parseText(context) {
  const tokens = ["<", "{{"];
  let endIndex = context.source.length;
  for (let i = 0; i < tokens.length; i++) {
    const index = context.source.indexOf(tokens[i], 1);
    if (index !== -1 && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context, endIndex) {
  const content = context.source.slice(0, endIndex);
  advanceBy(context, endIndex);
  return content;
}

function advanceBy(context, endIndex) {
  const c = context.source;
}

function createRoot(children) {
  return {
    type: NodeTypes.ROOT,
    children,
  };
}

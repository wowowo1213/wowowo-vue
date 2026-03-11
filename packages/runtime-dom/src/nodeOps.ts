export const nodeOps = {
  insert(el: Node, parent: Node, ancher: Node | null) {
    parent.insertBefore(el, ancher || null);
  },
  remove(el: Node) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  },
  createElement(type: string) {
    return document.createElement(type);
  },
  createText(text: string) {
    return document.createTextNode(text);
  },
  createComment(comment: string) {
    return document.createComment(comment);
  },
  setText(node: Node, text: string) {
    node.nodeValue = text;
  },
  setElementText(el: Node, text: string) {
    el.textContent = text;
  },
  parentNode(node: Node) {
    return node.parentNode;
  },
  nextSibling(node: Node) {
    return node.nextSibling;
  },
};

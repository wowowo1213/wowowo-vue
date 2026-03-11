export const nodeOps = {
  insert(el: HTMLElement, parent: HTMLElement, ancher: HTMLElement) {
    parent.insertBefore(el, ancher || null);
  },
  remove(el: HTMLElement) {
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
  setText(node: HTMLElement, text: string) {
    node.nodeValue = text;
  },
  setElementText(el: HTMLElement, text: string) {
    el.textContent = text;
  },
  parentNode(node: HTMLElement) {
    return node.parentNode;
  },
  nextSibling(node: HTMLElement) {
    return node.nextSibling;
  },
};

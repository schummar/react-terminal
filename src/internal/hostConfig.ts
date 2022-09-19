import { HostConfig } from 'react-reconciler';
import { ParagraphProps, TextProps } from '../elements';

export type Node = TextElement | ParagraphElement | Text;
export type TextElement = { type: 'textElement'; children: Node[]; props: TextProps };
export type ParagraphElement = { type: 'paragraphElement'; children: Node[]; props: ParagraphProps };
export type Text = { type: 'text'; text: string };

export const createHostConfig = (
  update: () => void,
): HostConfig<
  string,
  TextProps | ParagraphProps,
  TextElement | ParagraphElement,
  TextElement | ParagraphElement,
  Text,
  TextElement | ParagraphElement,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  ReturnType<typeof setTimeout>,
  unknown
> => ({
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  noTimeout: undefined,
  isPrimaryRenderer: false,

  getRootHostContext: () => null,
  prepareForCommit: () => null,
  resetAfterCommit: update,
  getChildHostContext: () => null,

  // Handle paragraph nodes
  createInstance: (type, props) => {
    switch (type) {
      case 'rterm-text':
        return { type: 'textElement', children: [], props: { ...props, children: undefined } };

      case 'rterm-paragraph':
        return { type: 'paragraphElement', children: [], props: { ...props, children: undefined } };

      default:
        throw Error(`Unknown type: ${type}`);
    }
  },
  shouldSetTextContent: () => false,
  prepareUpdate: () => true,
  commitUpdate: (node, _payload, _type, _prev, props) => {
    node.props = { ...props, children: undefined };
  },

  // Handle text nodes
  createTextInstance: (text) => {
    return { type: 'text', text };
  },
  commitTextUpdate: (textNode, _old, text) => {
    textNode.text = text;
  },

  // Append
  appendInitialChild: (parent, child) => {
    parent.children.push(child);
  },
  appendChild: (parent, child) => {
    parent.children.push(child);
  },
  removeChild: (parent, child) => {
    parent.children = parent.children.filter((x) => x !== child);
  },
  appendChildToContainer: (container, child) => {
    container.children.push(child);
  },
  removeChildFromContainer: (container, child) => {
    container.children = container.children.filter((x) => x !== child);
  },
  insertBefore: (parent, child, before) => {
    const index = parent.children.indexOf(before);
    parent.children.splice(index, 0, child);
  },
  finalizeInitialChildren: () => false,
  clearContainer: (container) => {
    container.children.length = 0;
  },

  getPublicInstance: function (instance) {
    return instance;
  },
  preparePortalMount: function () {
    throw new Error('Function not implemented.');
  },
  scheduleTimeout: function (fn: (...args: unknown[]) => unknown, delay?: number | undefined) {
    return setTimeout(fn, delay);
  },
  cancelTimeout: function (id) {
    clearTimeout(id);
  },

  getCurrentEventPriority: function () {
    throw new Error('Function not implemented.');
  },
  getInstanceFromNode: function () {
    throw new Error('Function not implemented.');
  },
  beforeActiveInstanceBlur: function (): void {
    throw new Error('Function not implemented.');
  },
  afterActiveInstanceBlur: function (): void {
    throw new Error('Function not implemented.');
  },
  prepareScopeUpdate: function () {
    throw new Error('Function not implemented.');
  },
  getInstanceFromScope: function () {
    throw new Error('Function not implemented.');
  },
  detachDeletedInstance: function () {
    // ignore
  },
});

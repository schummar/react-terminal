import type { ReactNode } from 'react';
import Reconciler from 'react-reconciler';
import { TextProps } from './elements';
import { createHostConfig, ParagraphElement } from './internal/hostConfig';
import { stringWriter } from './internal/stringWriter';
import { TerminalWriter, TerminalWriterTarget } from './internal/terminalWriter';
export * from 'xterm-headless';
export { Paragraph, Text } from './elements';
export type { ParagraphProps, TextProps } from './elements';

export interface RenderOptions {
  target?: TerminalWriterTarget;
}

export const createRoot = ({ target }: RenderOptions = {}) => {
  const root: ParagraphElement = { type: 'paragraphElement', children: [], props: {} };
  const terminalWriter = new TerminalWriter(root, target);
  const hostConfig = createHostConfig(() => terminalWriter.render());
  const reconciler = Reconciler(hostConfig);
  const container = (reconciler.createContainer as any)(root, 0, false, null);

  const unmount = () => {
    reconciler.updateContainer(null, container, null, null);
  };

  const stop = () => {
    terminalWriter.stop();
  };

  const writeLine = (text: string, options?: TextProps) => {
    terminalWriter.writeLine(text, options);
  };

  const render = (component: ReactNode) => {
    reconciler.updateContainer(component, container, null);

    return () => {
      stop();
      unmount();
    };
  };

  return { render, unmount, stop, writeLine };
};

export const render = (component: ReactNode, options?: RenderOptions) => {
  const root = createRoot(options);
  return root.render(component);
};

export const renderToString = (component: ReactNode, width = Infinity) => {
  const root: ParagraphElement = { type: 'paragraphElement', children: [], props: {} };
  const hostConfig = createHostConfig(() => undefined);
  const reconciler = Reconciler(hostConfig);
  const container = (reconciler.createContainer as any)(root, 0, false, null);

  reconciler.updateContainer(component, container, null);
  const result = stringWriter(root, width);
  reconciler.updateContainer(null, container, null, null);

  return result;
};

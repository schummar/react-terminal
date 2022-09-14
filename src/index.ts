import type { ReactNode } from 'react';
import Reconciler from 'react-reconciler';
import { createHostConfig, ParagraphElement } from './internal/hostConfig';
import { TerminalWriter } from './internal/terminalWriter';
export { Paragraph, Text } from './elements';
export type { ParagraphProps, TextProps } from './elements';

export const render = (component: ReactNode) => {
  const root: ParagraphElement = { type: 'paragraphElement', children: [], props: {} };
  const terminalWriter = new TerminalWriter(root);
  const hostConfig = createHostConfig(() => terminalWriter.render());

  const reconciler = Reconciler(hostConfig);
  const container = (reconciler.createContainer as any)(root, 0, false, null);
  reconciler.updateContainer(component, container, null);
};

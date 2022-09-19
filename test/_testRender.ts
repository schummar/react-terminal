import { ReactNode } from 'react';
import ReactReconciler from 'react-reconciler';
import { createHostConfig, ParagraphElement } from '../src/internal/hostConfig';

export function testRender(component: ReactNode) {
  const root: ParagraphElement = { type: 'paragraphElement', children: [], props: {} };
  const hostConfig = createHostConfig(() => undefined);
  const reconciler = ReactReconciler(hostConfig);
  const container = (reconciler.createContainer as any)(root, 0, false, null);

  reconciler.updateContainer(component, container, null);
  return root;
}

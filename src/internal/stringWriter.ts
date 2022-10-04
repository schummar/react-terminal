import { calcLines } from './calcLines';
import { Node } from './hostConfig';

export function stringWriter(node: Node, width: number) {
  const lines = calcLines(node, '', width);
  return lines.join('\n');
}

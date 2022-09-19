import { Node } from './hostConfig';
import { layoutNode } from './layoutNode';
import { PNode, prepareNode } from './prepareNode';

export const calcLines = (node: Node, additionalLines: string, width = process.stdout.columns): string[] => {
  const prepared = prepareNode(node);

  if (additionalLines.length > 0) {
    prepared.push(
      ...additionalLines.split('\n').map<PNode>((line) => ({
        content: line,
        width: 0,
        grow: 0,
        shrink: 0,
        ellipsis: false,
        margin: [0, 0, 0, 0],
        maxLines: Infinity,
      })),
    );
  }

  return prepared.flatMap((prepared) => layoutNode(prepared, width));
};

import { Node } from './hostConfig';
import { layoutNode } from './layoutNode';
import { prepareNode } from './prepareNode';

export const calcLines = (node: Node, additionalLines: string, width = process.stdout.columns): string[] => {
  const prepared = prepareNode(node);
  return prepared.flatMap((prepared) => layoutNode(prepared, width));

  // if (additionalLines) {
  //   paragraphs.push({
  //     marginLeft: 0,
  //     marginRight: 0,
  //     open: false,
  //     content: additionalLines,
  //     width: stringWidth(additionalLines),
  //     grow: 0,
  //     shrink: 0,
  //   });
  // }

  // return paragraphs.flatMap((p) => {
  //   return wrapAnsi(p, cols, { hard: true, trim: false })
  //     .split('\n')
  //     .map((line) => ''.padEnd(p.marginLeft ?? 0, ' ') + line);
  // });
};

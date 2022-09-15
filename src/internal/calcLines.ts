import stringWidth from 'string-width';
import wrapAnsi from 'wrap-ansi';
import { calcParagraph } from './calcParagraphs';
import { Node } from './hostConfig';
import { layoutChunk } from './layoutChunk';

export const calcLines = (node: Node, additionalLines: string): string[] => {
  const paragraphs = calcParagraph(node);
  paragraphs.push({
    marginLeft: 0,
    marginRight: 0,
    open: false,
    content: additionalLines,
    width: stringWidth(additionalLines),
    grow: 0,
    shrink: 0,
  });

  const lines = paragraphs.flatMap((p) => {
    const cols = process.stdout.columns - p.marginLeft - p.marginRight;
    // const forceWidth = (cols > p.width && p.grow) || (cols < p.width && p.shrink) ? cols : undefined;

    const text = layoutChunk(p, cols);
    return wrapAnsi(text, cols, { hard: true, trim: false })
      .split('\n')
      .map((line) => ''.padEnd(p.marginLeft, ' ') + line);
  });

  if (node.type === 'paragraphElement') {
    return lines.slice(-(node.props.maxLines ?? 0));
  }

  return lines;
};

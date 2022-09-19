import sliceAnsi from 'slice-ansi';
import stringWidth from 'string-width';
import wrapAnsi from 'wrap-ansi';
import { sum } from './helpers';
import { PNode } from './prepareNode';

export const layoutNode = (node: PNode, maxWidth: number): string[] => {
  maxWidth -= node.margin[1] + node.margin[3];
  let paragraphs;

  if (typeof node.content === 'string') {
    paragraphs = [node.content];
  } else if (node.inline) {
    const children = node.content.map((child) => ({ ...child, delta: 0, max: 0 }));

    if (node.width !== maxWidth) {
      const prop = maxWidth > node.width ? 'grow' : 'shrink';
      const layoutNodes = children.filter((child) => child[prop]);

      if (layoutNode.length > 0) {
        let delta = Math.abs(maxWidth - node.width);
        const divisor = sum(layoutNodes.map((child) => child[prop])) / delta;

        for (const child of layoutNodes) {
          child.max = prop === 'grow' ? Infinity : child.width;
          child.delta = Math.min(Math.floor((child[prop] ?? 0) / divisor), child.max);
          delta -= child.delta;
        }

        for (; delta > 0; delta--) {
          let max;

          for (const child of layoutNodes) {
            const quotient = child.delta === child.max ? 0 : (child[prop] ?? 0) / (child.delta + 1);

            if (quotient > (max?.quotient ?? 0)) {
              max = { quotient, child };
            }
          }

          if (max) {
            max.child.delta++;
          }
        }

        if (prop === 'shrink') {
          for (const child of layoutNodes) {
            child.delta *= -1;
          }
        }
      }
    }

    paragraphs = [children.map((child) => layoutNode(child, child.width + child.delta)[0]).join('')];
  } else {
    paragraphs = node.content.flatMap((child) => layoutNode(child, maxWidth));
  }

  paragraphs = paragraphs.flatMap((p) => {
    const width = stringWidth(p);

    if (maxWidth < width && node.shrink) {
      if (node.ellipsis) {
        p = sliceAnsi(p, 0, Math.max(maxWidth - 3, 0)) + ''.padEnd(Math.min(maxWidth, 3), '.');
      } else {
        p = sliceAnsi(p, 0, maxWidth);
      }
    } else if (maxWidth > width && node.grow) {
      p = p + ''.padEnd(maxWidth - width, ' ');
    }

    return wrapAnsi(p, maxWidth, { hard: true, trim: false })
      .split('\n')
      .map((line) => (line.length ? ''.padEnd(node.margin[3], ' ') + line : line));
  });

  paragraphs = paragraphs.slice(-node.maxLines);
  paragraphs.unshift(...Array(node.margin[0]).fill(''));
  paragraphs.push(...Array(node.margin[2]).fill(''));

  return paragraphs;
};

import sliceAnsi from 'slice-ansi';
import stringWidth from 'string-width';
import wrapAnsi from 'wrap-ansi';
import { sum } from './helpers';
import { PNode } from './prepareNode';

function withDefaults(node: PNode): PNode & Required<Omit<PNode, 'inline'>> {
  return {
    content: node.content,
    inline: node.inline,
    width: node.width ?? 0,
    grow: node.grow ?? 0,
    fill: node.fill ?? ' ',
    shrink: node.shrink ?? 0,
    ellipsis: node.ellipsis ?? false,
    margin: node.margin ?? [0, 0, 0, 0],
    maxLines: node.maxLines ?? Infinity,
    prefix: node.prefix ?? '',
  };
}

export const layoutNode = (_node: PNode, maxWidth: number): string[] => {
  const node = withDefaults(_node);

  maxWidth -= node.margin[1] + node.margin[3] + stringWidth(node.prefix);
  let paragraphs;

  if (typeof node.content === 'string') {
    paragraphs = [node.content];
  } else if (node.inline) {
    const children = node.content.map((child) => ({ ...withDefaults(child), delta: 0, max: 0 }));

    if (maxWidth !== Infinity && maxWidth !== 0 && node.width !== maxWidth) {
      const prop = maxWidth > node.width ? 'grow' : 'shrink';
      const layoutNodes = children.filter((child) => child[prop]);

      if (layoutNodes.length > 0) {
        let delta = Math.abs(maxWidth - node.width);
        const divisor = sum(layoutNodes.map((child) => child[prop])) / delta;

        for (const child of layoutNodes) {
          child.max = prop === 'grow' ? Infinity : child.width;
          child.delta = Math.min(Math.floor(child[prop] / divisor), child.max);
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

    if (maxWidth !== Infinity && maxWidth !== 0 && maxWidth < width && node.shrink) {
      if (node.ellipsis) {
        p = sliceAnsi(p, 0, Math.max(maxWidth - 3, 0)) + ''.padEnd(Math.min(maxWidth, 3), '.');
      } else {
        p = sliceAnsi(p, 0, maxWidth);
      }
    } else if (maxWidth !== Infinity && maxWidth !== 0 && maxWidth > width && node.grow) {
      p = p + ''.padEnd(maxWidth - width, node.fill);
    }

    return wrapAnsi(p, maxWidth, { hard: true, trim: false })
      .split('\n')
      .map((line) => node.prefix + (line.length ? ''.padEnd(node.margin[3], ' ') + line : line));
  });

  paragraphs = paragraphs.slice(-node.maxLines);
  paragraphs.unshift(...Array(node.margin[0]).fill(''));
  paragraphs.push(...Array(node.margin[2]).fill(''));

  return paragraphs;
};

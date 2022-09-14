import sliceAnsi from 'slice-ansi';
import stringWidth from 'string-width';
import { Chunk } from './paragraph';

const sum = (arr: number[]) => arr.reduce((sum, cur) => sum + cur, 0);

export const layoutChunk = (chunk: Chunk, maxWidth?: number): string => {
  let text;

  if (typeof chunk.content === 'string') {
    text = chunk.content;
  } else {
    const children = chunk.content.map((child) => ({ ...child, diff: 0, max: 0 }));

    if (maxWidth !== undefined && chunk.width !== maxWidth && typeof chunk.content !== 'string') {
      const prop = maxWidth > chunk.width ? 'grow' : 'shrink';
      if (children.some((child) => child[prop])) {
        let diff = Math.abs(maxWidth - chunk.width);

        const divisor = sum(children.map((child) => child[prop])) / diff;

        for (const child of children) {
          child.max = prop === 'grow' ? Infinity : child.width;
          child.diff = Math.min(Math.floor(child[prop] / divisor), child.max);
          diff -= child.diff;
        }

        for (; diff > 0; diff--) {
          let max;

          for (const child of children) {
            const quotient = child.diff === child.max ? 0 : child[prop] / (child.diff + 1);
            if (quotient > (max?.quotient ?? 0)) {
              max = { quotient, child };
            }
          }

          if (max) {
            max.child.diff++;
          }
        }

        if (prop === 'shrink') {
          for (const child of children) {
            child.diff *= -1;
          }
        }
      }
    }

    text = children.map((child) => layoutChunk(child, child.width + child.diff)).join('');
  }

  const width = stringWidth(text);

  if (maxWidth !== undefined && maxWidth < width && chunk.shrink) {
    if (chunk.ellipsis) {
      text = sliceAnsi(text, 0, Math.max(maxWidth - 3, 0)) + ''.padEnd(Math.min(maxWidth, 3), '.');
    } else {
      text = sliceAnsi(text, 0, maxWidth);
    }
  } else if (maxWidth !== undefined && maxWidth > width && chunk.grow) {
    text = text + ''.padEnd(maxWidth - width, ' ');
  }

  return text;
};

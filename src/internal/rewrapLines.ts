import wrapAnsi from 'wrap-ansi';

export const rewrapLines = (lines: string[], width: number) => {
  return lines.flatMap((line) => {
    return wrapAnsi(line, width, { hard: true, trim: false }).split('\n');
  });
};

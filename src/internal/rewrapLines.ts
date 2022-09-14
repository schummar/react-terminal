import wrapAnsi from 'wrap-ansi';

export const rewrapLines = (lines: string[]) => {
  return lines.flatMap((line) => {
    return wrapAnsi(line, process.stdout.columns, { hard: true, trim: false }).split('\n');
  });
};

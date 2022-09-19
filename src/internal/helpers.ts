export const sum = (arr: (number | undefined)[]) => arr.reduce<number>((sum, cur) => sum + (cur ?? 0), 0);

import type { ForegroundColorName, ModifierName } from 'chalk';
import { ReactNode } from 'react';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'rterm-text': TextProps;
      'rterm-paragraph': ParagraphProps;
    }
  }
}

export type TextProps = {
  children?: ReactNode;
  color?: ForegroundColorName;
  backgroundColor?: ForegroundColorName;
  grow?: boolean | number;
  fill?: string;
  shrink?: boolean | number;
  ellipsis?: boolean;
} & {
  [K in ModifierName]?: boolean;
};

export type ParagraphProps = TextProps & {
  margin?: number | [number, number] | [number, number, number] | [number, number, number, number];
  maxLines?: number;
};

export function Text(props: TextProps) {
  return <rterm-text {...props} />;
}

export function Paragraph(props: ParagraphProps) {
  return <rterm-paragraph {...props} />;
}

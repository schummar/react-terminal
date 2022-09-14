import type { ForegroundColor, Modifiers } from 'chalk';
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
  color?: ForegroundColor;
  backgroundColor?: ForegroundColor;
  grow?: boolean | number;
  shrink?: boolean | number;
  ellipsis?: boolean;
} & {
  [K in Modifiers]?: boolean;
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

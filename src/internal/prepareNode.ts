import chalk, { ForegroundColorName, ModifierName } from 'chalk';
import stringWidth from 'string-width';
import { ParagraphProps, TextProps } from '../elements';
import { sum } from './helpers';
import { Node } from './hostConfig';

export type PNode = {
  content: string | PNode[];
  format?: (s: string) => string;
  inline?: {
    l: boolean;
    r: boolean;
  };
  width?: number;
  grow?: number;
  fill?: string;
  shrink?: number;
  ellipsis?: boolean;
  margin?: [number, number, number, number];
  maxLines?: number;
  prefix?: string;
};

const calcFormat = (props: TextProps, format = chalk) => {
  if (props.color) {
    format = format[props.color];
  }

  if (props.backgroundColor) {
    const bgColor = `bg${props.backgroundColor.at(0)?.toUpperCase()}${props.backgroundColor.slice(
      1,
    )}` as `bg${Capitalize<ForegroundColorName>}`;
    format = format[bgColor];
  }

  for (const [key, value] of Object.entries(props)) {
    if (key in format && value) {
      format = format[key as ModifierName];
    }
  }

  return format;
};

const calcMargin = (m: ParagraphProps['margin']): [number, number, number, number] | undefined => {
  if (typeof m === 'number') {
    return [m, m, m, m];
  } else if (m?.length === 2) {
    return [...m, ...m];
  } else if (m?.length === 3) {
    return [...m, m[1]];
  }

  return m;
};

const normValue = (value?: number | boolean) => (value === true ? 1 : typeof value === 'number' ? Math.max(value, 0) : undefined);

export const prepareNode = (node: Node, format = chalk): PNode[] => {
  // For text node: Just return a new open paragraph
  if (node.type === 'text') {
    return node.text.split('\n').map((line, index, arr) => ({
      content: line,
      format,
      inline: {
        l: index === 0,
        r: index === arr.length - 1,
      },
      width: stringWidth(line),
    }));
  }

  format = calcFormat(node.props, format);
  const children = node.children.flatMap((child) => prepareNode(child, format));

  let last: PNode | undefined;
  let currentGroup: PNode[] = [];
  const groups = [currentGroup];

  for (const child of children) {
    if (last && (!last?.inline?.r || !child.inline?.l)) {
      currentGroup = [];
      groups.push(currentGroup);
    }

    currentGroup.push(child);
    last = child;
  }

  const blocks = groups
    .map<PNode | undefined>((group) =>
      node.type === 'textElement' || group.length > 1
        ? {
            content: group,
            format,
            inline: {
              l: group[0]?.inline?.l ?? true,
              r: group.at(-1)?.inline?.r ?? true,
            },
            width: sum(group.map((child) => child.width)),
            grow: normValue(node.props.grow ?? (node.props.fill ? true : undefined)),
            fill: node.props.fill,
            shrink: normValue(node.props.shrink),
            ellipsis: node.props.ellipsis,
            prefix: node.props.prefix,
          }
        : group[0],
    )
    .filter((block): block is PNode => block !== undefined);

  if (node.type === 'textElement') {
    return blocks;
  }

  return [
    {
      content: blocks,
      format,
      margin: calcMargin(node.props.margin),
      maxLines: node.props.maxLines,
      prefix: node.props.prefix,
    },
  ];
};

import chalk, { ForegroundColor, Modifiers } from 'chalk';
import stringWidth from 'string-width';
import wrapAnsi from 'wrap-ansi';
import { TextProps } from '../elements';
import { Node } from './hostConfig';
import { layoutChunk } from './layoutChunk';

type Chunk = { content: string | Chunk[]; width: number; grow: number; shrink: number; ellipsis?: boolean };
type P = Chunk & { open: boolean; marginRight: number; marginLeft: number };

const normValue = (value?: number | boolean) => (value === true ? 1 : value === false || value === undefined || value < 0 ? 0 : value);

const calcFormat = (props: TextProps, format = chalk) => {
  if (props.color) {
    format = format[props.color];
  }

  if (props.backgroundColor) {
    const bgColor = `bg${props.backgroundColor.at(0)?.toUpperCase()}${props.backgroundColor.slice(
      1,
    )}` as `bg${Capitalize<ForegroundColor>}`;
    format = format[bgColor];
  }

  for (const [key, value] of Object.entries(props)) {
    if (key in format && value) {
      format = format[key as Modifiers];
    }
  }

  return format;
};

const calcParagraph = (node: Node, format = chalk): P[] => {
  // For text node: Just return a new open paragraph
  if (node.type === 'text') {
    return node.text.split('\n').map((line, i, arr) => {
      line = format(line);

      return {
        open: i === 0 || i === arr.length - 1,
        marginLeft: 0,
        marginRight: 0,
        content: line,
        width: stringWidth(line),
        grow: 0,
        shrink: 0,
      };
    });
  }

  format = calcFormat(node.props, format);

  const paragraphs = node.children
    .flatMap((child) => calcParagraph(child, format))
    .reduce<P[]>((paragraphs, p) => {
      const last = paragraphs.at(-1);

      if (last?.open && Array.isArray(last.content) && p.open) {
        last.content.push(p);
        last.width += p.width;
      } else if (p.open) {
        paragraphs.push({
          open: true,
          marginLeft: 0,
          marginRight: 0,
          content: [p],
          width: p.width,
          grow: normValue(node.props.grow),
          shrink: normValue(node.props.shrink),
          ellipsis: node.props.ellipsis,
        });
      } else {
        paragraphs.push(p);
      }

      return paragraphs;
    }, []);

  if (node.type === 'paragraphElement') {
    let m = node.props.margin ?? 0;

    if (typeof m === 'number') {
      m = [m, m, m, m];
    } else if (m.length === 2) {
      m = [...m, ...m];
    } else if (m.length === 3) {
      m = [...m, m[1]];
    }

    for (const p of paragraphs) {
      p.marginLeft += m[3];
      p.marginRight += m[1];
      p.open = false;
    }

    for (let i = 0; i < m[0]; i++) {
      paragraphs.unshift({ marginLeft: 0, marginRight: 0, open: false, content: '', width: 0, grow: 0, shrink: 0 });
    }
    for (let i = 0; i < m[2]; i++) {
      paragraphs.push({ marginLeft: 0, marginRight: 0, open: false, content: '', width: 0, grow: 0, shrink: 0 });
    }
  }

  return paragraphs;
};

export const calcParagraphs = (node: Node, additionalLines: string): string[] => {
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

  return paragraphs.flatMap((p) => {
    const cols = process.stdout.columns - p.marginLeft - p.marginRight;
    // const forceWidth = (cols > p.width && p.grow) || (cols < p.width && p.shrink) ? cols : undefined;

    const text = layoutChunk(p, cols);
    return wrapAnsi(text, cols, { hard: true, trim: false })
      .split('\n')
      .map((line) => ''.padEnd(p.marginLeft, ' ') + line);
  });
};

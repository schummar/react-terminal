import ansiEscapes from 'ansi-escapes';
import { TextProps } from '../elements';
import { calcLines } from './calcLines';
import { ParagraphElement } from './hostConfig';
import { layoutNode } from './layoutNode';
import { PNode } from './prepareNode';
import { rewrapLines } from './rewrapLines';

export interface TerminalWriterTarget {
  write: (typeof process)['stdout']['write'];
  columns: number;
  rows: number;
}

export class TerminalWriter {
  renderedLines?: { cols: number; lines: string[] };
  originalWrite?: TerminalWriterTarget['write'];
  additionalLines: PNode[] = [];
  handles = [
    //
    this.hookIntoStdout(),
    this.observeResize(),
    this.hideCursor(),
  ];

  constructor(private root: ParagraphElement, private target: TerminalWriterTarget = process.stdout) {
    this.render();
  }

  writeLine(text: string, options?: Omit<TextProps, 'children'>) {
    this.additionalLines.push({
      content: text.replace(/\n$/, ''),
      prefix: options?.prefix,
    });
  }

  stop() {
    this.render(true);

    for (const handle of this.handles) {
      handle();
    }
    delete this.originalWrite;
  }

  private hookIntoStdout() {
    const originalWrite = this.target.write;
    this.originalWrite = originalWrite.bind(this.target);

    this.target.write = (data, ...args) => {
      if (typeof data !== 'string') {
        data = data.toString();
      }
      data = Buffer.from(data, typeof args[0] === 'string' ? args[0] : 'utf8').toString();

      this.writeLine(data);
      this.render();
      return true;
    };

    return () => {
      this.target.write = originalWrite;
    };
  }

  private observeResize() {
    let cols = this.target.columns;
    const interval = setInterval(() => {
      if (this.target.columns !== cols) {
        cols = this.target.columns;
        this.render();
      }
    }, 100);

    return () => clearInterval(interval);
  }

  private hideCursor() {
    this.originalWrite?.(ansiEscapes.cursorHide);
    return () => this.originalWrite?.(ansiEscapes.cursorShow);
  }

  render(full = false) {
    const write = this.originalWrite;
    if (!write) {
      return;
    }

    const cols = this.target.columns;
    const rows = this.target.rows || 40;
    let maxLines = Math.max(rows - 1, 1);

    const add = this.additionalLines.length ? this.additionalLines.flatMap((x) => layoutNode(x, cols)) : [];
    this.additionalLines = [];

    const lines = calcLines(this.root, '', cols);
    let renderedLines: (string | null)[] = this.renderedLines?.lines ?? [];

    if (this.renderedLines && this.renderedLines.cols !== cols) {
      // rewrap after resize: calculate how many lines the previously rendered content is now taking to find out how many lines to rewind
      // also null the lines to make sure all a completely rerendered
      renderedLines = rewrapLines(this.renderedLines.lines, cols).map(() => null);
    }

    if (full && lines.length > rows - 1) {
      write(ansiEscapes.clearTerminal);
      maxLines = 0;
      renderedLines = [];
    } else if (renderedLines.length) {
      write(ansiEscapes.cursorUp(renderedLines.length));
    }
    write(ansiEscapes.cursorLeft);

    add.forEach((line) => {
      write(`${line}${ansiEscapes.eraseEndLine}\n${ansiEscapes.cursorLeft}`);
    });

    let skip = 0;

    lines.slice(-maxLines).forEach((line, i) => {
      if (line === renderedLines[i + add.length]) {
        skip++;
        return;
      }

      if (skip) {
        write(ansiEscapes.cursorDown(skip));
      }

      write(`${line}${ansiEscapes.eraseEndLine}\n${ansiEscapes.cursorLeft}`);

      skip = 0;
    });

    if (skip) {
      write(ansiEscapes.cursorDown(skip));
    }
    write(ansiEscapes.cursorSavePosition);
    write(ansiEscapes.eraseDown);
    write(ansiEscapes.cursorRestorePosition);

    this.renderedLines = { cols, lines };
  }
}

import ansiEscapes from 'ansi-escapes';
import { calcLines } from './calcLines';
import { ParagraphElement } from './hostConfig';
import { rewrapLines } from './rewrapLines';

export class TerminalWriter {
  renderedLines?: { cols: number; lines: string[] };
  write?: typeof process['stdout']['write'];
  additionalLines = '';
  handles = [
    //
    this.hookIntoStdout(),
    this.observeResize(),
    this.hideCursor(),
  ];

  constructor(private root: ParagraphElement) {
    this.render();
    this.scheduleCleanup();
  }

  private hookIntoStdout() {
    const originalWrite = process.stdout.write;
    this.write = originalWrite.bind(process.stdout);

    process.stdout.write = (data, ...args) => {
      if (typeof data !== 'string') {
        data = data.toString();
      }
      data = Buffer.from(data, typeof args[0] === 'string' ? args[0] : 'utf8').toString();

      this.additionalLines += data;
      this.render();
      return true;
    };

    return () => {
      process.stdout.write = originalWrite;
    };
  }

  private observeResize() {
    let cols = process.stdout.columns;
    const interval = setInterval(() => {
      if (process.stdout.columns !== cols) {
        cols = process.stdout.columns;
        this.render();
      }
    }, 100);

    return () => clearInterval(interval);
  }

  private hideCursor() {
    this.write?.(ansiEscapes.cursorHide);
    return () => this.write?.(ansiEscapes.cursorShow);
  }

  private scheduleCleanup() {
    const cleanup = () => {
      for (const handle of this.handles) {
        handle();
      }
    };

    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `SIGTERM`].forEach((eventType) => {
      process.on(eventType, () => {
        cleanup();
        process.exit();
      });
    });

    process.on('uncaughtException', (e) => {
      cleanup();
      throw e;
    });
  }

  render() {
    const cols = process.stdout.columns;
    const lines = calcLines(this.root, this.additionalLines);
    let renderedLines: (string | null)[] = this.renderedLines?.lines ?? [];

    if (this.renderedLines && this.renderedLines.cols !== cols) {
      // rewrap after resize: calculate how many lines the previously rendered content is now taking to find out how many lines to rewind
      // also null the lines to make sure all a completely rerendered
      renderedLines = rewrapLines(this.renderedLines.lines).map(() => null);
    }

    if (renderedLines.length) {
      this.write?.(ansiEscapes.cursorUp(renderedLines.length));
    }
    this.write?.(ansiEscapes.cursorLeft);

    let skip = 0;

    lines.forEach((line, i) => {
      if (line === renderedLines[i]) {
        skip++;
        return;
      }

      if (skip) {
        this.write?.(ansiEscapes.cursorDown(skip));
      }

      this.write?.(`${line}${ansiEscapes.eraseEndLine}\n`);

      skip = 0;
    });

    if (skip) {
      this.write?.(ansiEscapes.cursorDown(skip));
    }
    this.write?.(ansiEscapes.cursorSavePosition);
    this.write?.(ansiEscapes.eraseDown);
    this.write?.(ansiEscapes.cursorRestorePosition);

    this.renderedLines = { cols, lines };
  }
}

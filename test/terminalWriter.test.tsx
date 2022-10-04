import { setTimeout } from 'timers/promises';
import { describe, expect, test } from 'vitest';
import { Terminal } from 'xterm-headless';
import { createRoot } from '../src';
import { Paragraph } from '../src/elements';
import { TerminalWriterTarget } from '../src/internal/terminalWriter';

class TestTerminal implements TerminalWriterTarget {
  term = new Terminal({
    cols: this.options.cols,
    rows: this.options.rows,
    allowProposedApi: true,
  });

  write = this.term.write.bind(this.term) as TerminalWriterTarget['write'];
  columns = this.options.cols;
  rows = this.options.rows;

  constructor(private options: { cols: number; rows: number }) {}

  getBuffer = (all = false) => {
    const buffer = this.term.buffer.active;
    const offset = all ? 0 : buffer.baseY;

    return Array(buffer.length - offset)
      .fill(0)
      .map((x, i) =>
        buffer
          .getLine(offset + i)
          ?.translateToString()
          .replace(/\xA0/g, ' '),
      );
  };
}

describe('terminalWriter', () => {
  test('long output', async () => {
    const term = new TestTerminal({ cols: 25, rows: 3 });
    const root = createRoot({ target: term });

    root.render(
      <Paragraph>
        <Paragraph>a</Paragraph>
        <Paragraph>b</Paragraph>
        <Paragraph>c</Paragraph>
        <Paragraph>d</Paragraph>
        <Paragraph>e</Paragraph>
      </Paragraph>,
    );

    await setTimeout();
    expect(term.getBuffer(true)).toEqual([
      //
      'd                        ',
      'e                        ',
      '                         ',
    ]);

    root.stop();
    root.unmount();
    await setTimeout();
    expect(term.getBuffer(true)).toEqual([
      //
      'a                        ',
      'b                        ',
      'c                        ',
      'd                        ',
      'e                        ',
      '                         ',
    ]);
  });
});

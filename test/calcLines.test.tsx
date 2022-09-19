import { describe, expect, test } from 'vitest';
import { Paragraph, Text } from '../src';
import { calcLines } from '../src/internal/calcLines';
import { testRender } from './_testRender';

describe('calcParagraphs', () => {
  test('nested', () => {
    const node = testRender(
      <>
        <Paragraph>
          <Text color="green">Ok</Text>{' '}
          <Text bold shrink ellipsis>
            Some long title
          </Text>{' '}
          <Text dim>[1.23s]</Text>
        </Paragraph>

        <Paragraph margin={[1, 0, 0, 2]}>{'foo\nbar\nbaz'}</Paragraph>

        <Paragraph margin={[1, 0, 0, 2]}>
          <Paragraph>
            <Text>Ok</Text>{' '}
            <Text shrink ellipsis>
              Some long title
            </Text>{' '}
            <Text>[1.23s]</Text>
          </Paragraph>

          <Paragraph>
            <Text grow>grow</Text> <Text>[1.23s]</Text>
          </Paragraph>

          <Paragraph margin={[1, 0, 0, 2]} maxLines={2}>
            {'foo\nbar\nbaz'}
          </Paragraph>
        </Paragraph>
      </>,
    );
    const lines = calcLines(node, '', 20);

    expect(lines.join('\n')).toBe(
      `\u001b[32mOk\u001b[39m \u001b[1mSome l\u001b[22m... \u001b[2m[1.23s]\u001b[22m

  foo
  bar
  baz

  Ok Some... [1.23s]
  grow       [1.23s]

    bar
    baz`,
    );
  });
});

import { describe, expect, test } from 'vitest';
import { renderToString } from '../src';
import { Paragraph, Text } from '../src/elements';

describe('stringWriter', () => {
  test('no width', async () => {
    const result = renderToString(
      <Paragraph>
        <Paragraph>
          <Text grow>a</Text>#
        </Paragraph>
        <Paragraph>bbbbbb</Paragraph>
        <Paragraph>c</Paragraph>
        <Paragraph>d</Paragraph>
        <Paragraph>e</Paragraph>
      </Paragraph>,
    );

    expect(result).toBe('a#\nbbbbbb\nc\nd\ne');
  });

  test('with width', async () => {
    const result = renderToString(
      <Paragraph>
        <Paragraph>
          <Text grow>a</Text>#
        </Paragraph>
        <Paragraph>bbbbbb</Paragraph>
        <Paragraph>c</Paragraph>
        <Paragraph>d</Paragraph>
        <Paragraph>e</Paragraph>
      </Paragraph>,
      5,
    );

    expect(result).toBe('a   #\nbbbbb\nb\nc\nd\ne');
  });
});

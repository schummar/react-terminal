import { describe, expect, test } from 'vitest';
import { Paragraph, Text } from '../src/elements';
import { prepareNode } from '../src/internal/prepareNode';
import { testRender } from './_testRender';

describe('calcParagraph', () => {
  test('text', () => {
    const node = testRender('foo');
    const p = prepareNode(node);

    expect(p).toMatchObject([
      {
        content: [{ content: 'foo', inline: { l: true, r: true }, width: 3 }],
      },
    ]);
  });

  test('text element', () => {
    const node = testRender(
      <Text grow shrink={1} ellipsis>
        foo
      </Text>,
    );
    const p = prepareNode(node);

    expect(p).toMatchObject([
      {
        content: [
          {
            content: [{ content: 'foo', inline: { l: true, r: true }, width: 3 }],
            inline: { l: true, r: true },
            width: 3,
            ellipsis: true,
            grow: 1,
            shrink: 1,
          },
        ],
      },
    ]);
  });

  test('empty text element', () => {
    const node = testRender(<Text grow shrink={1} ellipsis />);
    const p = prepareNode(node);

    expect(p).toMatchObject([
      {
        content: [
          {
            content: [],
            inline: { l: true, r: true },
            width: 0,
            ellipsis: true,
            grow: 1,
            shrink: 1,
          },
        ],
      },
    ]);
  });

  test('paragraph', () => {
    const node = testRender(
      <Paragraph margin={1} maxLines={2}>
        foo
      </Paragraph>,
    );
    const p = prepareNode(node);

    expect(p).toMatchObject([
      {
        content: [
          {
            content: [{ content: 'foo', inline: { l: true, r: true }, width: 3 }],
            margin: [1, 1, 1, 1],
            maxLines: 2,
          },
        ],
      },
    ]);
  });

  test('empty paragraph', () => {
    const node = testRender(<Paragraph margin={1} maxLines={2} />);
    const p = prepareNode(node);

    expect(p).toMatchObject([
      {
        content: [
          {
            content: [],
            margin: [1, 1, 1, 1],
            maxLines: 2,
          },
        ],
      },
    ]);
  });

  test('nested', () => {
    const node = testRender(
      <Paragraph>
        <Paragraph>
          abc <Text>def</Text> <Paragraph>hij</Paragraph> {'klm\nnop'}
        </Paragraph>
        <Paragraph>qrs</Paragraph>
      </Paragraph>,
    );
    const p = prepareNode(node);

    expect(p).toMatchObject([
      // Root
      {
        content: [
          // P0
          {
            content: [
              // P1_0
              {
                content: [
                  // Inline wrapper
                  {
                    content: [
                      // Text
                      { content: 'abc ', inline: { l: true, r: true }, width: 4 },
                      // Text element
                      {
                        content: [{ content: 'def', inline: { l: true, r: true }, width: 3 }],
                        inline: { l: true, r: true },
                        width: 3,
                      },
                      // Text
                      { content: ' ', inline: { l: true, r: true }, width: 1 },
                    ],
                    inline: { l: true, r: true },
                    width: 8,
                  },
                  // P2
                  {
                    content: [
                      // Text
                      { content: 'hij', inline: { l: true, r: true }, width: 3 },
                    ],
                  },
                  // Inline wrapper
                  {
                    content: [
                      // Text
                      { content: ' ', inline: { l: true, r: true }, width: 1 },
                      // Text
                      { content: 'klm', inline: { l: true, r: false }, width: 3 },
                    ],
                    inline: { l: true, r: false },
                    width: 4,
                  },
                  // Text
                  {
                    content: 'nop',
                    inline: { l: false, r: true },
                    width: 3,
                  },
                ],
              },
              // P1_1
              {
                content: [
                  // Text
                  { content: 'qrs', inline: { l: true, r: true }, width: 3 },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });
});

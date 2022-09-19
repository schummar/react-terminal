import { describe, expect, test } from 'vitest';
import { layoutNode } from '../src/internal/layoutNode';
import { withDefaults } from './_testHelpers';

describe('layoutChunk', () => {
  test('simple', () => {
    const lines = layoutNode(
      withDefaults({
        content: 'simple text',
        width: 11,
      }),
      20,
    );

    expect(lines).toEqual(['simple text']);
  });

  describe('grow', () => {
    test('single element', () => {
      const lines = layoutNode(
        withDefaults({
          content: 'simple text',
          grow: 1,
          width: 11,
        }),
        20,
      );

      expect(lines).toEqual(['simple text         ']);
    });

    test('one grows', () => {
      const lines = layoutNode(
        withDefaults({
          content: [
            { content: 'foo', grow: 1, width: 3 },
            { content: 'bar', width: 3 },
          ],
          inline: { l: true, r: true },
          width: 6,
        }),
        20,
      );

      expect(lines).toEqual(['foo              bar']);
    });

    test('multiple grow', () => {
      const lines = layoutNode(
        withDefaults({
          content: [
            { content: 'foo', grow: 1, width: 3 },
            { content: 'bar', grow: 2, width: 3 },
          ],
          inline: { l: true, r: true },
          width: 6,
        }),
        20,
      );

      expect(lines).toEqual(['foo     bar         ']);
    });
  });

  describe('shrink', () => {
    test('single element', () => {
      const lines = layoutNode(
        withDefaults({
          content: 'simple text',
          shrink: 1,
          width: 11,
        }),
        10,
      );

      expect(lines).toEqual(['simple tex']);
    });

    test('ellipsis', () => {
      const lines = layoutNode(
        withDefaults({
          content: 'simple text',
          shrink: 1,
          width: 11,
          ellipsis: true,
        }),
        10,
      );

      expect(lines).toEqual(['simple ...']);
    });

    test('one shrinks', () => {
      const lines = layoutNode(
        withDefaults({
          content: [
            { content: 'foo', shrink: 1, width: 3 },
            { content: 'bar', width: 3 },
          ],
          inline: { l: true, r: true },
          width: 6,
        }),
        5,
      );

      expect(lines).toEqual(['fobar']);
    });

    test('multiple shrink', () => {
      const lines = layoutNode(
        withDefaults({
          content: [
            { content: 'foo', shrink: 1, width: 3 },
            { content: 'bar', shrink: 2, width: 3 },
          ],
          inline: { l: true, r: true },
          width: 6,
        }),
        3,
      );

      expect(lines).toEqual(['fob']);
    });
  });

  describe('maxLines', () => {
    test('maxLines', () => {
      const lines = layoutNode(
        withDefaults({
          content: [{ content: 'foo' }, { content: 'bar' }, { content: 'baz' }],
          maxLines: 2,
        }),
        3,
      );

      expect(lines).toEqual(['bar', 'baz']);
    });
  });
});

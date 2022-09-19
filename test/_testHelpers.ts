import { PNode } from '../src/internal/prepareNode';

type PPNode = Partial<Omit<PNode, 'content'> & { content: string | PPNode[] }>;

export const withDefaults = (node: PPNode): PNode => ({
  width: 0,
  grow: 0,
  shrink: 0,
  ellipsis: false,
  margin: [0, 0, 0, 0],
  maxLines: Infinity,
  ...node,
  content: typeof node.content === 'string' ? node.content : node.content?.map(withDefaults) ?? [],
});

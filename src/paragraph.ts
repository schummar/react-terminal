export type Chunk = { content: string | Chunk[]; width: number; grow: number; shrink: number; ellipsis?: boolean };
export type P = Chunk & { open: boolean; marginRight: number; marginLeft: number };

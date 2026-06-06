export type Direction = 'up' | 'down' | 'left' | 'right';

export type Terrain = 'empty' | 'path' | 'entrance';

export interface GridCell {
  terrain: Terrain;
  direction?: Direction;
}

export type ZoneId =
  | 'holmes-house'
  | 'museum'
  | 'bar'
  | 'big-bang'
  | 'drugstore'
  | 'book-store'
  | 'locksmith'
  | 'key'
  | 'bridge'
  | 'docks'
  | 'park'
  | 'pawnshop'
  | 'theater'
  | 'hotel'
  | 'cigar-shop'
  | 'graveyard'
  | 'carriage-station'
  | 'bank'
  | 'street'
  | 'scotland-yard';

export interface Zone {
  id: ZoneId;
  pin: { top: number; left: number };
  puzzleId: string;
  clueText: string;
  isBase?: boolean;
}

export interface Entrance {
  at: { row: number; column: number };
  direction: Direction;
  zoneId: ZoneId;
}

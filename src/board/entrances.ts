import type { Direction, Entrance } from './types';
import { cellKey } from './grid';

/** Arrow cell → zone (verify against physical board if needed). */
export const ENTRANCES: Entrance[] = [
  { at: { row: 0, column: 14 }, direction: 'down', zoneId: 'museum' },
  { at: { row: 3, column: 7 }, direction: 'up', zoneId: 'book-store' },
  { at: { row: 3, column: 4 }, direction: 'up', zoneId: 'locksmith' },
  { at: { row: 4, column: 21 }, direction: 'up', zoneId: 'holmes-house' },
  { at: { row: 5, column: 10 }, direction: 'left', zoneId: 'docks' },
  { at: { row: 7, column: 2 }, direction: 'down', zoneId: 'hotel' },
  { at: { row: 7, column: 7 }, direction: 'right', zoneId: 'park' },
  { at: { row: 10, column: 10 }, direction: 'left', zoneId: 'park' },
  { at: { row: 8, column: 14 }, direction: 'left', zoneId: 'pawnshop' },
  { at: { row: 9, column: 18 }, direction: 'up', zoneId: 'bar' },
  { at: { row: 10, column: 7 }, direction: 'left', zoneId: 'cigar-shop' },
  { at: { row: 11, column: 0 }, direction: 'right', zoneId: 'hotel' },
  { at: { row: 13, column: 15 }, direction: 'right', zoneId: 'drugstore' },
  { at: { row: 14, column: 7 }, direction: 'right', zoneId: 'theater' },
  { at: { row: 15, column: 19 }, direction: 'down', zoneId: 'scotland-yard' },
  { at: { row: 16, column: 9 }, direction: 'down', zoneId: 'bank' },
  { at: { row: 18, column: 3 }, direction: 'up', zoneId: 'carriage-station' },
];

const entranceByCell: Record<string, Entrance> = Object.fromEntries(
  ENTRANCES.map((entrance) => [cellKey(entrance.at.row, entrance.at.column), entrance]),
);

export function entranceAt(row: number, column: number): Entrance | undefined {
  return entranceByCell[cellKey(row, column)];
}

/** Arrow points into the zone; you cannot step onto the cell from that side. */
const APPROACH_FROM_ZONE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function canEnterFromDirection(
  entrance: Entrance,
  approachDirection: Direction,
): boolean {
  return approachDirection !== APPROACH_FROM_ZONE[entrance.direction];
}

import type { Direction, GridCell } from './types';

/** Authoring matrix (0 empty, 1 path, 2–5 entrances). Not used at runtime outside this file. */
const SQUARE_VALUES: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0],
  [0, 0, 0, 0, 4, 1, 1, 4, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 4, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
  [1, 1, 2, 1, 1, 1, 1, 5, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [5, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 4, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const DIRECTION_BY_VALUE: Record<number, Direction> = {
  2: 'down',
  3: 'left',
  4: 'up',
  5: 'right',
};

function valueToCell(value: number): GridCell {
  if (value === 0) {
    return { terrain: 'empty' };
  }
  if (value === 1) {
    return { terrain: 'path' };
  }
  const direction = DIRECTION_BY_VALUE[value];
  if (direction) {
    return { terrain: 'entrance', direction };
  }
  return { terrain: 'empty' };
}

export const GRID: GridCell[][] = SQUARE_VALUES.map((row) => row.map(valueToCell));

export const GRID_ROWS = GRID.length;
export const GRID_COLUMNS = GRID[0].length;

export function isWalkable(cell: GridCell | undefined): boolean {
  return cell !== undefined && cell.terrain !== 'empty';
}

export function cellKey(row: number, column: number): string {
  return `${row},${column}`;
}

export function cloneGrid(): GridCell[][] {
  return GRID.map((row) => row.map((cell) => ({ ...cell })));
}

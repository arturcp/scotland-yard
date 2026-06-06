import type { Position } from '../types/game';
import { entranceAt } from './entrances';
import { GRID_COLUMNS, GRID_ROWS, isWalkable } from './grid';
import type { GridCell } from './types';

type MarkedCell = GridCell | 'S' | '*';

export interface BoardPosition {
  boardData: MarkedCell[][];
  current: Position;
  id: string;
  row: number;
  column: number;
  isStart: boolean;
}

export function createBoardPosition(
  boardData: MarkedCell[][],
  current: Position,
  isStart = false,
): BoardPosition {
  const id = current.place ?? `${current.row},${current.column}`;
  current.id = id;

  return {
    boardData,
    current,
    id,
    row: current.row ?? 0,
    column: current.column ?? 0,
    isStart,
  };
}

export function entrance(position: BoardPosition) {
  return entranceAt(position.row, position.column);
}

export function insideBoard(row: number, column: number) {
  return row >= 0 && row < GRID_ROWS && column >= 0 && column < GRID_COLUMNS;
}

export function cellAt(
  position: BoardPosition,
  row: number,
  column: number,
): MarkedCell | undefined {
  if (!insideBoard(row, column)) {
    return undefined;
  }
  return position.boardData[row][column];
}

export function availableSquare(
  position: BoardPosition,
  row = position.row,
  column = position.column,
) {
  const cell = cellAt(position, row, column);
  if (cell === 'S' || cell === '*') {
    return true;
  }
  return isWalkable(cell as GridCell | undefined);
}

export function initialPosition(position: BoardPosition) {
  return position.isStart || cellAt(position, position.row, position.column) === 'S';
}

export function canMoveUp(position: BoardPosition) {
  return (
    insideBoard(position.row - 1, position.column) &&
    availableSquare(position, position.row - 1, position.column)
  );
}

export function canMoveDown(position: BoardPosition) {
  return (
    insideBoard(position.row + 1, position.column) &&
    availableSquare(position, position.row + 1, position.column)
  );
}

export function canMoveLeft(position: BoardPosition) {
  return (
    insideBoard(position.row, position.column - 1) &&
    availableSquare(position, position.row, position.column - 1)
  );
}

export function canMoveRight(position: BoardPosition) {
  return (
    insideBoard(position.row, position.column + 1) &&
    availableSquare(position, position.row, position.column + 1)
  );
}

export function canMove(position: BoardPosition) {
  return (
    canMoveUp(position) || canMoveDown(position) || canMoveLeft(position) || canMoveRight(position)
  );
}

export function moveUp(position: BoardPosition): BoardPosition {
  return createBoardPosition(position.boardData, {
    row: position.row - 1,
    column: position.column,
    place: null,
  });
}

export function moveDown(position: BoardPosition): BoardPosition {
  return createBoardPosition(position.boardData, {
    row: position.row + 1,
    column: position.column,
    place: null,
  });
}

export function moveLeft(position: BoardPosition): BoardPosition {
  return createBoardPosition(position.boardData, {
    row: position.row,
    column: position.column - 1,
    place: null,
  });
}

export function moveRight(position: BoardPosition): BoardPosition {
  return createBoardPosition(position.boardData, {
    row: position.row,
    column: position.column + 1,
    place: null,
  });
}

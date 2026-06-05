import type { Position } from '../types/game';
import { entranceAt } from './entrances';
import { GRID_COLUMNS, GRID_ROWS, isWalkable } from './grid';
import type { GridCell } from './types';

type MarkedCell = GridCell | 'S' | '*';

export default class BoardNavigator {
  boardData: MarkedCell[][];
  current: Position;
  id: string;
  row: number;
  column: number;
  isStart: boolean;

  constructor(boardData: MarkedCell[][], current: Position, isStart = false) {
    this.boardData = boardData;
    this.current = current;
    this.isStart = isStart;

    this.id = current.place ?? `${current.row},${current.column}`;
    this.current.id = this.id;
    this.row = current.row ?? 0;
    this.column = current.column ?? 0;
  }

  entrance = () => entranceAt(this.row, this.column);

  canMove = () => {
    return this.canMoveUp() || this.canMoveDown() || this.canMoveLeft() || this.canMoveRight();
  };

  insideBoard = (row: number, column: number) =>
    row >= 0 && row < GRID_ROWS && column >= 0 && column < GRID_COLUMNS;

  cellAt = (row: number, column: number): MarkedCell | undefined => {
    if (!this.insideBoard(row, column)) {
      return undefined;
    }
    return this.boardData[row][column];
  };

  canMoveUp = () => this.insideBoard(this.row - 1, this.column) && this.availableSquare(this.row - 1, this.column);
  canMoveDown = () => this.insideBoard(this.row + 1, this.column) && this.availableSquare(this.row + 1, this.column);
  canMoveLeft = () => this.insideBoard(this.row, this.column - 1) && this.availableSquare(this.row, this.column - 1);
  canMoveRight = () =>
    this.insideBoard(this.row, this.column + 1) && this.availableSquare(this.row, this.column + 1);

  moveUp = () =>
    new BoardNavigator(this.boardData, { row: this.row - 1, column: this.column, place: null });
  moveDown = () =>
    new BoardNavigator(this.boardData, { row: this.row + 1, column: this.column, place: null });
  moveLeft = () =>
    new BoardNavigator(this.boardData, { row: this.row, column: this.column - 1, place: null });
  moveRight = () =>
    new BoardNavigator(this.boardData, { row: this.row, column: this.column + 1, place: null });

  initialPosition = () => this.isStart || this.cellAt(this.row, this.column) === 'S';

  availableSquare = (row = this.row, column = this.column) => {
    const cell = this.cellAt(row, column);
    if (cell === 'S' || cell === '*') {
      return true;
    }
    return isWalkable(cell as GridCell | undefined);
  };
}

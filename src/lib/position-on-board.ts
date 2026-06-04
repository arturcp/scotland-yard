import type { Position } from '../types/game';

type BoardCell = number | string;

class PositionOnBoard {
  boardData: BoardCell[][];
  current: Position;
  id: string;
  row: number;
  column: number;

  constructor(boardData: BoardCell[][], current: Position) {
    this.boardData = boardData;
    this.current = current;

    this.id = `${current.row},${current.column}`;
    this.current.id = this.id;
    this.row = current.row ?? 0;
    this.column = current.column ?? 0;
  }

  canMove = () => {
    return this.canMoveUp() || this.canMoveDown() || this.canMoveLeft() || this.canMoveRight();
  };

  insideBoard = (row: number, column: number) =>
    row >= 0 && row < this.boardData.length && column >= 0 && column <= 22;

  canMoveUp = () => this.insideBoard(this.row - 1, this.column) && this.availableSquare(this.row - 1, this.column);
  canMoveDown = () => this.insideBoard(this.row + 1, this.column) && this.availableSquare(this.row + 1, this.column);
  canMoveLeft = () => this.insideBoard(this.row, this.column - 1) && this.availableSquare(this.row, this.column - 1);
  canMoveRight = () => this.insideBoard(this.row, this.column + 1) && this.availableSquare(this.row, this.column + 1);
  moveUp = () => new PositionOnBoard(this.boardData, { row: this.row - 1, column: this.column, place: null });
  moveDown = () => new PositionOnBoard(this.boardData, { row: this.row + 1, column: this.column, place: null });
  moveLeft = () => new PositionOnBoard(this.boardData, { row: this.row, column: this.column - 1, place: null });
  moveRight = () => new PositionOnBoard(this.boardData, { row: this.row, column: this.column + 1, place: null });
  initialPosition = () => this.insideBoard(this.row, this.column) && this.boardData[this.row][this.column] === 'S';
  availableSquare = (row = this.row, column = this.column) =>
    this.insideBoard(row, column) && parseInt(String(this.boardData[row][column])) > 0;
}

export default PositionOnBoard;

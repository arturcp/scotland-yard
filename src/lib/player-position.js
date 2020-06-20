class PlayerPosition {
  constructor(boardData, current) {
    this.boardData = boardData;
    this.current = current;
    this.id = current.row + ',' + current.column;
    this.current.id = this.id;

    this.row = current.row;
    this.column = current.column;
  }

  canMove = () => {
    return this.canMoveUp() || this.canMoveDown() || this.canMoveLeft() || this.canMoveRight();
  }

  insideBoard = (row, column) => {
    return row >= 0 && column <= 22;
  }

  canMoveUp = () => {
    let row = this.current.row - 1,
        column = this.current.column;

    return this.insideBoard(row, column) && this.availableSquare(row, column);
  }

  canMoveDown = () => {
    let row = this.current.row + 1,
        column = this.current.column;

    return this.insideBoard(row, column) && this.availableSquare(row, column);
  }

  canMoveLeft = () => {
    let row = this.current.row,
        column = this.current.column - 1;

    return this.insideBoard(row, column) && this.availableSquare(row, column);
  }

  canMoveRight = () => {
    let row = this.current.row,
        column = this.current.column + 1;

    return this.insideBoard(row, column) && this.availableSquare(row, column);
  }

  availableSquare = (row, column) => {
    return this.boardData[row][column] !== '*' && this.boardData[row][column] > 0
  }

  up = () => { return new PlayerPosition(this.boardData, { row: this.current.row - 1, column: this.current.column }) }
  down = () => { return new PlayerPosition(this.boardData, { row: this.current.row + 1, column: this.current.column }) }
  left = () => { return new PlayerPosition(this.boardData, { row: this.current.row, column: this.current.column - 1 }) }
  right = () => { return new PlayerPosition(this.boardData, { row: this.current.row, column: this.current.column + 1 }) }
}

export default PlayerPosition;

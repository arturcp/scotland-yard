class PositionOnBoard {
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

  initialPosition = () => this.boardData[this.row][this.column] === 'S';
  insideBoard = (row, column) => row >= 0 && column <= 22
  canMoveUp = () => this.insideBoard(this.row - 1, this.column) && this.availableSquare(this.row - 1, this.column)
  canMoveDown = () => this.insideBoard(this.row + 1, this.column) && this.availableSquare(this.row + 1, this.column)
  canMoveLeft = () => this.insideBoard(this.row, this.column - 1) && this.availableSquare(this.row, this.column - 1)
  canMoveRight = () => this.insideBoard(this.row, this.column + 1) && this.availableSquare(this.row, this.column + 1)
  moveUp = () => new PositionOnBoard(this.boardData, { row: this.row - 1, column: this.column })
  moveDown = () => new PositionOnBoard(this.boardData, { row: this.row + 1, column: this.column })
  moveLeft = () => new PositionOnBoard(this.boardData, { row: this.row, column: this.column - 1 })
  moveRight = () => new PositionOnBoard(this.boardData, { row: this.row, column: this.column + 1 })
  availableSquare = (row = this.row, column = this.column) => parseInt(this.boardData[row][column]) > 0
}

export default PositionOnBoard;

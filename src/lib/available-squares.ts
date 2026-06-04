import BoardData from '../components/Board/board-data';
import type { AvailableSquare, Player } from '../types/game';
import PositionOnBoard from './position-on-board';

type BoardCell = number | string;

class AvailableSquares {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  markInitialPosition = (data: BoardCell[][], position: PositionOnBoard) => {
    data[position.row][position.column] = 'S';
  };

  clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

  markCurrentPosition = (data: BoardCell[][], path: string[], position: PositionOnBoard) => {
    data[position.row][position.column] = '*';
    path.push(position.id);
  };

  all = (diceResult: number) => {
    const data = this.clone(BoardData.squares);
    const position = new PositionOnBoard(data, this.player.position);

    this.markInitialPosition(data, position);
    return this.findNextMove([], [], position, data, diceResult + 1);
  };

  findNextMove = (
    results: AvailableSquare[],
    path: string[],
    position: PositionOnBoard,
    boardData: BoardCell[][],
    movesRemaining: number,
  ): AvailableSquare[] => {
    if (movesRemaining > 0) {
      const board = this.clone(boardData);
      const currentPath = this.clone(path);

      if (position.availableSquare() || position.initialPosition()) {
        this.checkpoint(results, currentPath, board, position);

        if (position.canMove()) {
          movesRemaining--;

          this.findNextMove(results, currentPath, position.moveUp(), board, movesRemaining);
          this.findNextMove(results, currentPath, position.moveDown(), board, movesRemaining);
          this.findNextMove(results, currentPath, position.moveLeft(), board, movesRemaining);
          this.findNextMove(results, currentPath, position.moveRight(), board, movesRemaining);
        }
      }
    }

    return results;
  };

  checkpoint = (results: AvailableSquare[], path: string[], board: BoardCell[][], position: PositionOnBoard) => {
    if (!position.initialPosition()) {
      this.markCurrentPosition(board, path, position);
      this.savePosition(results, path, position);
    }
  };

  savePosition = (results: AvailableSquare[], path: string[], position: PositionOnBoard) => {
    if (!this.existInArray(results, position.id)) {
      const data = position.current as AvailableSquare;
      data.path = path;
      results.push(data);
    }
  };

  existInArray = (array: AvailableSquare[], id: string) => {
    const filteredElements = array.filter((item) => item.id === id);

    return filteredElements.length > 0;
  };
}

export default AvailableSquares;

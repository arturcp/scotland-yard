import { GRID, canEnterFromDirection } from '../board';
import type { Direction, Entrance } from '../board/types';
import type { AvailableSquare, Player } from '../types/game';
import BoardNavigator from '../board/navigator';

type MarkedCell = (typeof GRID)[number][number] | 'S' | '*';

class AvailableSquares {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

  all = (diceResult: number) => {
    if (this.player.position.place) {
      return [];
    }

    const data = GRID.map((row) => [...row]) as MarkedCell[][];
    const row = this.player.position.row ?? 0;
    const column = this.player.position.column ?? 0;
    data[row][column] = 'S';

    const position = new BoardNavigator(data, { row, column, place: null }, true);
    return this.findNextMove([], [], position, data, diceResult + 1);
  };

  findNextMove = (
    results: AvailableSquare[],
    path: string[],
    position: BoardNavigator,
    boardData: MarkedCell[][],
    movesRemaining: number,
    lastMove?: Direction,
  ): AvailableSquare[] => {
    if (movesRemaining <= 0) {
      return results;
    }

    if (!position.availableSquare() && !position.initialPosition()) {
      return results;
    }

    const board = this.clone(boardData);
    const currentPath = this.clone(path);

    const entrance = position.entrance();
    let pathAtCell = currentPath;

    if (!position.initialPosition()) {
      pathAtCell = [...currentPath, position.id];
      this.checkpointGrid(results, pathAtCell, board, position);
    }

    if (
      entrance &&
      movesRemaining >= 1 &&
      lastMove &&
      canEnterFromDirection(entrance, lastMove)
    ) {
      this.checkpointZone(results, pathAtCell, entrance);
    }

    if (!position.canMove()) {
      return results;
    }

    const movesAfterStep = movesRemaining - 1;
    const pathForChildren = position.initialPosition() ? currentPath : pathAtCell;

    this.findNextMove(results, pathForChildren, position.moveUp(), board, movesAfterStep, 'up');
    this.findNextMove(results, pathForChildren, position.moveDown(), board, movesAfterStep, 'down');
    this.findNextMove(results, pathForChildren, position.moveLeft(), board, movesAfterStep, 'left');
    this.findNextMove(results, pathForChildren, position.moveRight(), board, movesAfterStep, 'right');

    return results;
  };

  checkpointGrid = (
    results: AvailableSquare[],
    path: string[],
    board: MarkedCell[][],
    position: BoardNavigator,
  ) => {
    board[position.row][position.column] = '*';
    this.saveGridPosition(results, path, position);
  };

  checkpointZone = (results: AvailableSquare[], path: string[], entrance: Entrance) => {
    const zonePath = [...path, entrance.zoneId];
    this.saveZonePosition(results, zonePath, entrance.zoneId);
  };

  saveGridPosition = (results: AvailableSquare[], path: string[], position: BoardNavigator) => {
    if (!this.existInArray(results, position.id)) {
      results.push({
        id: position.id,
        row: position.row,
        column: position.column,
        place: null,
        path,
      });
    }
  };

  saveZonePosition = (results: AvailableSquare[], path: string[], zoneId: string) => {
    if (!this.existInArray(results, zoneId)) {
      results.push({
        id: zoneId,
        place: zoneId,
        path,
      });
    }
  };

  existInArray = (array: AvailableSquare[], id: string) => {
    return array.some((item) => item.id === id);
  };
}

export default AvailableSquares;

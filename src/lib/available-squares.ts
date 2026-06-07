import { GRID, ENTRANCES, ZONE_IDS, bridgeDestination, canEnterFromDirection, cellKey } from '../board';
import {
  availableSquare,
  canMove,
  createBoardPosition,
  entrance,
  initialPosition,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
  type BoardPosition,
} from '../board/navigator';
import type { Direction, Entrance, ZoneId } from '../board/types';
import type { AvailableSquare, Player } from '../types/game';

type MarkedCell = (typeof GRID)[number][number] | 'S' | '*';

function clone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

const CARRIAGE_STATION_ID: ZoneId = 'carriage-station';

export function exitTilesForZone(zoneId: ZoneId): string[] {
  return ENTRANCES.filter((entrance) => entrance.zoneId === zoneId).map((entrance) =>
    cellKey(entrance.at.row, entrance.at.column),
  );
}

function getCarriageStationTeleportDestinations(): AvailableSquare[] {
  return ZONE_IDS.filter((zoneId) => zoneId !== CARRIAGE_STATION_ID).map((zoneId) => ({
    id: zoneId,
    place: zoneId,
    path: [zoneId],
  }));
}

function parseTileId(tileId: string) {
  const [row, column] = tileId.split(',');
  return { row: parseInt(row, 10), column: parseInt(column, 10) };
}

export function hasAvailableSquare(array: AvailableSquare[], id: string) {
  return array.some((item) => item.id === id);
}

function saveGridPosition(results: AvailableSquare[], path: string[], position: BoardPosition) {
  if (!hasAvailableSquare(results, position.id)) {
    results.push({
      id: position.id,
      row: position.row,
      column: position.column,
      place: null,
      path,
    });
  }
}

function saveZonePosition(results: AvailableSquare[], path: string[], zoneId: string) {
  if (!hasAvailableSquare(results, zoneId)) {
    results.push({
      id: zoneId,
      place: zoneId,
      path,
    });
  }
}

function checkpointGrid(
  results: AvailableSquare[],
  path: string[],
  board: MarkedCell[][],
  position: BoardPosition,
) {
  board[position.row][position.column] = '*';
  saveGridPosition(results, path, position);
}

function checkpointZone(results: AvailableSquare[], path: string[], zoneEntrance: Entrance) {
  const zonePath = [...path, zoneEntrance.zoneId];
  saveZonePosition(results, zonePath, zoneEntrance.zoneId);
}

function findNextMove(
  results: AvailableSquare[],
  path: string[],
  position: BoardPosition,
  boardData: MarkedCell[][],
  movesRemaining: number,
  lastMove?: Direction,
): AvailableSquare[] {
  if (movesRemaining <= 0) {
    return results;
  }

  if (!availableSquare(position) && !initialPosition(position)) {
    return results;
  }

  const board = clone(boardData);
  const currentPath = clone(path);

  const zoneEntrance = entrance(position);
  let pathAtCell = currentPath;

  if (!initialPosition(position)) {
    pathAtCell = [...currentPath, position.id];
    checkpointGrid(results, pathAtCell, board, position);
  }

  const canStepIntoZone =
    zoneEntrance &&
    movesRemaining >= 2 &&
    (initialPosition(position) ||
      (lastMove !== undefined && canEnterFromDirection(zoneEntrance, lastMove)));

  if (canStepIntoZone) {
    const zoneEntryPath = initialPosition(position) ? [position.id] : pathAtCell;
    checkpointZone(results, zoneEntryPath, zoneEntrance);
  }

  const movesAfterStep = movesRemaining - 1;
  const pathForChildren = initialPosition(position) ? currentPath : pathAtCell;

  const bridgeTarget = bridgeDestination(position.row, position.column);
  if (bridgeTarget) {
    const bridgePosition = createBoardPosition(board, {
      row: bridgeTarget.row,
      column: bridgeTarget.column,
      place: null,
    });
    findNextMove(results, pathForChildren, bridgePosition, board, movesAfterStep);
  }

  if (!canMove(position)) {
    return results;
  }

  findNextMove(results, pathForChildren, moveUp(position), board, movesAfterStep, 'up');
  findNextMove(results, pathForChildren, moveDown(position), board, movesAfterStep, 'down');
  findNextMove(results, pathForChildren, moveLeft(position), board, movesAfterStep, 'left');
  findNextMove(results, pathForChildren, moveRight(position), board, movesAfterStep, 'right');

  return results;
}

export function getAvailableSquares(player: Player, diceResult: number): AvailableSquare[] {
  const data = GRID.map((row) => [...row]) as MarkedCell[][];

  if (player.position.place) {
    const currentZone = player.position.place as ZoneId;

    if (currentZone === CARRIAGE_STATION_ID) {
      return getCarriageStationTeleportDestinations();
    }

    const exitTiles = exitTilesForZone(currentZone);
    if (!exitTiles.length) {
      return [];
    }

    const results: AvailableSquare[] = [];
    for (const exitTile of exitTiles) {
      const { row, column } = parseTileId(exitTile);
      const position = createBoardPosition(data, { row, column, place: null });
      findNextMove(results, [], position, data, diceResult);
    }
    return results;
  }

  const row = player.position.row ?? 0;
  const column = player.position.column ?? 0;
  data[row][column] = 'S';

  const position = createBoardPosition(data, { row, column, place: null }, true);
  return findNextMove([], [], position, data, diceResult + 1);
}

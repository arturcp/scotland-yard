export const SQUARE_SIZE = 49;
export const BOARD_PADDING = 3;
export const PIECE_SIZE = 22;
export const PIECE_SPACING = 8;
export const PIECE_CENTER_OFFSET = (SQUARE_SIZE - PIECE_SIZE) / 2;
const TILE_INNER_PADDING = 4;

export interface PiecePlacement {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export function tileOrigin(row: number, column: number) {
  return {
    top: row * SQUARE_SIZE + BOARD_PADDING,
    left: column * SQUARE_SIZE + BOARD_PADDING,
  };
}

export function getPiecePlacement(index: number, count: number): PiecePlacement {
  if (count <= 0 || index < 0 || index >= count) {
    return { offsetX: 0, offsetY: 0, scale: 1 };
  }

  if (count === 1) {
    return { offsetX: 0, offsetY: 0, scale: 1 };
  }

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const innerSize = SQUARE_SIZE - TILE_INNER_PADDING;
  const maxPieceSize = Math.min(innerSize / cols, innerSize / rows);
  const scale = Math.min(1, maxPieceSize / PIECE_SIZE);
  const effectiveSize = PIECE_SIZE * scale;

  const row = Math.floor(index / cols);
  const col = index % cols;
  const itemsInRow = Math.min(cols, count - row * cols);

  const offsetX = (col - (itemsInRow - 1) / 2) * effectiveSize;
  const offsetY = (row - (rows - 1) / 2) * effectiveSize;

  return { offsetX, offsetY, scale };
}

/** @deprecated Use getPiecePlacement instead */
export function pieceCenterOffsetX(playerIndex: number, playersAtTile: number): number {
  return getPiecePlacement(playerIndex, playersAtTile).offsetX;
}

export function pieceOffset(playerIndex: number, playersAtTile: number): number {
  return PIECE_CENTER_OFFSET + pieceCenterOffsetX(playerIndex, playersAtTile);
}

export function piecePosition(
  row: number,
  column: number,
  playerIndex: number,
  playersAtTile: number,
) {
  const origin = tileOrigin(row, column);
  const { offsetX, offsetY } = getPiecePlacement(playerIndex, playersAtTile);

  return {
    top: origin.top + SQUARE_SIZE / 2 + offsetY,
    left: origin.left + SQUARE_SIZE / 2 + offsetX,
  };
}

export const BOARD_WIDTH = BOARD_PADDING * 2 + 23 * SQUARE_SIZE;
export const BOARD_HEIGHT = BOARD_PADDING * 2 + 19 * SQUARE_SIZE;

export const SQUARE_SIZE = 49;
export const BOARD_PADDING = 3;
export const PIECE_SIZE = 22;
export const PIECE_SPACING = 8;
export const PIECE_CENTER_OFFSET = (SQUARE_SIZE - PIECE_SIZE) / 2;

export function tileOrigin(row: number, column: number) {
  return {
    top: row * SQUARE_SIZE + BOARD_PADDING,
    left: column * SQUARE_SIZE + BOARD_PADDING,
  };
}

export function pieceCenterOffsetX(playerIndex: number, playersAtTile: number): number {
  return PIECE_SPACING * playerIndex - (PIECE_SPACING * (playersAtTile - 1)) / 2;
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

  return {
    top: origin.top + SQUARE_SIZE / 2,
    left: origin.left + SQUARE_SIZE / 2 + pieceCenterOffsetX(playerIndex, playersAtTile),
  };
}

export const BOARD_WIDTH = BOARD_PADDING * 2 + 23 * SQUARE_SIZE;
export const BOARD_HEIGHT = BOARD_PADDING * 2 + 19 * SQUARE_SIZE;

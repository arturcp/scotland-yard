export const SQUARE_SIZE = 49;
export const BOARD_PADDING = 3;
export const PIECE_SIZE = 24;

const PIECE_CENTER_OFFSET = (SQUARE_SIZE - PIECE_SIZE) / 2;

export function tileOrigin(row: number, column: number) {
  return {
    top: row * SQUARE_SIZE + BOARD_PADDING,
    left: column * SQUARE_SIZE + BOARD_PADDING,
  };
}

export function pieceOffset(playerIndex: number, playersAtTile: number): number {
  const spacing = 8;
  return PIECE_CENTER_OFFSET - 4 * (playersAtTile - 1) + spacing * playerIndex;
}

export function piecePosition(
  row: number,
  column: number,
  playerIndex: number,
  playersAtTile: number,
) {
  const origin = tileOrigin(row, column);
  const offset = pieceOffset(playerIndex, playersAtTile);

  return {
    top: origin.top + PIECE_CENTER_OFFSET,
    left: origin.left + offset,
  };
}

export const BOARD_WIDTH = BOARD_PADDING * 2 + 23 * SQUARE_SIZE;
export const BOARD_HEIGHT = BOARD_PADDING * 2 + 19 * SQUARE_SIZE;

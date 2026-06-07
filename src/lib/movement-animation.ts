import { SQUARE_SIZE, BOARD_PADDING, pieceCenterOffsetX } from '../board/layout';
import type { Player, Position } from '../types/game';

export const STEP_DURATION_MS = 200;

export function parseNotation(notation: string): Position {
  if (notation.includes(',')) {
    const [row, column] = notation.split(',');
    return {
      row: parseInt(row, 10),
      column: parseInt(column, 10),
      place: null,
    };
  }
  return { place: notation };
}

function playersAtPosition(player: Player, players: Player[], position: Position): Player[] {
  const atPosition = players.filter((p) => {
    if (p.id === player.id) return false;
    const pPos = p.position;
    if (position.place) {
      return pPos.place === position.place;
    }
    return (pPos.row ?? 0) === (position.row ?? 0) && (pPos.column ?? 0) === (position.column ?? 0);
  });

  atPosition.push(player);
  atPosition.sort((a, b) => a.id - b.id);

  return atPosition;
}

function movePinTo(pin: HTMLElement, player: Player, players: Player[], position: Position) {
  if (position.place) {
    return;
  }

  const row = position.row ?? 0;
  const column = position.column ?? 0;
  const atPosition = playersAtPosition(player, players, position);
  const idx = atPosition.findIndex((p) => p.id === player.id);
  const offsetX = pieceCenterOffsetX(idx, atPosition.length);
  const originTop = row * SQUARE_SIZE + BOARD_PADDING;
  const originLeft = column * SQUARE_SIZE + BOARD_PADDING;

  pin.classList.add('player--anchor-center');
  pin.classList.toggle('player--solo', atPosition.length === 1);

  pin.style.top = `${originTop + SQUARE_SIZE / 2}px`;
  pin.style.left = `${originLeft + SQUARE_SIZE / 2 + offsetX}px`;
}

export function movePlayer(player: Player, players: Player[], path: string[]): Position {
  const pin = document.querySelector(`#player-${player.id}`)! as HTMLElement;

  path.forEach((element, index) => {
    setTimeout(() => {
      const position = parseNotation(element);
      movePinTo(pin, player, players, position);
    }, STEP_DURATION_MS * index);
  });

  const finalNotation = path[path.length - 1];
  const finalPosition = parseNotation(finalNotation);

  if (!finalPosition.place) {
    return finalPosition;
  }

  return {
    ...finalPosition,
    id: finalNotation,
    path,
  };
}

import type { Player, Position } from '../types/game';

export const STEP_DURATION_MS = 200;

const SQUARE_WIDTH = 49;
const SQUARE_HEIGHT = 49;
const PADDING_TOP = 7;
const PADDING_LEFT = 3;

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

function getCenteredOffset(player: Player, players: Player[], position: Position): number {
  const playersAtSamePos = players.filter((p) => {
    if (p.id === player.id) return false;
    const pPos = p.position;
    if (position.place) {
      return pPos.place === position.place;
    }
    return (pPos.row ?? 0) === (position.row ?? 0) && (pPos.column ?? 0) === (position.column ?? 0);
  });

  playersAtSamePos.push(player);
  playersAtSamePos.sort((a, b) => a.id - b.id);

  const idx = playersAtSamePos.findIndex((p) => p.id === player.id);
  const N = playersAtSamePos.length;
  const spacing = 8;

  return 9.5 - 4 * (N - 1) + spacing * idx;
}

function movePinTo(pin: HTMLElement, player: Player, players: Player[], position: Position) {
  if (position.place) {
    return;
  }

  const offset = getCenteredOffset(player, players, position);
  pin.style.top = `${(position.row ?? 0) * SQUARE_WIDTH + PADDING_TOP}px`;
  pin.style.left = `${(position.column ?? 0) * SQUARE_HEIGHT + PADDING_LEFT + offset}px`;
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

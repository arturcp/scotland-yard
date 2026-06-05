import { isDebugMode } from '../../lib/debug-mode';
import MovementAnimation, { STEP_DURATION_MS } from '../../lib/movement-animation';
import type { GameShiftView, Position } from '../../types/game';

import './styles.css';

interface SquareProps {
  type: string;
  direction: string;
  updatePlayerPosition: (playerId: number, position: Position) => void;
  state: string;
  row: number;
  column: number;
  available: boolean;
  gameShift: GameShiftView;
  path: string[] | null;
}

export default function Square({
  type,
  direction,
  updatePlayerPosition,
  state,
  row,
  column,
  available,
  gameShift,
  path,
}: SquareProps) {
  const squareId = `${row},${column}`;
  const showCoords = isDebugMode() && state !== 'empty';
  const classes = `square ${state || ''} ${type} ${available ? 'available-square' : ''}${showCoords ? ' square-debug' : ''}`;

  function handleClick() {
    if (!available || !path) return;
    const { player, players } = gameShift;
    const newPosition = new MovementAnimation(player, players).move(path);
    setTimeout(() => {
      updatePlayerPosition(player.id, newPosition);
    }, path.length * STEP_DURATION_MS);
  }

  return (
    <div
      data-id={squareId}
      className={classes}
      data-direction={direction}
      data-row={row}
      data-column={column}
      onClick={handleClick}
    >
      {type === 'entrance' && <i className="fa fa-chevron-up"></i>}
      {showCoords && <span className="square-debug-coords">({row},{column})</span>}
    </div>
  );
}

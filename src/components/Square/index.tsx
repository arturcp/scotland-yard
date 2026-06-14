import { ChevronUp } from 'lucide-react';
import { isDebugMode } from '../../lib/debug-mode';
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
  canInteract?: boolean;
  onMove?: (destination: Position, path: string[]) => void;
}

export default function Square({
  type,
  direction,
  state,
  row,
  column,
  available,
  path,
  canInteract = true,
  onMove,
}: SquareProps) {
  const squareId = `${row},${column}`;
  const showCoords = isDebugMode() && state !== 'empty';
  const clickable = available && canInteract;
  const classes = `square ${state || ''} ${type} ${clickable ? 'available-square' : ''}${showCoords ? ' square-debug' : ''}`;

  function handleClick() {
    if (!clickable || !path || !onMove) return;
    onMove({ row, column, place: null, id: squareId, path }, path);
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
      {type === 'entrance' && <ChevronUp aria-hidden="true" size={24} strokeWidth={2} />}
      {showCoords && (
        <span className="square-debug-coords">
          ({row},{column})
        </span>
      )}
    </div>
  );
}

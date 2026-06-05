import type { GridCell } from '../../board/types';
import type { GameController } from '../../types/game';
import Square from '../Square';

export function buildSquares(list: GridCell[], row: number, game: GameController) {
  const gameShift = game.gameShift();

  return list.map((cell, column) => {
    const squareId = `${row},${column}`;
    const availableEntry = gameShift.availableSquares.find((s) => s.id === squareId && !s.place);
    const isAvailable = !!availableEntry;

    return (
      <Square
        key={squareId}
        type={cell.terrain === 'entrance' ? 'entrance' : ''}
        direction={cell.direction ?? ''}
        updatePlayerPosition={game.updatePlayerPosition}
        state={cell.terrain === 'empty' ? 'empty' : ''}
        row={row}
        column={column}
        available={isAvailable}
        gameShift={gameShift}
        path={availableEntry?.path ?? null}
      />
    );
  });
}

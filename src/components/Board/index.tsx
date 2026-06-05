import type { CSSProperties } from 'react';
import Places from '../Places';
import Player from '../Player';
import type { GameController, Player as GamePlayer } from '../../types/game';
import { GRID, zonePins } from '../../board';
import { buildSquares } from './square-factory';

import './styles.css';

interface BoardProps {
  players: GamePlayer[];
  game: GameController;
}

const PLACE_PINS = zonePins();

function playerPosition(player: GamePlayer): CSSProperties {
  const { position } = player;
  if (position.place) {
    return {
      top: PLACE_PINS[position.place].top,
      left: PLACE_PINS[position.place].left + 8 * (player.id - 1),
    };
  }
  return {
    top: (position.row ?? 0) * 49 + 7,
    left: (position.column ?? 0) * 49 + 3 + 8 * (player.id - 1),
  };
}

export default function Board({ players, game }: BoardProps) {
  return (
    <section id="board">
      {GRID.map((list, row) => buildSquares(list, row, game))}
      <Places game={game} />
      <div id="players">
        {players.map((player) => (
          <Player key={player.id} player={player} style={playerPosition(player)} />
        ))}
      </div>
    </section>
  );
}

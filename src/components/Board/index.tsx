import type { CSSProperties } from 'react';
import Places from '../Places';
import Player from '../Player';
import type { GameController, Player as GamePlayer } from '../../types/game';
import { GRID, zonePins } from '../../board';
import { piecePosition } from '../../board/layout';
import type { ZoneId } from '../../board/types';
import { buildSquares } from './square-factory';

import './styles.css';

interface BoardProps {
  players: GamePlayer[];
  game: GameController;
}

const PLACE_PINS = zonePins();

function playerPosition(player: GamePlayer, players: GamePlayer[]): CSSProperties {
  const { position } = player;
  const playersAtSamePos = players
    .filter((p) => {
      if (position.place) {
        return p.position.place === position.place;
      }
      return (
        (p.position.row ?? 0) === (position.row ?? 0) &&
        (p.position.column ?? 0) === (position.column ?? 0)
      );
    })
    .sort((a, b) => a.id - b.id);

  const idx = playersAtSamePos.findIndex((p) => p.id === player.id);
  const N = playersAtSamePos.length;

  if (position.place) {
    const zoneId = position.place as ZoneId;
    const spacing = 8;
    const leftStart = PLACE_PINS[zoneId].left + 12 - 4 * (N - 1);
    return {
      top: PLACE_PINS[zoneId].top,
      left: leftStart + spacing * idx,
    };
  }

  const { top, left } = piecePosition(position.row ?? 0, position.column ?? 0, idx, N);
  return { top, left };
}

export default function Board({ players, game }: BoardProps) {
  return (
    <div id="board-frame">
      <section id="board">
        {GRID.map((list, row) => buildSquares(list, row, game))}
        <Places game={game} />
        <div id="players">
          {players.map((player) => (
            <Player key={player.id} player={player} style={playerPosition(player, players)} />
          ))}
        </div>
      </section>
    </div>
  );
}

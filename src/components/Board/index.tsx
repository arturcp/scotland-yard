import type { CSSProperties } from 'react';
import Places from '../Places';
import Player from '../Player';
import type { GameController, Player as GamePlayer } from '../../types/game';
import { GRID, zonePins } from '../../board';
import { PIECE_CENTER_OFFSET, PIECE_SIZE, PIECE_SPACING, piecePosition } from '../../board/layout';
import type { ZoneId } from '../../board/types';
import { buildSquares } from './square-factory';

import './styles.css';

interface BoardProps {
  players: GamePlayer[];
  game: GameController;
}

const PLACE_PINS = zonePins();

function playersAtTile(player: GamePlayer, players: GamePlayer[]) {
  const { position } = player;

  return players
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
}

function playerPosition(player: GamePlayer, players: GamePlayer[]): CSSProperties {
  const { position } = player;
  const atTile = playersAtTile(player, players);
  const idx = atTile.findIndex((p) => p.id === player.id);
  const N = atTile.length;

  if (position.place) {
    const zoneId = position.place as ZoneId;
    const leftStart =
      PLACE_PINS[zoneId].left + PIECE_CENTER_OFFSET - (PIECE_SPACING / 2) * (N - 1);
    return {
      top: PLACE_PINS[zoneId].top,
      left: leftStart + PIECE_SPACING * idx,
    };
  }

  const { top, left } = piecePosition(position.row ?? 0, position.column ?? 0, idx, N);
  return { top, left };
}

export default function Board({ players, game }: BoardProps) {
  const { status } = game.gameShift();
  const isSelectingMove = status === 'in-progress' && game.canInteract;

  return (
    <div id="board-frame">
      <section
        id="board"
        className={`${isSelectingMove ? 'move-selection-active' : ''}${game.canInteract ? '' : ' board--locked'}`}
      >
        {GRID.map((list, row) => buildSquares(list, row, game))}
        <Places game={game} />
        <div id="players" style={{ '--piece-size': `${PIECE_SIZE}px` } as CSSProperties}>
          {players.map((player) => {
            const atTile = playersAtTile(player, players);
            const onGrid = !player.position.place;

            return (
              <Player
                key={player.id}
                player={player}
                style={playerPosition(player, players)}
                anchorCenter={onGrid}
                solo={onGrid && atTile.length === 1}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

import type { CSSProperties } from 'react';
import Places from '../Places';
import Player from '../Player';
import type { GameController, Player as GamePlayer } from '../../types/game';
import { GRID, zonePins } from '../../board';
import {
  getPiecePlacement,
  PIECE_CENTER_OFFSET,
  PIECE_SIZE,
  piecePosition,
} from '../../board/layout';
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

function playerPlacement(player: GamePlayer, players: GamePlayer[]) {
  const { position } = player;
  const atTile = playersAtTile(player, players);
  const idx = atTile.findIndex((p) => p.id === player.id);
  const N = atTile.length;
  const { offsetX, offsetY, scale } = getPiecePlacement(idx, N);

  if (position.place) {
    const zoneId = position.place as ZoneId;
    const pin = PLACE_PINS[zoneId];
    const centerX = pin.left + PIECE_CENTER_OFFSET + PIECE_SIZE / 2;
    const centerY = pin.top + PIECE_SIZE / 2;
    return {
      top: centerY + offsetY,
      left: centerX + offsetX,
      scale,
    };
  }

  const { top, left } = piecePosition(position.row ?? 0, position.column ?? 0, idx, N);
  return { top, left, scale };
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

            const placement = playerPlacement(player, players);

            return (
              <Player
                key={player.id}
                player={player}
                style={{ top: placement.top, left: placement.left }}
                anchorCenter={onGrid || Boolean(player.position.place)}
                solo={onGrid && atTile.length === 1}
                scale={placement.scale}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

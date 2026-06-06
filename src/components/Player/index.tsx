import type { CSSProperties } from 'react';
import type { Player as GamePlayer } from '../../types/game';

import './styles.css';

interface PlayerProps {
  player: GamePlayer;
  style: CSSProperties;
}

export default function Player({ player, style }: PlayerProps) {
  return (
    <div
      id={`player-${player.id}`}
      className={`player ${player.color}`}
      style={{ ...style, color: player.color }}
    >
      <i className="fa-solid fa-user"></i>
    </div>
  );
}

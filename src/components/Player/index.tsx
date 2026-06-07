import { UserRound } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Player as GamePlayer } from '../../types/game';

import './styles.css';

interface PlayerProps {
  player: GamePlayer;
  style: CSSProperties;
  anchorCenter?: boolean;
  solo?: boolean;
}

export default function Player({ player, style, anchorCenter = false, solo = false }: PlayerProps) {
  const classes = [
    'player',
    player.color,
    anchorCenter && 'player--anchor-center',
    solo && 'player--solo',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={`player-${player.id}`} className={classes} style={{ ...style, color: player.color }}>
      <UserRound aria-hidden="true" strokeWidth={2} fill="currentColor" />
    </div>
  );
}

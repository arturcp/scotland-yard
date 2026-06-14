import { UserRound } from 'lucide-react';
import type { CSSProperties } from 'react';
import { getPlayerColorValue, type Player as GamePlayer } from '../../types/game';

import './styles.css';

interface PlayerProps {
  player: GamePlayer;
  style: CSSProperties;
  anchorCenter?: boolean;
  solo?: boolean;
  scale?: number;
}

export default function Player({
  player,
  style,
  anchorCenter = false,
  solo = false,
  scale = 1,
}: PlayerProps) {
  const classes = [
    'player',
    player.color,
    anchorCenter && 'player--anchor-center',
    solo && 'player--solo',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      id={`player-${player.id}`}
      className={classes}
      style={
        {
          ...style,
          color: getPlayerColorValue(player.color),
          '--piece-scale': scale,
        } as CSSProperties
      }
    >
      <UserRound aria-hidden="true" strokeWidth={2} fill="currentColor" />
    </div>
  );
}

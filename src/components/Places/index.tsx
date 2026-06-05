import MovementAnimation from '../../lib/movement-animation';
import { ZONE_IDS as zoneIds } from '../../board';
import type { ZoneId } from '../../board/types';
import type { GameController } from '../../types/game';

import './sizes.css';
import './styles.css';

interface PlacesProps {
  game: GameController;
}

const PLACE_CLASSES: Record<ZoneId, string> = {
  'holmes-house': 'holmes-house w3 h4',
  museum: 'museum w6 h4',
  bar: 'bar w5 h3',
  'big-bang': 'big-bang w6 h2-half',
  drugstore: 'drugstore w6 h2-half',
  'book-store': 'book-store w4 h3',
  locksmith: 'locksmith w3 h3',
  key: 'key w3 h3',
  bridge: 'bridge w4 h4',
  docks: 'docks w6 h3',
  park: 'park w6 h6',
  pawnshop: 'pawnshop w3 h5',
  theater: 'theater w6 h3',
  hotel: 'hotel w3 h5',
  'cigar-shop': 'cigar-shop w3 h5',
  graveyard: 'graveyard w6 h2',
  'carriage-station': 'carriage-station w6 h3',
  bank: 'bank w7 h2',
  street: 'street w3 h3',
  'scotland-yard': 'scotland-yard w5 h3',
};

export default function Places({ game }: PlacesProps) {
  const { availableSquares } = game.gameShift();

  function handleZoneClick(zoneId: ZoneId, path: string[]) {
    const { player, players } = game.gameShift();
    const newPosition = new MovementAnimation(player, players).move(path);
    setTimeout(() => {
      game.updatePlayerPosition(player.id, newPosition);
    }, path.length * 500);
  }

  return (
    <div>
      {zoneIds.map((zoneId) => {
        const available = availableSquares.find((s) => s.place === zoneId);
        const className = `place ${PLACE_CLASSES[zoneId]}${available ? ' available-zone' : ''}`;

        return (
          <div
            key={zoneId}
            className={className}
            data-zone-id={zoneId}
            role={available ? 'button' : undefined}
            tabIndex={available ? 0 : undefined}
            onClick={() => {
              if (available?.path) handleZoneClick(zoneId, available.path);
            }}
            onKeyDown={(e) => {
              if (available?.path && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleZoneClick(zoneId, available.path);
              }
            }}
          />
        );
      })}
    </div>
  );
}

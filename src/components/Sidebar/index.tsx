import { useCallback, useEffect, useState } from 'react';
import MicroModal from 'micromodal';
import DiceRoll from '../DiceRoll';
import DiceIcon from './DiceIcon';
import { getAvailableSquares } from '../../lib/available-squares';
import type { GameController, Player } from '../../types/game';

import './styles.css';

interface SidebarProps {
  players: Player[];
  game: GameController;
}

export default function Sidebar({ players, game }: SidebarProps) {
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    MicroModal.init();
  }, []);

  function handleDiceClick() {
    if (rolling) {
      return;
    }

    setRolling(true);
  }

  const handleRollComplete = useCallback(
    (diceResult: number) => {
      const player = players[0];
      const results = getAvailableSquares(player, diceResult);
      game.updateAvailableSquares(results, diceResult);
      setRolling(false);
    },
    [game, players],
  );

  const { status, diceResult } = game.gameShift();
  const diceButtonClasses =
    status === 'waiting' ? 'dice-roll-trigger pulsate-fwd' : 'dice-roll-trigger';

  return (
    <aside id="sidebar">
      <ul>
        <li>
          <i className="fa-solid fa-magnifying-glass"></i>
        </li>
        <li>
          <i className="fa-regular fa-file-lines" data-micromodal-trigger="modal-notes"></i>
        </li>
        <li>
          <i className="fa-solid fa-user-secret"></i>
        </li>
        <li>
          <button
            type="button"
            className={diceButtonClasses}
            onClick={handleDiceClick}
            data-testid="dice-roll-trigger"
            aria-label="Roll dice"
            disabled={rolling}
          >
            <DiceIcon />
            {diceResult !== null && (
              <span className="dice-result-badge" data-testid="dice-result-badge">
                {diceResult}
              </span>
            )}
          </button>
        </li>
      </ul>
      {rolling && <DiceRoll onComplete={handleRollComplete} />}
    </aside>
  );
}

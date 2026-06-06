import { useCallback, useEffect, useState } from 'react';
import MicroModal from 'micromodal';
import DiceRoll from '../DiceRoll';
import DiceIcon from './DiceIcon';
import DetectiveLogo from './DetectiveLogo';
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
      <div className="sidebar-header">
        <DetectiveLogo />
        <span className="sidebar-title">Scotland Yard</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <button type="button" className="nav-item active" aria-current="page">
              <i className="fa-solid fa-house" aria-hidden="true" />
              <span>Inicio</span>
            </button>
          </li>
          <li>
            <button type="button" className="nav-item" data-micromodal-trigger="modal-notes">
              <i className="fa-regular fa-file-lines" aria-hidden="true" />
              <span>Notas</span>
            </button>
          </li>
          <li>
            <button type="button" className="nav-item">
              <i className="fa-solid fa-user-secret" aria-hidden="true" />
              <span>Jogadores</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className={diceButtonClasses}
              onClick={handleDiceClick}
              data-testid="dice-roll-trigger"
              aria-label="Rolar dados"
              disabled={rolling}
            >
              <DiceIcon />
              {diceResult !== null && (
                <span className="dice-result-badge" data-testid="dice-result-badge">
                  {diceResult}
                </span>
              )}
              <span>Dados</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="nav-item">
          <i className="fa-regular fa-circle-question" aria-hidden="true" />
          <span>Ajuda</span>
        </button>
      </div>

      {rolling && <DiceRoll onComplete={handleRollComplete} />}
    </aside>
  );
}

import { useEffect } from 'react';
import { CircleHelp, FileText, Home, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import MicroModal from 'micromodal';
import DiceIcon from './DiceIcon';
import DetectiveLogo from './DetectiveLogo';
import type { GameController } from '../../types/game';

import './styles.css';

interface SidebarProps {
  game: GameController;
  rolling: boolean;
  onRollStart: () => void;
}

export default function Sidebar({ game, rolling, onRollStart }: SidebarProps) {
  useEffect(() => {
    MicroModal.init();
  }, []);

  function handleDiceClick() {
    if (rolling) {
      return;
    }

    onRollStart();
  }

  const { status, diceResult } = game.gameShift();
  const diceButtonClasses =
    status === 'waiting' ? 'dice-roll-trigger pulsate-fwd' : 'dice-roll-trigger';

  return (
    <aside id="sidebar">
      <Link to="/" className="sidebar-header" aria-label="Voltar para a página inicial">
        <DetectiveLogo />
        <span className="sidebar-title">Scotland Yard</span>
      </Link>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <button type="button" className="nav-item active" aria-current="page">
              <Home aria-hidden="true" size={28} strokeWidth={1.75} />
              <span>Inicio</span>
            </button>
          </li>
          <li>
            <button type="button" className="nav-item" data-micromodal-trigger="modal-notes">
              <FileText aria-hidden="true" size={28} strokeWidth={1.75} />
              <span>Notas</span>
            </button>
          </li>
          <li>
            <button type="button" className="nav-item">
              <Users aria-hidden="true" size={28} strokeWidth={1.75} />
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
          <CircleHelp aria-hidden="true" size={28} strokeWidth={1.75} />
          <span>Ajuda</span>
        </button>
      </div>
    </aside>
  );
}

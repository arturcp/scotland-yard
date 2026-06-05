import { useEffect } from 'react';
import MicroModal from 'micromodal';
import { getAvailableSquares } from '../../lib/available-squares';
import type { GameController, Player } from '../../types/game';

import './styles.css';

interface SidebarProps {
  players: Player[];
  game: GameController;
}

function randomInt(min: number, max: number) {
  return min + Math.floor((max - min) * Math.random());
}

export default function Sidebar({ players, game }: SidebarProps) {
  useEffect(() => {
    MicroModal.init();
  }, []);

  function handlePlayClick() {
    const diceResult = randomInt(1, 6);
    alert('Rolagem de dados: ' + diceResult);
    const player = players[0];
    const results = getAvailableSquares(player, diceResult);
    game.updateAvailableSquares(results);
  }

  const { status } = game.gameShift();
  const playButtonClasses = status === 'waiting' ? 'fa fa-play pulsate-fwd' : 'fa fa-play';

  return (
    <aside id="sidebar">
      <ul>
        <li>
          <i className="fa fa-search"></i>
        </li>
        <li>
          <i className="fa fa-file-text-o" data-micromodal-trigger="modal-notes"></i>
        </li>
        <li>
          <i className="fa fa-user-secret"></i>
        </li>
        <li>
          <i className={playButtonClasses} onClick={handlePlayClick}></i>
        </li>
      </ul>
    </aside>
  );
}

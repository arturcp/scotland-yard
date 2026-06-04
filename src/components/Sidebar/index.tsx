import { Component } from 'react';
import MicroModal from 'micromodal';
import AvailableSquares from '../../lib/available-squares';
import type { GameController, Player } from '../../types/game';

import './styles.css';

interface SidebarProps {
  players: Player[];
  game: GameController;
}

class Sidebar extends Component<SidebarProps> {
  game = this.props.game;
  randomInt = (min: number, max: number) => min + Math.floor((max - min) * Math.random());

  componentDidMount() {
    MicroModal.init();

    const players = this.props.players;
    const playButton = document.querySelector('.fa-play');

    playButton?.addEventListener('click', () => {
      playButton.classList.remove('pulsate-fwd');
      const diceResult = this.randomInt(1, 6);
      alert('Rolagem de dados: ' + diceResult);
      const player = players[0];
      const results = new AvailableSquares(player).all(diceResult);

      this.game.updateAvailableSquares(results);
    });
  }

  playButtonClasses = () => {
    const gameShift = this.game.gameShift();

    if (gameShift.status === 'waiting') {
      return 'fa fa-play pulsate-fwd';
    }
    return 'fa fa-play';
  };

  render() {
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
            <i className={this.playButtonClasses()}></i>
          </li>
        </ul>
      </aside>
    );
  }
}

export default Sidebar;

import React, { Component } from 'react';
import MicroModal from 'micromodal';
import AvailableSquares from '../../lib/available-squares';
import './styles.css';

class Sidebar extends Component {
  game = this.props.game
  randomInt = (min, max) => min + Math.floor((max - min) * Math.random())

  componentDidMount() {
    MicroModal.init();

    const players = this.props.players,
          playButton = document.querySelector('.fa-play');

    playButton.classList.add('pulsate-fwd');

    playButton.addEventListener('click', () => {
      playButton.classList.remove('pulsate-fwd');
      const diceResult = this.randomInt(1, 6);
      alert('Rolagem de dados: ' + diceResult);
      const player = players[0],
            results = new AvailableSquares(player).all(diceResult);

      this.game.updateAvailableSquares(results);
    });
  }

  playButtonClasses = () => {
    const gameShift = this.game.gameShift();

    if (gameShift.status === 'in-progress') {
      return 'fa fa-play pulsate-fwd';
    } else {
      return 'fa fa-play';
    }
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
    )
  }
}

export default Sidebar;

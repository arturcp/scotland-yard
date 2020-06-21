import React, { Component } from 'react';
import MicroModal from 'micromodal';
import AvailableSquares from '../../lib/available-squares';
import MovementAnimation from '../../lib/movement-animation';
import './styles.css';

class Sidebar extends Component {
  componentDidMount() {
    MicroModal.init();

    const players = this.props.players,
          playButton = document.querySelector('.fa-play');

    playButton.addEventListener('click', () => {
      const player = players[0],
            results = new AvailableSquares(player).all(6),
            board = document.querySelector('#board');

      results.forEach(element => {
        const square = board.querySelector('[data-id="' + element.id + '"]')

        // TODO: This should be done through setstate in the parent
        square.classList.add('available-square');

        square.addEventListener('click', () => {
          if (window.confirm('Tem certeza?')) {
            const availableSquares = document.querySelectorAll('.available-square');
            availableSquares.forEach((element) => element.classList.remove('available-square'));
            const newPosition = new MovementAnimation(player).move(element.path);
            setTimeout(() => {
              this.props.updatePlayerPosition(player.id, newPosition);
            }, element.path.length * 500);
          }
        });
      });
    });
  }

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
            <i className="fa fa-play"></i>
          </li>
        </ul>
      </aside>
    )
  }
}

export default Sidebar;

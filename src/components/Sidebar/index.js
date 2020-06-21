import React, { Component } from 'react';
import MicroModal from 'micromodal';
import PlayerMovement from '../../lib/player-movement';
import './styles.css';

class Sidebar extends Component {
  componentDidMount() {
    MicroModal.init();

    const players = this.props.players,
          playButton = document.querySelector('.fa-play');

    playButton.addEventListener('click', () => {
      this.props.callback();
      var results = new PlayerMovement(players[0]).all(6),
      board = document.querySelector('#board');

      results.forEach(element => {
        board.querySelector('[data-id="' + element.id + '"]').classList.add('available-square');
      });

      console.log('results');
      console.log(results);
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

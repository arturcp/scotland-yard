import React, { Component } from 'react';
import Board from '../Board'
import Sidebar from '../Sidebar'
import Notes from '../Notes'

import './styles.css';

class Game extends Component {
  state = {
    players: [
      { id: 1, name: 'John', color: 'blue', position: { row: 10, column: 10, place: null } },
      { id: 2, name: 'Jane', color: 'yellow', position: { row: 10, column: 10, place: null } },
      { id: 3, name: 'Josh', color: 'brown', position: { row: 10, column: 10, place: null } },
      { id: 4, name: 'Joan', color: 'lightpink', position: { row: 10, column: 10, place: null } },
    ]
  };

    // var results = new PlayerMovement(players[0]).all(6),
    //     board = document.querySelector('#board');

    // results.forEach(element => {
    //   board.querySelector('[data-id="' + element.id + '"]').style.backgroundColor = 'red';
    // });

    // console.log('results');
    // console.log(results);

  render() {
    const { players } = this.state;

    return (
      <div id="container">
        <Sidebar />
        <Board players={players}/>
        <Notes />
      </div>
    )
  }
}

export default Game;

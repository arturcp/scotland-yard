import React, { Component } from 'react';
import Board from '../Board'
import Sidebar from '../Sidebar'
import Notes from '../Notes'
import Player from '../Player';

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



  playerPosition = (player) => {
    const position = player.position;
    if (position.place) {
      return { top: this.state.places[position.place].top, left: this.state.places[position.place].left + 8 * (player.id - 1) }
    } else {
      return { top: position.row * 49 + 7, left: position.column * 49 + 3 + 8 * (player.id - 1) }
    };
  }

  render() {
    const { players } = this.state;
    const boardPlayers = players.map((player, row) => {
      return <Player player={player} key={player.id} style={this.playerPosition(player)}/>
    });

    return (
      <div id="container">
        <Sidebar />
        <Board players={players}/>
        <Notes />
        <div id="players">
          {boardPlayers}
        </div>
      </div>
    )
  }
}

export default Game;

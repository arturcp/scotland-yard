import React, { Component } from 'react';
import Board from '../Board'
import Sidebar from '../Sidebar'
import Notes from '../Notes'

import './styles.css';

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [
        { id: 1, name: 'John', color: 'blue', position: { row: 10, column: 10, place: null } },
        { id: 2, name: 'Jane', color: 'yellow', position: { row: 10, column: 10, place: null } },
        { id: 3, name: 'Josh', color: 'brown', position: { row: 10, column: 10, place: null } },
        { id: 4, name: 'Joan', color: 'lightpink', position: { row: 10, column: 10, place: null } },
      ]
    };
  }

  updatePlayerPosition = (playerId, position) => {
    const list = [];
    this.state.players.forEach(player => {
      if (player.id === playerId) {
        player.position = position
      }

      list.push(player);
    });
    this.setState({ players: list });
    console.log(this.state.players)
  }

  render() {
    const { players } = this.state;

    return (
      <div id="container">
        <Sidebar players={players} updatePlayerPosition={this.updatePlayerPosition}/>
        <Board players={players} />
        <Notes />
      </div>
    )
  }
}

export default Game;

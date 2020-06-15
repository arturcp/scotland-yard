import React, { Component } from 'react';
import Board from '../Board'
import Sidebar from '../Sidebar'
import Notes from '../Notes'
import './styles.css';

class Game extends Component {
  state = {
    players: [
      { id: 1, name: 'John', color: 'blue', position: { row: null, column: null, place: 'holmes-house' } },
      { id: 2, name: 'Jane', color: 'yellow', position: { row: null, column: null, place: 'hotel' } }
    ]
  };
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

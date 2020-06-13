import React, { Component } from 'react';
import Board from '../Board'
import Sidebar from '../Sidebar'
import Notes from '../Notes'
import './styles.css';

class Game extends Component {
  render() {
    return (
      <div id="container">
        <Sidebar />
        <Board />
        <Notes />
      </div>
    )
  }
}

export default Game;

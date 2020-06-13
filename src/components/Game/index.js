import React, { Component } from 'react';
import Board from '../Board'
import Sidebar from '../Sidebar'
import './styles.css';

class Game extends Component {
  render() {
    return (
      <div id="container">
        <Sidebar />
        <Board />
      </div>
    )
  }
}

export default Game;

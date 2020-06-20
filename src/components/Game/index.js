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
      ],
      debug: false
    };
  }

  callback = () => {
    this.setState({ debug: true });
  }

  render() {
    const { players } = this.state;

    return (
      <div id="container">
        <Sidebar players={players} callback={this.callback}/>
        <Board players={players} debug={this.state.debug}/>
        <Notes />
      </div>
    )
  }
}

export default Game;

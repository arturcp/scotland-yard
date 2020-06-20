import React, { Component } from 'react';
import Places from '../Places';
import BoardData from './board-data';
import SquareFactory from './square-factory';
import Player from '../Player';

import './styles.css';

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: BoardData.squares,
      places: BoardData.places
    }
  }

  playerPosition = (player) => {
    const position = player.position;
    if (position.place) {
      return { top: this.state.places[position.place].top, left: this.state.places[position.place].left + 8 * (player.id - 1) }
    } else {
      return { top: position.row * 49 + 7, left: position.column * 49 + 3 + 8 * (player.id - 1) }
    };
  }

  render() {
    const { squares } = this.state,
          players = this.props.players;

    const squareFactory = new SquareFactory();
    const boardSquares = squares.map((list, row) => {
      return squareFactory.buildSquares(list, row, this.props.debug);
    });

    const boardPlayers = players.map((player, row) => {
      return <Player player={player} key={player.id} style={this.playerPosition(player)}/>
    });

    return (
      <section id="board">
        {boardSquares}
        <Places />
        <div id="players">
          {boardPlayers}
        </div>
      </section>
    )
  }
}

export default Board;

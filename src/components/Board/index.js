import React, { Component } from 'react';
import Places from '../Places';
import Player from '../Player';

import BoardData from './board-data';
import SquareFactory from './square-factory';
import './styles.css';

class Board extends Component {
  state = {
    squares: BoardData.squares,
    players: this.props.players,
    places: BoardData.places
  }

  playerPosition = (player) => {
    const position = player.position;
    if (position.place) {
      return { top: this.state.places[position.place].top, left: this.state.places[position.place].left + 8 * (player.id - 1) }
    };
  }

  render() {
    const { squares, players } = this.state;
    const squareFactory = new SquareFactory();
    const boardSquares = squares.map((list, row) => {
      return squareFactory.buildSquares(list, row);
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

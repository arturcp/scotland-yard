import React, { Component } from 'react';
import Places from '../Places';
import BoardData from './board-data';
import SquareFactory from './square-factory';
import Player from '../Player';

import './styles.css';

class Board extends Component {
  constructor(props) {
    super(props);
    this.squares = BoardData.squares;
    this.places = BoardData.places;
    this.game = props.game;
  }

  // TODO: can this go to the player
  playerPosition = (player) => {
    const position = player.position;
    if (position.place) {
      return { top: this.places[position.place].top, left: this.places[position.place].left + 8 * (player.id - 1) }
    } else {
      return { top: position.row * 49 + 7, left: position.column * 49 + 3 + 8 * (player.id - 1) }
    };
  }

  render() {
    const players = this.props.players;

    const squareFactory = new SquareFactory();
    const boardSquares = this.squares.map((list, row) => {
      return squareFactory.buildSquares(list, row, this.game);
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

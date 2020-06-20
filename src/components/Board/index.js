import React, { Component } from 'react';
import Places from '../Places';
import BoardData from '../../lib/board-data';
import SquareFactory from './square-factory';
import './styles.css';

class Board extends Component {
  state = {
    squares: BoardData.squares,
    players: this.props.players,
    places: BoardData.places,
    availableMovements: []
  }

  render() {
    const { squares } = this.state;
    const squareFactory = new SquareFactory();
    const boardSquares = squares.map((list, row) => {
      return squareFactory.buildSquares(list, row);
    });

    return (
      <section id="board">
        {boardSquares}
        <Places />
      </section>
    )
  }
}

export default Board;

import React, { Component } from 'react';
import Square from '../Square';
import Places from '../Places';
import './styles.css';

class Board extends Component {
  state = {
    // 0: empty square
    // 1: square
    // 2: Down arrow
    // 3: Left arrow
    // 4: Up arrow
    // 5: Right arrow
    // 6: Home
    squares: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0],
      [0, 0, 0, 0, 4, 1, 1, 4, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 6, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 2, 1, 1, 1, 1, 5, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 4, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [5, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 5, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 4, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
  }

  entranceDirection = (squareValue) => {
    switch (squareValue) {
      case 2: return 'down';
      case 3: return 'left';
      case 4: return 'up';
      case 5: return 'right';
      default: return '';
    }
  }

  squareType = (squareValue) => {
    switch (squareValue) {
      case 2:
      case 3:
      case 4:
      case 5:
        return 'entrance';
      case 6:
        return 'start';
      default:
        return '';
    }
  }

  printSquare = (list, row) => {
    return list.map((squareValue, column) => {
      const state = squareValue === 0 ? 'empty' : '';
      const type = this.squareType(squareValue);
      const direction = this.entranceDirection(squareValue);

      return <Square type={type} direction={direction} state={state} row={row} column={column} key={row + column} />
    });
  }

  render() {
    const { squares } = this.state;
    const items = squares.map((list, row) => {
      return this.printSquare(list, row);
    });

    return (
      <section id="board">
        {items}
        <Places />
      </section>
    )
  }
}

export default Board;

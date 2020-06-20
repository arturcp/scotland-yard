import React from 'react';
import Square from '../Square';

class SquareFactory {
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
      default:
        return '';
    }
  }

  buildSquares = (list, row) => {
    const self = this;

    return list.map((squareValue, column) => {
      const squareState = squareValue === 0 ? 'empty' : '';
      const type = self.squareType(squareValue);
      const direction = self.entranceDirection(squareValue);

      return <Square type={type} direction={direction} state={squareState} row={row} column={column} key={row + column} />
    });
  }
}

export default SquareFactory;

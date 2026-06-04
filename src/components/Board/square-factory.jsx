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

  buildSquares = (list, row, game) => {
    const gameShift = game.gameShift(),
          self = this;

    return list.map((squareValue, column) => {
      const squareState = squareValue === 0 ? 'empty' : '';
      const availableSquareList = gameShift.availableSquares.filter((element) => element.id === `${row},${column}`);
      const isAvailable = availableSquareList.length > 0;
      const path = isAvailable ? availableSquareList[0].path : null;

      return <Square
        type={self.squareType(squareValue)}
        direction={self.entranceDirection(squareValue)}
        updatePlayerPosition={game.updatePlayerPosition}
        state={squareState}
        row={row}
        column={column}
        key={row + ',' + column}
        available={isAvailable}
        gameShift={gameShift}
        path={path} />
    });
  }
}

export default SquareFactory;

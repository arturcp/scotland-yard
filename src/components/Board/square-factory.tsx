import Square from '../Square';
import type { GameController } from '../../types/game';

type EntranceDirection = 'down' | 'left' | 'up' | 'right' | '';
type SquareType = 'entrance' | '';

class SquareFactory {
  entranceDirection = (squareValue: number): EntranceDirection => {
    switch (squareValue) {
      case 2:
        return 'down';
      case 3:
        return 'left';
      case 4:
        return 'up';
      case 5:
        return 'right';
      default:
        return '';
    }
  };

  squareType = (squareValue: number): SquareType => {
    switch (squareValue) {
      case 2:
      case 3:
      case 4:
      case 5:
        return 'entrance';
      default:
        return '';
    }
  };

  buildSquares = (list: number[], row: number, game: GameController) => {
    const gameShift = game.gameShift();

    return list.map((squareValue, column) => {
      const squareState = squareValue === 0 ? 'empty' : '';
      const availableSquareList = gameShift.availableSquares.filter(
        (element) => element.id === `${row},${column}`,
      );
      const isAvailable = availableSquareList.length > 0;
      const path = isAvailable ? availableSquareList[0].path : null;

      return (
        <Square
          type={this.squareType(squareValue)}
          direction={this.entranceDirection(squareValue)}
          updatePlayerPosition={game.updatePlayerPosition}
          state={squareState}
          row={row}
          column={column}
          key={row + ',' + column}
          available={isAvailable}
          gameShift={gameShift}
          path={path}
        />
      );
    });
  };
}

export default SquareFactory;

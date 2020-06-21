import BoardData from '../components/Board/board-data'
import PlayerPosition from './player-position'

class PlayerMovement {
  constructor(player) {
    this.player = player;
  }

  all = (diceResult) => {
    let data = this.cloneBoardData(BoardData.squares),
        position = this.player.position,
        playerPosition = new PlayerPosition(data, position);

    data[position.row][position.column] = 'S';

    return this.findNextMove([], playerPosition, data, diceResult + 1);
  }

  cloneBoardData = (boardData) => {
    return JSON.parse(JSON.stringify(boardData));
  }

  findNextMove = (results, position, boardData, movesRemaining) => {
    if (movesRemaining > 0) {
      const updatedBoardData = this.cloneBoardData(boardData),
            startPosition = position.startPosition();

      if (position.availableSquare() || startPosition) {
        if (!startPosition) {
          updatedBoardData[position.row][position.column] = '*';
          results = this.resultsWithPosition(results, position);
        }

        if (position.canMove()) {
          movesRemaining--;

          results = this.findNextMove(results, position.up(), updatedBoardData, movesRemaining);
          results = this.findNextMove(results, position.down(), updatedBoardData, movesRemaining);
          results = this.findNextMove(results, position.left(), updatedBoardData, movesRemaining);
          results = this.findNextMove(results, position.right(), updatedBoardData, movesRemaining);
        }
      }
    }

    return results;
  }

  resultsWithPosition = (results, position) => {
    if (!this.existInArray(results, position.id)) {
      results.push(position.current);
    }
    return results;
  }

  existInArray = (array, id) => {
    const filteredElements = array.filter(function(item, index) {
      return item.id === id;
    });

    return filteredElements.length > 0
  }
}

export default PlayerMovement;

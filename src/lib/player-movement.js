import BoardData from '../components/Board/board-data'
import PlayerPosition from './player-position'

class PlayerMovement {
  constructor(player) {
    this.player = player;
  }

  markInitialPosition = (data, position) => data[position.row][position.column] = 'S'
  markCurrentPosition = (data, position) => data[position.row][position.column] = '*'
  cloneBoard = (boardData) => JSON.parse(JSON.stringify(boardData))

  all = (diceResult) => {
    let data = this.cloneBoard(BoardData.squares),
        position = new PlayerPosition(data, this.player.position);

    this.markInitialPosition(data, position.current);
    return this.findNextMove([], position, data, diceResult + 1);
  }

  findNextMove = (results, position, boardData, movesRemaining) => {
    if (movesRemaining > 0) {
      const board = this.cloneBoard(boardData),
            startPosition = position.initialPosition();

      if (position.availableSquare() || startPosition) {
        if (!startPosition) {
          this.markCurrentPosition(board, position);
          results = this.savePosition(results, position);
        }

        if (position.canMove()) {
          movesRemaining--;

          results = this.findNextMove(results, position.up(), board, movesRemaining);
          results = this.findNextMove(results, position.down(), board, movesRemaining);
          results = this.findNextMove(results, position.left(), board, movesRemaining);
          results = this.findNextMove(results, position.right(), board, movesRemaining);
        }
      }
    }

    return results;
  }

  savePosition = (results, position) => {
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

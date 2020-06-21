import BoardData from '../components/Board/board-data'
import PlayerPosition from './player-position'

class AvailableSquares {
  constructor(player) {
    this.player = player;
  }

  markInitialPosition = (data, position) => data[position.row][position.column] = 'S'
  clone = (data) => JSON.parse(JSON.stringify(data))
  markCurrentPosition = (data, path, position) => {
    data[position.row][position.column] = '*';
    path.push(position.id);
  }

  all = (diceResult) => {
    let data = this.clone(BoardData.squares),
        position = new PlayerPosition(data, this.player.position);

    this.markInitialPosition(data, position.current);
    return this.findNextMove([], [], position, data, diceResult + 1);
  }

  findNextMove = (results, path, position, boardData, movesRemaining) => {
    if (movesRemaining > 0) {
      const board = this.clone(boardData),
            currentPath = this.clone(path);

      if (position.availableSquare() || position.initialPosition()) {
        this.checkpoint(results, currentPath, board, position);

        if (position.canMove()) {
          movesRemaining--;

          this.findNextMove(results, currentPath, position.up(), board, movesRemaining);
          this.findNextMove(results, currentPath, position.down(), board, movesRemaining);
          this.findNextMove(results, currentPath, position.left(), board, movesRemaining);
          this.findNextMove(results, currentPath, position.right(), board, movesRemaining);
        }
      }
    }

    return results;
  }

  checkpoint = (results, path, board, position) => {
    if (!position.initialPosition()) {
      this.markCurrentPosition(board, path, position);
      this.savePosition(results, path, position);
    }
  }

  savePosition = (results, path, position) => {
    if (!this.existInArray(results, position.id)) {
      const data = position.current;
      data.path = path;
      results.push(data);
    }
  }

  existInArray = (array, id) => {
    const filteredElements = array.filter(function(item, index) {
      return item.id === id;
    });

    return filteredElements.length > 0
  }
}

export default AvailableSquares;

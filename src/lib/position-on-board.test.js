import PositionOnBoard from './position-on-board'
import BoardData from '../components/Board/board-data'

const freshBoard = () => JSON.parse(JSON.stringify(BoardData.squares))

describe('PositionOnBoard', () => {
  describe('initialization', () => {
    test('builds the correct string id', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 3, column: 7 })
      expect(pos.id).toBe('3,7')
    })

    test('sets the id on the current position object', () => {
      const current = { row: 3, column: 7 }
      new PositionOnBoard(freshBoard(), current)
      expect(current.id).toBe('3,7')
    })
  })

  describe('availableSquare', () => {
    test('returns true for a square with value > 0', () => {
      // Row 0, col 10 has value 1
      const pos = new PositionOnBoard(freshBoard(), { row: 0, column: 10 })
      expect(pos.availableSquare()).toBe(true)
    })

    test('returns false for an empty square (value 0)', () => {
      // Row 0, col 0 has value 0
      const pos = new PositionOnBoard(freshBoard(), { row: 0, column: 0 })
      expect(pos.availableSquare()).toBe(false)
    })

    test('accepts explicit row and column arguments', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 0, column: 0 })
      expect(pos.availableSquare(0, 10)).toBe(true)
      expect(pos.availableSquare(0, 0)).toBe(false)
    })
  })

  describe('initialPosition', () => {
    test('returns true when the current cell is marked S', () => {
      const board = freshBoard()
      board[4][10] = 'S'
      const pos = new PositionOnBoard(board, { row: 4, column: 10 })
      expect(pos.initialPosition()).toBe(true)
    })

    test('returns false when the current cell is not S', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 0, column: 10 })
      expect(pos.initialPosition()).toBe(false)
    })
  })

  describe('movement', () => {
    test('moveUp decrements the row', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 5, column: 10 })
      const up = pos.moveUp()
      expect(up.row).toBe(4)
      expect(up.column).toBe(10)
    })

    test('moveDown increments the row', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 5, column: 10 })
      const down = pos.moveDown()
      expect(down.row).toBe(6)
      expect(down.column).toBe(10)
    })

    test('moveLeft decrements the column', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 5, column: 10 })
      const left = pos.moveLeft()
      expect(left.row).toBe(5)
      expect(left.column).toBe(9)
    })

    test('moveRight increments the column', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 5, column: 10 })
      const right = pos.moveRight()
      expect(right.row).toBe(5)
      expect(right.column).toBe(11)
    })

    test('each move returns a new PositionOnBoard instance', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 5, column: 10 })
      expect(pos.moveUp()).toBeInstanceOf(PositionOnBoard)
    })
  })

  describe('canMove', () => {
    test('returns true when at least one neighbour is available', () => {
      // Row 0, col 10 has value 1; col 11 also has value 1 (can move right)
      const pos = new PositionOnBoard(freshBoard(), { row: 0, column: 10 })
      expect(pos.canMove()).toBe(true)
    })

    test('canMoveUp returns false at row 0', () => {
      const pos = new PositionOnBoard(freshBoard(), { row: 0, column: 10 })
      expect(pos.canMoveUp()).toBe(false)
    })

    test('canMoveRight returns true when the right cell is available', () => {
      // Row 0, col 10 → col 11 has value 1
      const pos = new PositionOnBoard(freshBoard(), { row: 0, column: 10 })
      expect(pos.canMoveRight()).toBe(true)
    })

    test('canMoveDown returns true when the cell below is available', () => {
      // Row 0, col 10 has value 1; row 1, col 10 also has value 1
      const pos = new PositionOnBoard(freshBoard(), { row: 0, column: 10 })
      expect(pos.canMoveDown()).toBe(true)
    })
  })
})

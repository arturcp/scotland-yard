import { cloneGrid } from '../board/grid';
import {
  availableSquare,
  canMove,
  canMoveDown,
  canMoveRight,
  canMoveUp,
  createBoardPosition,
  initialPosition,
  moveDown,
  moveLeft,
  moveRight,
  moveUp,
} from '../board/navigator';

const freshBoard = () => cloneGrid();

describe('board position', () => {
  describe('initialization', () => {
    test('builds the correct string id', () => {
      const pos = createBoardPosition(freshBoard(), { row: 3, column: 7 });
      expect(pos.id).toBe('3,7');
    });

    test('sets the id on the current position object', () => {
      const current: { row: number; column: number; id?: string } = { row: 3, column: 7 };
      createBoardPosition(freshBoard(), current);
      expect(current.id).toBe('3,7');
    });
  });

  describe('availableSquare', () => {
    test('returns true for a walkable cell', () => {
      const pos = createBoardPosition(freshBoard(), { row: 0, column: 10 });
      expect(availableSquare(pos)).toBe(true);
    });

    test('returns false for an empty cell', () => {
      const pos = createBoardPosition(freshBoard(), { row: 0, column: 0 });
      expect(availableSquare(pos)).toBe(false);
    });

    test('accepts explicit row and column arguments', () => {
      const pos = createBoardPosition(freshBoard(), { row: 0, column: 0 });
      expect(availableSquare(pos, 0, 10)).toBe(true);
      expect(availableSquare(pos, 0, 0)).toBe(false);
    });
  });

  describe('initialPosition', () => {
    test('returns true when the current cell is marked S', () => {
      const board = freshBoard();
      (board[4] as Array<(typeof board)[number][number] | 'S'>)[10] = 'S';
      const pos = createBoardPosition(board, { row: 4, column: 10 });
      expect(initialPosition(pos)).toBe(true);
    });

    test('returns false when the current cell is not S', () => {
      const pos = createBoardPosition(freshBoard(), { row: 0, column: 10 });
      expect(initialPosition(pos)).toBe(false);
    });
  });

  describe('movement', () => {
    test('moveUp decrements the row', () => {
      const pos = createBoardPosition(freshBoard(), { row: 5, column: 10 });
      const up = moveUp(pos);
      expect(up.row).toBe(4);
      expect(up.column).toBe(10);
    });

    test('moveDown increments the row', () => {
      const pos = createBoardPosition(freshBoard(), { row: 5, column: 10 });
      const down = moveDown(pos);
      expect(down.row).toBe(6);
      expect(down.column).toBe(10);
    });

    test('moveLeft decrements the column', () => {
      const pos = createBoardPosition(freshBoard(), { row: 5, column: 10 });
      const left = moveLeft(pos);
      expect(left.row).toBe(5);
      expect(left.column).toBe(9);
    });

    test('moveRight increments the column', () => {
      const pos = createBoardPosition(freshBoard(), { row: 5, column: 10 });
      const right = moveRight(pos);
      expect(right.row).toBe(5);
      expect(right.column).toBe(11);
    });

    test('each move returns a new position object', () => {
      const pos = createBoardPosition(freshBoard(), { row: 5, column: 10 });
      expect(moveUp(pos)).not.toBe(pos);
    });
  });

  describe('canMove', () => {
    test('returns true when at least one neighbour is available', () => {
      const pos = createBoardPosition(freshBoard(), { row: 0, column: 10 });
      expect(canMove(pos)).toBe(true);
    });

    test('canMoveUp returns false at row 0', () => {
      const pos = createBoardPosition(freshBoard(), { row: 0, column: 10 });
      expect(canMoveUp(pos)).toBe(false);
    });

    test('canMoveRight returns true when the right cell is available', () => {
      const pos = createBoardPosition(freshBoard(), { row: 0, column: 10 });
      expect(canMoveRight(pos)).toBe(true);
    });

    test('canMoveDown returns true when the cell below is available', () => {
      const pos = createBoardPosition(freshBoard(), { row: 0, column: 10 });
      expect(canMoveDown(pos)).toBe(true);
    });
  });
});

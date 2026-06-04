import { render } from '@testing-library/react';
import type { GameController, Player } from '../../types/game';
import Board from './index';

const players: Player[] = [
  { id: 1, name: 'John', color: 'blue', position: { row: 10, column: 10, place: null } },
  { id: 2, name: 'Jane', color: 'yellow', position: { row: 10, column: 10, place: null } },
];

const makeGame = (): GameController => ({
  gameShift: () => ({ player: players[0], availableSquares: [], status: 'waiting' }),
  updatePlayerPosition: vi.fn(),
  updateAvailableSquares: vi.fn(),
});

describe('Board', () => {
  test('renders the board section', () => {
    const { container } = render(<Board players={players} game={makeGame()} />);
    expect(container.querySelector('#board')).toBeInTheDocument();
  });

  test('renders a players container', () => {
    const { container } = render(<Board players={players} game={makeGame()} />);
    expect(container.querySelector('#players')).toBeInTheDocument();
  });

  test('renders all provided players', () => {
    const { container } = render(<Board players={players} game={makeGame()} />);
    expect(container.querySelector('#player-1')).toBeInTheDocument();
    expect(container.querySelector('#player-2')).toBeInTheDocument();
  });

  test('renders board squares', () => {
    const { container } = render(<Board players={players} game={makeGame()} />);
    expect(container.querySelectorAll('.square').length).toBeGreaterThan(0);
  });

  test('renders place elements', () => {
    const { container } = render(<Board players={players} game={makeGame()} />);
    expect(container.querySelectorAll('.place').length).toBeGreaterThan(0);
  });

  test('marks available squares', () => {
    const availableSquares = [{ id: '0,10', row: 0, column: 10, path: ['0,10'] }];
    const game: GameController = {
      gameShift: () => ({ player: players[0], availableSquares, status: 'in-progress' }),
      updatePlayerPosition: vi.fn(),
      updateAvailableSquares: vi.fn(),
    };
    const { container } = render(<Board players={players} game={game} />);
    expect(container.querySelector('.available-square')).toBeInTheDocument();
  });
});

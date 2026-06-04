import { render } from '@testing-library/react';
import Game from './index';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

beforeAll(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Game', () => {
  describe('rendering', () => {
    test('renders the main container', () => {
      const { container } = render(<Game />);
      expect(container.querySelector('#container')).toBeInTheDocument();
    });

    test('renders the board', () => {
      const { container } = render(<Game />);
      expect(container.querySelector('#board')).toBeInTheDocument();
    });

    test('renders the sidebar', () => {
      const { container } = render(<Game />);
      expect(container.querySelector('#sidebar')).toBeInTheDocument();
    });

    test('renders the notes modal', () => {
      const { container } = render(<Game />);
      expect(container.querySelector('#modal-notes')).toBeInTheDocument();
    });

    test('renders all 4 players', () => {
      const { container } = render(<Game />);
      expect(container.querySelectorAll('[id^="player-"]')).toHaveLength(4);
    });
  });

  describe('updateAvailableSquares', () => {
    test('updates gameShift status to in-progress', () => {
      const game = new Game({});
      game.state = {
        players: [],
        gameShift: { status: 'waiting', availableSquares: [], playerId: 1 },
      };
      game.setState = ((updater) => {
        const next =
          typeof updater === 'function' ? updater(game.state, game.state) : { ...game.state, ...updater };
        game.state = next as typeof game.state;
      }) as typeof game.setState;

      const squares = [{ id: '0,10', row: 0, column: 10, path: ['0,10'] }];
      game.updateAvailableSquares(squares);

      expect(game.state.gameShift.status).toBe('in-progress');
      expect(game.state.gameShift.availableSquares).toEqual(squares);
    });
  });

  describe('updatePlayerPosition', () => {
    test('resets gameShift to waiting after a move', () => {
      const game = new Game({});
      game.state = {
        players: [{ id: 1, name: 'John', color: 'blue', position: { row: 0, column: 0, place: null } }],
        gameShift: { status: 'in-progress', availableSquares: [{ id: '1,0', row: 1, column: 0, path: [] }], playerId: 1 },
      };
      game.setState = ((updater) => {
        const next =
          typeof updater === 'function' ? updater(game.state, game.state) : { ...game.state, ...updater };
        game.state = next as typeof game.state;
      }) as typeof game.setState;

      game.updatePlayerPosition(1, { row: 1, column: 0, place: null });

      expect(game.state.gameShift.status).toBe('waiting');
      expect(game.state.gameShift.availableSquares).toEqual([]);
    });

    test('updates the correct player position', () => {
      const game = new Game({});
      game.state = {
        players: [
          { id: 1, name: 'John', color: 'blue', position: { row: 0, column: 0, place: null } },
          { id: 2, name: 'Jane', color: 'yellow', position: { row: 0, column: 0, place: null } },
        ],
        gameShift: { status: 'in-progress', availableSquares: [], playerId: 1 },
      };
      game.setState = ((updater) => {
        const next =
          typeof updater === 'function' ? updater(game.state, game.state) : { ...game.state, ...updater };
        game.state = next as typeof game.state;
      }) as typeof game.setState;

      const newPosition = { row: 3, column: 5, place: null };
      game.updatePlayerPosition(2, newPosition);

      const updated = game.state.players.find((p) => p.id === 2);
      expect(updated?.position).toEqual(newPosition);
    });
  });

  describe('gameShift', () => {
    test('returns the active player and available squares', () => {
      const { container } = render(<Game />);
      expect(container.querySelector('.fa-play')).toHaveClass('pulsate-fwd');
    });
  });
});

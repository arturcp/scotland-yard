import { act, fireEvent, render, screen } from '@testing-library/react';
import MicroModal from 'micromodal';
import type { GameController, GameShiftStatus, Player } from '../../types/game';
import { RESULT_HOLD_MS, ROLL_DURATION_MS } from '../DiceRoll';
import Sidebar from './index';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

const players: Player[] = [
  { id: 1, name: 'John', color: 'blue', position: { row: 0, column: 0, place: null } },
];

const makeGame = (status: GameShiftStatus = 'waiting', diceResult: number | null = null): GameController => ({
  gameShift: () => ({ player: players[0], availableSquares: [], status, players, diceResult }),
  updateAvailableSquares: vi.fn(),
  updatePlayerPosition: vi.fn(),
});

describe('Sidebar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    test('renders the sidebar element', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('#sidebar')).toBeInTheDocument();
    });

    test('renders the search icon', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('.fa-magnifying-glass')).toBeInTheDocument();
    });

    test('renders the notes icon', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('.fa-file-lines')).toBeInTheDocument();
    });

    test('renders the detective icon', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('.fa-user-secret')).toBeInTheDocument();
    });

    test('renders the dice roll trigger', () => {
      render(<Sidebar players={players} game={makeGame()} />);
      expect(screen.getByTestId('dice-roll-trigger')).toBeInTheDocument();
      expect(screen.getByTestId('dice-roll-trigger').querySelector('.sidebar-dice-icon')).toBeInTheDocument();
    });
  });

  describe('MicroModal', () => {
    test('initializes MicroModal on mount', () => {
      render(<Sidebar players={players} game={makeGame()} />);
      expect(MicroModal.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('dice button classes', () => {
    test('has pulsate-fwd class when game status is waiting', () => {
      render(<Sidebar players={players} game={makeGame('waiting')} />);
      expect(screen.getByTestId('dice-roll-trigger')).toHaveClass('pulsate-fwd');
    });

    test('does not have pulsate-fwd class when game status is in-progress', () => {
      render(<Sidebar players={players} game={makeGame('in-progress')} />);
      expect(screen.getByTestId('dice-roll-trigger')).not.toHaveClass('pulsate-fwd');
    });
  });

  describe('dice button click', () => {
    test('calls updateAvailableSquares after the roll completes', () => {
      const game = makeGame('waiting');
      render(<Sidebar players={players} game={game} />);
      fireEvent.click(screen.getByTestId('dice-roll-trigger'));

      expect(game.updateAvailableSquares).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(ROLL_DURATION_MS + RESULT_HOLD_MS);
      });

      expect(game.updateAvailableSquares).toHaveBeenCalledTimes(1);
      expect(game.updateAvailableSquares).toHaveBeenCalledWith(expect.any(Array), expect.any(Number));
    });
  });

  describe('dice result badge', () => {
    test('shows the rolled value on the dice icon', () => {
      render(<Sidebar players={players} game={makeGame('in-progress', 4)} />);
      expect(screen.getByTestId('dice-result-badge')).toHaveTextContent('4');
    });

    test('hides the badge when there is no active dice result', () => {
      render(<Sidebar players={players} game={makeGame('waiting', null)} />);
      expect(screen.queryByTestId('dice-result-badge')).not.toBeInTheDocument();
    });
  });
});

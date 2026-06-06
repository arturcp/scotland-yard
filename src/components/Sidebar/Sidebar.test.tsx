import { act, fireEvent, render, screen } from '@testing-library/react';
import MicroModal from 'micromodal';
import type { GameController, GameShiftStatus, Player } from '../../types/game';
import Sidebar from './index';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

const players: Player[] = [
  { id: 1, name: 'John', color: 'blue', position: { row: 0, column: 0, place: null } },
];

const makeGame = (
  status: GameShiftStatus = 'waiting',
  diceResult: number | null = null,
): GameController => ({
  gameShift: () => ({ player: players[0], availableSquares: [], status, players, diceResult }),
  updateAvailableSquares: vi.fn(),
  updatePlayerPosition: vi.fn(),
});

const defaultProps = {
  rolling: false,
  onRollStart: vi.fn(),
};

describe('Sidebar', () => {
  describe('rendering', () => {
    test('renders the sidebar element', () => {
      const { container } = render(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('#sidebar')).toBeInTheDocument();
    });

    test('renders the home icon', () => {
      const { container } = render(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('.fa-house')).toBeInTheDocument();
    });

    test('renders the notes icon', () => {
      const { container } = render(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('.fa-file-lines')).toBeInTheDocument();
    });

    test('renders the detective icon', () => {
      const { container } = render(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('.fa-user-secret')).toBeInTheDocument();
    });

    test('renders the help icon', () => {
      const { container } = render(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('.fa-circle-question')).toBeInTheDocument();
    });

    test('renders the dice roll trigger', () => {
      render(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(screen.getByTestId('dice-roll-trigger')).toBeInTheDocument();
      expect(
        screen.getByTestId('dice-roll-trigger').querySelector('.sidebar-dice-icon'),
      ).toBeInTheDocument();
    });

    test('renders the Scotland Yard title', () => {
      render(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(screen.getByText('Scotland Yard')).toBeInTheDocument();
    });
  });

  describe('MicroModal', () => {
    test('initializes MicroModal on mount', () => {
      render(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(MicroModal.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('dice button classes', () => {
    test('has pulsate-fwd class when game status is waiting', () => {
      render(<Sidebar game={makeGame('waiting')} {...defaultProps} />);
      expect(screen.getByTestId('dice-roll-trigger')).toHaveClass('pulsate-fwd');
    });

    test('does not have pulsate-fwd class when game status is in-progress', () => {
      render(<Sidebar game={makeGame('in-progress')} {...defaultProps} />);
      expect(screen.getByTestId('dice-roll-trigger')).not.toHaveClass('pulsate-fwd');
    });
  });

  describe('dice button click', () => {
    test('calls onRollStart when clicked', () => {
      const onRollStart = vi.fn();
      render(<Sidebar game={makeGame('waiting')} rolling={false} onRollStart={onRollStart} />);
      fireEvent.click(screen.getByTestId('dice-roll-trigger'));
      expect(onRollStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('dice result badge', () => {
    test('shows the rolled value on the dice icon', () => {
      render(<Sidebar game={makeGame('in-progress', 4)} {...defaultProps} />);
      expect(screen.getByTestId('dice-result-badge')).toHaveTextContent('4');
    });

    test('hides the badge when there is no active dice result', () => {
      render(<Sidebar game={makeGame('waiting', null)} {...defaultProps} />);
      expect(screen.queryByTestId('dice-result-badge')).not.toBeInTheDocument();
    });
  });
});

import { fireEvent, render } from '@testing-library/react';
import MicroModal from 'micromodal';
import type { GameController, GameShiftStatus, Player } from '../../types/game';
import Sidebar from './index';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

const players: Player[] = [
  { id: 1, name: 'John', color: 'blue', position: { row: 0, column: 0, place: null } },
];

const makeGame = (status: GameShiftStatus = 'waiting'): GameController => ({
  gameShift: () => ({ player: players[0], availableSquares: [], status, players }),
  updateAvailableSquares: vi.fn(),
  updatePlayerPosition: vi.fn(),
});

describe('Sidebar', () => {
  describe('rendering', () => {
    test('renders the sidebar element', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('#sidebar')).toBeInTheDocument();
    });

    test('renders the search icon', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('.fa-search')).toBeInTheDocument();
    });

    test('renders the notes icon', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('.fa-file-text-o')).toBeInTheDocument();
    });

    test('renders the detective icon', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('.fa-user-secret')).toBeInTheDocument();
    });

    test('renders the play icon', () => {
      const { container } = render(<Sidebar players={players} game={makeGame()} />);
      expect(container.querySelector('.fa-play')).toBeInTheDocument();
    });
  });

  describe('MicroModal', () => {
    test('initializes MicroModal on mount', () => {
      render(<Sidebar players={players} game={makeGame()} />);
      expect(MicroModal.init).toHaveBeenCalledTimes(1);
    });
  });

  describe('play button classes', () => {
    test('has pulsate-fwd class when game status is waiting', () => {
      const { container } = render(<Sidebar players={players} game={makeGame('waiting')} />);
      expect(container.querySelector('.fa-play')).toHaveClass('pulsate-fwd');
    });

    test('does not have pulsate-fwd class when game status is in-progress', () => {
      const { container } = render(<Sidebar players={players} game={makeGame('in-progress')} />);
      expect(container.querySelector('.fa-play')).not.toHaveClass('pulsate-fwd');
    });
  });

  describe('play button click', () => {
    test('calls updateAvailableSquares when play is clicked', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      const game = makeGame('waiting');
      const { container } = render(<Sidebar players={players} game={game} />);
      fireEvent.click(container.querySelector('.fa-play')!);
      expect(game.updateAvailableSquares).toHaveBeenCalledTimes(1);
    });
  });
});

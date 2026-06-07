import { fireEvent, render } from '@testing-library/react';
import { movePlayer, STEP_DURATION_MS } from '../../lib/movement-animation';
import type { GameShiftView, Player } from '../../types/game';
import Square from './index';

vi.mock('../../lib/movement-animation');
vi.mock('../../lib/debug-mode', () => ({
  isDebugMode: vi.fn(() => false),
}));

import { isDebugMode } from '../../lib/debug-mode';

const player: Player = {
  id: 1,
  name: 'John',
  color: 'blue',
  position: { row: 5, column: 3, place: null },
};

const makeProps = (overrides = {}) => ({
  type: '',
  row: 5,
  column: 3,
  state: '',
  available: false,
  direction: '',
  gameShift: { player, availableSquares: [], status: 'waiting' as const, players: [player], diceResult: null },
  updatePlayerPosition: vi.fn(),
  path: null,
  ...overrides,
});

describe('Square', () => {
  beforeEach(() => {
    vi.mocked(isDebugMode).mockReturnValue(false);
  });

  describe('rendering', () => {
    test('renders with the correct data-id', () => {
      const { container } = render(<Square {...makeProps()} />);
      expect(container.querySelector('[data-id="5,3"]')).toBeInTheDocument();
    });

    test('renders with the correct data-row and data-column', () => {
      const { container } = render(<Square {...makeProps()} />);
      const sq = container.querySelector('.square');
      expect(sq).toHaveAttribute('data-row', '5');
      expect(sq).toHaveAttribute('data-column', '3');
    });

    test('renders with the correct data-direction', () => {
      const { container } = render(<Square {...makeProps({ direction: 'up' })} />);
      expect(container.querySelector('.square')).toHaveAttribute('data-direction', 'up');
    });

    test('renders the chevron icon for entrance type', () => {
      const { container } = render(<Square {...makeProps({ type: 'entrance' })} />);
      expect(container.querySelector('.lucide-chevron-up')).toBeInTheDocument();
    });

    test('does not render the chevron icon for non-entrance type', () => {
      const { container } = render(<Square {...makeProps({ type: '' })} />);
      expect(container.querySelector('.lucide-chevron-up')).not.toBeInTheDocument();
    });

    test('applies the empty state class', () => {
      const { container } = render(<Square {...makeProps({ state: 'empty' })} />);
      expect(container.querySelector('.square')).toHaveClass('empty');
    });

    test('applies available-square class when available', () => {
      const { container } = render(<Square {...makeProps({ available: true, path: ['5,3'] })} />);
      expect(container.querySelector('.square')).toHaveClass('available-square');
    });

    test('does not apply available-square class when not available', () => {
      const { container } = render(<Square {...makeProps({ available: false })} />);
      expect(container.querySelector('.square')).not.toHaveClass('available-square');
    });

    test('shows coordinates on path tiles when debug mode is enabled', () => {
      vi.mocked(isDebugMode).mockReturnValue(true);
      const { container } = render(<Square {...makeProps()} />);
      expect(container.querySelector('.square-debug-coords')).toHaveTextContent('(5,3)');
    });

    test('does not show coordinates on empty tiles when debug mode is enabled', () => {
      vi.mocked(isDebugMode).mockReturnValue(true);
      const { container } = render(<Square {...makeProps({ state: 'empty' })} />);
      expect(container.querySelector('.square-debug-coords')).not.toBeInTheDocument();
    });

    test('does not show coordinates when debug mode is disabled', () => {
      vi.mocked(isDebugMode).mockReturnValue(false);
      const { container } = render(<Square {...makeProps()} />);
      expect(container.querySelector('.square-debug-coords')).not.toBeInTheDocument();
    });
  });

  describe('click handling', () => {
    test('does not call updatePlayerPosition when not available', () => {
      const updateFn = vi.fn();
      const { container } = render(<Square {...makeProps({ updatePlayerPosition: updateFn })} />);
      fireEvent.click(container.querySelector('.square')!);
      expect(updateFn).not.toHaveBeenCalled();
    });

    test('calls updatePlayerPosition after the animation when available', () => {
      vi.useFakeTimers();
      const updateFn = vi.fn();
      const newPosition = { row: 5, column: 4, place: null };
      document.body.innerHTML = '<div id="player-1"></div>';
      vi.mocked(movePlayer).mockReturnValue(newPosition);

      const path = ['5,3', '5,4'];
      const gameShift: GameShiftView = {
        player,
        availableSquares: [],
        status: 'in-progress',
        players: [player],
        diceResult: 2,
      };

      const { container } = render(
        <Square
          {...makeProps({ available: true, path, gameShift, updatePlayerPosition: updateFn })}
        />,
      );
      fireEvent.click(container.querySelector('.square')!);
      vi.runAllTimers();

      expect(updateFn).toHaveBeenCalledWith(player.id, newPosition);
      vi.useRealTimers();
    });

    test('animation timeout scales with path length', () => {
      vi.useFakeTimers();
      const updateFn = vi.fn();
      const newPosition = { row: 5, column: 5, place: null };
      document.body.innerHTML = '<div id="player-1"></div>';
      vi.mocked(movePlayer).mockReturnValue(newPosition);

      const path = ['5,3', '5,4', '5,5'];
      const gameShift: GameShiftView = {
        player,
        availableSquares: [],
        status: 'in-progress',
        players: [player],
        diceResult: 2,
      };

      const { container } = render(
        <Square
          {...makeProps({ available: true, path, gameShift, updatePlayerPosition: updateFn })}
        />,
      );
      fireEvent.click(container.querySelector('.square')!);

      vi.advanceTimersByTime(path.length * STEP_DURATION_MS - 1);
      expect(updateFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(updateFn).toHaveBeenCalledWith(player.id, newPosition);
      vi.useRealTimers();
    });
  });
});

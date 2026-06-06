import { act, render, screen } from '@testing-library/react';
import confetti from 'canvas-confetti';
import DiceRoll, { RESULT_HOLD_MS, ROLL_DURATION_MS } from './index';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

describe('DiceRoll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('shows the roll result after the animation', () => {
    const onComplete = vi.fn();
    render(<DiceRoll onComplete={onComplete} />);

    expect(screen.queryByText('Você tirou o número 6!')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(ROLL_DURATION_MS);
    });

    expect(screen.getByText('Você tirou o número 6!')).toBeInTheDocument();
  });

  test('fires confetti when the roll is 6', () => {
    render(<DiceRoll onComplete={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(ROLL_DURATION_MS);
    });

    expect(confetti).toHaveBeenCalledTimes(1);
  });

  test('does not fire confetti when the roll is not 6', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    render(<DiceRoll onComplete={vi.fn()} />);

    act(() => {
      vi.advanceTimersByTime(ROLL_DURATION_MS);
    });

    expect(confetti).not.toHaveBeenCalled();
  });

  test('calls onComplete after showing the result', () => {
    const onComplete = vi.fn();
    render(<DiceRoll onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(ROLL_DURATION_MS + RESULT_HOLD_MS);
    });

    expect(onComplete).toHaveBeenCalledWith(6);
  });
});

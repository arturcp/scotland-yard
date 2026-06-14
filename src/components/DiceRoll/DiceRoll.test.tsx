import { act, render, screen, waitFor } from '@testing-library/react';
import confetti from 'canvas-confetti';
import DiceRoll, { PREDETERMINED_TUMBLE_MS, RESULT_HOLD_MS } from './index';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

let mockRollValue = 6;
const mockRoll = vi.fn();

vi.mock('@3d-dice/dice-box/dist/style.css', () => ({}));
vi.mock('@3d-dice/dice-box', () => ({
  default: class MockDiceBox {
    onRollComplete: ((results: unknown) => void) | undefined;

    constructor(config: { onRollComplete?: (results: unknown) => void }) {
      this.onRollComplete = config.onRollComplete;
    }

    init() {
      return Promise.resolve();
    }

    show() {}

    roll(notation: string) {
      mockRoll(notation);
      queueMicrotask(() => {
        this.onRollComplete?.([{ rolls: [{ value: mockRollValue }] }]);
      });
    }

    clear() {}
  },
}));

function renderDiceRoll(onComplete = vi.fn()) {
  return render(
    <div style={{ position: 'relative', width: 1133, height: 937 }}>
      <DiceRoll onComplete={onComplete} />
    </div>,
  );
}

describe('DiceRoll', () => {
  beforeEach(() => {
    mockRollValue = 6;
    mockRoll.mockClear();
  });

  test('shows the roll result after the dice settle', async () => {
    renderDiceRoll(vi.fn());

    await waitFor(() => {
      expect(screen.getByText('Você tirou o número 6!')).toBeInTheDocument();
    });
  });

  test('fires confetti when the roll is 6', async () => {
    renderDiceRoll();

    await waitFor(() => {
      expect(confetti).toHaveBeenCalledTimes(1);
    });
  });

  test('does not fire confetti when the roll is not 6', async () => {
    mockRollValue = 3;

    renderDiceRoll();

    await waitFor(() => {
      expect(screen.getByText('Você tirou o número 3!')).toBeInTheDocument();
    });

    expect(confetti).not.toHaveBeenCalled();
  });

  test('uses a standard d6 roll', async () => {
    renderDiceRoll(vi.fn());

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalledWith('1d6');
    });
  });

  test('uses the server result for spectator rolls instead of random 3D physics', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    try {
      render(
        <div style={{ position: 'relative', width: 1133, height: 937 }}>
          <DiceRoll
            predeterminedValue={4}
            resultMessage="Maria tirou o número 4!"
            onComplete={onComplete}
          />
        </div>,
      );

      expect(mockRoll).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(PREDETERMINED_TUMBLE_MS);
      });
      expect(screen.getByText('Maria tirou o número 4!')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(RESULT_HOLD_MS);
      });
      expect(onComplete).toHaveBeenCalledWith(4);
    } finally {
      vi.useRealTimers();
    }
  });

  test('shows a custom result message when provided', async () => {
    render(
      <div style={{ position: 'relative', width: 1133, height: 937 }}>
        <DiceRoll resultMessage="Kátia tirou o número 6!" onComplete={vi.fn()} />
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText('Kátia tirou o número 6!')).toBeInTheDocument();
    });
  });

  test('does not fire confetti when showConfetti is false', async () => {
    render(
      <div style={{ position: 'relative', width: 1133, height: 937 }}>
        <DiceRoll showConfetti={false} onComplete={vi.fn()} />
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText('Você tirou o número 6!')).toBeInTheDocument();
    });

    expect(confetti).not.toHaveBeenCalled();
  });

  test('calls onComplete with the animation result', async () => {
    const onComplete = vi.fn();
    renderDiceRoll(onComplete);

    await waitFor(
      () => {
        expect(onComplete).toHaveBeenCalledWith(6);
      },
      { timeout: RESULT_HOLD_MS + 1000 },
    );
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import confetti from 'canvas-confetti';
import DiceRoll, { RESULT_HOLD_MS } from './index';

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

  test('uses predetermined notation when a forced result is provided', async () => {
    mockRollValue = 2;

    render(
      <div style={{ position: 'relative', width: 1133, height: 937 }}>
        <DiceRoll
          forcedResult={4}
          resultMessage="Kátia tirou o número 4!"
          onComplete={vi.fn()}
        />
      </div>,
    );

    await waitFor(() => {
      expect(mockRoll).toHaveBeenCalledWith('1d6@4');
    });

    await waitFor(() => {
      expect(screen.getByText('Kátia tirou o número 4!')).toBeInTheDocument();
    });
  });

  test('shows the server value even when the animation reports a different result', async () => {
    mockRollValue = 2;

    render(
      <div style={{ position: 'relative', width: 1133, height: 937 }}>
        <DiceRoll forcedResult={5} onComplete={vi.fn()} />
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByText('Você tirou o número 5!')).toBeInTheDocument();
    });
  });

  test('calls onComplete after showing the result', async () => {
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

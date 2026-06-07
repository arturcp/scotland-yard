import { useEffect, useId, useRef, useState } from 'react';
import DiceBox from '@3d-dice/dice-box';
import '@3d-dice/dice-box/dist/style.css';
import confetti from 'canvas-confetti';

import './styles.css';

export const RESULT_HOLD_MS = 2000;

function getDiceResult(results: Array<{ rolls: Array<{ value: number }> }>): number {
  return results[0]?.rolls?.[0]?.value ?? 1;
}

async function waitForSize(element: HTMLElement): Promise<void> {
  if (element.clientWidth > 0 && element.clientHeight > 0) {
    return;
  }

  const parent = element.parentElement;
  if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
    await waitForAnimationFrames(1);
    return;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    if (element.clientWidth > 0 && element.clientHeight > 0) {
      return;
    }

    await waitForAnimationFrames(1);
  }
}

async function waitForAnimationFrames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
}

interface DiceRollProps {
  onComplete: (result: number) => void;
  resultMessage?: string;
  showConfetti?: boolean;
}

export default function DiceRoll({
  onComplete,
  resultMessage,
  showConfetti = true,
}: DiceRollProps) {
  const diceCanvasId = useId().replace(/:/g, '');
  const containerId = `dice-box-container-${diceCanvasId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let cancelled = false;
    let ready = false;
    let completeTimer: number;
    let diceBox: DiceBox | null = null;

    void (async () => {
      await waitForSize(container);
      if (cancelled) {
        return;
      }

      diceBox = new DiceBox({
        id: diceCanvasId,
        container: `#${containerId}`,
        assetPath: '/assets/',
        offscreen: false,
        theme: 'default',
        themeColor: '#d4af37',
        scale: 4,
        throwForce: 7,
        spinForce: 6,
        enableShadows: true,
        onRollComplete: (results) => {
          if (cancelled) {
            return;
          }

          const value = getDiceResult(results);
          setResult(value);
          setShowResult(true);

          if (showConfetti && value === 6) {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.55 },
            });
          }

          completeTimer = window.setTimeout(() => {
            onCompleteRef.current(value);
          }, RESULT_HOLD_MS);
        },
      });

      await diceBox.init();
      ready = true;

      if (cancelled) {
        diceBox.clear();
        return;
      }

      diceBox.show();
      await waitForAnimationFrames();
      window.dispatchEvent(new Event('resize'));
      await waitForAnimationFrames();

      if (!cancelled) {
        diceBox.roll('1d6');
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(completeTimer);

      if (ready && diceBox) {
        diceBox.clear();
      }
    };
  }, [containerId, diceCanvasId, showConfetti]);

  return (
    <div className="dice-roll-overlay" role="status" aria-live="polite">
      <div id={containerId} ref={containerRef} className="dice-box-container" />
      {showResult && result !== null && (
        <p className="dice-roll-result">
          {resultMessage ?? `Você tirou o número ${result}!`}
        </p>
      )}
    </div>
  );
}

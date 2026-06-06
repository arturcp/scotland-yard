import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';

import './styles.css';

export const ROLL_DURATION_MS = 1800;
export const RESULT_HOLD_MS = 2000;

const FACE_ROTATIONS: Record<number, string> = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateY(-90deg)',
  3: 'rotateX(-90deg)',
  4: 'rotateX(90deg)',
  5: 'rotateY(90deg)',
  6: 'rotateY(180deg)',
};

const DOT_LAYOUT: Record<number, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

export function randomDiceRoll() {
  return 1 + Math.floor(Math.random() * 6);
}

function DiceFace({ value, dotClassName }: { value: number; dotClassName: string }) {
  return (
    <>
      {DOT_LAYOUT[value].map((visible, index) => (
        <span
          key={index}
          className={`${dotClassName}${visible ? '' : ' hidden'}`}
          aria-hidden={!visible}
        />
      ))}
    </>
  );
}

interface DiceRollProps {
  onComplete: (result: number) => void;
}

export default function DiceRoll({ onComplete }: DiceRollProps) {
  const [result] = useState(randomDiceRoll);
  const [rolling, setRolling] = useState(true);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const rollTimer = window.setTimeout(() => {
      setRolling(false);
      setShowResult(true);

      if (result === 6) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
        });
      }
    }, ROLL_DURATION_MS);

    const completeTimer = window.setTimeout(() => {
      onComplete(result);
    }, ROLL_DURATION_MS + RESULT_HOLD_MS);

    return () => {
      window.clearTimeout(rollTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, result]);

  return createPortal(
    <div className="dice-roll-overlay" role="status" aria-live="polite">
      <div className="dice-roll-flyer">
        <div className="dice-scene">
          <div
            className={`dice-cube${rolling ? ' rolling' : ''}`}
            style={{ transform: rolling ? undefined : FACE_ROTATIONS[result] }}
          >
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <div key={value} className={`dice-face dice-face-${value}`}>
                <DiceFace value={value} dotClassName="dice-dot" />
              </div>
            ))}
          </div>
        </div>
        {showResult && <p className="dice-roll-result">Você tirou o número {result}!</p>}
      </div>
    </div>,
    document.body,
  );
}

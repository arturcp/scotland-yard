import { useState } from 'react';
import type { CaseField } from '../../types/game';

import './styles.css';

interface SolutionModalProps {
  open: boolean;
  caseFields: CaseField[];
  onSubmit: (answers: Record<string, string>) => void;
  onReveal: () => void;
  submitted: boolean;
  onContinue: () => void;
  onClose: () => void;
}

export default function SolutionModal({
  open,
  caseFields,
  onSubmit,
  onReveal,
  submitted,
  onContinue,
  onClose,
}: SolutionModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!open) {
    return null;
  }

  return (
    <div className="solution-modal" role="dialog" aria-modal="true">
      <div className="solution-modal__backdrop" aria-hidden="true" />
      <div className="solution-modal__panel">
        <h2>Solução do caso</h2>
        <p>Registre sua dedução final na Casa do Sherlock Holmes.</p>

        {!submitted ? (
          <>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit(answers);
              }}
            >
              {caseFields.map((field) => (
                <label key={field.key} className="solution-modal__field">
                  <span>{field.label}</span>
                  <input
                    value={answers[field.key] ?? ''}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    required
                  />
                </label>
              ))}
              <button type="submit" className="solution-modal__primary">
                Confirmar resposta
              </button>
            </form>
            <button type="button" className="solution-modal__secondary" onClick={onContinue}>
              Continuar jogando
            </button>
          </>
        ) : (
          <>
            <button type="button" className="solution-modal__primary" onClick={onReveal}>
              Ver solução
            </button>
            <button type="button" className="solution-modal__secondary" onClick={onClose}>
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

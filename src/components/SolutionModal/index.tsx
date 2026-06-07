import { useState } from 'react';
import type { CaseField } from '../../types/game';

import './styles.css';

interface SolutionModalProps {
  open: boolean;
  caseFields: CaseField[];
  onSubmit: (answers: Record<string, string>) => void;
  onReveal: () => void;
  onConfirm: (correct: boolean) => void;
  submitted: boolean;
  revealed: boolean;
  officialSolution: CaseField[] | null;
  playerAnswers: Record<string, string> | null;
  solutionNarrative: string | null;
  onContinue: () => void;
  onClose: () => void;
}

export default function SolutionModal({
  open,
  caseFields,
  onSubmit,
  onReveal,
  onConfirm,
  submitted,
  revealed,
  officialSolution,
  playerAnswers,
  solutionNarrative,
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
        ) : !revealed ? (
          <>
            <p className="solution-modal__hint">
              Sua resposta foi registrada. Revele a solução oficial para comparar com sua dedução.
            </p>
            <button type="button" className="solution-modal__primary" onClick={onReveal}>
              Ver solução
            </button>
            <button type="button" className="solution-modal__secondary" onClick={onClose}>
              Fechar
            </button>
          </>
        ) : (
          <>
            <dl className="solution-modal__comparison">
              {officialSolution?.map((field) => (
                <div key={field.key} className="solution-modal__comparison-item">
                  <dt>{field.label}</dt>
                  <dd>
                    <span className="solution-modal__answer-label">Sua resposta:</span>{' '}
                    {playerAnswers?.[field.key] ?? '—'}
                  </dd>
                  <dd>
                    <span className="solution-modal__answer-label">Solução correta:</span>{' '}
                    {field.answer ?? '—'}
                  </dd>
                </div>
              ))}
            </dl>
            {solutionNarrative && (
              <p className="solution-modal__narrative">{solutionNarrative}</p>
            )}
            <p className="solution-modal__hint">Sua dedução está correta?</p>
            <button
              type="button"
              className="solution-modal__primary"
              onClick={() => onConfirm(true)}
            >
              Sim, acertei
            </button>
            <button
              type="button"
              className="solution-modal__secondary"
              onClick={() => onConfirm(false)}
            >
              Não, errei
            </button>
          </>
        )}
      </div>
    </div>
  );
}

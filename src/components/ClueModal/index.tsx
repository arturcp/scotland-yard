import './styles.css';

export interface ClueModalData {
  zoneName: string;
  text: string;
}

interface ClueModalProps {
  clue: ClueModalData;
  masterKeysRemaining: number;
  onPassTurn: () => void;
  onLockZone: () => void;
}

export default function ClueModal({
  clue,
  masterKeysRemaining,
  onPassTurn,
  onLockZone,
}: ClueModalProps) {
  const canLockZone = masterKeysRemaining > 0;

  return (
    <div className="clue-modal" role="dialog" aria-modal="true" aria-labelledby="clue-modal-title">
      <div className="clue-modal__panel">
        <h2 id="clue-modal-title">{clue.zoneName}</h2>
        <div className="clue-modal__body">
          <p className="clue-modal__text">{clue.text}</p>
        </div>
        <p className="clue-modal__hint">
          Esta informação ficará disponível em <strong>Notas</strong>, no menu lateral. Você ainda
          está no seu turno — escolha como continuar.
        </p>
        <p className="clue-modal__keys">
          Chaves-mestras disponíveis: <strong>{masterKeysRemaining}</strong>
        </p>
        <div className="clue-modal__actions">
          <button type="button" className="lobby__submit clue-modal__action" onClick={onPassTurn}>
            Passar turno
          </button>
          <button
            type="button"
            className="lobby__submit clue-modal__action clue-modal__action--secondary"
            disabled={!canLockZone}
            onClick={onLockZone}
          >
            Trancar zona
          </button>
        </div>
      </div>
    </div>
  );
}

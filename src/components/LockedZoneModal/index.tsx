import '../ClueModal/styles.css';
import './styles.css';

interface LockedZoneModalProps {
  zoneName: string;
  hasMasterKey: boolean;
  onUnlock: () => void;
  onPassTurn: () => void;
}

export default function LockedZoneModal({
  zoneName,
  hasMasterKey,
  onUnlock,
  onPassTurn,
}: LockedZoneModalProps) {
  return (
    <div
      className="clue-modal locked-zone-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locked-zone-modal-title"
    >
      <div className="clue-modal__panel">
        <h2 id="locked-zone-modal-title">{zoneName}</h2>
        <div className="clue-modal__body">
          {hasMasterKey ? (
            <p className="clue-modal__text">
              Esta zona está trancada. Deseja usar uma chave-mestra para destrancar e entrar?
            </p>
          ) : (
            <p className="clue-modal__text">A porta está trancada. Você não possui chaves-mestras.</p>
          )}
        </div>
        <div className="clue-modal__actions">
          {hasMasterKey ? (
            <>
              <button
                type="button"
                className="lobby__submit clue-modal__action"
                onClick={onUnlock}
              >
                Usar chave-mestra
              </button>
              <button
                type="button"
                className="lobby__submit clue-modal__action clue-modal__action--secondary"
                onClick={onPassTurn}
              >
                Não entrar
              </button>
            </>
          ) : (
            <button type="button" className="lobby__submit clue-modal__action" onClick={onPassTurn}>
              Passar turno
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

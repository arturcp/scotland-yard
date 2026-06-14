import { getZoneLabel } from '../../board';
import type { ZoneId } from '../../board/types';
import './micromodal.css';
import './styles.css';
import type { NoteEntry } from '../../types/game';

interface NotesProps {
  visitedZones: ZoneId[];
  clueNotes: NoteEntry[];
  customText: string;
  onCustomNotesChange: (notes: string) => void;
}

export default function Notes({
  visitedZones = [],
  clueNotes = [],
  customText = '',
  onCustomNotesChange,
}: NotesProps) {
  const visitedPlaces = visitedZones.filter((zoneId) => zoneId !== 'holmes-house');

  return (
    <div className="modal micromodal-slide" id="modal-notes" aria-hidden="true">
      <div className="modal__overlay" tabIndex={-1} data-micromodal-close>
        <div
          className="modal__container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-notes-title"
        >
          <header className="modal__header">
            <h2 className="modal__title" id="modal-notes-title">
              Notas
            </h2>
            <button className="modal__close" aria-label="Fechar" data-micromodal-close />
          </header>
          <main className="modal__content scrollbar-noir px-2" id="modal-notes-content">
            {visitedPlaces.length > 0 && (
              <section className="notes__visited">
                <h3>Locais visitados</h3>
                <ul>
                  {visitedPlaces.map((zoneId) => (
                    <li key={zoneId}>{getZoneLabel(zoneId)}</li>
                  ))}
                </ul>
              </section>
            )}
            {clueNotes.length > 0 && (
              <section className="notes__clues">
                <h3>Pistas coletadas</h3>
                <ul>
                  {clueNotes.map((entry, index) =>
                    entry.kind === 'clue' ? (
                      <li key={`${entry.zoneId}-${index}`}>
                        <strong>{entry.zoneName}</strong>
                        <p>{entry.text}</p>
                      </li>
                    ) : null,
                  )}
                </ul>
              </section>
            )}
            {visitedPlaces.length === 0 && clueNotes.length === 0 && (
              <p className="notes__empty">Nenhum local visitado ou pista coletada ainda.</p>
            )}
            <label className="notes__custom-label" htmlFor="notes-custom">
              Anotações pessoais
            </label>
            <textarea
              id="notes-custom"
              value={customText}
              onChange={(e) => onCustomNotesChange(e.target.value)}
              className="notes__editor"
              placeholder="Escreva suas notas aqui..."
            />
          </main>
          <footer className="modal__footer">
            <button className="modal__btn" data-micromodal-close aria-label="Fechar">
              Fechar
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

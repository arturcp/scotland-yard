import './micromodal.css';
import './styles.css';
import type { NoteEntry } from '../../types/game';

interface NotesProps {
  clueNotes: NoteEntry[];
  customText: string;
  onCustomNotesChange: (notes: string) => void;
}

export default function Notes({ clueNotes, customText, onCustomNotesChange }: NotesProps) {
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
          <main className="modal__content" id="modal-notes-content">
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

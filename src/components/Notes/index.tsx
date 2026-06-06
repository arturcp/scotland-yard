import './micromodal.css';
import './styles.css';

interface NotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function Notes({ notes, onNotesChange }: NotesProps) {
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
            <button
              className="modal__close"
              aria-label="Close modal"
              data-micromodal-close
            ></button>
          </header>
          <main className="modal__content" id="modal-notes-content">
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="notes__editor"
              placeholder="Escreva suas notas aqui..."
            />
          </main>
          <footer className="modal__footer">
            <button className="modal__btn modal__btn-primary">Salvar</button>
            <button
              className="modal__btn"
              data-micromodal-close
              aria-label="Close this dialog window"
            >
              Close
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}

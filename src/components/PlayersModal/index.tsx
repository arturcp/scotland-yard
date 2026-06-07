import { UserRound } from 'lucide-react';
import type { Player } from '../../types/game';

import './styles.css';

interface PlayersModalProps {
  players: Player[];
}

export default function PlayersModal({ players }: PlayersModalProps) {
  return (
    <div className="modal micromodal-slide" id="modal-players" aria-hidden="true">
      <div className="modal__overlay" tabIndex={-1} data-micromodal-close>
        <div
          className="modal__container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-players-title"
        >
          <header className="modal__header">
            <h2 className="modal__title" id="modal-players-title">
              Jogadores
            </h2>
            <button className="modal__close" aria-label="Fechar" data-micromodal-close />
          </header>
          <main className="modal__content">
            <ul className="players-modal__list">
              {players.map((player) => (
                <li key={player.id} className="players-modal__item">
                  <UserRound
                    aria-hidden="true"
                    size={28}
                    strokeWidth={1.75}
                    style={{ color: player.color }}
                  />
                  <span>{player.name}</span>
                  {player.eliminated && <span className="players-modal__out">Eliminado</span>}
                  {!player.connected && (
                    <span className="players-modal__out">Desconectado</span>
                  )}
                </li>
              ))}
            </ul>
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

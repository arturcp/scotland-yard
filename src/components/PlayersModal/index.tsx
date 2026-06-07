import { useMemo } from 'react';
import { UserRound } from 'lucide-react';
import type { Player } from '../../types/game';

import '../Notes/micromodal.css';
import './styles.css';

interface PlayersModalProps {
  players: Player[];
  turnOrder: number[];
}

export default function PlayersModal({ players, turnOrder }: PlayersModalProps) {
  const entries = useMemo(() => {
    if (turnOrder.length > 0) {
      return turnOrder.flatMap((id, index) => {
        const player = players.find((entry) => entry.id === id);
        if (!player) {
          return [];
        }
        return [{ player, rank: index + 1 }];
      });
    }

    return players.map((player) => ({ player, rank: null as number | null }));
  }, [players, turnOrder]);

  const hasTurnOrder = turnOrder.length > 0;

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
            {hasTurnOrder && (
              <p className="players-modal__subtitle">Ordem de jogada</p>
            )}
            <ul
              className={`players-modal__list${hasTurnOrder ? ' players-modal__list--ordered' : ''}`}
            >
              {entries.map(({ player, rank }) => (
                <li key={player.id} className="players-modal__item">
                  {hasTurnOrder && rank !== null && (
                    <span className="players-modal__rank" aria-label={`${rank}º na ordem de jogada`}>
                      {rank}º
                    </span>
                  )}
                  <UserRound
                    aria-hidden="true"
                    size={32}
                    strokeWidth={1.75}
                    style={{ color: player.color }}
                  />
                  <span className="players-modal__name">{player.name}</span>
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

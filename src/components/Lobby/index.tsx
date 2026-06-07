import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { PLAYER_COLORS, MIN_PLAYERS, DEFAULT_MASTER_KEYS_PER_PLAYER, MAX_MASTER_KEYS_PER_PLAYER, type Player, type PlayerColor } from '../../types/game';
import type { UseGameSocketReturn } from '../../hooks/useGameSocket';

import './styles.css';

function buildInviteUrl(roomCode: string): string {
  return `${window.location.origin}/jogo/${roomCode}`;
}

function buildWhatsAppUrl(roomCode: string, inviteUrl: string): string {
  const message = `Entre na minha partida de Scotland Yard Digital! Sala ${roomCode}: ${inviteUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

interface LobbyProps {
  roomCode: string;
  game: UseGameSocketReturn;
}

const COLOR_LABELS: Record<PlayerColor, string> = {
  blue: 'Azul',
  yellow: 'Amarelo',
  brown: 'Marrom',
  lightpink: 'Rosa',
  green: 'Verde',
  purple: 'Roxo',
};

function canEditPlayerColor(
  player: Player,
  game: UseGameSocketReturn,
  hasJoined: boolean,
): boolean {
  return (
    hasJoined &&
    game.phase === 'lobby' &&
    (player.id === game.playerId || game.isCreator)
  );
}

export default function Lobby({ roomCode, game }: LobbyProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<PlayerColor>('blue');
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [masterKeys, setMasterKeys] = useState(DEFAULT_MASTER_KEYS_PER_PLAYER);

  const inviteUrl = useMemo(() => buildInviteUrl(roomCode), [roomCode]);
  const whatsAppUrl = useMemo(() => buildWhatsAppUrl(roomCode, inviteUrl), [roomCode, inviteUrl]);

  const takenColors = new Set(game.players.map((player) => player.color));
  const connectedCount = game.players.filter((player) => player.connected).length;
  const canStart = game.isCreator && connectedCount >= MIN_PLAYERS && game.phase === 'lobby';

  function handleMasterKeysChange(value: number) {
    setMasterKeys(value);
    game.setMasterKeysPerPlayer(value);
  }

  function handleJoin(event: React.FormEvent) {
    event.preventDefault();
    setJoining(true);
    game.join(name, color);
  }

  async function handleCopyInvite() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard without a focused selection.
      const input = document.createElement('input');
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  const hasJoined = game.playerId !== null;
  const showInvite = game.isCreator && hasJoined && game.phase === 'lobby';

  return (
    <div className="lobby">
      <div className="lobby__card">
        <Link to="/" className="lobby__back">
          <ArrowLeft className="lobby__back-icon" aria-hidden="true" />
          Voltar ao início
        </Link>

        <p className="lobby__eyebrow">Quartel-general dos detetives</p>
        <h1 className="lobby__title">Sala {roomCode}</h1>
        {game.room?.caseTitle && (
          <p className="lobby__case">
            Caso: <strong>{game.room.caseTitle}</strong>
          </p>
        )}

        {game.error && <p className="lobby__error">{game.error}</p>}

        {!hasJoined ? (
          <form className="lobby__form" onSubmit={handleJoin}>
            <label className="lobby__field">
              <span>Nome do detetive</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                maxLength={24}
                required
              />
            </label>

            <fieldset className="lobby__colors">
              <legend>Cor da peça</legend>
              <div className="lobby__color-grid">
                {PLAYER_COLORS.map((option) => {
                  const taken = takenColors.has(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`lobby__color${color === option ? ' lobby__color--selected' : ''}${taken ? ' lobby__color--taken' : ''}`}
                      style={{ '--piece-color': option } as React.CSSProperties}
                      disabled={taken}
                      onClick={() => setColor(option)}
                      aria-label={COLOR_LABELS[option]}
                    />
                  );
                })}
              </div>
            </fieldset>

            <button type="submit" className="lobby__submit" disabled={joining || game.connecting}>
              {joining || game.connecting ? 'Conectando…' : 'Entrar na sala'}
            </button>
          </form>
        ) : (
          <div className="lobby__waiting">
            <p className="lobby__status">
              {game.connected ? 'Conectado à sala.' : 'Reconectando…'}
            </p>

            {showInvite && (
              <section className="lobby__invite" aria-label="Convidar jogadores">
                <p className="lobby__invite-label">Convide outros detetives</p>
                <div className="lobby__invite-row">
                  <input
                    className="lobby__invite-url"
                    type="text"
                    readOnly
                    value={inviteUrl}
                    aria-label="Link da sala"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <button
                    type="button"
                    className="lobby__invite-copy"
                    onClick={handleCopyInvite}
                    aria-label={copied ? 'Link copiado' : 'Copiar link da sala'}
                  >
                    {copied ? <Check className="lobby__invite-icon" aria-hidden="true" /> : <Copy className="lobby__invite-icon" aria-hidden="true" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <a
                  className="lobby__invite-whatsapp"
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar no WhatsApp
                </a>
              </section>
            )}

            {game.isCreator && (
              <label className="lobby__field">
                <span>Chaves-mestras por jogador</span>
                <input
                  type="number"
                  min={0}
                  max={MAX_MASTER_KEYS_PER_PLAYER}
                  value={masterKeys}
                  onChange={(event) => handleMasterKeysChange(Number(event.target.value))}
                />
              </label>
            )}

            {game.isCreator && (
              <button
                type="button"
                className="lobby__submit"
                disabled={!canStart}
                onClick={game.startGame}
              >
                Iniciar
              </button>
            )}
            {!game.isCreator && (
              <p className="lobby__hint">Aguardando o criador iniciar a partida…</p>
            )}
          </div>
        )}

        <section className="lobby__players">
          <h2>Jogadores ({connectedCount})</h2>
          <ul>
            {game.players.map((player) => {
              const editable = canEditPlayerColor(player, game, hasJoined);

              return (
                <li key={player.id} className="lobby__player">
                  <div className="lobby__player-info">
                    {!editable && (
                      <span
                        className="lobby__swatch"
                        style={{ color: player.color }}
                        aria-hidden="true"
                      >
                        ●
                      </span>
                    )}
                    <span>
                      {player.name}
                      {!player.connected && ' (desconectado)'}
                      {game.room?.creatorId === player.id && ' — criador'}
                    </span>
                  </div>

                  {editable && (
                    <div
                      className="lobby__player-colors"
                      role="group"
                      aria-label={`Cor de ${player.name}`}
                    >
                      {PLAYER_COLORS.map((option) => {
                        const taken =
                          game.players.some(
                            (other) => other.id !== player.id && other.color === option,
                          );
                        const selected = player.color === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            className={`lobby__color lobby__color--compact${selected ? ' lobby__color--selected' : ''}${taken ? ' lobby__color--taken' : ''}`}
                            style={{ '--piece-color': option } as React.CSSProperties}
                            disabled={taken}
                            onClick={() => game.updateColor(player.id, option)}
                            aria-label={COLOR_LABELS[option]}
                            aria-pressed={selected}
                          />
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

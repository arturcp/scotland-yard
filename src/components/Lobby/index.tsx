import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import {
  PLAYER_COLORS,
  MIN_PLAYERS,
  MAX_PLAYERS,
  DEFAULT_MASTER_KEYS_PER_PLAYER,
  MAX_MASTER_KEYS_PER_PLAYER,
  getPlayerColorValue,
  type LobbyPlayer,
  type Player,
  type PlayerColor,
  type RoomSummary,
} from '../../types/game';
import type { UseGameSocketReturn } from '../../hooks/useGameSocket';
import { fetchRoomSummary } from '../../lib/api';

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
  red: 'Vermelho',
  pink: 'Rosa',
  green: 'Verde',
  purple: 'Roxo',
  cyan: 'Ciano',
  orange: 'Laranja',
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
  const [lobbySnapshot, setLobbySnapshot] = useState<RoomSummary | null>(null);

  const inviteUrl = useMemo(() => buildInviteUrl(roomCode), [roomCode]);
  const whatsAppUrl = useMemo(() => buildWhatsAppUrl(roomCode, inviteUrl), [roomCode, inviteUrl]);

  const hasJoined = game.playerId !== null;
  const players: LobbyPlayer[] = hasJoined
    ? game.players.map(({ id, name, color, connected }) => ({ id, name, color, connected }))
    : (lobbySnapshot?.players ?? []);
  const creatorId = hasJoined ? game.room?.creatorId : lobbySnapshot?.creatorId;
  const caseTitle = game.room?.caseTitle ?? lobbySnapshot?.caseTitle;

  const takenColors = useMemo(
    () => new Set(players.map((player) => player.color)),
    [players],
  );
  const connectedCount = players.filter((player) => player.connected).length;
  const canStart = game.isCreator && connectedCount >= MIN_PLAYERS && game.phase === 'lobby';
  const playerCount = hasJoined ? game.players.length : (lobbySnapshot?.playerCount ?? players.length);
  const roomFull = !hasJoined && playerCount >= MAX_PLAYERS;

  useEffect(() => {
    if (hasJoined) {
      return;
    }

    let cancelled = false;

    async function refreshLobbySnapshot() {
      try {
        const summary = await fetchRoomSummary(roomCode);
        if (!cancelled) {
          setLobbySnapshot(summary);
        }
      } catch {
        // Ignore polling errors; the join flow will surface connection issues.
      }
    }

    refreshLobbySnapshot();
    const intervalId = window.setInterval(refreshLobbySnapshot, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [hasJoined, roomCode]);

  useEffect(() => {
    if (!takenColors.has(color)) {
      return;
    }
    const available = PLAYER_COLORS.find((option) => !takenColors.has(option));
    if (available) {
      setColor(available);
    }
  }, [color, takenColors]);

  useEffect(() => {
    if (joining && (game.playerId !== null || game.error)) {
      setJoining(false);
    }
  }, [joining, game.playerId, game.error]);

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
        {caseTitle && (
          <p className="lobby__case">
            Caso: <strong>{caseTitle}</strong>
          </p>
        )}

        {game.error && !roomFull && <p className="lobby__error">{game.error}</p>}

        {!hasJoined && roomFull ? (
          <p className="lobby__room-full" role="status">
            A sala está cheia ({MAX_PLAYERS}/{MAX_PLAYERS} jogadores). Aguarde alguém sair ou peça ao
            criador para iniciar uma nova partida.
          </p>
        ) : !hasJoined ? (
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
                      style={{ '--piece-color': getPlayerColorValue(option) } as React.CSSProperties}
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
          <h2>Jogadores ({players.length}/{MAX_PLAYERS})</h2>
          <ul>
            {players.map((player) => {
              const editable = canEditPlayerColor(player as Player, game, hasJoined);

              return (
                <li key={player.id} className="lobby__player">
                  <div className="lobby__player-info">
                    {!editable && (
                      <span
                        className="lobby__swatch"
                        style={{ color: getPlayerColorValue(player.color) }}
                        aria-hidden="true"
                      >
                        ●
                      </span>
                    )}
                    <span>
                      {player.name}
                      {!player.connected && ' (desconectado)'}
                      {creatorId === player.id && ' — criador'}
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
                          players.some(
                            (other) => other.id !== player.id && other.color === option,
                          );
                        const selected = player.color === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            className={`lobby__color lobby__color--compact${selected ? ' lobby__color--selected' : ''}${taken ? ' lobby__color--taken' : ''}`}
                            style={{ '--piece-color': getPlayerColorValue(option) } as React.CSSProperties}
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

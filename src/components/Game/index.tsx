import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useIsDesktop from '../../hooks/useIsDesktop';
import { useGameSocket } from '../../hooks/useGameSocket';
import { movePlayer, STEP_DURATION_MS } from '../../lib/movement-animation';
import Board from '../Board';
import Lobby from '../Lobby';
import Notes from '../Notes';
import PlayersModal from '../PlayersModal';
import Sidebar from '../Sidebar';
import SolutionModal from '../SolutionModal';
import TurnBanner from '../TurnBanner';
import DiceRoll from '../DiceRoll';
import MobileWarning from './MobileWarning';
import TopBar from './TopBar';
import type { GameController, Player, Position } from '../../types/game';

import '../TurnBanner/styles.css';
import './styles.css';

interface GameProps {
  roomCode: string;
}

export default function Game({ roomCode }: GameProps) {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const gameSocket = useGameSocket(roomCode);
  const [rolling, setRolling] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionSubmitted, setSolutionSubmitted] = useState(false);
  const [showTurnOrder, setShowTurnOrder] = useState(false);
  const [showCaseIntro, setShowCaseIntro] = useState(false);
  const [isInitialCaseIntro, setIsInitialCaseIntro] = useState(false);
  const hasLeftHolmesHouseRef = useRef(false);
  const solutionDismissedRef = useRef(false);
  const prevHolmesVisitRef = useRef<string | null | undefined>(undefined);

  const {
    room,
    phase,
    shift,
    visiblePlayers,
    playerId,
    notes,
    isMyTurn,
    canInteract,
    showDice,
    turnBanner,
    verifyingMessage,
    gameOverMessage,
    officialSolution,
    solutionNarrative,
    lastSubmittedAnswers,
    turnOrderRolls,
    lastDiceRoll,
    remoteMove,
    caseFields,
    rollTurnOrderDice,
    rollDice,
    showTurnOrderDice,
    move,
    updateNotes,
    submitSolution,
    revealSolution,
    leaveGame,
    roomClosed,
    clearRemoteMove,
    clearLastDiceRoll,
  } = gameSocket;

  const handleLeaveGame = useCallback(() => {
    leaveGame();
    navigate('/');
  }, [leaveGame, navigate]);

  useEffect(() => {
    if (roomClosed) {
      navigate('/');
    }
  }, [navigate, roomClosed]);

  useEffect(() => {
    if (phase === 'turnOrder') {
      setShowCaseIntro(true);
      setIsInitialCaseIntro(true);
      setShowTurnOrder(true);
    }
    if (phase === 'playing') {
      setShowTurnOrder(false);
      setShowCaseIntro(false);
      setIsInitialCaseIntro(false);
    }
  }, [phase]);

  const dismissCaseIntro = useCallback(() => {
    setShowCaseIntro(false);
    setIsInitialCaseIntro(false);
  }, []);

  const showCaseFromSidebar = useCallback(() => {
    setShowCaseIntro(true);
  }, []);

  const canShowCase = !!room?.caseIntro && phase !== null && phase !== 'lobby';

  useEffect(() => {
    if (lastDiceRoll !== null) {
      setRolling(true);
    }
  }, [lastDiceRoll]);

  useEffect(() => {
    if (!remoteMove || !room) {
      return;
    }

    const movingPlayer = room.players.find((player) => player.id === remoteMove.playerId);
    if (!movingPlayer) {
      return;
    }

    const delay = remoteMove.path.length * STEP_DURATION_MS;
    movePlayer(movingPlayer, room.players, remoteMove.path);
    const timer = window.setTimeout(() => {
      clearRemoteMove();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [clearRemoteMove, remoteMove, room]);

  useEffect(() => {
    if (!room || playerId === null || phase !== 'playing') {
      return;
    }

    const player = room.players.find((entry) => entry.id === playerId);
    if (!player) {
      return;
    }

    const place = player.position.place;
    const visitedZones = room.visitedZonesByPlayer[playerId] ?? [];

    if (
      place !== 'holmes-house' ||
      visitedZones.length > 0 ||
      notes.some((entry) => entry.kind === 'clue')
    ) {
      hasLeftHolmesHouseRef.current = true;
    }

    if (place !== 'holmes-house') {
      solutionDismissedRef.current = false;
    }

    const justReturned =
      prevHolmesVisitRef.current !== undefined &&
      prevHolmesVisitRef.current !== 'holmes-house' &&
      place === 'holmes-house';

    if (
      justReturned &&
      hasLeftHolmesHouseRef.current &&
      !solutionSubmitted &&
      !solutionDismissedRef.current
    ) {
      setSolutionOpen(true);
    }

    prevHolmesVisitRef.current = place;
  }, [notes, phase, playerId, room, solutionSubmitted]);

  useEffect(() => {
    if (phase === 'verifying') {
      setSolutionSubmitted(true);
    }
  }, [phase]);

  const players = useMemo(
    () => visiblePlayers as Player[],
    [visiblePlayers],
  );

  const activePlayer = room?.players.find((player) => player.id === shift?.playerId);

  const handleMove = (destination: Position, path: string[]) => {
    if (!canInteract || playerId === null) {
      return;
    }

    const movingPlayer = room?.players.find((player) => player.id === playerId);
    if (!movingPlayer) {
      return;
    }

    movePlayer(movingPlayer, room?.players ?? [], path);
    const delay = path.length * STEP_DURATION_MS;
    window.setTimeout(() => {
      move(destination);
    }, delay);
  };

  const game: GameController = {
    canInteract,
    gameShift: () => ({
      player: activePlayer ?? players[0]!,
      availableSquares: shift?.availableSquares ?? [],
      status: shift?.status ?? 'waiting',
      diceResult: shift?.diceResult ?? null,
      players: room?.players ?? [],
    }),
    updatePlayerPosition: () => {},
    updateAvailableSquares: () => {},
    onMove: handleMove,
  };

  const customNoteText =
    notes
      .filter((entry) => entry.kind === 'custom')
      .map((entry) => entry.text)
      .join('\n') || '';

  const clueNotes = notes.filter((entry) => entry.kind === 'clue');

  const bannerMessage = useMemo(() => {
    if (phase === 'turnOrder') {
      if (showCaseIntro || rolling) {
        return null;
      }
      if (showTurnOrderDice) {
        return 'Rode o dado para definir a ordem de jogada';
      }
      if (playerId !== null) {
        return 'Aguardando os outros detetives rolarem o dado…';
      }
      return null;
    }
    if (phase === 'playing' && isMyTurn && shift?.status === 'waiting' && !rolling) {
      return 'Seu turno';
    }
    return turnBanner;
  }, [
    isMyTurn,
    phase,
    playerId,
    rolling,
    shift?.status,
    showCaseIntro,
    showTurnOrderDice,
    turnBanner,
  ]);

  if (!isDesktop) {
    return <MobileWarning />;
  }

  if (!room || phase === 'lobby') {
    return (
      <div className="App game-app">
        <TopBar onLeaveGame={handleLeaveGame} />
        <Lobby roomCode={roomCode} game={gameSocket} />
      </div>
    );
  }

  return (
    <div id="container">
      <div id="vignette" aria-hidden="true" />
      <TopBar onLeaveGame={handleLeaveGame} />
      <Sidebar
        game={game}
        rolling={rolling}
        showDice={showDice}
        showCase={canShowCase}
        onShowCase={showCaseFromSidebar}
        onRollStart={() => {
          if (showTurnOrderDice) {
            rollTurnOrderDice();
          } else {
            rollDice();
          }
        }}
      />
      <main id="main-content">
        <TurnBanner message={bannerMessage} />
        {verifyingMessage && <div className="game-status-banner">{verifyingMessage}</div>}
        {gameOverMessage && officialSolution && (
          <div className="game-over-overlay">
            <div className="game-over-overlay__panel">
              <h2>{gameOverMessage}</h2>
              <dl className="game-over-overlay__answers">
                {officialSolution.map((field) => (
                  <div key={field.key}>
                    <dt>{field.label}</dt>
                    <dd>
                      Resposta do vencedor: {lastSubmittedAnswers?.[field.key] ?? '—'}
                    </dd>
                    <dd>Solução correta: {field.answer}</dd>
                  </div>
                ))}
              </dl>
              {solutionNarrative && <p className="game-over-overlay__narrative">{solutionNarrative}</p>}
            </div>
          </div>
        )}
        <div id="board-spotlight">
          <Board players={players} game={game} />
        </div>
      </main>
      <Notes
        clueNotes={clueNotes}
        customText={customNoteText}
        onCustomNotesChange={updateNotes}
      />
      <PlayersModal players={room.players} />
      <SolutionModal
        open={solutionOpen && phase !== 'finished'}
        caseFields={caseFields}
        submitted={solutionSubmitted}
        onSubmit={(answers) => {
          submitSolution(answers);
          setSolutionSubmitted(true);
        }}
        onReveal={revealSolution}
        onContinue={() => {
          solutionDismissedRef.current = true;
          setSolutionOpen(false);
        }}
        onClose={() => setSolutionOpen(false)}
      />
      {showCaseIntro && room.caseIntro && (
        <div className="turn-order-overlay case-intro-overlay">
          <div className="turn-order-overlay__panel case-intro-overlay__panel">
            <h2>{room.caseTitle}</h2>
            <div className="case-intro-overlay__body">
              <p className="case-intro__text">{room.caseIntro}</p>
              {caseFields.length > 0 && (
                <section className="case-intro-overlay__questions">
                  <h3>Perguntas a responder</h3>
                  <ol>
                    {caseFields.map((field) => (
                      <li key={field.key}>{field.label}</li>
                    ))}
                  </ol>
                </section>
              )}
              {isInitialCaseIntro && (
                <p className="case-intro-overlay__hint">
                  Você pode rever este caso a qualquer momento pelo menu <strong>Caso</strong> na
                  barra lateral.
                </p>
              )}
            </div>
            <button type="button" className="lobby__submit" onClick={dismissCaseIntro}>
              {isInitialCaseIntro ? 'Começar investigação' : 'Fechar'}
            </button>
          </div>
        </div>
      )}
      {showTurnOrder && phase === 'turnOrder' && !showCaseIntro && (
        <div className="turn-order-overlay">
          <div className="turn-order-overlay__panel">
            <h2>Ordem de jogada</h2>
            <p>
              Todos os jogadores devem rolar o dado. Quem tirar o maior número começa; em caso de
              empate, a ordem entre os empatados é sorteada.
            </p>
            {showTurnOrderDice ? (
              <>
                <p className="turn-order-overlay__prompt">
                  Role o dado para entrar na fila e definir quem joga primeiro.
                </p>
                <button
                  type="button"
                  className="lobby__submit turn-order-overlay__roll-btn"
                  disabled={rolling}
                  onClick={rollTurnOrderDice}
                >
                  Rolar dado
                </button>
              </>
            ) : (
              <p className="turn-order-overlay__prompt turn-order-overlay__prompt--waiting">
                Aguardando os outros detetives rolarem o dado…
              </p>
            )}
            <ul className="turn-order-overlay__list">
              {turnOrderRolls.map((roll) => (
                <li key={`${roll.playerId}-${roll.value}`}>
                  <span>{roll.playerName}</span>
                  <strong>{roll.value}</strong>
                </li>
              ))}
              {(room.turnOrderPendingIds ?? []).map((pendingId) => {
                const pendingPlayer = room.players.find((player) => player.id === pendingId);
                if (!pendingPlayer) {
                  return null;
                }
                return (
                  <li key={`pending-${pendingId}`} className="turn-order-overlay__pending">
                    <span>{pendingPlayer.name}</span>
                    <strong>—</strong>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      {rolling && lastDiceRoll !== null && (
        <DiceRoll
          forcedResult={lastDiceRoll}
          onComplete={() => {
            setRolling(false);
            clearLastDiceRoll();
          }}
        />
      )}
    </div>
  );
}

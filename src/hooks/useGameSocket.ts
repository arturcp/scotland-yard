import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getWebSocketUrl } from '../lib/api';
import { getSessionToken, saveSessionToken, clearSessionToken } from '../lib/session';
import type {
  AvailableSquare,
  CaseField,
  GameRoomState,
  LastDiceRoll,
  NoteEntry,
  PendingClue,
  PendingLockedZone,
  Position,
  TurnOrderRoll,
} from '../types/game';

type PublicRoomState = Omit<GameRoomState, 'sessionTokens'>;

function resolvePlayerName(
  room: PublicRoomState | null,
  rollerId: number,
  playerName?: string,
): string {
  if (playerName) {
    return playerName;
  }

  return room?.players.find((player) => player.id === rollerId)?.name ?? 'Jogador';
}

function buildTurnBanner(state: PublicRoomState, playerId: number | null): string | null {
  if (state.phase !== 'playing' || state.shift.playerId === 0) {
    return null;
  }

  const activePlayer = state.players.find((player) => player.id === state.shift.playerId);
  if (!activePlayer) {
    return null;
  }

  if (playerId === state.shift.playerId) {
    return 'Seu turno';
  }

  return `${activePlayer.name} está jogando`;
}

type ServerMessage =
  | {
      type: 'roomState';
      state: PublicRoomState;
      you: { playerId: number; sessionToken: string; notes: NoteEntry[]; masterKeysRemaining: number };
      caseFields: CaseField[];
    }
  | { type: 'error'; message: string }
  | { type: 'turnOrderStarted' }
  | { type: 'turnOrderRoll'; rolls: TurnOrderRoll[] }
  | {
      type: 'turnOrderDiceRolled';
      playerId: number;
      playerName: string;
      value: number;
      rolls: TurnOrderRoll[];
    }
  | { type: 'turnStarted'; playerId: number; playerName: string }
  | {
      type: 'diceRolled';
      playerId: number;
      playerName: string;
      value: number;
      availableSquares: AvailableSquare[];
    }
  | { type: 'playerMoved'; playerId: number; position: Position; path: string[] }
  | { type: 'clueAdded'; playerId: number; zoneId: string; zoneName: string; clueText: string }
  | {
      type: 'lockedZoneEncountered';
      playerId: number;
      zoneId: string;
      zoneName: string;
      hasMasterKey: boolean;
    }
  | { type: 'zoneLocked'; playerId: number; playerName: string; zoneId: string }
  | { type: 'zoneUnlocked'; zoneId: string }
  | { type: 'verifying'; playerName: string }
  | { type: 'playerEliminated'; playerId: number; playerName: string }
  | {
      type: 'gameOver';
      winnerId: number;
      winnerName: string;
      playerAnswer: Record<string, string>;
      officialSolution: CaseField[];
      solutionNarrative: string;
    }
  | { type: 'solutionFailed'; playerId: number; playerName: string }
  | { type: 'left' }
  | { type: 'roomClosed' };

export interface GameSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  room: PublicRoomState | null;
  playerId: number | null;
  notes: NoteEntry[];
  caseFields: CaseField[];
  turnOrderRolls: TurnOrderRoll[];
  turnBanner: string | null;
  verifyingMessage: string | null;
  gameOverMessage: string | null;
  lastDiceRoll: LastDiceRoll | null;
  pendingClue: PendingClue | null;
  pendingLockedZone: PendingLockedZone | null;
  masterKeysRemaining: number;
  remoteMove: { playerId: number; path: string[] } | null;
  officialSolution: CaseField[] | null;
  solutionNarrative: string | null;
  lastSubmittedAnswers: Record<string, string> | null;
  leftGame: boolean;
  roomClosed: boolean;
}

const INITIAL_STATE: GameSocketState = {
  connected: false,
  connecting: false,
  error: null,
  room: null,
  playerId: null,
  notes: [],
  caseFields: [],
  turnOrderRolls: [],
  turnBanner: null,
  verifyingMessage: null,
  gameOverMessage: null,
  lastDiceRoll: null,
  pendingClue: null,
  pendingLockedZone: null,
  masterKeysRemaining: 0,
  remoteMove: null,
  officialSolution: null,
  solutionNarrative: null,
  lastSubmittedAnswers: null,
  leftGame: false,
  roomClosed: false,
};

export function useGameSocket(roomCode: string) {
  const [state, setState] = useState<GameSocketState>(INITIAL_STATE);
  const wsRef = useRef<WebSocket | null>(null);
  const joinedRef = useRef(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const intentionalCloseRef = useRef(false);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const send = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const applyRoomState = useCallback(
    (payload: Extract<ServerMessage, { type: 'roomState' }>) => {
      reconnectAttemptsRef.current = 0;
      clearReconnectTimer();
      saveSessionToken(roomCode, payload.you.sessionToken);
      setState((prev) => ({
        ...prev,
        room: payload.state,
        playerId: payload.you.playerId,
        notes: payload.you.notes,
        masterKeysRemaining: payload.you.masterKeysRemaining,
        caseFields: payload.caseFields,
        turnOrderRolls: payload.state.turnOrderRolls,
        pendingClue:
          payload.state.shift.status === 'awaiting-clue' &&
          payload.you.playerId === payload.state.shift.playerId
            ? prev.pendingClue
            : null,
        pendingLockedZone:
          payload.state.shift.status === 'awaiting-locked-zone' &&
          payload.you.playerId === payload.state.shift.playerId
            ? prev.pendingLockedZone
            : null,
        turnBanner:
          payload.state.phase === 'turnOrder'
            ? null
            : payload.state.phase === 'playing'
              ? buildTurnBanner(payload.state, payload.you.playerId)
              : prev.turnBanner,
        error: null,
        connecting: false,
      }));
    },
    [clearReconnectTimer, roomCode],
  );

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current !== null || !getSessionToken(roomCode)) {
      return;
    }

    const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 8000);
    setState((prev) => ({
      ...prev,
      connected: false,
      connecting: true,
      error: 'Conexão perdida. Tentando reconectar…',
    }));

    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
      reconnectAttemptsRef.current += 1;
      connectRef.current();
    }, delay);
  }, [roomCode]);

  const connectRef = useRef<(joinPayload?: { name: string; color: string }) => void>(() => {});

  const connect = useCallback(
    (joinPayload?: { name: string; color: string }) => {
      const existing = wsRef.current;
      if (
        existing &&
        (existing.readyState === WebSocket.OPEN || existing.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      if (existing) {
        existing.onopen = null;
        existing.onmessage = null;
        existing.onerror = null;
        existing.onclose = null;
        existing.close();
        wsRef.current = null;
      }

      setState((prev) => ({ ...prev, connecting: true, error: null }));
      intentionalCloseRef.current = false;

      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        if (ws !== wsRef.current) {
          return;
        }

        setState((prev) => ({ ...prev, connected: true, connecting: false, error: null }));
        const sessionToken = getSessionToken(roomCode);
        if (sessionToken && !joinPayload) {
          ws.send(JSON.stringify({ type: 'reconnect', code: roomCode, sessionToken }));
        } else if (joinPayload) {
          ws.send(
            JSON.stringify({
              type: 'join',
              code: roomCode,
              name: joinPayload.name,
              color: joinPayload.color,
              sessionToken: sessionToken ?? undefined,
            }),
          );
        }
      };

      ws.onmessage = (event) => {
        if (ws !== wsRef.current) {
          return;
        }

        const message = JSON.parse(event.data as string) as ServerMessage;

        switch (message.type) {
          case 'roomState':
            applyRoomState(message);
            break;
          case 'error':
            if (message.message.includes('Sessão expirada')) {
              clearSessionToken(roomCode);
              clearReconnectTimer();
              intentionalCloseRef.current = true;
            }
            setState((prev) => ({ ...prev, error: message.message, connecting: false }));
            break;
          case 'turnOrderStarted':
            setState((prev) => ({
              ...prev,
              turnBanner: null,
              lastDiceRoll: null,
              turnOrderRolls: [],
            }));
            break;
          case 'turnOrderRoll':
            setState((prev) => ({ ...prev, turnOrderRolls: message.rolls }));
            break;
          case 'turnOrderDiceRolled':
            setState((prev) => ({
              ...prev,
              turnOrderRolls: message.rolls,
            }));
            break;
          case 'turnStarted':
            setState((prev) => {
              if (prev.room?.phase !== 'playing') {
                return prev;
              }

              return {
                ...prev,
                turnBanner:
                  prev.playerId === message.playerId
                    ? 'Seu turno'
                    : `${message.playerName} está jogando`,
              };
            });
            break;
          case 'diceRolled':
            setState((prev) => {
              const playerName = resolvePlayerName(
                prev.room,
                message.playerId,
                message.playerName,
              );

              return {
                ...prev,
                turnBanner:
                  prev.playerId === message.playerId
                    ? prev.turnBanner
                    : `${playerName} tirou o número ${message.value}!`,
                room: prev.room
                  ? {
                      ...prev.room,
                      shift: {
                        ...prev.room.shift,
                        status: 'in-progress',
                        diceResult: message.value,
                        availableSquares: message.availableSquares,
                        playerId: message.playerId,
                      },
                    }
                  : prev.room,
              };
            });
            break;
          case 'playerMoved':
            setState((prev) => ({
              ...prev,
              remoteMove:
                prev.playerId !== message.playerId
                  ? { playerId: message.playerId, path: message.path }
                  : prev.remoteMove,
              room: prev.room
                ? {
                    ...prev.room,
                    players: prev.room.players.map((player) =>
                      player.id === message.playerId
                        ? { ...player, position: message.position }
                        : player,
                    ),
                  }
                : prev.room,
            }));
            break;
          case 'clueAdded':
            setState((prev) => {
              const isActivePlayer = prev.playerId === prev.room?.shift.playerId;

              return {
                ...prev,
                notes: [
                  ...prev.notes,
                  {
                    kind: 'clue' as const,
                    zoneId: message.zoneId as NoteEntry extends { kind: 'clue'; zoneId: infer Z }
                      ? Z
                      : never,
                    zoneName: message.zoneName,
                    text: message.clueText,
                    at: new Date().toISOString(),
                  },
                ],
                pendingClue: isActivePlayer
                  ? {
                      zoneId: message.zoneId as PendingClue['zoneId'],
                      zoneName: message.zoneName,
                      text: message.clueText,
                    }
                  : null,
                room: prev.room
                  ? {
                      ...prev.room,
                      shift: {
                        ...prev.room.shift,
                        status: 'awaiting-clue',
                        availableSquares: [],
                        diceResult: null,
                      },
                    }
                  : prev.room,
              };
            });
            break;
          case 'lockedZoneEncountered':
            setState((prev) => {
              const isActivePlayer = prev.playerId === prev.room?.shift.playerId;

              return {
                ...prev,
                pendingLockedZone: isActivePlayer
                  ? {
                      zoneId: message.zoneId as PendingLockedZone['zoneId'],
                      zoneName: message.zoneName,
                      hasMasterKey: message.hasMasterKey,
                    }
                  : null,
                room: prev.room
                  ? {
                      ...prev.room,
                      shift: {
                        ...prev.room.shift,
                        status: 'awaiting-locked-zone',
                        availableSquares: [],
                        diceResult: null,
                      },
                    }
                  : prev.room,
              };
            });
            break;
          case 'verifying':
            setState((prev) => ({
              ...prev,
              verifyingMessage: `${message.playerName} está verificando a solução…`,
            }));
            break;
          case 'playerEliminated':
            setState((prev) => ({
              ...prev,
              room: prev.room
                ? {
                    ...prev.room,
                    players: prev.room.players.map((player) =>
                      player.id === message.playerId ? { ...player, eliminated: true } : player,
                    ),
                  }
                : prev.room,
            }));
            break;
          case 'solutionFailed':
            setState((prev) => ({
              ...prev,
              verifyingMessage: null,
              error: `${message.playerName} errou a solução e foi eliminado.`,
            }));
            break;
          case 'gameOver':
            setState((prev) => ({
              ...prev,
              verifyingMessage: null,
              officialSolution: message.officialSolution,
              solutionNarrative: message.solutionNarrative,
              lastSubmittedAnswers: message.playerAnswer,
              gameOverMessage: `${message.winnerName} venceu a partida!`,
              room: prev.room ? { ...prev.room, phase: 'finished', winnerId: message.winnerId } : prev.room,
            }));
            break;
          case 'left':
            intentionalCloseRef.current = true;
            clearReconnectTimer();
            clearSessionToken(roomCode);
            if (wsRef.current) {
              wsRef.current.onopen = null;
              wsRef.current.onmessage = null;
              wsRef.current.onerror = null;
              wsRef.current.onclose = null;
              wsRef.current.close();
              wsRef.current = null;
            }
            setState({ ...INITIAL_STATE, leftGame: true });
            break;
          case 'roomClosed':
            intentionalCloseRef.current = true;
            clearReconnectTimer();
            clearSessionToken(roomCode);
            if (wsRef.current) {
              wsRef.current.onopen = null;
              wsRef.current.onmessage = null;
              wsRef.current.onerror = null;
              wsRef.current.onclose = null;
              wsRef.current.close();
              wsRef.current = null;
            }
            setState({
              ...INITIAL_STATE,
              roomClosed: true,
              error: 'A sala foi encerrada porque não restam jogadores.',
            });
            break;
        }
      };

      ws.onclose = () => {
        if (ws !== wsRef.current) {
          return;
        }

        wsRef.current = null;
        joinedRef.current = false;
        setState((prev) => ({ ...prev, connected: false, connecting: false }));

        if (!intentionalCloseRef.current && getSessionToken(roomCode)) {
          scheduleReconnect();
        }
      };

      ws.onerror = () => {
        if (ws !== wsRef.current) {
          return;
        }
      };
    },
    [applyRoomState, clearReconnectTimer, roomCode, scheduleReconnect],
  );

  connectRef.current = connect;

  useEffect(() => {
    if (getSessionToken(roomCode)) {
      connectRef.current();
    }

    return () => {
      intentionalCloseRef.current = true;
      clearReconnectTimer();
      const ws = wsRef.current;
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
        wsRef.current = null;
      }
    };
  }, [clearReconnectTimer, roomCode]);

  const join = useCallback(
    (name: string, color: string) => {
      joinedRef.current = true;
      connect({ name, color });
    },
    [connect],
  );

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  const updateColor = useCallback(
    (targetPlayerId: number, color: string) =>
      send({ type: 'updateColor', targetPlayerId, color }),
    [send],
  );
  const startGame = useCallback(() => send({ type: 'start' }), [send]);
  const rollTurnOrderDice = useCallback(
    (value: number) => send({ type: 'rollTurnOrderDice', value }),
    [send],
  );
  const rollDice = useCallback((value: number) => send({ type: 'rollDice', value }), [send]);
  const move = useCallback(
    (destination: Position) => send({ type: 'move', destination }),
    [send],
  );
  const passTurn = useCallback(() => send({ type: 'passTurn' }), [send]);
  const lockZone = useCallback(
    (zoneId: string) => send({ type: 'lockZone', zoneId }),
    [send],
  );
  const resolveLockedZone = useCallback(
    (unlock: boolean) => send({ type: 'resolveLockedZone', unlock }),
    [send],
  );
  const setMasterKeysPerPlayer = useCallback(
    (count: number) => send({ type: 'setMasterKeysPerPlayer', count }),
    [send],
  );
  const updateNotes = useCallback(
    (customText: string) => send({ type: 'updateNotes', customText }),
    [send],
  );
  const submitSolution = useCallback(
    (answers: Record<string, string>) => send({ type: 'submitSolution', answers }),
    [send],
  );
  const revealSolution = useCallback(() => send({ type: 'revealSolution' }), [send]);
  const leaveGame = useCallback(() => {
    intentionalCloseRef.current = true;
    clearReconnectTimer();
    clearSessionToken(roomCode);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave' }));
    }

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setState({ ...INITIAL_STATE, leftGame: true });
  }, [clearReconnectTimer, roomCode]);

  const clearRemoteMove = useCallback(() => {
    setState((prev) => ({ ...prev, remoteMove: null }));
  }, []);

  const clearTurnBanner = useCallback(() => {
    setState((prev) => ({ ...prev, turnBanner: null }));
  }, []);

  const clearLastDiceRoll = useCallback(() => {
    setState((prev) => ({ ...prev, lastDiceRoll: null }));
  }, []);

  const clearPendingClue = useCallback(() => {
    setState((prev) => ({ ...prev, pendingClue: null }));
  }, []);

  const clearPendingLockedZone = useCallback(() => {
    setState((prev) => ({ ...prev, pendingLockedZone: null }));
  }, []);

  const players = state.room?.players ?? [];
  const phase = state.room?.phase ?? null;
  const shift = state.room?.shift;
  const isMyTurn = !!state.playerId && shift?.playerId === state.playerId;
  const canInteract =
    phase === 'playing' && isMyTurn && shift?.status === 'in-progress' && !state.remoteMove;
  const showTurnOrderDice =
    phase === 'turnOrder' &&
    state.playerId !== null &&
    (state.room?.turnOrderPendingIds ?? []).includes(state.playerId);
  const showDice =
    showTurnOrderDice ||
    (phase === 'playing' && isMyTurn && shift?.status === 'waiting' && !state.remoteMove);
  const isCreator = state.playerId !== null && state.room?.creatorId === state.playerId;
  const activePlayers = players.filter((p) => !p.eliminated);

  const visiblePlayers = useMemo(
    () => players.filter((player) => !player.eliminated),
    [players],
  );

  return {
    ...state,
    join,
    reconnect,
    updateColor,
    startGame,
    rollTurnOrderDice,
    rollDice,
    move,
    passTurn,
    lockZone,
    resolveLockedZone,
    setMasterKeysPerPlayer,
    updateNotes,
    submitSolution,
    revealSolution,
    leaveGame,
    clearRemoteMove,
    clearTurnBanner,
    clearLastDiceRoll,
    clearPendingClue,
    clearPendingLockedZone,
    phase,
    shift,
    players,
    visiblePlayers,
    isMyTurn,
    canInteract,
    showDice,
    showTurnOrderDice,
    isCreator,
    activePlayers,
  };
}

export type UseGameSocketReturn = ReturnType<typeof useGameSocket>;

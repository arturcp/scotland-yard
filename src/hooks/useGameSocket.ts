import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getWebSocketUrl } from '../lib/api';
import { getSessionToken, saveSessionToken } from '../lib/session';
import type {
  AvailableSquare,
  CaseField,
  GameRoomState,
  NoteEntry,
  Position,
  TurnOrderRoll,
} from '../types/game';

type PublicRoomState = Omit<GameRoomState, 'sessionTokens'>;

type ServerMessage =
  | {
      type: 'roomState';
      state: PublicRoomState;
      you: { playerId: number; sessionToken: string; notes: NoteEntry[] };
      caseFields: CaseField[];
    }
  | { type: 'error'; message: string }
  | { type: 'turnOrderRoll'; rolls: TurnOrderRoll[] }
  | { type: 'turnStarted'; playerId: number; playerName: string }
  | {
      type: 'diceRolled';
      playerId: number;
      value: number;
      availableSquares: AvailableSquare[];
    }
  | { type: 'playerMoved'; playerId: number; position: Position; path: string[] }
  | { type: 'clueAdded'; playerId: number; zoneId: string; zoneName: string; clueText: string }
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
  | { type: 'solutionFailed'; playerId: number; playerName: string };

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
  lastDiceRoll: number | null;
  remoteMove: { playerId: number; path: string[] } | null;
  officialSolution: CaseField[] | null;
  solutionNarrative: string | null;
  lastSubmittedAnswers: Record<string, string> | null;
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
  remoteMove: null,
  officialSolution: null,
  solutionNarrative: null,
  lastSubmittedAnswers: null,
};

export function useGameSocket(roomCode: string) {
  const [state, setState] = useState<GameSocketState>(INITIAL_STATE);
  const wsRef = useRef<WebSocket | null>(null);
  const joinedRef = useRef(false);

  const send = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const applyRoomState = useCallback(
    (payload: Extract<ServerMessage, { type: 'roomState' }>) => {
      saveSessionToken(roomCode, payload.you.sessionToken);
      setState((prev) => ({
        ...prev,
        room: payload.state,
        playerId: payload.you.playerId,
        notes: payload.you.notes,
        caseFields: payload.caseFields,
        error: null,
      }));
    },
    [roomCode],
  );

  const connect = useCallback(
    (joinPayload?: { name: string; color: string }) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      setState((prev) => ({ ...prev, connecting: true, error: null }));
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setState((prev) => ({ ...prev, connected: true, connecting: false }));
        const sessionToken = getSessionToken(roomCode);
        if (sessionToken && !joinPayload) {
          send({ type: 'reconnect', code: roomCode, sessionToken });
        } else if (joinPayload) {
          send({
            type: 'join',
            code: roomCode,
            name: joinPayload.name,
            color: joinPayload.color,
            sessionToken: sessionToken ?? undefined,
          });
        }
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data as string) as ServerMessage;

        switch (message.type) {
          case 'roomState':
            applyRoomState(message);
            break;
          case 'error':
            setState((prev) => ({ ...prev, error: message.message }));
            break;
          case 'turnOrderRoll':
            setState((prev) => ({ ...prev, turnOrderRolls: message.rolls }));
            break;
          case 'turnStarted':
            setState((prev) => ({
              ...prev,
              turnBanner:
                prev.playerId === message.playerId ? 'Seu turno' : `${message.playerName} está jogando`,
              lastDiceRoll: null,
            }));
            break;
          case 'diceRolled':
            setState((prev) => ({
              ...prev,
              lastDiceRoll: prev.playerId === message.playerId ? message.value : prev.lastDiceRoll,
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
            }));
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
                    shift:
                      prev.playerId === message.playerId
                        ? {
                            ...prev.room.shift,
                            status: 'waiting',
                            availableSquares: [],
                            diceResult: null,
                          }
                        : prev.room.shift,
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
            setState((prev) => ({
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
            }));
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
        }
      };

      ws.onclose = () => {
        setState((prev) => ({ ...prev, connected: false, connecting: false }));
        wsRef.current = null;
        joinedRef.current = false;
      };

      ws.onerror = () => {
        setState((prev) => ({
          ...prev,
          error: 'Conexão perdida. Tentando reconectar…',
          connecting: false,
        }));
      };
    },
    [applyRoomState, roomCode, send],
  );

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

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
  const rollDice = useCallback(() => send({ type: 'rollDice' }), [send]);
  const move = useCallback(
    (destination: Position) => send({ type: 'move', destination }),
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

  const clearRemoteMove = useCallback(() => {
    setState((prev) => ({ ...prev, remoteMove: null }));
  }, []);

  const clearTurnBanner = useCallback(() => {
    setState((prev) => ({ ...prev, turnBanner: null }));
  }, []);

  const clearLastDiceRoll = useCallback(() => {
    setState((prev) => ({ ...prev, lastDiceRoll: null }));
  }, []);

  const players = state.room?.players ?? [];
  const phase = state.room?.phase ?? null;
  const shift = state.room?.shift;
  const isMyTurn = !!state.playerId && shift?.playerId === state.playerId;
  const canInteract =
    phase === 'playing' && isMyTurn && shift?.status === 'in-progress' && !state.remoteMove;
  const showDice =
    phase === 'playing' && isMyTurn && shift?.status === 'waiting' && !state.remoteMove;
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
    rollDice,
    move,
    updateNotes,
    submitSolution,
    revealSolution,
    clearRemoteMove,
    clearTurnBanner,
    clearLastDiceRoll,
    phase,
    shift,
    players,
    visiblePlayers,
    isMyTurn,
    canInteract,
    showDice,
    isCreator,
    activePlayers,
  };
}

export type UseGameSocketReturn = ReturnType<typeof useGameSocket>;

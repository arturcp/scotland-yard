import type { WebSocket } from 'ws';
import type { CaseDefinition, GameRoomState, NoteEntry, Position } from '../../src/types/game.js';
import {
  beginSolutionVerification,
  getCaseForRoom,
  getPlayerNotes,
  getPublicRoomState,
  joinRoom,
  leaveRoom,
  movePlayer,
  reconnectRoom,
  revealSolution,
  rollDice,
  rollTurnOrderDice,
  setPlayerConnected,
  startGame,
  updateNotes,
  updatePlayerColor,
  type ServerGameEvent,
} from './game-engine.js';

type ClientMessage =
  | { type: 'join'; code: string; name: string; color: string; sessionToken?: string }
  | { type: 'reconnect'; code: string; sessionToken: string }
  | { type: 'updateColor'; targetPlayerId: number; color: string }
  | { type: 'start' }
  | { type: 'rollDice' }
  | { type: 'rollTurnOrderDice' }
  | { type: 'move'; destination: Position }
  | { type: 'updateNotes'; customText: string }
  | { type: 'submitSolution'; answers: Record<string, string> }
  | { type: 'revealSolution' }
  | { type: 'leave' };

export type ServerMessage =
  | {
      type: 'roomState';
      state: ReturnType<typeof getPublicRoomState>;
      you: { playerId: number; sessionToken: string; notes: NoteEntry[] };
      caseFields: CaseDefinition['fields'];
    }
  | { type: 'error'; message: string }
  | { type: 'left' }
  | { type: 'roomClosed' }
  | ServerGameEvent;

interface ClientContext {
  roomCode: string;
  sessionToken: string;
  playerId: number;
}

const roomClients = new Map<string, Set<WebSocket>>();
const clientContext = new Map<WebSocket, ClientContext>();

function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function sendError(ws: WebSocket, message: string): void {
  send(ws, { type: 'error', message });
}

function getClients(roomCode: string): Set<WebSocket> {
  const normalized = roomCode.toUpperCase();
  if (!roomClients.has(normalized)) {
    roomClients.set(normalized, new Set());
  }
  return roomClients.get(normalized)!;
}

function broadcast(roomCode: string, message: ServerMessage, except?: WebSocket): void {
  for (const client of getClients(roomCode)) {
    if (client !== except && client.readyState === client.OPEN) {
      send(client, message);
    }
  }
}

function broadcastRoomState(code: string, state: GameRoomState): void {
  for (const client of getClients(code)) {
    const ctx = clientContext.get(client);
    if (!ctx) continue;
    sendRoomState(client, state, ctx.playerId, ctx.sessionToken);
  }
}

function sendRoomState(
  ws: WebSocket,
  state: GameRoomState,
  playerId: number,
  sessionToken: string,
): void {
  const caseDef = getCaseForRoom(state.code);
  send(ws, {
    type: 'roomState',
    state: getPublicRoomState(state),
    you: {
      playerId,
      sessionToken,
      notes: getPlayerNotes(state, playerId),
    },
    caseFields: caseDef?.fields.map(({ key, label }) => ({ key, label })) ?? [],
  });
}

function registerClient(ws: WebSocket, roomCode: string, sessionToken: string, playerId: number): void {
  clientContext.set(ws, { roomCode: roomCode.toUpperCase(), sessionToken, playerId });
  getClients(roomCode).add(ws);
}

function handleEvents(code: string, events: ServerGameEvent[] | undefined, state: GameRoomState): void {
  if (events?.length) {
    for (const event of events) {
      if (event.type === 'clueAdded') {
        for (const client of getClients(code)) {
          const ctx = clientContext.get(client);
          if (ctx?.playerId === event.playerId) {
            send(client, event);
          }
        }
        continue;
      }

      broadcast(code, event);
    }
  }

  broadcastRoomState(code, state);
}

export function handleConnection(ws: WebSocket): void {
  ws.on('message', (raw) => {
    let message: ClientMessage;
    try {
      message = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      sendError(ws, 'Mensagem inválida.');
      return;
    }

    switch (message.type) {
      case 'join': {
        const result = joinRoom(message.code, message.name, message.color, message.sessionToken);
        if (result.error) {
          sendError(ws, result.error);
          return;
        }
        registerClient(ws, result.state.code, result.sessionToken, result.playerId);
        sendRoomState(ws, result.state, result.playerId, result.sessionToken);
        broadcastRoomState(result.state.code, result.state);
        break;
      }
      case 'reconnect': {
        const result = reconnectRoom(message.code, message.sessionToken);
        if (result.error) {
          sendError(ws, result.error);
          return;
        }
        registerClient(ws, result.state.code, result.sessionToken, result.playerId);
        sendRoomState(ws, result.state, result.playerId, result.sessionToken);
        broadcastRoomState(result.state.code, result.state);
        break;
      }
      default: {
        const ctx = clientContext.get(ws);
        if (!ctx) {
          sendError(ws, 'Conecte-se à sala primeiro.');
          return;
        }

        switch (message.type) {
          case 'updateColor': {
            const result = updatePlayerColor(
              ctx.roomCode,
              ctx.playerId,
              message.targetPlayerId,
              message.color,
            );
            if (result.error) {
              sendError(ws, result.error);
              return;
            }
            broadcastRoomState(ctx.roomCode, result.state);
            break;
          }
          case 'start': {
            const result = startGame(ctx.roomCode, ctx.playerId);
            if (result.error) {
              sendError(ws, result.error);
              return;
            }
            handleEvents(ctx.roomCode, result.events, result.state);
            break;
          }
          case 'rollDice': {
            const result = rollDice(ctx.roomCode, ctx.playerId);
            if (result.error) {
              sendError(ws, result.error);
              return;
            }
            handleEvents(ctx.roomCode, result.events, result.state);
            break;
          }
          case 'rollTurnOrderDice': {
            const result = rollTurnOrderDice(ctx.roomCode, ctx.playerId);
            if (result.error) {
              sendError(ws, result.error);
              return;
            }
            handleEvents(ctx.roomCode, result.events, result.state);
            break;
          }
          case 'move': {
            const result = movePlayer(ctx.roomCode, ctx.playerId, message.destination);
            if (result.error) {
              sendError(ws, result.error);
              return;
            }
            handleEvents(ctx.roomCode, result.events, result.state);
            break;
          }
          case 'updateNotes': {
            const result = updateNotes(ctx.roomCode, ctx.playerId, message.customText);
            if (result.error) {
              sendError(ws, result.error);
              return;
            }
            sendRoomState(ws, result.state, ctx.playerId, ctx.sessionToken);
            break;
          }
          case 'submitSolution': {
            const result = beginSolutionVerification(
              ctx.roomCode,
              ctx.playerId,
              message.answers,
            );
            if (result.error) {
              sendError(ws, result.error);
              return;
            }
            handleEvents(ctx.roomCode, result.events, result.state);
            break;
          }
          case 'revealSolution': {
            const result = revealSolution(ctx.roomCode, ctx.playerId);
            if (result.error) {
              sendError(ws, result.error);
              return;
            }
            handleEvents(ctx.roomCode, result.events, result.state);
            break;
          }
          case 'leave': {
            const roomCode = ctx.roomCode;
            const result = leaveRoom(roomCode, ctx.playerId);
            if (result.error && !result.roomDeleted) {
              sendError(ws, result.error);
              return;
            }

            getClients(roomCode).delete(ws);
            clientContext.delete(ws);
            send(ws, { type: 'left' });

            if (result.roomDeleted) {
              for (const client of getClients(roomCode)) {
                send(client, { type: 'roomClosed' });
                client.close();
                clientContext.delete(client);
              }
              roomClients.delete(roomCode);
            } else if (result.state) {
              handleEvents(roomCode, result.events, result.state);
            }

            ws.close();
            break;
          }
        }
      }
    }
  });

  ws.on('close', () => {
    const ctx = clientContext.get(ws);
    if (ctx) {
      setPlayerConnected(ctx.roomCode, ctx.sessionToken, false);
      getClients(ctx.roomCode).delete(ws);
      clientContext.delete(ws);
      const state = reconnectRoom(ctx.roomCode, ctx.sessionToken).state;
      broadcastRoomState(ctx.roomCode, state);
    }
  });
}

export function cleanupClient(ws: WebSocket): void {
  ws.close();
}

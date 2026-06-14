import type { WebSocket } from 'ws';
import type { ZoneId } from '../../src/board/types.js';
import type { CaseDefinition, GameRoomState, NoteEntry, Position } from '../../src/types/game.js';
import {
  beginSolutionVerification,
  confirmSolution,
  getCaseForRoom,
  getPlayerNotes,
  getPlayerVisitedZones,
  getPublicRoomState,
  joinRoom,
  leaveRoom,
  movePlayer,
  passTurn,
  lockZoneFromClue,
  resolveLockedZoneEntry,
  reconnectRoom,
  revealSolution,
  rollDice,
  rollTurnOrderDice,
  setMasterKeysPerPlayer,
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
  | { type: 'setMasterKeysPerPlayer'; count: number }
  | { type: 'rollDice'; value: number }
  | { type: 'rollTurnOrderDice'; value: number }
  | { type: 'move'; destination: Position }
  | { type: 'passTurn' }
  | { type: 'lockZone'; zoneId: string }
  | { type: 'resolveLockedZone'; unlock: boolean }
  | { type: 'updateNotes'; customText: string }
  | { type: 'submitSolution'; answers: Record<string, string> }
  | { type: 'revealSolution' }
  | { type: 'confirmSolution'; correct: boolean }
  | { type: 'leave' };

export type ServerMessage =
  | {
      type: 'roomState';
      state: ReturnType<typeof getPublicRoomState>;
      you: {
        playerId: number;
        sessionToken: string;
        notes: NoteEntry[];
        visitedZones: ZoneId[];
      };
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

async function broadcastRoomState(code: string, state: GameRoomState): Promise<void> {
  for (const client of getClients(code)) {
    const ctx = clientContext.get(client);
    if (!ctx) continue;
    await sendRoomState(client, state, ctx.playerId, ctx.sessionToken);
  }
}

async function sendRoomState(
  ws: WebSocket,
  state: GameRoomState,
  playerId: number,
  sessionToken: string,
): Promise<void> {
  const caseDef = await getCaseForRoom(state.code);
  send(ws, {
    type: 'roomState',
    state: getPublicRoomState(state),
    you: {
      playerId,
      sessionToken,
      notes: getPlayerNotes(state, playerId),
      visitedZones: getPlayerVisitedZones(state, playerId),
      masterKeysRemaining: state.masterKeysRemainingByPlayer[playerId] ?? 0,
    },
    caseFields: caseDef?.fields.map(({ key, label }) => ({ key, label })) ?? [],
  });
}

function registerClient(ws: WebSocket, roomCode: string, sessionToken: string, playerId: number): void {
  clientContext.set(ws, { roomCode: roomCode.toUpperCase(), sessionToken, playerId });
  getClients(roomCode).add(ws);
}

async function handleEvents(
  code: string,
  events: ServerGameEvent[] | undefined,
  state: GameRoomState,
): Promise<void> {
  if (events?.length) {
    for (const event of events) {
      if (
        event.type === 'clueAdded' ||
        event.type === 'lockedZoneEncountered' ||
        event.type === 'solutionRevealed'
      ) {
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

  await broadcastRoomState(code, state);
}

export function handleConnection(ws: WebSocket): void {
  ws.on('message', (raw) => {
    void (async () => {
      let message: ClientMessage;
      try {
        message = JSON.parse(raw.toString()) as ClientMessage;
      } catch {
        sendError(ws, 'Mensagem inválida.');
        return;
      }

      switch (message.type) {
        case 'join': {
          const result = await joinRoom(message.code, message.name, message.color, message.sessionToken);
          if (result.error) {
            sendError(ws, result.error);
            return;
          }
          registerClient(ws, result.state.code, result.sessionToken, result.playerId);
          await sendRoomState(ws, result.state, result.playerId, result.sessionToken);
          await broadcastRoomState(result.state.code, result.state);
          break;
        }
        case 'reconnect': {
          const result = await reconnectRoom(message.code, message.sessionToken);
          if (result.error) {
            sendError(ws, result.error);
            return;
          }
          registerClient(ws, result.state.code, result.sessionToken, result.playerId);
          await sendRoomState(ws, result.state, result.playerId, result.sessionToken);
          await broadcastRoomState(result.state.code, result.state);
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
              const result = await updatePlayerColor(
                ctx.roomCode,
                ctx.playerId,
                message.targetPlayerId,
                message.color,
              );
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await broadcastRoomState(ctx.roomCode, result.state);
              break;
            }
            case 'start': {
              const result = await startGame(ctx.roomCode, ctx.playerId);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'rollDice': {
              const result = await rollDice(ctx.roomCode, ctx.playerId, message.value);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'rollTurnOrderDice': {
              const result = await rollTurnOrderDice(ctx.roomCode, ctx.playerId, message.value);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'move': {
              const result = await movePlayer(ctx.roomCode, ctx.playerId, message.destination);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'passTurn': {
              const result = await passTurn(ctx.roomCode, ctx.playerId);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'lockZone': {
              const result = await lockZoneFromClue(ctx.roomCode, ctx.playerId, message.zoneId);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'resolveLockedZone': {
              const result = await resolveLockedZoneEntry(ctx.roomCode, ctx.playerId, message.unlock);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'setMasterKeysPerPlayer': {
              const result = await setMasterKeysPerPlayer(ctx.roomCode, ctx.playerId, message.count);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await broadcastRoomState(ctx.roomCode, result.state);
              break;
            }
            case 'updateNotes': {
              const result = await updateNotes(ctx.roomCode, ctx.playerId, message.customText);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await sendRoomState(ws, result.state, ctx.playerId, ctx.sessionToken);
              break;
            }
            case 'submitSolution': {
              const result = await beginSolutionVerification(
                ctx.roomCode,
                ctx.playerId,
                message.answers,
              );
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'revealSolution': {
              const result = await revealSolution(ctx.roomCode, ctx.playerId);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'confirmSolution': {
              const result = await confirmSolution(ctx.roomCode, ctx.playerId, message.correct);
              if (result.error) {
                sendError(ws, result.error);
                return;
              }
              await handleEvents(ctx.roomCode, result.events, result.state);
              break;
            }
            case 'leave': {
              const roomCode = ctx.roomCode;
              const result = await leaveRoom(roomCode, ctx.playerId);
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
                await handleEvents(roomCode, result.events, result.state);
              }

              ws.close();
              break;
            }
          }
        }
      }
    })().catch((error) => {
      console.error('WebSocket message handler failed:', error);
      sendError(ws, 'Erro interno do servidor.');
    });
  });

  ws.on('close', () => {
    void (async () => {
      const ctx = clientContext.get(ws);
      if (ctx) {
        await setPlayerConnected(ctx.roomCode, ctx.sessionToken, false);
        getClients(ctx.roomCode).delete(ws);
        clientContext.delete(ws);
        const result = await reconnectRoom(ctx.roomCode, ctx.sessionToken);
        await broadcastRoomState(ctx.roomCode, result.state);
      }
    })().catch((error) => {
      console.error('WebSocket close handler failed:', error);
    });
  });
}

export function cleanupClient(ws: WebSocket): void {
  ws.close();
}

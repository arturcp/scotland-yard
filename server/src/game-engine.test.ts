import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedCasesIfEmpty } from './case-store.js';
import {
  computeTurnOrderFromRolls,
  createRoom,
  joinRoom,
  leaveRoom,
  revealSolution,
  rollDice,
  rollTurnOrderDice,
  roomExists,
  startGame,
  beginSolutionVerification,
  updatePlayerColor,
} from './game-engine.js';
import { closeDb, saveRoom } from './persistence.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB = path.join(__dirname, '..', 'data', 'test-rooms.db');

beforeEach(() => {
  process.env.DB_PATH = TEST_DB;
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }
  seedCasesIfEmpty();
});

afterEach(() => {
  closeDb();
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }
});

describe('game engine', () => {
  test('creates a room with lobby phase and selected case', () => {
    const room = createRoom('001');
    expect(room.code).toHaveLength(6);
    expect(room.phase).toBe('lobby');
    expect(room.caseId).toBe('001');
    expect(room.caseTitle).toBe('O Homem Profano');
    expect(room.caseIntro.length).toBeGreaterThan(0);
  });

  test('rejects unknown case', () => {
    expect(() => createRoom('999')).toThrow('Caso não encontrado.');
  });

  test('player can change own color in lobby', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    joinRoom(room.code, 'Bob', 'yellow');

    const updated = updatePlayerColor(room.code, first.playerId, first.playerId, 'green');
    expect(updated.error).toBeUndefined();
    expect(updated.state.players.find((p) => p.id === first.playerId)?.color).toBe('green');
  });

  test('creator can change another player color in lobby', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    const second = joinRoom(room.code, 'Bob', 'yellow');

    const updated = updatePlayerColor(room.code, first.playerId, second.playerId, 'purple');
    expect(updated.error).toBeUndefined();
    expect(updated.state.players.find((p) => p.id === second.playerId)?.color).toBe('purple');
  });

  test('non-creator cannot change another player color', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    const second = joinRoom(room.code, 'Bob', 'yellow');

    const updated = updatePlayerColor(room.code, second.playerId, first.playerId, 'green');
    expect(updated.error).toBe('Você não pode alterar a cor deste jogador.');
  });

  test('rejects duplicate color in lobby', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    joinRoom(room.code, 'Bob', 'yellow');

    const updated = updatePlayerColor(room.code, first.playerId, first.playerId, 'yellow');
    expect(updated.error).toBe('Esta cor já está em uso.');
  });

  test('rejects color change after game starts', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    joinRoom(room.code, 'Bob', 'yellow');
    startGame(room.code, first.playerId);

    const updated = updatePlayerColor(room.code, first.playerId, first.playerId, 'green');
    expect(updated.error).toBe('Não é possível alterar cores após o início da partida.');
  });

  test('starts turn order phase and waits for each player to roll', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    const second = joinRoom(room.code, 'Bob', 'yellow');
    expect(first.error).toBeUndefined();
    expect(second.error).toBeUndefined();

    const started = startGame(room.code, first.playerId);
    expect(started.error).toBeUndefined();
    expect(started.state.phase).toBe('turnOrder');
    expect(started.state.turnOrderPendingIds).toEqual([first.playerId, second.playerId]);
    expect(started.state.shift.playerId).toBe(0);
    expect(started.state.turnOrder).toEqual([]);
    expect(started.events?.some((event) => event.type === 'turnOrderStarted')).toBe(true);
    expect(started.events?.some((event) => event.type === 'turnStarted')).toBe(false);

    const aliceRoll = rollTurnOrderDice(room.code, first.playerId);
    expect(aliceRoll.error).toBeUndefined();
    expect(aliceRoll.state.phase).toBe('turnOrder');
    expect(aliceRoll.events?.some((event) => event.type === 'turnOrderDiceRolled')).toBe(true);

    const bobRoll = rollTurnOrderDice(room.code, second.playerId);
    expect(bobRoll.error).toBeUndefined();
    expect(bobRoll.state.phase).toBe('playing');
    expect(bobRoll.state.turnOrder).toHaveLength(2);
    expect(bobRoll.events?.some((event) => event.type === 'turnStarted')).toBe(true);
  });

  test('orders players by descending dice and randomizes ties', () => {
    const rolls = [
      { playerId: 1, playerName: 'A', value: 1 },
      { playerId: 2, playerName: 'B', value: 3 },
      { playerId: 3, playerName: 'C', value: 3 },
      { playerId: 4, playerName: 'D', value: 6 },
      { playerId: 5, playerName: 'E', value: 3 },
      { playerId: 6, playerName: 'F', value: 4 },
    ];

    const order = computeTurnOrderFromRolls(rolls, () => 0);
    expect(order[0]).toBe(4);
    expect(order[1]).toBe(6);
    expect(order.slice(2, 5).sort()).toEqual([2, 3, 5]);
    expect(order[5]).toBe(1);
  });

  test('keeps turn order phase until every connected player rolls', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    const second = joinRoom(room.code, 'Bob', 'yellow');
    startGame(room.code, first.playerId);

    const partial = rollTurnOrderDice(room.code, first.playerId);
    expect(partial.state.phase).toBe('turnOrder');
    expect(partial.state.turnOrderPendingIds).toEqual([second.playerId]);
    expect(partial.events?.some((event) => event.type === 'turnStarted')).toBe(false);
  });

  test('rejects duplicate turn order rolls', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    joinRoom(room.code, 'Bob', 'yellow');
    startGame(room.code, first.playerId);

    const firstRoll = rollTurnOrderDice(room.code, first.playerId);
    expect(firstRoll.error).toBeUndefined();

    const duplicateRoll = rollTurnOrderDice(room.code, first.playerId);
    expect(duplicateRoll.error).toBe('Você já rolou o dado para a ordem de jogada.');
  });

  test('deletes room when the last player leaves', () => {
    const room = createRoom('002');
    const only = joinRoom(room.code, 'Alice', 'blue');

    const result = leaveRoom(room.code, only.playerId);
    expect(result.error).toBeUndefined();
    expect(result.roomDeleted).toBe(true);
    expect(roomExists(room.code)).toBe(false);
  });

  test('removes player and reassigns creator when someone leaves', () => {
    const room = createRoom('002');
    const creator = joinRoom(room.code, 'Alice', 'blue');
    const other = joinRoom(room.code, 'Bob', 'yellow');

    const result = leaveRoom(room.code, creator.playerId);
    expect(result.error).toBeUndefined();
    expect(result.roomDeleted).toBe(false);
    expect(result.state?.players).toHaveLength(1);
    expect(result.state?.creatorId).toBe(other.playerId);
    expect(roomExists(room.code)).toBe(true);
  });

  test('rolls dice only for active player', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    const second = joinRoom(room.code, 'Bob', 'yellow');
    startGame(room.code, first.playerId);
    rollTurnOrderDice(room.code, first.playerId);
    const started = rollTurnOrderDice(room.code, second.playerId);
    const activeId = started.state.shift.playerId;

    const wrong = rollDice(
      room.code,
      activeId === first.playerId ? second.playerId : first.playerId,
    );
    expect(wrong.error).toBe('Não é a sua vez.');

    const rolled = rollDice(room.code, activeId);
    expect(rolled.error).toBeUndefined();
    expect(rolled.state.shift.diceResult).toBeGreaterThanOrEqual(1);
    expect(rolled.state.shift.diceResult).toBeLessThanOrEqual(6);
  });

  test('eliminates player on wrong solution', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    const second = joinRoom(room.code, 'Bob', 'yellow');
    startGame(room.code, first.playerId);
    rollTurnOrderDice(room.code, first.playerId);
    const started = rollTurnOrderDice(room.code, second.playerId);

    const player = started.state.players.find((p) => p.id === first.playerId)!;
    player.position = { place: 'holmes-house' };
    saveRoom(started.state);

    beginSolutionVerification(room.code, first.playerId, {
      culprit: 'wrong',
      method: 'wrong',
      motive: 'wrong',
    });

    const result = revealSolution(room.code, first.playerId);
    expect(result.events?.some((event) => event.type === 'solutionFailed')).toBe(true);
    expect(result.state.players.find((p) => p.id === first.playerId)?.eliminated).toBe(true);
  });
});

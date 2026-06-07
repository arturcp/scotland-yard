import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedCasesIfEmpty } from './case-store.js';
import {
  createRoom,
  joinRoom,
  revealSolution,
  rollDice,
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

  test('starts game with turn order after two players join', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    const second = joinRoom(room.code, 'Bob', 'yellow');
    expect(first.error).toBeUndefined();
    expect(second.error).toBeUndefined();

    const started = startGame(room.code, first.playerId);
    expect(started.error).toBeUndefined();
    expect(started.state.phase).toBe('playing');
    expect(started.events?.some((event) => event.type === 'turnOrderRoll')).toBe(true);
    expect(started.events?.some((event) => event.type === 'turnStarted')).toBe(true);
  });

  test('rolls dice only for active player', () => {
    const room = createRoom('002');
    const first = joinRoom(room.code, 'Alice', 'blue');
    const second = joinRoom(room.code, 'Bob', 'yellow');
    const started = startGame(room.code, first.playerId);
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
    joinRoom(room.code, 'Bob', 'yellow');
    const started = startGame(room.code, first.playerId);

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

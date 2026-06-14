import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MAX_PLAYERS, PLAYER_COLORS } from '../../src/types/game.js';
import { seedCasesIfEmpty, resetCaseStore } from './case-store.js';
import {
  computeTurnOrderFromRolls,
  createRoom,
  getPlayerVisitedZones,
  joinRoom,
  leaveRoom,
  lockZoneFromClue,
  movePlayer,
  passTurn,
  resolveLockedZoneEntry,
  beginSolutionVerification,
  confirmSolution,
  revealSolution,
  rollDice,
  rollTurnOrderDice,
  roomExists,
  setMasterKeysPerPlayer,
  startGame,
  updatePlayerColor,
} from './game-engine.js';
import { closeDb, saveRoom } from './persistence.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB = path.join(__dirname, '..', 'data', 'test-rooms.db');

beforeEach(async () => {
  process.env.TURSO_DATABASE_URL = `file:${TEST_DB}`;
  delete process.env.TURSO_AUTH_TOKEN;
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }
  await seedCasesIfEmpty();
});

afterEach(async () => {
  await closeDb();
  resetCaseStore();
  if (fs.existsSync(TEST_DB)) {
    fs.unlinkSync(TEST_DB);
  }
});

describe('game engine', () => {
  test('creates a room with lobby phase and selected case', async () => {
    const room = await createRoom('001');
    expect(room.code).toHaveLength(6);
    expect(room.phase).toBe('lobby');
    expect(room.caseId).toBe('001');
    expect(room.caseTitle).toBe('O Homem Profano');
    expect(room.caseIntro.length).toBeGreaterThan(0);
  });

  test('rejects unknown case', async () => {
    await expect(createRoom('999')).rejects.toThrow('Caso não encontrado.');
  });

  test('player can change own color in lobby', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    await joinRoom(room.code, 'Bob', 'yellow');

    const updated = await updatePlayerColor(room.code, first.playerId, first.playerId, 'green');
    expect(updated.error).toBeUndefined();
    expect(updated.state.players.find((p) => p.id === first.playerId)?.color).toBe('green');
  });

  test('creator can change another player color in lobby', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');

    const updated = await updatePlayerColor(room.code, first.playerId, second.playerId, 'purple');
    expect(updated.error).toBeUndefined();
    expect(updated.state.players.find((p) => p.id === second.playerId)?.color).toBe('purple');
  });

  test('non-creator cannot change another player color', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');

    const updated = await updatePlayerColor(room.code, second.playerId, first.playerId, 'green');
    expect(updated.error).toBe('Você não pode alterar a cor deste jogador.');
  });

  test('rejects duplicate color in lobby', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    await joinRoom(room.code, 'Bob', 'yellow');

    const updated = await updatePlayerColor(room.code, first.playerId, first.playerId, 'yellow');
    expect(updated.error).toBe('Esta cor já está em uso.');
  });

  test('rejects color change after game starts', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);

    const updated = await updatePlayerColor(room.code, first.playerId, first.playerId, 'green');
    expect(updated.error).toBe('Não é possível alterar cores após o início da partida.');
  });

  test('starts turn order phase and waits for each player to roll', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    expect(first.error).toBeUndefined();
    expect(second.error).toBeUndefined();

    const started = await startGame(room.code, first.playerId);
    expect(started.error).toBeUndefined();
    expect(started.state.phase).toBe('turnOrder');
    expect(started.state.turnOrderPendingIds).toEqual([first.playerId, second.playerId]);
    expect(started.state.shift.playerId).toBe(0);
    expect(started.state.turnOrder).toEqual([]);
    expect(started.events?.some((event) => event.type === 'turnOrderStarted')).toBe(true);
    expect(started.events?.some((event) => event.type === 'turnStarted')).toBe(false);

    const aliceRoll = await rollTurnOrderDice(room.code, first.playerId, 4);
    expect(aliceRoll.error).toBeUndefined();
    expect(aliceRoll.state.phase).toBe('turnOrder');
    expect(aliceRoll.events?.some((event) => event.type === 'turnOrderDiceRolled')).toBe(true);

    const bobRoll = await rollTurnOrderDice(room.code, second.playerId, 6);
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

  test('keeps turn order phase until every connected player rolls', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);

    const partial = await rollTurnOrderDice(room.code, first.playerId, 4);
    expect(partial.state.phase).toBe('turnOrder');
    expect(partial.state.turnOrderPendingIds).toEqual([second.playerId]);
    expect(partial.events?.some((event) => event.type === 'turnStarted')).toBe(false);
  });

  test('rejects invalid dice values', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);

    expect((await rollTurnOrderDice(room.code, first.playerId, 0)).error).toBe('Valor de dado inválido.');
    expect((await rollTurnOrderDice(room.code, first.playerId, 7)).error).toBe('Valor de dado inválido.');
  });

  test('rejects duplicate turn order rolls', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);

    const firstRoll = await rollTurnOrderDice(room.code, first.playerId, 4);
    expect(firstRoll.error).toBeUndefined();

    const duplicateRoll = await rollTurnOrderDice(room.code, first.playerId, 4);
    expect(duplicateRoll.error).toBe('Você já rolou o dado para a ordem de jogada.');
  });

  test('deletes room when the last player leaves', async () => {
    const room = await createRoom('002');
    const only = await joinRoom(room.code, 'Alice', 'blue');

    const result = await leaveRoom(room.code, only.playerId);
    expect(result.error).toBeUndefined();
    expect(result.roomDeleted).toBe(true);
    expect(await roomExists(room.code)).toBe(false);
  });

  test('removes player and reassigns creator when someone leaves', async () => {
    const room = await createRoom('002');
    const creator = await joinRoom(room.code, 'Alice', 'blue');
    const other = await joinRoom(room.code, 'Bob', 'yellow');

    const result = await leaveRoom(room.code, creator.playerId);
    expect(result.error).toBeUndefined();
    expect(result.roomDeleted).toBe(false);
    expect(result.state?.players).toHaveLength(1);
    expect(result.state?.creatorId).toBe(other.playerId);
    expect(await roomExists(room.code)).toBe(true);
  });

  test('rolls dice only for active player', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);
    await rollTurnOrderDice(room.code, first.playerId, 4);
    const started = await rollTurnOrderDice(room.code, second.playerId, 6);
    const activeId = started.state.shift.playerId;

    const wrong = await rollDice(
      room.code,
      activeId === first.playerId ? second.playerId : first.playerId,
      3,
    );
    expect(wrong.error).toBe('Não é a sua vez.');

    const rolled = await rollDice(room.code, activeId, 5);
    expect(rolled.error).toBeUndefined();
    expect(rolled.state.shift.diceResult).toBe(5);
  });

  test('keeps turn when discovering a clue', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);
    await rollTurnOrderDice(room.code, first.playerId, 4);
    const started = await rollTurnOrderDice(room.code, second.playerId, 6);

    const state = started.state;
    state.shift = {
      status: 'in-progress',
      playerId: first.playerId,
      diceResult: 6,
      availableSquares: [{ id: 'hotel', place: 'hotel', path: ['hotel'] }],
    };
    await saveRoom(state);

    const moved = await movePlayer(room.code, first.playerId, {
      place: 'hotel',
      id: 'hotel',
      path: ['hotel'],
    });

    expect(moved.error).toBeUndefined();
    expect(moved.state.shift.status).toBe('awaiting-clue');
    expect(moved.state.shift.playerId).toBe(first.playerId);
    expect(moved.events?.some((event) => event.type === 'clueAdded')).toBe(true);
    expect(moved.events?.some((event) => event.type === 'turnStarted')).toBe(false);
    expect(getPlayerVisitedZones(moved.state, first.playerId)).toContain('hotel');
  });

  test('records visits to zones without clues', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);
    await rollTurnOrderDice(room.code, first.playerId, 4);
    const started = await rollTurnOrderDice(room.code, second.playerId, 6);

    const state = started.state;
    state.shift = {
      status: 'in-progress',
      playerId: first.playerId,
      diceResult: 6,
      availableSquares: [{ id: 'street', place: 'street', path: ['street'] }],
    };
    await saveRoom(state);

    const moved = await movePlayer(room.code, first.playerId, {
      place: 'street',
      id: 'street',
      path: ['street'],
    });

    expect(moved.error).toBeUndefined();
    expect(getPlayerVisitedZones(moved.state, first.playerId)).toContain('street');
    expect(moved.events?.some((event) => event.type === 'clueAdded')).toBe(false);
  });

  test('passTurn advances to the next player after a clue', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);
    await rollTurnOrderDice(room.code, first.playerId, 4);
    const started = await rollTurnOrderDice(room.code, second.playerId, 6);

    const state = started.state;
    state.currentPlayerIndex = state.turnOrder.indexOf(first.playerId);
    state.shift = {
      status: 'awaiting-clue',
      playerId: first.playerId,
      availableSquares: [],
      diceResult: null,
    };
    await saveRoom(state);

    const passed = await passTurn(room.code, first.playerId);
    expect(passed.error).toBeUndefined();
    expect(passed.state.shift.status).toBe('waiting');
    const nextPlayerId =
      state.turnOrder[(state.turnOrder.indexOf(first.playerId) + 1) % state.turnOrder.length]!;
    expect(passed.state.shift.playerId).toBe(nextPlayerId);
    expect(passed.events?.some((event) => event.type === 'turnStarted')).toBe(true);
  });

  test('lockZoneFromClue consumes a key and locks the zone', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    await joinRoom(room.code, 'Bob', 'yellow');
    const started = await startGame(room.code, first.playerId);

    const state = started.state;
    state.phase = 'playing';
    state.turnOrder = [first.playerId, state.players.find((p) => p.id !== first.playerId)!.id];
    state.currentPlayerIndex = 0;
    state.shift = {
      status: 'awaiting-clue',
      playerId: first.playerId,
      availableSquares: [],
      diceResult: null,
    };
    state.players.find((player) => player.id === first.playerId)!.position = { place: 'hotel' };
    state.masterKeysRemainingByPlayer[first.playerId] = 2;
    await saveRoom(state);

    const locked = await lockZoneFromClue(room.code, first.playerId, 'hotel');
    expect(locked.error).toBeUndefined();
    expect(locked.state.lockedZones.hotel?.lockedBy).toBe(first.playerId);
    expect(locked.state.masterKeysRemainingByPlayer[first.playerId]).toBe(1);
    expect(locked.events?.some((event) => event.type === 'zoneLocked')).toBe(true);
  });

  test('entering a locked zone without a key passes the turn', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);
    await rollTurnOrderDice(room.code, first.playerId, 4);
    const started = await rollTurnOrderDice(room.code, second.playerId, 6);

    const state = started.state;
    state.currentPlayerIndex = state.turnOrder.indexOf(first.playerId);
    state.shift = {
      status: 'in-progress',
      playerId: first.playerId,
      diceResult: 4,
      availableSquares: [{ id: 'museum', place: 'museum', path: ['museum'] }],
    };
    state.lockedZones = { museum: { lockedBy: second.playerId } };
    state.masterKeysRemainingByPlayer[first.playerId] = 0;
    await saveRoom(state);

    const blocked = await movePlayer(room.code, first.playerId, {
      place: 'museum',
      id: 'museum',
      path: ['museum'],
    });
    expect(blocked.state.shift.status).toBe('awaiting-locked-zone');
    expect(blocked.events?.some((event) => event.type === 'lockedZoneEncountered')).toBe(true);

    const resolved = await resolveLockedZoneEntry(room.code, first.playerId, false);
    const nextPlayerId =
      state.turnOrder[(state.turnOrder.indexOf(first.playerId) + 1) % state.turnOrder.length]!;
    expect(resolved.state.shift.playerId).toBe(nextPlayerId);
    expect(resolved.events?.some((event) => event.type === 'turnStarted')).toBe(true);
  });

  test('creator can configure master keys in the lobby', async () => {
    const room = await createRoom('002');
    const creator = await joinRoom(room.code, 'Alice', 'blue');

    const updated = await setMasterKeysPerPlayer(room.code, creator.playerId, 3);
    expect(updated.error).toBeUndefined();
    expect(updated.state.masterKeysPerPlayer).toBe(3);
  });

  test('reveals solution before player confirms', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);
    await rollTurnOrderDice(room.code, first.playerId, 4);
    const started = await rollTurnOrderDice(room.code, second.playerId, 6);

    const player = started.state.players.find((p) => p.id === first.playerId)!;
    player.position = { place: 'holmes-house' };
    await saveRoom(started.state);

    await beginSolutionVerification(room.code, first.playerId, {
      culprit: 'wrong',
      method: 'wrong',
      motive: 'wrong',
    });

    const reveal = await revealSolution(room.code, first.playerId);
    expect(reveal.error).toBeUndefined();
    expect(reveal.events?.some((event) => event.type === 'solutionRevealed')).toBe(true);
    expect(reveal.state.phase).toBe('verifying');
    expect(reveal.state.players.find((p) => p.id === first.playerId)?.eliminated).toBe(false);
  });

  test('eliminates player on wrong solution confirmation', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);
    await rollTurnOrderDice(room.code, first.playerId, 4);
    const started = await rollTurnOrderDice(room.code, second.playerId, 6);

    const player = started.state.players.find((p) => p.id === first.playerId)!;
    player.position = { place: 'holmes-house' };
    await saveRoom(started.state);

    await beginSolutionVerification(room.code, first.playerId, {
      culprit: 'wrong',
      method: 'wrong',
      motive: 'wrong',
    });

    await revealSolution(room.code, first.playerId);

    const result = await confirmSolution(room.code, first.playerId, false);
    expect(result.events?.some((event) => event.type === 'solutionFailed')).toBe(true);
    expect(result.state.players.find((p) => p.id === first.playerId)?.eliminated).toBe(true);
  });

  test('ends game when player confirms correct solution', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'yellow');
    await startGame(room.code, first.playerId);
    await rollTurnOrderDice(room.code, first.playerId, 4);
    const started = await rollTurnOrderDice(room.code, second.playerId, 6);

    const player = started.state.players.find((p) => p.id === first.playerId)!;
    player.position = { place: 'holmes-house' };
    await saveRoom(started.state);

    await beginSolutionVerification(room.code, first.playerId, {
      culprit: 'My guess',
      method: 'My method',
      motive: 'My motive',
    });

    await revealSolution(room.code, first.playerId);

    const result = await confirmSolution(room.code, first.playerId, true);
    expect(result.state.phase).toBe('finished');
    expect(result.state.winnerId).toBe(first.playerId);
    expect(result.events?.some((event) => event.type === 'gameOver')).toBe(true);
  });

  test('rejects invalid color on join', async () => {
    const room = await createRoom('002');
    const result = await joinRoom(room.code, 'Alice', 'brown');
    expect(result.error).toBe('Cor inválida.');
  });

  test('rejects duplicate color on join', async () => {
    const room = await createRoom('002');
    await joinRoom(room.code, 'Alice', 'blue');
    const second = await joinRoom(room.code, 'Bob', 'blue');
    expect(second.error).toBe('Esta cor já está em uso.');
  });

  test('rejects reconnect with another players color', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    await joinRoom(room.code, 'Bob', 'yellow');

    const reconnect = await joinRoom(room.code, 'Alice', 'yellow', first.sessionToken);
    expect(reconnect.error).toBe('Esta cor já está em uso.');
  });

  test('allows reconnect with same color', async () => {
    const room = await createRoom('002');
    const first = await joinRoom(room.code, 'Alice', 'blue');
    await joinRoom(room.code, 'Bob', 'yellow');

    const reconnect = await joinRoom(room.code, 'Alice', 'blue', first.sessionToken);
    expect(reconnect.error).toBeUndefined();
    expect(reconnect.playerId).toBe(first.playerId);
  });

  test('rejects join when room is full', async () => {
    const room = await createRoom('002');

    for (let i = 0; i < MAX_PLAYERS; i++) {
      const joined = await joinRoom(room.code, `Player ${i + 1}`, PLAYER_COLORS[i]);
      expect(joined.error).toBeUndefined();
    }

    const overflow = await joinRoom(room.code, 'Extra', 'blue');
    expect(overflow.error).toBe('A sala está cheia.');
  });
});

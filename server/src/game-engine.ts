import { randomBytes } from 'crypto';
import type {
  AvailableSquare,
  CaseDefinition,
  GameRoomState,
  NoteEntry,
  Player,
  Position,
  RoomSummary,
  TurnOrderRoll,
} from '../../src/types/game.js';
import { MAX_PLAYERS, MIN_PLAYERS, PLAYER_COLORS, DEFAULT_MASTER_KEYS_PER_PLAYER, MAX_MASTER_KEYS_PER_PLAYER } from '../../src/types/game.js';
import type { ZoneId } from '../../src/board/types.js';
import { getAvailableSquares } from '../../src/lib/available-squares.js';
import {
  caseExists,
  getCaseById,
  getCaseClue,
  getZoneLabel,
} from './case-store.js';
import { deleteRoom, loadRoom, saveRoom } from './persistence.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const STARTING_POSITION: Position = { place: 'holmes-house' };

const activeRooms = new Map<string, GameRoomState>();

function generateCode(): string {
  let code = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[bytes[i]! % CODE_CHARS.length];
  }
  return code;
}

function generateSessionToken(): string {
  return randomBytes(16).toString('hex');
}

function parseDiceValue(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 6) {
    return null;
  }
  return value;
}

function nextActivePlayerIndex(state: GameRoomState): number {
  const { turnOrder, currentPlayerIndex, players } = state;
  if (!turnOrder.length) {
    return 0;
  }

  let index = currentPlayerIndex;
  for (let step = 0; step < turnOrder.length; step++) {
    index = (index + 1) % turnOrder.length;
    const playerId = turnOrder[index]!;
    const player = players.find((p) => p.id === playerId);
    if (player && !player.eliminated) {
      return index;
    }
  }

  return currentPlayerIndex;
}

function activePlayers(state: GameRoomState): Player[] {
  return state.players.filter((p) => !p.eliminated);
}

function getCase(state: GameRoomState): CaseDefinition {
  const caseDef = getCaseById(state.caseId);
  if (!caseDef) {
    throw new Error(`Caso não encontrado: ${state.caseId}`);
  }
  return caseDef;
}

function emptyRoomState(code: string): GameRoomState {
  return {
    code,
    phase: 'lobby',
    creatorId: null,
    caseId: '',
    caseTitle: '',
    caseIntro: '',
    players: [],
    turnOrder: [],
    currentPlayerIndex: 0,
    turnOrderRolls: [],
    turnOrderPendingIds: [],
    shift: {
      status: 'waiting',
      availableSquares: [],
      playerId: 0,
      diceResult: null,
    },
    visitedZonesByPlayer: {},
    notesByPlayer: {},
    verifyingPlayerId: null,
    winnerId: null,
    lastSubmittedAnswers: null,
    officialSolution: null,
    sessionTokens: {},
    masterKeysPerPlayer: DEFAULT_MASTER_KEYS_PER_PLAYER,
    masterKeysRemainingByPlayer: {},
    lockedZones: {},
    pendingLockedZoneEntry: null,
  };
}

function createInitialState(code: string, caseDef: CaseDefinition): GameRoomState {
  return {
    code,
    phase: 'lobby',
    creatorId: null,
    caseId: caseDef.id,
    caseTitle: caseDef.title,
    caseIntro: caseDef.intro,
    players: [],
    turnOrder: [],
    currentPlayerIndex: 0,
    turnOrderRolls: [],
    turnOrderPendingIds: [],
    shift: {
      status: 'waiting',
      availableSquares: [],
      playerId: 0,
      diceResult: null,
    },
    visitedZonesByPlayer: {},
    notesByPlayer: {},
    verifyingPlayerId: null,
    winnerId: null,
    lastSubmittedAnswers: null,
    officialSolution: null,
    sessionTokens: {},
    masterKeysPerPlayer: DEFAULT_MASTER_KEYS_PER_PLAYER,
    masterKeysRemainingByPlayer: {},
    lockedZones: {},
    pendingLockedZoneEntry: null,
  };
}

function getMasterKeysRemaining(state: GameRoomState, playerId: number): number {
  return state.masterKeysRemainingByPlayer[playerId] ?? 0;
}

function initializeMasterKeys(state: GameRoomState): void {
  state.masterKeysRemainingByPlayer = {};
  for (const player of state.players.filter((entry) => entry.connected)) {
    state.masterKeysRemainingByPlayer[player.id] = state.masterKeysPerPlayer;
  }
}

function advanceTurn(state: GameRoomState): ServerGameEvent {
  state.pendingLockedZoneEntry = null;
  state.shift = {
    status: 'waiting',
    availableSquares: [],
    playerId: state.shift.playerId,
    diceResult: null,
  };
  state.currentPlayerIndex = nextActivePlayerIndex(state);
  const nextPlayerId = state.turnOrder[state.currentPlayerIndex]!;
  state.shift.playerId = nextPlayerId;
  const nextPlayer = state.players.find((player) => player.id === nextPlayerId)!;
  return {
    type: 'turnStarted',
    playerId: nextPlayerId,
    playerName: nextPlayer.name,
  };
}

function recordZoneVisit(state: GameRoomState, playerId: number, zoneId: ZoneId): void {
  const visited = state.visitedZonesByPlayer[playerId] ?? [];
  if (!visited.includes(zoneId)) {
    state.visitedZonesByPlayer[playerId] = [...visited, zoneId];
  }
}

function finishMoveWithClueCheck(
  state: GameRoomState,
  playerId: number,
  newPosition: Position,
  events: ServerGameEvent[],
): boolean {
  const zoneId = newPosition.place as ZoneId | undefined;
  if (!zoneId || zoneId === 'holmes-house') {
    return false;
  }

  recordZoneVisit(state, playerId, zoneId);

  const clueNotes = (state.notesByPlayer[playerId] ?? []).filter((entry) => entry.kind === 'clue');
  const alreadyCollected = clueNotes.some((entry) => entry.zoneId === zoneId);
  const clueText = getCaseClue(state.caseId, zoneId);
  if (!clueText || alreadyCollected) {
    return false;
  }

  const zoneName = getZoneLabel(zoneId);
  const entry: NoteEntry = {
    kind: 'clue',
    zoneId,
    zoneName,
    text: clueText,
    at: new Date().toISOString(),
  };
  state.notesByPlayer[playerId] = [...(state.notesByPlayer[playerId] ?? []), entry];
  events.push({
    type: 'clueAdded',
    playerId,
    zoneId,
    zoneName,
    clueText,
  });
  state.shift = {
    status: 'awaiting-clue',
    availableSquares: [],
    playerId,
    diceResult: null,
  };
  state.pendingLockedZoneEntry = null;
  return true;
}

function persist(state: GameRoomState): GameRoomState {
  saveRoom(state);
  activeRooms.set(state.code, state);
  return state;
}

function getMutableRoom(code: string): GameRoomState | null {
  const normalized = code.toUpperCase();
  const cached = activeRooms.get(normalized);
  if (cached) {
    return cached;
  }
  const loaded = loadRoom(normalized);
  if (loaded) {
    activeRooms.set(normalized, loaded);
    return loaded;
  }
  return null;
}

export function createRoom(caseId: string): GameRoomState {
  if (!caseExists(caseId)) {
    throw new Error('Caso não encontrado.');
  }

  const caseDef = getCaseById(caseId);
  if (!caseDef) {
    throw new Error('Caso não encontrado.');
  }

  let code = generateCode();
  while (roomExists(code)) {
    code = generateCode();
  }
  const state = persist(createInitialState(code, caseDef));
  return state;
}

export function roomExists(code: string): boolean {
  return !!getMutableRoom(code);
}

export function getRoomSummary(code: string): RoomSummary {
  const state = getMutableRoom(code);
  if (!state) {
    return { exists: false, phase: null, playerCount: 0 };
  }
  return {
    exists: true,
    phase: state.phase,
    playerCount: state.players.length,
    caseId: state.caseId,
    caseTitle: state.caseTitle,
  };
}

export function getPublicRoomState(state: GameRoomState): Omit<
  GameRoomState,
  'sessionTokens' | 'notesByPlayer' | 'visitedZonesByPlayer'
> & {
  notesByPlayer: Record<number, NoteEntry[]>;
  visitedZonesByPlayer: Record<number, ZoneId[]>;
} {
  const {
    sessionTokens: _tokens,
    notesByPlayer: _notes,
    visitedZonesByPlayer: _visited,
    ...rest
  } = state;
  return {
    ...rest,
    players: state.players.map(({ id, name, color, position, eliminated, connected }) => ({
      id,
      name,
      color,
      position,
      eliminated,
      connected,
    })),
    notesByPlayer: {},
    visitedZonesByPlayer: {},
  };
}

export function getPlayerNotes(state: GameRoomState, playerId: number): NoteEntry[] {
  return state.notesByPlayer[playerId] ?? [];
}

export function getPlayerVisitedZones(state: GameRoomState, playerId: number): ZoneId[] {
  return state.visitedZonesByPlayer[playerId] ?? [];
}

export interface JoinResult {
  state: GameRoomState;
  sessionToken: string;
  playerId: number;
  error?: string;
}

export function joinRoom(
  code: string,
  name: string,
  color: string,
  sessionToken?: string,
): JoinResult {
  const state = getMutableRoom(code);
  if (!state) {
    return {
      state: {
        code,
        phase: 'lobby',
        creatorId: null,
        caseId: '',
        caseTitle: '',
        caseIntro: '',
        players: [],
        turnOrder: [],
        currentPlayerIndex: 0,
        turnOrderRolls: [],
        turnOrderPendingIds: [],
        shift: {
          status: 'waiting',
          availableSquares: [],
          playerId: 0,
          diceResult: null,
        },
        visitedZonesByPlayer: {},
        notesByPlayer: {},
        verifyingPlayerId: null,
        winnerId: null,
        lastSubmittedAnswers: null,
        officialSolution: null,
        sessionTokens: {},
        masterKeysPerPlayer: DEFAULT_MASTER_KEYS_PER_PLAYER,
        masterKeysRemainingByPlayer: {},
        lockedZones: {},
        pendingLockedZoneEntry: null,
      },
      sessionToken: '',
      playerId: 0,
      error: 'Sala não encontrada.',
    };
  }

  if (state.phase !== 'lobby' && !sessionToken) {
    return {
      state,
      sessionToken: '',
      playerId: 0,
      error: 'A partida já começou. Use o mesmo navegador para reconectar.',
    };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { state, sessionToken: '', playerId: 0, error: 'Informe um nome.' };
  }

  if (sessionToken) {
    const existingId = Object.entries(state.sessionTokens).find(([, token]) => token === sessionToken)?.[0];
    const existing = existingId ? state.players.find((p) => p.id === Number(existingId)) : undefined;
    if (existing) {
      existing.name = trimmedName;
      existing.color = color;
      existing.connected = true;
      persist(state);
      return { state, sessionToken, playerId: existing.id };
    }
  }

  if (state.phase !== 'lobby') {
    return {
      state,
      sessionToken: '',
      playerId: 0,
      error: 'Não foi possível entrar na partida. Tente reconectar com a mesma sessão.',
    };
  }

  if (state.players.length >= MAX_PLAYERS) {
    return { state, sessionToken: '', playerId: 0, error: 'A sala está cheia.' };
  }

  if (state.players.some((p) => p.color === color)) {
    return { state, sessionToken: '', playerId: 0, error: 'Esta cor já está em uso.' };
  }

  if (state.players.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
    return { state, sessionToken: '', playerId: 0, error: 'Este nome já está em uso.' };
  }

  const newToken = generateSessionToken();
  const playerId = state.players.length
    ? Math.max(...state.players.map((p) => p.id)) + 1
    : 1;

  const player: Player = {
    id: playerId,
    name: trimmedName,
    color,
    position: { ...STARTING_POSITION },
    eliminated: false,
    connected: true,
  };

  state.players.push(player);
  state.sessionTokens[playerId] = newToken;
  if (state.creatorId === null) {
    state.creatorId = playerId;
  }
  state.notesByPlayer[playerId] = state.notesByPlayer[playerId] ?? [];

  persist(state);
  return { state, sessionToken: newToken, playerId };
}

export function setPlayerConnected(code: string, sessionToken: string, connected: boolean): void {
  const state = getMutableRoom(code);
  if (!state) return;
  const playerId = Object.entries(state.sessionTokens).find(([, token]) => token === sessionToken)?.[0];
  const player = playerId ? state.players.find((p) => p.id === Number(playerId)) : undefined;
  if (player) {
    player.connected = connected;
    persist(state);
  }
}

export function reconnectRoom(code: string, sessionToken: string): JoinResult {
  const state = getMutableRoom(code);
  if (!state) {
    return {
      state: {
        code,
        phase: 'lobby',
        creatorId: null,
        caseId: '',
        caseTitle: '',
        caseIntro: '',
        players: [],
        turnOrder: [],
        currentPlayerIndex: 0,
        turnOrderRolls: [],
        turnOrderPendingIds: [],
        shift: {
          status: 'waiting',
          availableSquares: [],
          playerId: 0,
          diceResult: null,
        },
        visitedZonesByPlayer: {},
        notesByPlayer: {},
        verifyingPlayerId: null,
        winnerId: null,
        lastSubmittedAnswers: null,
        officialSolution: null,
        sessionTokens: {},
        masterKeysPerPlayer: DEFAULT_MASTER_KEYS_PER_PLAYER,
        masterKeysRemainingByPlayer: {},
        lockedZones: {},
        pendingLockedZoneEntry: null,
      },
      sessionToken: '',
      playerId: 0,
      error: 'Sala não encontrada.',
    };
  }

  const playerIdEntry = Object.entries(state.sessionTokens).find(([, token]) => token === sessionToken)?.[0];
  const player = playerIdEntry ? state.players.find((p) => p.id === Number(playerIdEntry)) : undefined;
  if (!player) {
    return {
      state,
      sessionToken: '',
      playerId: 0,
      error: 'Sessão expirada. Entre novamente com nome e cor.',
    };
  }

  player.connected = true;
  persist(state);
  return { state, sessionToken, playerId: player.id };
}

export interface LeaveRoomResult {
  state: GameRoomState | null;
  roomDeleted: boolean;
  error?: string;
  events?: ServerGameEvent[];
}

function removePlayerFromGameState(state: GameRoomState, playerId: number): ServerGameEvent[] {
  const events: ServerGameEvent[] = [];
  const wasActive = state.shift.playerId === playerId;

  delete state.sessionTokens[playerId];
  delete state.notesByPlayer[playerId];
  delete state.visitedZonesByPlayer[playerId];
  delete state.masterKeysRemainingByPlayer[playerId];
  state.players = state.players.filter((player) => player.id !== playerId);

  if (state.creatorId === playerId) {
    state.creatorId = state.players[0]?.id ?? null;
  }

  if (state.verifyingPlayerId === playerId) {
    state.verifyingPlayerId = null;
    if (state.phase === 'verifying') {
      state.phase = 'playing';
    }
  }

  const leavingTurnIndex = state.turnOrder.indexOf(playerId);
  state.turnOrder = state.turnOrder.filter((id) => id !== playerId);
  state.turnOrderPendingIds = state.turnOrderPendingIds.filter((id) => id !== playerId);
  state.turnOrderRolls = state.turnOrderRolls.filter((roll) => roll.playerId !== playerId);

  if (state.phase === 'turnOrder') {
    if (state.players.length < MIN_PLAYERS) {
      state.phase = 'lobby';
      state.turnOrder = [];
      state.turnOrderRolls = [];
      state.turnOrderPendingIds = state.players.map((player) => player.id);
      return events;
    }

    const allRemainingRolled = state.players.every((player) =>
      state.turnOrderRolls.some((roll) => roll.playerId === player.id),
    );
    if (state.turnOrderPendingIds.length === 0 && allRemainingRolled) {
      events.push(...finalizeTurnOrder(state));
    }
    return events;
  }

  if (state.phase !== 'playing' && state.phase !== 'verifying') {
    return events;
  }

  if (state.turnOrder.length === 0) {
    return events;
  }

  if (wasActive || !state.turnOrder.includes(state.shift.playerId)) {
    state.currentPlayerIndex =
      leavingTurnIndex === -1 ? 0 : leavingTurnIndex % state.turnOrder.length;
    const nextPlayerId = state.turnOrder[state.currentPlayerIndex]!;
    state.shift = {
      status: 'waiting',
      availableSquares: [],
      playerId: nextPlayerId,
      diceResult: null,
    };
    const nextPlayer = state.players.find((player) => player.id === nextPlayerId)!;
    events.push({
      type: 'turnStarted',
      playerId: nextPlayerId,
      playerName: nextPlayer.name,
    });
  }

  return events;
}

export function leaveRoom(code: string, playerId: number): LeaveRoomResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: null, roomDeleted: true, error: 'Sala não encontrada.' };
  }

  if (!state.players.some((player) => player.id === playerId)) {
    return { state, roomDeleted: false, error: 'Jogador não encontrado.' };
  }

  const events = removePlayerFromGameState(state, playerId);

  if (state.players.length === 0) {
    deleteRoom(code);
    activeRooms.delete(code.toUpperCase());
    return { state: null, roomDeleted: true, events };
  }

  persist(state);
  return { state, roomDeleted: false, events };
}

export interface EngineResult {
  state: GameRoomState;
  error?: string;
  events?: ServerGameEvent[];
}

export type ServerGameEvent =
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
  | { type: 'diceRolled'; playerId: number; playerName: string; value: number; availableSquares: AvailableSquare[] }
  | { type: 'playerMoved'; playerId: number; position: Position; path: string[] }
  | { type: 'clueAdded'; playerId: number; zoneId: ZoneId; zoneName: string; clueText: string }
  | {
      type: 'lockedZoneEncountered';
      playerId: number;
      zoneId: ZoneId;
      zoneName: string;
      hasMasterKey: boolean;
    }
  | { type: 'zoneLocked'; playerId: number; playerName: string; zoneId: ZoneId }
  | { type: 'zoneUnlocked'; zoneId: ZoneId }
  | { type: 'verifying'; playerName: string }
  | { type: 'playerEliminated'; playerId: number; playerName: string }
  | {
      type: 'gameOver';
      winnerId: number;
      winnerName: string;
      playerAnswer: Record<string, string>;
      officialSolution: CaseDefinition['fields'];
      solutionNarrative: string;
    }
  | { type: 'solutionFailed'; playerId: number; playerName: string }
  | {
      type: 'solutionRevealed';
      playerId: number;
      officialSolution: CaseDefinition['fields'];
      solutionNarrative: string;
      playerAnswers: Record<string, string>;
    };

export function updatePlayerColor(
  code: string,
  requesterId: number,
  targetPlayerId: number,
  color: string,
): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'lobby') {
    return { state, error: 'Não é possível alterar cores após o início da partida.' };
  }
  if (!PLAYER_COLORS.includes(color as (typeof PLAYER_COLORS)[number])) {
    return { state, error: 'Cor inválida.' };
  }

  const target = state.players.find((player) => player.id === targetPlayerId);
  if (!target) {
    return { state, error: 'Jogador não encontrado.' };
  }

  const isSelf = requesterId === targetPlayerId;
  const isCreator = state.creatorId === requesterId;
  if (!isSelf && !isCreator) {
    return { state, error: 'Você não pode alterar a cor deste jogador.' };
  }

  if (target.color === color) {
    return { state };
  }

  if (state.players.some((player) => player.id !== targetPlayerId && player.color === color)) {
    return { state, error: 'Esta cor já está em uso.' };
  }

  target.color = color;
  persist(state);
  return { state };
}

export function startGame(code: string, playerId: number): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.creatorId !== playerId) {
    return { state, error: 'Apenas o criador pode iniciar a partida.' };
  }
  if (state.phase !== 'lobby') {
    return { state, error: 'A partida já foi iniciada.' };
  }
  if (state.players.filter((p) => p.connected).length < MIN_PLAYERS) {
    return { state, error: `São necessários pelo menos ${MIN_PLAYERS} jogadores conectados.` };
  }

  state.phase = 'turnOrder';
  state.turnOrderPendingIds = state.players.filter((p) => p.connected).map((p) => p.id);
  state.turnOrderRolls = [];
  state.turnOrder = [];
  state.currentPlayerIndex = 0;
  state.lockedZones = {};
  state.pendingLockedZoneEntry = null;
  initializeMasterKeys(state);
  state.shift = {
    status: 'waiting',
    availableSquares: [],
    playerId: 0,
    diceResult: null,
  };
  persist(state);

  return { state, events: [{ type: 'turnOrderStarted' }] };
}

function shuffleArray<T>(items: T[], random: () => number = Math.random): T[] {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex]!, array[index]!];
  }
  return array;
}

export function computeTurnOrderFromRolls(
  rolls: TurnOrderRoll[],
  random: () => number = Math.random,
): number[] {
  const byValue = new Map<number, TurnOrderRoll[]>();
  for (const roll of rolls) {
    const group = byValue.get(roll.value) ?? [];
    group.push(roll);
    byValue.set(roll.value, group);
  }

  const values = [...byValue.keys()].sort((a, b) => b - a);
  const order: number[] = [];
  for (const value of values) {
    const shuffledGroup = shuffleArray(byValue.get(value)!, random);
    order.push(...shuffledGroup.map((roll) => roll.playerId));
  }

  return order;
}

function finalizeTurnOrder(state: GameRoomState): ServerGameEvent[] {
  state.turnOrder = computeTurnOrderFromRolls(state.turnOrderRolls);
  state.currentPlayerIndex = 0;
  state.phase = 'playing';
  state.turnOrderPendingIds = [];

  const firstPlayerId = state.turnOrder[0]!;
  state.shift = {
    status: 'waiting',
    availableSquares: [],
    playerId: firstPlayerId,
    diceResult: null,
  };

  const firstPlayer = state.players.find((player) => player.id === firstPlayerId)!;
  return [
    {
      type: 'turnStarted',
      playerId: firstPlayerId,
      playerName: firstPlayer.name,
    },
  ];
}

export function setMasterKeysPerPlayer(
  code: string,
  playerId: number,
  count: number,
): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.creatorId !== playerId) {
    return { state, error: 'Apenas o criador pode alterar as chaves-mestras.' };
  }
  if (state.phase !== 'lobby') {
    return { state, error: 'As chaves-mestras só podem ser definidas no lobby.' };
  }
  if (!Number.isInteger(count) || count < 0 || count > MAX_MASTER_KEYS_PER_PLAYER) {
    return {
      state,
      error: `Informe um valor entre 0 e ${MAX_MASTER_KEYS_PER_PLAYER}.`,
    };
  }

  state.masterKeysPerPlayer = count;
  persist(state);
  return { state };
}

export function rollTurnOrderDice(code: string, playerId: number, value: number): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'turnOrder') {
    return { state, error: 'Não é hora de rolar para a ordem de jogada.' };
  }
  if (!state.turnOrderPendingIds.includes(playerId)) {
    return { state, error: 'Você já rolou o dado para a ordem de jogada.' };
  }

  const player = state.players.find((entry) => entry.id === playerId);
  if (!player) {
    return { state, error: 'Jogador inválido.' };
  }

  const diceValue = parseDiceValue(value);
  if (diceValue === null) {
    return { state, error: 'Valor de dado inválido.' };
  }

  const roll: TurnOrderRoll = { playerId, playerName: player.name, value: diceValue };
  state.turnOrderRolls = [...state.turnOrderRolls, roll];
  state.turnOrderPendingIds = state.turnOrderPendingIds.filter((id) => id !== playerId);

  const events: ServerGameEvent[] = [
    {
      type: 'turnOrderDiceRolled',
      playerId,
      playerName: player.name,
      value: diceValue,
      rolls: [...state.turnOrderRolls],
    },
  ];

  if (state.turnOrderPendingIds.length === 0) {
    events.push(...finalizeTurnOrder(state));
  }

  persist(state);
  return { state, events };
}

export function rollDice(code: string, playerId: number, value: number): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'playing') {
    return { state, error: 'Não é possível rolar os dados agora.' };
  }
  if (state.shift.playerId !== playerId) {
    return { state, error: 'Não é a sua vez.' };
  }
  if (state.shift.status !== 'waiting') {
    return { state, error: 'Você já rolou os dados.' };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.eliminated) {
    return { state, error: 'Jogador inválido.' };
  }

  const diceValue = parseDiceValue(value);
  if (diceValue === null) {
    return { state, error: 'Valor de dado inválido.' };
  }

  const availableSquares = getAvailableSquares(player, diceValue);
  state.shift = {
    status: 'in-progress',
    availableSquares,
    playerId,
    diceResult: diceValue,
  };
  persist(state);

  return {
    state,
    events: [
      {
        type: 'diceRolled',
        playerId,
        playerName: player.name,
        value: diceValue,
        availableSquares,
      },
    ],
  };
}

function positionsEqual(a: Position, b: AvailableSquare): boolean {
  if (b.place) {
    return a.place === b.place;
  }
  return (a.row ?? -1) === (b.row ?? -2) && (a.column ?? -1) === (b.column ?? -2);
}

export function movePlayer(code: string, playerId: number, destination: Position): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'playing') {
    return { state, error: 'Não é possível mover agora.' };
  }
  if (state.shift.playerId !== playerId || state.shift.status !== 'in-progress') {
    return { state, error: 'Movimento inválido.' };
  }

  const match = state.shift.availableSquares.find((square) => positionsEqual(destination, square));
  if (!match) {
    return { state, error: 'Destino inválido.' };
  }

  const player = state.players.find((p) => p.id === playerId)!;
  const newPosition: Position = match.place
    ? { place: match.place, id: match.id, path: match.path }
    : { row: match.row, column: match.column, place: null, id: match.id, path: match.path };

  const zoneId = newPosition.place as ZoneId | undefined;
  const lock = zoneId ? state.lockedZones[zoneId] : undefined;
  if (zoneId && lock && lock.lockedBy !== playerId) {
    state.shift.status = 'awaiting-locked-zone';
    state.pendingLockedZoneEntry = {
      zoneId,
      zoneName: getZoneLabel(zoneId),
      destination: newPosition,
      path: match.path,
    };
    persist(state);
    return {
      state,
      events: [
        {
          type: 'lockedZoneEncountered',
          playerId,
          zoneId,
          zoneName: getZoneLabel(zoneId),
          hasMasterKey: getMasterKeysRemaining(state, playerId) > 0,
        },
      ],
    };
  }

  player.position = newPosition;

  const events: ServerGameEvent[] = [
    {
      type: 'playerMoved',
      playerId,
      position: newPosition,
      path: match.path,
    },
  ];

  if (finishMoveWithClueCheck(state, playerId, newPosition, events)) {
    persist(state);
    return { state, events };
  }

  events.push(advanceTurn(state));
  persist(state);
  return { state, events };
}

export function passTurn(code: string, playerId: number): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'playing') {
    return { state, error: 'Não é possível passar o turno agora.' };
  }
  if (state.shift.playerId !== playerId) {
    return { state, error: 'Não é a sua vez.' };
  }
  if (state.shift.status !== 'awaiting-clue' && state.shift.status !== 'awaiting-locked-zone') {
    return { state, error: 'Não há ação pendente para concluir.' };
  }

  state.pendingLockedZoneEntry = null;
  const events = [advanceTurn(state)];
  persist(state);
  return { state, events };
}

export function lockZoneFromClue(code: string, playerId: number, zoneId: ZoneId): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'playing') {
    return { state, error: 'Não é possível trancar a zona agora.' };
  }
  if (state.shift.playerId !== playerId || state.shift.status !== 'awaiting-clue') {
    return { state, error: 'Só é possível trancar após descobrir uma pista.' };
  }
  if (getMasterKeysRemaining(state, playerId) <= 0) {
    return { state, error: 'Você não possui chaves-mestras disponíveis.' };
  }

  const player = state.players.find((entry) => entry.id === playerId);
  if (!player) {
    return { state, error: 'Jogador inválido.' };
  }
  if (player.position.place !== zoneId) {
    return { state, error: 'Você só pode trancar a zona em que está.' };
  }

  state.masterKeysRemainingByPlayer[playerId] = getMasterKeysRemaining(state, playerId) - 1;
  state.lockedZones[zoneId] = { lockedBy: playerId };
  const events: ServerGameEvent[] = [
    {
      type: 'zoneLocked',
      playerId,
      playerName: player.name,
      zoneId,
    },
    advanceTurn(state),
  ];
  persist(state);
  return { state, events };
}

export function resolveLockedZoneEntry(
  code: string,
  playerId: number,
  unlock: boolean,
): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'playing') {
    return { state, error: 'Não é possível resolver a entrada agora.' };
  }
  if (state.shift.playerId !== playerId || state.shift.status !== 'awaiting-locked-zone') {
    return { state, error: 'Não há zona trancada aguardando resposta.' };
  }

  const pending = state.pendingLockedZoneEntry;
  if (!pending) {
    return { state, error: 'Não há zona trancada aguardando resposta.' };
  }

  const hasKey = getMasterKeysRemaining(state, playerId) > 0;
  if (!unlock || !hasKey) {
    state.pendingLockedZoneEntry = null;
    const events = [advanceTurn(state)];
    persist(state);
    return { state, events };
  }

  const player = state.players.find((entry) => entry.id === playerId)!;
  state.masterKeysRemainingByPlayer[playerId] = getMasterKeysRemaining(state, playerId) - 1;
  delete state.lockedZones[pending.zoneId];
  player.position = pending.destination;

  const events: ServerGameEvent[] = [
    {
      type: 'zoneUnlocked',
      zoneId: pending.zoneId,
    },
    {
      type: 'playerMoved',
      playerId,
      position: pending.destination,
      path: pending.path,
    },
  ];
  state.pendingLockedZoneEntry = null;

  if (finishMoveWithClueCheck(state, playerId, pending.destination, events)) {
    persist(state);
    return { state, events };
  }

  events.push(advanceTurn(state));
  persist(state);
  return { state, events };
}

export function updateNotes(
  code: string,
  playerId: number,
  customText: string,
): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }

  const clues = (state.notesByPlayer[playerId] ?? []).filter((n) => n.kind === 'clue');
  const trimmed = customText.trim();
  const customEntries: NoteEntry[] = trimmed
    ? [{ kind: 'custom', text: trimmed, at: new Date().toISOString() }]
    : [];

  state.notesByPlayer[playerId] = [...clues, ...customEntries];
  persist(state);
  return { state };
}

export function beginSolutionVerification(
  code: string,
  playerId: number,
  answers: Record<string, string>,
): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'playing') {
    return { state, error: 'Não é possível verificar a solução agora.' };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.eliminated) {
    return { state, error: 'Jogador inválido.' };
  }
  if (player.position.place !== 'holmes-house') {
    return { state, error: 'Você precisa estar na Casa do Sherlock Holmes.' };
  }

  state.phase = 'verifying';
  state.verifyingPlayerId = playerId;
  state.lastSubmittedAnswers = answers;
  persist(state);

  return {
    state,
    events: [{ type: 'verifying', playerName: player.name }],
  };
}

export function revealSolution(code: string, playerId: number): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'verifying' || state.verifyingPlayerId !== playerId) {
    return { state, error: 'Verificação inválida.' };
  }

  const caseDef = getCase(state);
  const answers = state.lastSubmittedAnswers ?? {};

  return {
    state,
    events: [
      {
        type: 'solutionRevealed',
        playerId,
        officialSolution: caseDef.fields,
        solutionNarrative: caseDef.solutionNarrative,
        playerAnswers: answers,
      },
    ],
  };
}

export function confirmSolution(
  code: string,
  playerId: number,
  correct: boolean,
): EngineResult {
  const state = getMutableRoom(code);
  if (!state) {
    return { state: emptyRoomState(code), error: 'Sala não encontrada.' };
  }
  if (state.phase !== 'verifying' || state.verifyingPlayerId !== playerId) {
    return { state, error: 'Verificação inválida.' };
  }

  const player = state.players.find((p) => p.id === playerId)!;
  const caseDef = getCase(state);
  const answers = state.lastSubmittedAnswers ?? {};

  state.officialSolution = caseDef.fields;

  if (correct) {
    state.phase = 'finished';
    state.winnerId = playerId;
    persist(state);
    return {
      state,
      events: [
        {
          type: 'gameOver',
          winnerId: playerId,
          winnerName: player.name,
          playerAnswer: answers,
          officialSolution: caseDef.fields,
          solutionNarrative: caseDef.solutionNarrative,
        },
      ],
    };
  }

  player.eliminated = true;
  state.phase = 'playing';
  state.verifyingPlayerId = null;
  state.lastSubmittedAnswers = null;

  if (activePlayers(state).length === 0) {
    state.phase = 'finished';
    persist(state);
    return {
      state,
      events: [
        {
          type: 'solutionFailed',
          playerId,
          playerName: player.name,
        },
      ],
    };
  }

  if (state.shift.playerId === playerId) {
    state.currentPlayerIndex = nextActivePlayerIndex(state);
    state.shift.playerId = state.turnOrder[state.currentPlayerIndex]!;
  }

  persist(state);
  const nextPlayer = state.players.find((p) => p.id === state.shift.playerId)!;

  return {
    state,
    events: [
      { type: 'solutionFailed', playerId, playerName: player.name },
      { type: 'playerEliminated', playerId, playerName: player.name },
      {
        type: 'turnStarted',
        playerId: nextPlayer.id,
        playerName: nextPlayer.name,
      },
    ],
  };
}

export function getCaseForRoom(code: string): CaseDefinition | null {
  const state = getMutableRoom(code);
  if (!state) return null;
  return getCaseById(state.caseId);
}

export function resetRoomToLobby(code: string): GameRoomState | null {
  const state = getMutableRoom(code);
  if (!state) return null;
  deleteRoom(code);
  activeRooms.delete(code.toUpperCase());
  return null;
}

export function hydrateActiveRooms(): void {
  // Rooms are loaded lazily from SQLite on access.
}

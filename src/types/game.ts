import type { ZoneId } from '../board/types';

export interface Position {
  row?: number;
  column?: number;
  place?: string | null;
  id?: string;
  path?: string[];
}

export interface Player {
  id: number;
  name: string;
  color: string;
  position: Position;
  eliminated?: boolean;
  connected?: boolean;
}

export interface AvailableSquare extends Position {
  id: string;
  path: string[];
}

export type GameShiftStatus = 'waiting' | 'in-progress' | 'awaiting-clue' | 'awaiting-locked-zone';

export interface LockedZone {
  lockedBy: number;
}

export interface PendingLockedZoneEntry {
  zoneId: ZoneId;
  zoneName: string;
  destination: Position;
  path: string[];
}

export interface GameShiftState {
  status: GameShiftStatus;
  availableSquares: AvailableSquare[];
  playerId: number;
  diceResult: number | null;
}

export interface GameShiftView {
  player: Player;
  availableSquares: AvailableSquare[];
  status: GameShiftStatus;
  players: Player[];
  diceResult: number | null;
}

export interface GameController {
  gameShift: () => GameShiftView;
  updatePlayerPosition: (playerId: number, position: Position) => void;
  updateAvailableSquares: (availableSquares: AvailableSquare[], diceResult: number) => void;
  lockedZones?: Partial<Record<ZoneId, LockedZone>>;
  canInteract?: boolean;
  onMove?: (destination: Position, path: string[]) => void;
}

export type GamePhase = 'lobby' | 'turnOrder' | 'playing' | 'verifying' | 'finished';

export type NoteEntry =
  | { kind: 'clue'; zoneId: ZoneId; zoneName: string; text: string; at: string }
  | { kind: 'custom'; text: string; at: string };

export interface CaseField {
  key: string;
  label: string;
  answer?: string;
}

export interface CaseListItem {
  id: string;
  number: number;
  title: string;
}

export interface CasePreview extends CaseListItem {
  intro: string;
  questions: Array<{ key: string; label: string }>;
}

export interface CaseDefinition {
  id: string;
  number: number;
  title: string;
  intro: string;
  solutionNarrative: string;
  fields: CaseField[];
  clues?: Partial<Record<ZoneId, string>>;
}

export interface TurnOrderRoll {
  playerId: number;
  playerName: string;
  value: number;
}

export interface LastDiceRoll {
  value: number;
  playerId: number;
  playerName: string;
  context: 'turnOrder' | 'playing';
}

export interface PendingClue {
  zoneId: ZoneId;
  zoneName: string;
  text: string;
}

export interface PendingLockedZone {
  zoneId: ZoneId;
  zoneName: string;
  hasMasterKey: boolean;
}

export interface GameRoomState {
  code: string;
  phase: GamePhase;
  creatorId: number | null;
  caseId: string;
  caseTitle: string;
  caseIntro: string;
  sessionTokens: Record<number, string>;
  players: Player[];
  turnOrder: number[];
  currentPlayerIndex: number;
  turnOrderRolls: TurnOrderRoll[];
  turnOrderPendingIds: number[];
  shift: GameShiftState;
  masterKeysPerPlayer: number;
  masterKeysRemainingByPlayer: Record<number, number>;
  lockedZones: Partial<Record<ZoneId, LockedZone>>;
  pendingLockedZoneEntry: PendingLockedZoneEntry | null;
  visitedZonesByPlayer: Record<number, ZoneId[]>;
  notesByPlayer: Record<number, NoteEntry[]>;
  verifyingPlayerId: number | null;
  winnerId: number | null;
  lastSubmittedAnswers: Record<string, string> | null;
  officialSolution: CaseField[] | null;
}

export interface PlayerSession {
  playerId: number;
  sessionToken: string;
}

export interface RoomSummary {
  exists: boolean;
  phase: GamePhase | null;
  playerCount: number;
  caseId?: string;
  caseTitle?: string;
}

export const PLAYER_COLORS = [
  'blue',
  'yellow',
  'brown',
  'lightpink',
  'green',
  'purple',
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const DEFAULT_MASTER_KEYS_PER_PLAYER = 2;
export const MAX_MASTER_KEYS_PER_PLAYER = 5;

export const SESSION_STORAGE_KEY = 'scotland-yard-session';

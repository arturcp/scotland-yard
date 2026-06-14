import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GameRoomState } from '../../src/types/game.js';
import { DEFAULT_MASTER_KEYS_PER_PLAYER } from '../../src/types/game.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '..', 'data', 'rooms.db');

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        code TEXT PRIMARY KEY,
        state_json TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
  }
  return db;
}

export function getDatabase(): Database.Database {
  return getDb();
}

export function saveRoom(state: GameRoomState): void {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO rooms (code, state_json, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(code) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`,
    )
    .run(state.code, JSON.stringify(state), Date.now());
}

export function loadRoom(code: string): GameRoomState | null {
  const database = getDb();
  const row = database
    .prepare('SELECT state_json FROM rooms WHERE code = ?')
    .get(code.toUpperCase()) as { state_json: string } | undefined;
  if (!row) {
    return null;
  }
  const state = JSON.parse(row.state_json) as GameRoomState;
  if (!state.sessionTokens) {
    state.sessionTokens = {};
  }
  if (!state.caseTitle) {
    state.caseTitle = '';
  }
  if (!state.caseIntro) {
    state.caseIntro = '';
  }
  if (state.masterKeysPerPlayer === undefined) {
    state.masterKeysPerPlayer = DEFAULT_MASTER_KEYS_PER_PLAYER;
  }
  if (!state.masterKeysRemainingByPlayer) {
    state.masterKeysRemainingByPlayer = {};
  }
  if (!state.lockedZones) {
    state.lockedZones = {};
  }
  if (state.pendingLockedZoneEntry === undefined) {
    state.pendingLockedZoneEntry = null;
  }
  return state;
}

export function roomExists(code: string): boolean {
  const database = getDb();
  const row = database.prepare('SELECT 1 FROM rooms WHERE code = ?').get(code.toUpperCase());
  return !!row;
}

export function deleteExpiredRooms(): number {
  const database = getDb();
  const cutoff = Date.now() - ROOM_TTL_MS;
  const result = database.prepare('DELETE FROM rooms WHERE updated_at < ?').run(cutoff);
  return result.changes;
}

export function deleteRoom(code: string): void {
  const database = getDb();
  database.prepare('DELETE FROM rooms WHERE code = ?').run(code.toUpperCase());
}

export function closeDb(): void {
  db?.close();
  db = null;
}

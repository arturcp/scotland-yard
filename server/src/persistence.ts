import { createClient, type Client } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GameRoomState } from '../../src/types/game.js';
import { DEFAULT_MASTER_KEYS_PER_PLAYER } from '../../src/types/game.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data', 'rooms.db');

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function resolveDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  if (process.env.DB_PATH) {
    return `file:${process.env.DB_PATH}`;
  }
  return `file:${DEFAULT_DB_PATH}`;
}

function getClient(): Client {
  if (!client) {
    const url = resolveDatabaseUrl();
    if (url.startsWith('file:')) {
      fs.mkdirSync(path.dirname(url.slice('file:'.length)), { recursive: true });
    }
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getClient();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS rooms (
          code TEXT PRIMARY KEY,
          state_json TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        )
      `);
    })();
  }
  await schemaReady;
}

export function getDatabase(): Client {
  return getClient();
}

export async function initDatabase(): Promise<void> {
  await ensureSchema();
}

export async function saveRoom(state: GameRoomState): Promise<void> {
  await ensureSchema();
  const database = getClient();
  await database.execute({
    sql: `INSERT INTO rooms (code, state_json, updated_at) VALUES (?, ?, ?)
          ON CONFLICT(code) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`,
    args: [state.code, JSON.stringify(state), Date.now()],
  });
}

export async function loadRoom(code: string): Promise<GameRoomState | null> {
  await ensureSchema();
  const database = getClient();
  const result = await database.execute({
    sql: 'SELECT state_json FROM rooms WHERE code = ?',
    args: [code.toUpperCase()],
  });
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  const state = JSON.parse(row.state_json as string) as GameRoomState;
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

export async function roomExists(code: string): Promise<boolean> {
  await ensureSchema();
  const database = getClient();
  const result = await database.execute({
    sql: 'SELECT 1 FROM rooms WHERE code = ?',
    args: [code.toUpperCase()],
  });
  return result.rows.length > 0;
}

export async function deleteExpiredRooms(): Promise<number> {
  await ensureSchema();
  const database = getClient();
  const cutoff = Date.now() - ROOM_TTL_MS;
  const result = await database.execute({
    sql: 'DELETE FROM rooms WHERE updated_at < ?',
    args: [cutoff],
  });
  return result.rowsAffected;
}

export async function deleteRoom(code: string): Promise<void> {
  await ensureSchema();
  const database = getClient();
  await database.execute({
    sql: 'DELETE FROM rooms WHERE code = ?',
    args: [code.toUpperCase()],
  });
}

export async function closeDb(): Promise<void> {
  if (client) {
    client.close();
    client = null;
  }
  schemaReady = null;
}

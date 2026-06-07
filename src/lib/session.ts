import { SESSION_STORAGE_KEY } from '../types/game';

interface SessionStore {
  [roomCode: string]: string;
}

function readStore(): SessionStore {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as SessionStore;
  } catch {
    return {};
  }
}

function writeStore(store: SessionStore): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(store));
}

export function getSessionToken(roomCode: string): string | null {
  return readStore()[roomCode.toUpperCase()] ?? null;
}

export function saveSessionToken(roomCode: string, sessionToken: string): void {
  const store = readStore();
  store[roomCode.toUpperCase()] = sessionToken;
  writeStore(store);
}

export function clearSessionToken(roomCode: string): void {
  const store = readStore();
  delete store[roomCode.toUpperCase()];
  writeStore(store);
}

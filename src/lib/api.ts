import type { CaseListItem, CasePreview, RoomSummary } from '../types/game';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function fetchCases(): Promise<CaseListItem[]> {
  const response = await fetch(`${API_BASE}/api/cases`);
  if (!response.ok) {
    throw new Error('Não foi possível carregar os casos.');
  }
  const data = (await response.json()) as { cases: CaseListItem[] };
  return data.cases;
}

export async function fetchCasePreview(caseId: string): Promise<CasePreview> {
  const response = await fetch(`${API_BASE}/api/cases/${encodeURIComponent(caseId)}`);
  if (response.status === 404) {
    throw new Error('Caso não encontrado.');
  }
  if (!response.ok) {
    throw new Error('Não foi possível carregar a história do caso.');
  }
  return response.json() as Promise<CasePreview>;
}

export async function createRoom(caseId: string): Promise<{
  code: string;
  caseId: string;
  caseTitle: string;
}> {
  const response = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? 'Não foi possível criar a sala.');
  }
  return response.json() as Promise<{ code: string; caseId: string; caseTitle: string }>;
}

export async function fetchRoomSummary(code: string): Promise<RoomSummary> {
  const response = await fetch(`${API_BASE}/api/rooms/${encodeURIComponent(code)}`);
  if (response.status === 404) {
    return { exists: false, phase: null, playerCount: 0 };
  }
  if (!response.ok) {
    throw new Error('Não foi possível verificar a sala.');
  }
  return response.json() as Promise<RoomSummary>;
}

export function getWebSocketUrl(): string {
  const configured = import.meta.env.VITE_WS_URL;
  if (configured) {
    return configured;
  }
  if (API_BASE) {
    const url = new URL(API_BASE);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws';
    url.search = '';
    url.hash = '';
    return url.toString();
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

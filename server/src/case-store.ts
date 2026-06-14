import type { ZoneId } from '../../src/board/types.js';
import type { CaseDefinition, CaseField, CaseListItem, CasePreview } from '../../src/types/game.js';
import { getDatabase } from './persistence.js';
import { CASE_SEEDS, type CaseSeed } from './seed-cases.js';

const ZONE_LABELS: Record<ZoneId, string> = {
  'holmes-house': 'Casa do Sherlock Holmes',
  museum: 'Museu',
  bar: 'Bar',
  'big-bang': 'Big Bang',
  drugstore: 'Farmácia',
  'book-store': 'Livraria',
  locksmith: 'Chaveiro',
  key: 'Chave',
  bridge: 'Ponte',
  docks: 'Docas',
  park: 'Parque',
  pawnshop: 'Casa de Penhores',
  theater: 'Teatro',
  hotel: 'Hotel',
  'cigar-shop': 'Charutaria',
  graveyard: 'Cemitério',
  'carriage-station': 'Estação de Carruagens',
  bank: 'Banco',
  street: 'Rua',
  'scotland-yard': 'Scotland Yard',
};

function initCaseTables(): void {
  const db = getDatabase();
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      number INTEGER NOT NULL,
      title TEXT NOT NULL,
      intro TEXT NOT NULL,
      solution_narrative TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS case_fields (
      case_id TEXT NOT NULL,
      field_key TEXT NOT NULL,
      label TEXT NOT NULL,
      answer TEXT NOT NULL,
      PRIMARY KEY (case_id, field_key),
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );

    CREATE TABLE IF NOT EXISTS case_clues (
      case_id TEXT NOT NULL,
      zone_id TEXT NOT NULL,
      text TEXT NOT NULL,
      PRIMARY KEY (case_id, zone_id),
      FOREIGN KEY (case_id) REFERENCES cases(id)
    );
  `);
}

function insertCaseSeed(seed: CaseSeed): void {
  const db = getDatabase();
  db.prepare(
    `INSERT INTO cases (id, number, title, intro, solution_narrative)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(seed.id, seed.number, seed.title, seed.intro, seed.solutionNarrative);

  const insertField = db.prepare(
    `INSERT INTO case_fields (case_id, field_key, label, answer) VALUES (?, ?, ?, ?)`,
  );
  for (const field of seed.fields) {
    insertField.run(seed.id, field.key, field.label, field.answer);
  }

  const insertClue = db.prepare(
    `INSERT INTO case_clues (case_id, zone_id, text) VALUES (?, ?, ?)`,
  );
  for (const [zoneId, text] of Object.entries(seed.clues)) {
    if (text) {
      insertClue.run(seed.id, zoneId, text);
    }
  }
}

export function seedCasesIfEmpty(): void {
  initCaseTables();
  const db = getDatabase();
  const count = db.prepare('SELECT COUNT(*) as total FROM cases').get() as { total: number };
  if (count.total > 0) {
    return;
  }

  const insertAll = db.transaction((seeds: CaseSeed[]) => {
    for (const seed of seeds) {
      insertCaseSeed(seed);
    }
  });

  insertAll(CASE_SEEDS);
}

export function listCasesPublic(): CaseListItem[] {
  seedCasesIfEmpty();
  const db = getDatabase();
  return db
    .prepare('SELECT id, number, title FROM cases ORDER BY number ASC')
    .all() as CaseListItem[];
}

export function caseExists(caseId: string): boolean {
  seedCasesIfEmpty();
  const db = getDatabase();
  const row = db.prepare('SELECT 1 FROM cases WHERE id = ?').get(caseId);
  return !!row;
}

export function getCaseById(caseId: string): CaseDefinition | null {
  seedCasesIfEmpty();
  const db = getDatabase();
  const row = db
    .prepare('SELECT id, number, title, intro, solution_narrative FROM cases WHERE id = ?')
    .get(caseId) as
    | {
        id: string;
        number: number;
        title: string;
        intro: string;
        solution_narrative: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  const fields = db
    .prepare(
      'SELECT field_key as key, label, answer FROM case_fields WHERE case_id = ? ORDER BY rowid ASC',
    )
    .all(caseId) as CaseField[];

  const clueRows = db
    .prepare('SELECT zone_id, text FROM case_clues WHERE case_id = ?')
    .all(caseId) as { zone_id: ZoneId; text: string }[];

  const clues: Partial<Record<ZoneId, string>> = {};
  for (const clue of clueRows) {
    clues[clue.zone_id] = clue.text;
  }

  return {
    id: row.id,
    number: row.number,
    title: row.title,
    intro: row.intro,
    solutionNarrative: row.solution_narrative,
    fields,
    clues,
  };
}

export function getCasePreview(caseId: string): CasePreview | null {
  seedCasesIfEmpty();
  const db = getDatabase();
  const row = db
    .prepare('SELECT id, number, title, intro FROM cases WHERE id = ?')
    .get(caseId) as Omit<CasePreview, 'questions'> | undefined;

  if (!row) {
    return null;
  }

  const questions = db
    .prepare('SELECT field_key as key, label FROM case_fields WHERE case_id = ? ORDER BY rowid ASC')
    .all(caseId) as Array<{ key: string; label: string }>;

  return { ...row, questions };
}

export function getCaseClue(caseId: string, zoneId: ZoneId): string | null {
  seedCasesIfEmpty();
  const db = getDatabase();
  const row = db
    .prepare('SELECT text FROM case_clues WHERE case_id = ? AND zone_id = ?')
    .get(caseId, zoneId) as { text: string } | undefined;
  return row?.text ?? null;
}

export function getZoneLabel(zoneId: ZoneId): string {
  return ZONE_LABELS[zoneId] ?? zoneId;
}

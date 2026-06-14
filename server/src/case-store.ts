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

let caseTablesReady: Promise<void> | null = null;

async function initCaseTables(): Promise<void> {
  if (!caseTablesReady) {
    caseTablesReady = (async () => {
      const db = getDatabase();
      await db.execute(`CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        number INTEGER NOT NULL,
        title TEXT NOT NULL,
        intro TEXT NOT NULL,
        solution_narrative TEXT NOT NULL
      )`);
      await db.execute(`CREATE TABLE IF NOT EXISTS case_fields (
        case_id TEXT NOT NULL,
        field_key TEXT NOT NULL,
        label TEXT NOT NULL,
        answer TEXT NOT NULL,
        PRIMARY KEY (case_id, field_key),
        FOREIGN KEY (case_id) REFERENCES cases(id)
      )`);
      await db.execute(`CREATE TABLE IF NOT EXISTS case_clues (
        case_id TEXT NOT NULL,
        zone_id TEXT NOT NULL,
        text TEXT NOT NULL,
        PRIMARY KEY (case_id, zone_id),
        FOREIGN KEY (case_id) REFERENCES cases(id)
      )`);
    })();
  }
  await caseTablesReady;
}

export function resetCaseStore(): void {
  caseTablesReady = null;
}

function buildCaseSeedStatements(seed: CaseSeed) {
  const statements = [
    {
      sql: `INSERT INTO cases (id, number, title, intro, solution_narrative)
            VALUES (?, ?, ?, ?, ?)`,
      args: [seed.id, seed.number, seed.title, seed.intro, seed.solutionNarrative] as [
        string,
        number,
        string,
        string,
        string,
      ],
    },
  ];

  for (const field of seed.fields) {
    statements.push({
      sql: `INSERT INTO case_fields (case_id, field_key, label, answer) VALUES (?, ?, ?, ?)`,
      args: [seed.id, field.key, field.label, field.answer],
    });
  }

  for (const [zoneId, text] of Object.entries(seed.clues)) {
    if (text) {
      statements.push({
        sql: `INSERT INTO case_clues (case_id, zone_id, text) VALUES (?, ?, ?)`,
        args: [seed.id, zoneId, text],
      });
    }
  }

  return statements;
}

export async function seedCasesIfEmpty(): Promise<void> {
  await initCaseTables();
  const db = getDatabase();
  const count = await db.execute('SELECT COUNT(*) as total FROM cases');
  const total = Number(count.rows[0]?.total ?? 0);
  if (total > 0) {
    return;
  }

  const statements = CASE_SEEDS.flatMap((seed) => buildCaseSeedStatements(seed));
  await db.batch(statements, 'write');
}

export async function listCasesPublic(): Promise<CaseListItem[]> {
  await seedCasesIfEmpty();
  const db = getDatabase();
  const result = await db.execute('SELECT id, number, title FROM cases ORDER BY number ASC');
  return result.rows.map((row) => ({
    id: row.id as string,
    number: Number(row.number),
    title: row.title as string,
  }));
}

export async function caseExists(caseId: string): Promise<boolean> {
  await seedCasesIfEmpty();
  const db = getDatabase();
  const result = await db.execute({
    sql: 'SELECT 1 FROM cases WHERE id = ?',
    args: [caseId],
  });
  return result.rows.length > 0;
}

export async function getCaseById(caseId: string): Promise<CaseDefinition | null> {
  await seedCasesIfEmpty();
  const db = getDatabase();
  const result = await db.execute({
    sql: 'SELECT id, number, title, intro, solution_narrative FROM cases WHERE id = ?',
    args: [caseId],
  });
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const fieldsResult = await db.execute({
    sql: 'SELECT field_key as key, label, answer FROM case_fields WHERE case_id = ? ORDER BY rowid ASC',
    args: [caseId],
  });
  const fields = fieldsResult.rows.map((fieldRow) => ({
    key: fieldRow.key as string,
    label: fieldRow.label as string,
    answer: fieldRow.answer as string,
  })) as CaseField[];

  const clueRowsResult = await db.execute({
    sql: 'SELECT zone_id, text FROM case_clues WHERE case_id = ?',
    args: [caseId],
  });

  const clues: Partial<Record<ZoneId, string>> = {};
  for (const clueRow of clueRowsResult.rows) {
    clues[clueRow.zone_id as ZoneId] = clueRow.text as string;
  }

  return {
    id: row.id as string,
    number: Number(row.number),
    title: row.title as string,
    intro: row.intro as string,
    solutionNarrative: row.solution_narrative as string,
    fields,
    clues,
  };
}

export async function getCasePreview(caseId: string): Promise<CasePreview | null> {
  await seedCasesIfEmpty();
  const db = getDatabase();
  const result = await db.execute({
    sql: 'SELECT id, number, title, intro FROM cases WHERE id = ?',
    args: [caseId],
  });
  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const questionsResult = await db.execute({
    sql: 'SELECT field_key as key, label FROM case_fields WHERE case_id = ? ORDER BY rowid ASC',
    args: [caseId],
  });
  const questions = questionsResult.rows.map((questionRow) => ({
    key: questionRow.key as string,
    label: questionRow.label as string,
  }));

  return {
    id: row.id as string,
    number: Number(row.number),
    title: row.title as string,
    intro: row.intro as string,
    questions,
  };
}

export async function getCaseClue(caseId: string, zoneId: ZoneId): Promise<string | null> {
  await seedCasesIfEmpty();
  const db = getDatabase();
  const result = await db.execute({
    sql: 'SELECT text FROM case_clues WHERE case_id = ? AND zone_id = ?',
    args: [caseId, zoneId],
  });
  const row = result.rows[0];
  return row ? (row.text as string) : null;
}

export function getZoneLabel(zoneId: ZoneId): string {
  return ZONE_LABELS[zoneId] ?? zoneId;
}

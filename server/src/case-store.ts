import type { InStatement } from '@libsql/client';
import type { ZoneId } from '../../src/board/types.js';
import type { CaseDefinition, CaseField, CaseListItem, CasePreview } from '../../src/types/game.js';
import { getDatabase } from './persistence.js';
import {
  CASE_SEEDS,
  CASE_SEED_VERSION,
  CLUE_BOOKS,
  NO_CLUE_TEXT,
  type CaseSeed,
} from './seed-cases.js';

const SEED_VERSION_KEY = 'cases_seed_version';

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

const STATEMENT_CHUNK_SIZE = 400;

async function readSeedVersion(db: ReturnType<typeof getDatabase>): Promise<number> {
  await db.execute(
    'CREATE TABLE IF NOT EXISTS seed_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
  );
  const result = await db.execute({
    sql: 'SELECT value FROM seed_meta WHERE key = ?',
    args: [SEED_VERSION_KEY],
  });
  return Number(result.rows[0]?.value ?? 0);
}

/**
 * Cria as tabelas e semeia os casos. Se o banco foi semeado com outra versão dos dados
 * (ex.: os casos antigos, em que `case_clues` guardava o texto), apaga e semeia de novo.
 */
async function initCaseTables(): Promise<void> {
  if (!caseTablesReady) {
    caseTablesReady = (async () => {
      const db = getDatabase();
      if ((await readSeedVersion(db)) === CASE_SEED_VERSION) {
        return;
      }

      await db.batch(
        [
          'DROP TABLE IF EXISTS case_clues',
          'DROP TABLE IF EXISTS case_fields',
          'DROP TABLE IF EXISTS clue_book',
          'DROP TABLE IF EXISTS cases',
          `CREATE TABLE cases (
            id TEXT PRIMARY KEY,
            number INTEGER NOT NULL,
            title TEXT NOT NULL,
            book_id TEXT NOT NULL,
            intro TEXT NOT NULL,
            solution_narrative TEXT NOT NULL
          )`,
          `CREATE TABLE case_fields (
            case_id TEXT NOT NULL,
            field_key TEXT NOT NULL,
            label TEXT NOT NULL,
            answer TEXT NOT NULL,
            PRIMARY KEY (case_id, field_key),
            FOREIGN KEY (case_id) REFERENCES cases(id)
          )`,
          // De-para do caso: em qual número do livro de pistas está a pista de cada local.
          `CREATE TABLE case_clues (
            case_id TEXT NOT NULL,
            zone_id TEXT NOT NULL,
            clue_number INTEGER NOT NULL,
            PRIMARY KEY (case_id, zone_id),
            FOREIGN KEY (case_id) REFERENCES cases(id)
          )`,
          // Livro de pistas: cada livro cobre 20 casos e numera as pistas de 1 a 280.
          `CREATE TABLE clue_book (
            book_id TEXT NOT NULL,
            clue_number INTEGER NOT NULL,
            text TEXT NOT NULL,
            PRIMARY KEY (book_id, clue_number)
          )`,
        ],
        'write',
      );

      const statements = [
        ...CASE_SEEDS.flatMap((seed) => buildCaseSeedStatements(seed)),
        ...buildClueBookStatements(),
      ];
      for (let i = 0; i < statements.length; i += STATEMENT_CHUNK_SIZE) {
        await db.batch(statements.slice(i, i + STATEMENT_CHUNK_SIZE), 'write');
      }

      await db.execute({
        sql: 'INSERT OR REPLACE INTO seed_meta (key, value) VALUES (?, ?)',
        args: [SEED_VERSION_KEY, String(CASE_SEED_VERSION)],
      });
    })().catch((error) => {
      caseTablesReady = null;
      throw error;
    });
  }
  await caseTablesReady;
}

export function resetCaseStore(): void {
  caseTablesReady = null;
}

function buildCaseSeedStatements(seed: CaseSeed): InStatement[] {
  const statements: InStatement[] = [
    {
      sql: `INSERT INTO cases (id, number, title, book_id, intro, solution_narrative)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [seed.id, seed.number, seed.title, seed.bookId, seed.intro, seed.solutionNarrative],
    },
  ];

  for (const field of seed.fields) {
    statements.push({
      sql: `INSERT INTO case_fields (case_id, field_key, label, answer) VALUES (?, ?, ?, ?)`,
      args: [seed.id, field.key, field.label, field.answer],
    });
  }

  for (const [zoneId, clueNumber] of Object.entries(seed.clues)) {
    if (clueNumber !== undefined) {
      statements.push({
        sql: `INSERT INTO case_clues (case_id, zone_id, clue_number) VALUES (?, ?, ?)`,
        args: [seed.id, zoneId, clueNumber],
      });
    }
  }

  return statements;
}

function buildClueBookStatements(): InStatement[] {
  return Object.entries(CLUE_BOOKS).flatMap(([bookId, clues]) =>
    Object.entries(clues).map(([clueNumber, text]) => ({
      sql: 'INSERT INTO clue_book (book_id, clue_number, text) VALUES (?, ?, ?)',
      args: [bookId, Number(clueNumber), text],
    })),
  );
}

export async function seedCasesIfEmpty(): Promise<void> {
  await initCaseTables();
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
    sql: `SELECT cc.zone_id AS zone_id, cb.text AS text
          FROM case_clues cc
          JOIN cases c ON c.id = cc.case_id
          JOIN clue_book cb ON cb.book_id = c.book_id AND cb.clue_number = cc.clue_number
          WHERE cc.case_id = ?`,
    args: [caseId],
  });

  const clues: Partial<Record<ZoneId, string>> = {};
  for (const clueRow of clueRowsResult.rows) {
    const text = clueRow.text as string;
    if (!NO_CLUE_TEXT.test(text.trim())) {
      clues[clueRow.zone_id as ZoneId] = text;
    }
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

/**
 * Procura a pista do local como no jogo físico: pega o número do local no de-para do caso
 * e lê esse número no livro de pistas. Devolve null quando o livro diz "Sem pista".
 */
export async function getCaseClue(caseId: string, zoneId: ZoneId): Promise<string | null> {
  await seedCasesIfEmpty();
  const db = getDatabase();
  const result = await db.execute({
    sql: `SELECT cb.text AS text
          FROM case_clues cc
          JOIN cases c ON c.id = cc.case_id
          JOIN clue_book cb ON cb.book_id = c.book_id AND cb.clue_number = cc.clue_number
          WHERE cc.case_id = ? AND cc.zone_id = ?`,
    args: [caseId, zoneId],
  });
  const text = result.rows[0]?.text as string | undefined;
  return text && !NO_CLUE_TEXT.test(text.trim()) ? text : null;
}

export function getZoneLabel(zoneId: ZoneId): string {
  return ZONE_LABELS[zoneId] ?? zoneId;
}

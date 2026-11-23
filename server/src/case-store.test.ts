import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getCaseById,
  getCaseClue,
  getCasePreview,
  listCasesPublic,
  seedCasesIfEmpty,
} from './case-store.js';
import { closeDb, getDatabase } from './persistence.js';
import { resetCaseStore } from './case-store.js';
import { CASE_SEEDS, CLUE_BOOKS } from './seed-cases.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DB = path.join(__dirname, '..', 'data', 'test-cases.db');

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

describe('case store', () => {
  test('seeds the real cases in number order without exposing answers in public list', async () => {
    const cases = await listCasesPublic();
    expect(cases).toHaveLength(97);
    expect(cases[0]).toEqual({ id: '021', number: 21, title: 'O Caso da Morte Reescrita' });
    expect(cases[cases.length - 1]?.number).toBe(120);
    expect(cases.map((c) => c.number)).not.toContain(90);
    expect(cases[0]).not.toHaveProperty('intro');
  });

  test('loads full case with answers for server logic only', async () => {
    const caseDef = await getCaseById('021');
    expect(caseDef?.title).toBe('O Caso da Morte Reescrita');
    expect(caseDef?.fields).toEqual([
      { key: 'assassino', label: 'Assassino', answer: 'Vance Millyard' },
      { key: 'motivo', label: 'Motivo', answer: 'Papel principal' },
    ]);
    expect(caseDef?.solutionNarrative).toContain('daltonismo');
    expect(caseDef?.solutionNarrative).not.toContain('Assassino: Vance Millyard');
  });

  test('resolves the clue of a zone through the case map and the clue book', async () => {
    // Caso 21: DOCAS 31 -> livro 21–40, pista 31.
    const caseDef = await getCaseById('021');
    expect(CASE_SEEDS.find((seed) => seed.number === 21)?.clues.docks).toBe(31);
    expect(caseDef?.clues?.docks).toBe(CLUE_BOOKS['21-40']?.['31']);
    expect(await getCaseClue('021', 'docks')).toBe(CLUE_BOOKS['21-40']?.['31']);
  });

  test('uses the book of the case when the same clue number exists in several books', async () => {
    // Caso 89 (livro 81–100): FARMÁCIA 113. Caso 61 (livro 61–80): FARMÁCIA 1.
    expect(await getCaseClue('089', 'drugstore')).toBe(CLUE_BOOKS['81-100']?.['113']);
    expect(await getCaseClue('061', 'drugstore')).toBe(CLUE_BOOKS['61-80']?.['1']);
  });

  test('returns no clue for zones the book marks as "Sem pista"', async () => {
    // No livro 21–40 a pista 5 é "Sem pista." (local sem pista para o caso).
    expect(CLUE_BOOKS['21-40']?.['5']).toBe('Sem pista.');
    const seedWithoutClue = CASE_SEEDS.find((seed) =>
      Object.values(seed.clues).some((n) => CLUE_BOOKS[seed.bookId]?.[String(n)] === 'Sem pista.'),
    );
    expect(seedWithoutClue).toBeDefined();
    const [zoneId] = Object.entries(seedWithoutClue!.clues).find(
      ([, n]) => CLUE_BOOKS[seedWithoutClue!.bookId]?.[String(n)] === 'Sem pista.',
    )!;
    expect(await getCaseClue(seedWithoutClue!.id, zoneId as never)).toBeNull();
    const caseDef = await getCaseById(seedWithoutClue!.id);
    expect(caseDef?.clues).not.toHaveProperty(zoneId);
  });

  test('every case has a clue number for all 14 clue zones and each exists in its book', () => {
    for (const seed of CASE_SEEDS) {
      const numbers = Object.values(seed.clues);
      expect(numbers, `caso ${seed.number}`).toHaveLength(14);
      for (const n of numbers) {
        expect(
          CLUE_BOOKS[seed.bookId]?.[String(n)],
          `caso ${seed.number}, pista ${n}`,
        ).toBeTruthy();
      }
    }
  });

  test('keeps the image marker in the intro of cases with pictures', async () => {
    const preview = await getCasePreview('113');
    expect(preview?.intro).toContain('{{image:/images/cases/caso-113.png}}');
    expect(preview?.intro).not.toContain('Carregar imagem');
    expect(
      fs.existsSync(path.join(__dirname, '..', '..', 'public/images/cases/caso-113.png')),
    ).toBe(true);
  });

  test('strips publisher footers from the data', () => {
    for (const seed of CASE_SEEDS) {
      expect(seed.intro).not.toMatch(/GROW JOGOS/i);
      expect(seed.solutionNarrative).not.toMatch(/GROW JOGOS/i);
    }
    for (const book of Object.values(CLUE_BOOKS)) {
      for (const text of Object.values(book)) {
        expect(text).not.toMatch(/GROW JOGOS/i);
      }
    }
  });

  test('loads public case preview without answers', async () => {
    const preview = await getCasePreview('021');
    expect(preview?.title).toBe('O Caso da Morte Reescrita');
    expect(preview?.intro.length).toBeGreaterThan(0);
    expect(preview?.questions).toEqual([
      { key: 'assassino', label: 'Assassino' },
      { key: 'motivo', label: 'Motivo' },
    ]);
    expect(preview).not.toHaveProperty('fields');
    expect(preview).not.toHaveProperty('solutionNarrative');
  });

  test('replaces data seeded by an older version of the cases', async () => {
    const db = getDatabase();
    await db.execute("UPDATE seed_meta SET value = '1' WHERE key = 'cases_seed_version'");
    await db.execute('DROP TABLE case_clues');
    await db.execute('CREATE TABLE case_clues (case_id TEXT, zone_id TEXT, text TEXT)');
    await db.execute(
      "INSERT INTO cases (id, number, title, book_id, intro, solution_narrative) VALUES ('001', 1, 'Antigo', 'x', 'x', 'x')",
    );
    resetCaseStore();

    const cases = await listCasesPublic();
    expect(cases).toHaveLength(97);
    expect(cases.map((c) => c.id)).not.toContain('001');
    expect(await getCaseClue('021', 'docks')).toBe(CLUE_BOOKS['21-40']?.['31']);
  });
});

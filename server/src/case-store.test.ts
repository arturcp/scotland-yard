import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCaseById, getCasePreview, listCasesPublic, seedCasesIfEmpty } from './case-store.js';
import { closeDb } from './persistence.js';
import { resetCaseStore } from './case-store.js';

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
  test('seeds seven cases without exposing answers in public list', async () => {
    const cases = await listCasesPublic();
    expect(cases).toHaveLength(7);
    expect(cases[0]?.title).toBe('O Homem Profano');
    expect(cases[6]?.title).toBe('Os ossos do Ofício');
  });

  test('loads full case with clues and answers for server logic only', async () => {
    const caseDef = await getCaseById('001');
    expect(caseDef?.title).toBe('O Homem Profano');
    expect(caseDef?.fields).toHaveLength(4);
    expect(caseDef?.clues?.bank).toContain('Earl Akintern');
    expect(caseDef?.fields[0]?.answer).toBe('Earl Akintern');
  });

  test('loads public case preview without answers', async () => {
    const preview = await getCasePreview('001');
    expect(preview?.title).toBe('O Homem Profano');
    expect(preview?.intro.length).toBeGreaterThan(0);
    expect(preview?.questions).toHaveLength(4);
    expect(preview?.questions[0]?.label).toContain('Pregador');
    expect(preview).not.toHaveProperty('fields');
    expect(preview).not.toHaveProperty('solutionNarrative');
  });
});

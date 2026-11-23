import type { ZoneId } from '../../src/board/types.js';
import casesData from './cases/cases.json' with { type: 'json' };
import clueBooksData from './cases/clue-books.json' with { type: 'json' };

export interface CaseSeedField {
  key: string;
  label: string;
  answer: string;
}

export interface CaseSeed {
  id: string;
  number: number;
  title: string;
  /** Livro de pistas deste caso (ex.: '21-40'). */
  bookId: string;
  intro: string;
  solutionNarrative: string;
  fields: CaseSeedField[];
  /** De-para do tabuleiro: zona -> número da pista no livro. */
  clues: Partial<Record<ZoneId, number>>;
}

/** Livros de pistas: bookId -> (número da pista -> texto). */
export type ClueBooks = Record<string, Record<string, string>>;

/**
 * Dados gerados por `scripts/import-cases.mjs` a partir dos casos do jogo físico.
 * Não edite os JSON à mão: rode o script de novo.
 */
export const CASE_SEEDS = casesData as CaseSeed[];
export const CLUE_BOOKS = clueBooksData as ClueBooks;

/** Aumente ao alterar os casos ou os livros: o banco é semeado de novo quando a versão muda. */
export const CASE_SEED_VERSION = 3;

/** Texto do livro que indica que o local não tem pista para o caso. */
export const NO_CLUE_TEXT = /^sem pista\.?$/i;

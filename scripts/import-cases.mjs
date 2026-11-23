#!/usr/bin/env node
/**
 * Gera os dados dos casos reais a partir dos .txt transcritos do jogo físico.
 *
 * Uso: node scripts/import-cases.mjs <pasta-de-origem>
 *
 * A pasta de origem é somente leitura. Saídas (commitadas no repositório):
 *   - server/src/cases/cases.json        casos, campos de resposta e de-para (zona -> nº da pista)
 *   - server/src/cases/clue-books.json   livros de pistas (nº da pista -> texto)
 *   - public/images/cases/caso-N.png     imagens usadas no texto dos casos
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DATA = path.join(ROOT, 'server/src/cases');
const OUT_IMAGES = path.join(ROOT, 'public/images/cases');

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error('Uso: node scripts/import-cases.mjs <pasta-de-origem>');
  process.exit(1);
}

const ZONES = {
  FARMÁCIA: 'drugstore',
  BANCO: 'bank',
  CARRUAGENS: 'carriage-station',
  DOCAS: 'docks',
  HOTEL: 'hotel',
  CHAVEIRO: 'locksmith',
  MUSEU: 'museum',
  LIVRARIA: 'book-store',
  PARQUE: 'park',
  PENHORES: 'pawnshop',
  TEATRO: 'theater',
  BAR: 'bar',
  'SCOTLAND YARD': 'scotland-yard',
  CHARUTARIA: 'cigar-shop',
};
const ZONE_LINE = new RegExp(`^(${Object.keys(ZONES).join('|')})\\s+(\\d+)\\s*$`, 'i');
const CLUES_PER_BOOK = 280;
const FIRST_CASE = 21;
const LAST_CASE = 120;

const errors = [];
const joins = [];
const warnings = [];
const fail = (msg) => errors.push(msg);

// ---------------------------------------------------------------- leitura

const files = fs
  .readdirSync(sourceDir)
  .filter((f) => /^IMG_.*\.txt$/.test(f))
  .sort()
  .map((name) => ({
    name,
    text: fs.readFileSync(path.join(sourceDir, name), 'utf8').replace(/^﻿/, ''),
  }));

/** Remove ruído de copyright/rodapé e normaliza espaços. */
function clean(text) {
  return text
    .split('\n')
    .filter((line) => !/GROW JOGOS E BRINQUEDOS/i.test(line))
    .filter((line) => !/SOB LICEN[ÇC]A DE RAS/i.test(line))
    .filter((line) => !/^C\.G\.C\./i.test(line.trim()))
    .join('\n')
    .replace(/\r/g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const SMALL_WORDS = new Set([
  'a',
  'o',
  'as',
  'os',
  'da',
  'de',
  'do',
  'das',
  'dos',
  'e',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'ao',
  'um',
  'uma',
  'que',
  'sem',
  'com',
  'para',
  'por',
]);
function titleCase(text) {
  return text
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (i > 0 && SMALL_WORDS.has(word)) return word;
      return word.replace(/(^|[-"'(])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
    })
    .join(' ');
}

// ---------------------------------------------------------------- casos e de-para

const caseTexts = new Map(); // número -> { title, intro }
const depara = new Map(); // número -> { zoneId: nº da pista }
const bookPages = new Map(); // "21-40" -> [{ page, text }]

for (const { name, text } of files) {
  const trimmed = text.trim();

  const bookHeader = trimmed.match(
    /^\[Livreto "Pistas e Soluções" — Casos (\d+) a (\d+) — página (\d+)/,
  );
  if (bookHeader) {
    const bookId = `${bookHeader[1]}-${bookHeader[2]}`;
    const body = trimmed.replace(/\[Rodapé da página\][\s\S]*$/, '');
    if (!bookPages.has(bookId)) bookPages.set(bookId, []);
    bookPages.get(bookId).push({ page: Number(bookHeader[3]), text: body, file: name });
    continue;
  }
  if (trimmed.startsWith('[Capa do livreto]')) continue;

  // De-para: "CASO N" + 14 linhas "LOCAL NÚMERO" (o "CASO N" pode vir no fim do arquivo).
  if (/^FARMÁCIA\s+\d+/.test(trimmed) || /^CASO\s+\d+\s*\n+FARMÁCIA/.test(trimmed)) {
    const caseNumber = Number(trimmed.match(/CASO\s+(\d+)/)?.[1]);
    const mapping = {};
    for (const line of trimmed.split('\n')) {
      const match = line.trim().match(ZONE_LINE);
      if (match) mapping[ZONES[match[1].toUpperCase()]] = Number(match[2]);
    }
    if (depara.has(caseNumber)) fail(`De-para duplicado para o caso ${caseNumber} (${name})`);
    depara.set(caseNumber, mapping);
    continue;
  }

  // Texto do caso: "CASO N: "TÍTULO"" ou "CASO N — "TÍTULO"".
  const header = trimmed.match(/^CASO\s+(\d+)\s*[:—-]\s*"([^"\n]+)"([^\n]*)\n/);
  if (header) {
    const number = Number(header[1]);
    const suffix = header[3].replace(/^\s*-\s*/, '').trim();
    const title = `${titleCase(header[2])}${suffix ? ` ${suffix}` : ''}`;
    const intro = clean(trimmed.slice(header[0].length));
    if (caseTexts.has(number)) fail(`Texto duplicado para o caso ${number} (${name})`);
    caseTexts.set(number, { title, intro });
    continue;
  }

  fail(`Arquivo não classificado: ${name}`);
}

// ---------------------------------------------------------------- livros e soluções

const clueBooks = {}; // bookId -> { [número]: texto }
const solutions = new Map(); // número do caso -> texto bruto

for (const [bookId, pages] of [...bookPages.entries()].sort()) {
  pages.sort((a, b) => a.page - b.page);
  let cluesPart = '';
  let solutionsPart = '';
  for (const page of pages) {
    const pageText = page.text
      .replace(/^\[Livreto[^\n]*\]\s*$/gm, '')
      .replace(/^\[Ilustração[^\n]*\]\s*$/gm, '')
      .replace(/^SOLUÇÕES:?\s*$/gm, '')
      .trim();
    const headerAt = solutionsPart ? 0 : pageText.search(/^CASO\s+\d+\s*—/m);
    if (!solutionsPart && headerAt === -1) {
      cluesPart += `${pageText}\n`;
      continue;
    }
    if (!solutionsPart) cluesPart += `${pageText.slice(0, headerAt)}\n`;
    const chunk = pageText.slice(headerAt).trim();
    if (!solutionsPart) {
      solutionsPart = chunk;
      continue;
    }
    // Texto cortado na quebra de página: une com o início da página seguinte.
    const cut = !/[.!?:;"”)\]]$/.test(solutionsPart) && !/^CASO\s+\d+/.test(chunk);
    if (cut) {
      const hyphenated = solutionsPart.endsWith('-');
      joins.push(
        `Livro ${bookId}, página ${page.page}: "...${solutionsPart.slice(-25)}" + "${chunk.slice(0, 25)}..."`,
      );
      solutionsPart = hyphenated ? solutionsPart.slice(0, -1) + chunk : `${solutionsPart} ${chunk}`;
    } else {
      solutionsPart += `\n\n${chunk}`;
    }
  }

  // Pistas
  const clues = {};
  let current = null;
  for (const rawLine of cluesPart.split('\n')) {
    if (!rawLine.trim()) continue;
    const numbered = rawLine.match(/^(\d{1,3}) (.*)$/);
    if (numbered) {
      let number = Number(numbered[1]);
      let body = numbered[2];
      const sic = body.match(/^\[sic:[^\]]*deveria ser (\d+)\]\s*(.*)$/);
      if (sic) {
        number = Number(sic[1]);
        body = sic[2];
      }
      if (clues[number] !== undefined) fail(`Livro ${bookId}: pista ${number} duplicada`);
      clues[number] = body.trim();
      current = number;
    } else if (current !== null) {
      const piece = rawLine.trim();
      if (!/^[IVX]+\)/.test(piece))
        warnings.push(`Livro ${bookId}: linha sem número anexada à pista ${current}: "${piece}"`);
      clues[current] += `\n${piece}`;
    }
  }
  for (let n = 1; n <= CLUES_PER_BOOK; n++) {
    if (clues[n] === undefined) fail(`Livro ${bookId}: falta a pista ${n}`);
  }
  for (const n of Object.keys(clues)) {
    if (Number(n) < 1 || Number(n) > CLUES_PER_BOOK)
      fail(`Livro ${bookId}: pista fora do intervalo (${n})`);
  }
  clueBooks[bookId] = clues;

  // Soluções
  const parts = solutionsPart.split(/^CASO\s+(\d+)\s*—[^\n]*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const number = Number(parts[i]);
    if (solutions.has(number)) fail(`Solução duplicada para o caso ${number}`);
    solutions.set(number, clean(parts[i + 1]));
  }
}

/** Separa a solução em narrativa e campos (linha-resumo "Rótulo: valor; Rótulo: valor."). */
function splitSolution(raw) {
  const paragraphs = raw.split(/\n{2,}/);
  const lastParagraph = paragraphs[paragraphs.length - 1].replace(/\n/g, ' ');
  const starts = [0];
  for (const m of lastParagraph.matchAll(/(?<!\b(?:Sr|Sra|Dr|Dra))[.!?]["”)]?\s+(?=\S)/g))
    starts.push(m.index + m[0].length);

  for (const start of starts) {
    const candidate = lastParagraph.slice(start).trim();
    const segments = candidate.replace(/\.$/, '').split(/;\s*/);
    const fields = [];
    for (const segment of segments) {
      const pair = segment.match(/^((?:[^:.]|\b(?:Sr|Sra|Dr|Dra)\.){1,50}):\s*(.+)$/);
      if (pair) fields.push({ label: pair[1].trim(), answer: pair[2].trim() });
      else if (fields.length) fields[fields.length - 1].answer += `; ${segment.trim()}`;
      else {
        fields.length = 0;
        break;
      }
    }
    if (fields.length) {
      const narrative = [...paragraphs.slice(0, -1), lastParagraph.slice(0, start).trim()]
        .filter(Boolean)
        .join('\n\n');
      return { narrative, fields };
    }
  }
  return { narrative: raw, fields: [] };
}

function slug(label, taken) {
  const base =
    label
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'campo';
  let key = base;
  for (let i = 2; taken.has(key); i++) key = `${base}_${i}`;
  taken.add(key);
  return key;
}

// ---------------------------------------------------------------- imagens

const IMAGE_MARKER = /\[Carregar imagem (\d+)\.(?:png|jpg)\]/g;
fs.mkdirSync(OUT_IMAGES, { recursive: true });

function replaceImages(intro, number) {
  return intro.replace(IMAGE_MARKER, (_, imageId) => {
    const source = path.join(sourceDir, `${imageId}.png`);
    if (!fs.existsSync(source)) {
      fail(`Caso ${number}: imagem ${imageId}.png não encontrada`);
      return '';
    }
    fs.copyFileSync(source, path.join(OUT_IMAGES, `caso-${number}.png`));
    return `{{image:/images/cases/caso-${number}.png}}`;
  });
}

// ---------------------------------------------------------------- correções de defeitos da origem
// (a pasta de origem não é alterada; os ajustes ficam documentados aqui)

/** De-para com número de pista truncado na transcrição. */
const DEPARA_FIXES = {
  // "FARMÁCIA 1" colidiria com a pista do caso 61; a sequência dos casos 61..80 indica 16.
  76: { drugstore: 16 },
};
/** Trechos da solução com pontuação errada que impedem ler o resumo. */
const SOLUTION_FIXES = {
  65: [['Onde está o colar; na fazenda', 'Onde está o colar: na fazenda']],
  81: [['sequestrados: o motivo', 'sequestrados; o motivo']],
  84: [['o local: ursa Nona: a criança', 'o local: ursa Nona; a criança']],
  85: [['contador suíço: o local', 'contador suíço; o local']],
  112: [['A quem pertenciam as vozes; Ashton', 'A quem pertenciam as vozes: Ashton']],
};
/** Títulos com grafia diferente entre o texto do caso e o livro (vale a grafia correta). */
const TITLE_FIXES = { 106: [['Clérico', 'Clérigo']] };
for (const [number, fix] of Object.entries(DEPARA_FIXES)) {
  if (depara.has(Number(number))) Object.assign(depara.get(Number(number)), fix);
}
for (const [number, replacements] of Object.entries(SOLUTION_FIXES)) {
  let raw = solutions.get(Number(number));
  if (raw === undefined) continue;
  for (const [from, to] of replacements) {
    if (!raw.includes(from)) fail(`Correção da solução do caso ${number} não se aplica: "${from}"`);
    raw = raw.replace(from, to);
  }
  solutions.set(Number(number), raw);
}

// ---------------------------------------------------------------- montagem

const cases = [];
const skipped = [];

for (let number = FIRST_CASE; number <= LAST_CASE; number++) {
  const text = caseTexts.get(number);
  const mapping = depara.get(number);
  const solution = solutions.get(number);
  const missing = [!text && 'texto do caso', !mapping && 'de-para', !solution && 'solução'].filter(
    Boolean,
  );
  if (missing.length) {
    skipped.push({ number, missing });
    continue;
  }

  const bookStart = FIRST_CASE + Math.floor((number - FIRST_CASE) / 20) * 20;
  const bookId = `${bookStart}-${bookStart + 19}`;
  const book = clueBooks[bookId];

  const zoneIds = Object.values(ZONES);
  for (const zoneId of zoneIds) {
    const clueNumber = mapping[zoneId];
    if (clueNumber === undefined) fail(`Caso ${number}: de-para sem a zona ${zoneId}`);
    else if (!book || book[clueNumber] === undefined)
      fail(`Caso ${number}: pista ${clueNumber} (${zoneId}) não existe no livro ${bookId}`);
  }

  const { narrative, fields } = splitSolution(solution);
  if (fields.length === 0) fail(`Caso ${number}: não encontrei a linha-resumo da solução`);
  const taken = new Set();

  cases.push({
    id: String(number).padStart(3, '0'),
    number,
    title: (TITLE_FIXES[number] ?? []).reduce((t, [from, to]) => t.replace(from, to), text.title),
    bookId,
    intro: replaceImages(text.intro, number),
    solutionNarrative: narrative,
    fields: fields.map(({ label, answer }) => ({
      key: slug(label, taken),
      label: label.charAt(0).toUpperCase() + label.slice(1),
      answer: answer.charAt(0).toUpperCase() + answer.slice(1),
    })),
    clues: mapping,
  });
}

// Cada número de pista deve ser usado no máximo uma vez por livro (detecta erro de transcrição).
const used = new Map();
for (const c of cases) {
  for (const [zoneId, n] of Object.entries(c.clues)) {
    const key = `${c.bookId}#${n}`;
    if (used.has(key))
      fail(`Livro ${c.bookId}: pista ${n} usada por ${used.get(key)} e por ${c.number}/${zoneId}`);
    used.set(key, `${c.number}/${zoneId}`);
  }
}

// ---------------------------------------------------------------- relatório

console.log(`Casos importados: ${cases.length}`);
console.log(`Livros: ${Object.keys(clueBooks).join(', ')}`);
for (const s of skipped) console.log(`Pulado: caso ${s.number} (falta ${s.missing.join(', ')})`);
for (const j of joins) console.log(`Junção de página: ${j}`);
for (const w of warnings) console.log(`Aviso: ${w}`);
if (errors.length) {
  console.error(`\n${errors.length} erro(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

fs.mkdirSync(OUT_DATA, { recursive: true });
fs.writeFileSync(path.join(OUT_DATA, 'cases.json'), `${JSON.stringify(cases, null, 2)}\n`);
fs.writeFileSync(path.join(OUT_DATA, 'clue-books.json'), `${JSON.stringify(clueBooks, null, 2)}\n`);
console.log(`\nGerado em ${path.relative(ROOT, OUT_DATA)}/ e ${path.relative(ROOT, OUT_IMAGES)}/`);

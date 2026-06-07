import type { Zone, ZoneId } from './types';

export const ZONES: Record<ZoneId, Zone> = {
  'holmes-house': {
    id: 'holmes-house',
    pin: { top: 140, left: 1030 },
    puzzleId: 'holmes-house',
    clueText: 'Clue: Holmes House',
  },
  museum: {
    id: 'museum',
    pin: { top: 110, left: 735 },
    puzzleId: 'museum',
    clueText: 'Clue: Museum',
  },
  bar: {
    id: 'bar',
    pin: { top: 350, left: 895 },
    puzzleId: 'bar',
    clueText: 'Clue: Bar',
  },
  'big-bang': {
    id: 'big-bang',
    pin: { top: 530, left: 780 },
    puzzleId: 'big-bang',
    clueText: 'Clue: Big Bang',
  },
  drugstore: {
    id: 'drugstore',
    pin: { top: 650, left: 920 },
    puzzleId: 'drugstore',
    clueText: 'Clue: Drugstore',
  },
  'book-store': {
    id: 'book-store',
    pin: { top: 60, left: 385 },
    puzzleId: 'book-store',
    clueText: 'Clue: Book Store',
  },
  locksmith: {
    id: 'locksmith',
    pin: { top: 60, left: 210 },
    puzzleId: 'locksmith',
    clueText: 'Clue: Locksmith',
  },
  key: {
    id: 'key',
    pin: { top: 55, left: 55 },
    puzzleId: 'key',
    clueText: 'Clue: Key',
  },
  bridge: {
    id: 'bridge',
    pin: { top: 200, left: 125 },
    puzzleId: 'bridge',
    clueText: 'Clue: Bridge',
  },
  docks: {
    id: 'docks',
    pin: { top: 245, left: 335 },
    puzzleId: 'docks',
    clueText: 'Clue: Docks',
  },
  park: {
    id: 'park',
    pin: { top: 445, left: 430 },
    puzzleId: 'park',
    clueText: 'Clue: Park',
  },
  pawnshop: {
    id: 'pawnshop',
    pin: { top: 355, left: 590 },
    puzzleId: 'pawnshop',
    clueText: 'Clue: Pawnshop',
  },
  theater: {
    id: 'theater',
    pin: { top: 590, left: 530 },
    puzzleId: 'theater',
    clueText: 'Clue: Theater',
  },
  hotel: {
    id: 'hotel',
    pin: { top: 500, left: 100 },
    puzzleId: 'hotel',
    clueText: 'Clue: Hotel',
  },
  'cigar-shop': {
    id: 'cigar-shop',
    pin: { top: 500, left: 260 },
    puzzleId: 'cigar-shop',
    clueText: 'Clue: Cigar Shop',
  },
  graveyard: {
    id: 'graveyard',
    pin: { top: 690, left: 200 },
    puzzleId: 'graveyard',
    clueText: 'Clue: Graveyard',
  },
  'carriage-station': {
    id: 'carriage-station',
    pin: { top: 785, left: 190 },
    puzzleId: 'carriage-station',
    clueText: 'Clue: Carriage Station',
  },
  bank: {
    id: 'bank',
    pin: { top: 860, left: 550 },
    puzzleId: 'bank',
    clueText: 'Clue: Bank',
  },
  street: {
    id: 'street',
    pin: { top: 835, left: 815 },
    puzzleId: 'street',
    clueText: 'Clue: Street',
  },
  'scotland-yard': {
    id: 'scotland-yard',
    pin: { top: 840, left: 940 },
    puzzleId: 'scotland-yard',
    clueText: 'Clue: Scotland Yard',
    isBase: true,
  },
};

export const ZONE_IDS = Object.keys(ZONES) as ZoneId[];

export const ZONE_LABELS: Record<ZoneId, string> = {
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

export function getZoneLabel(zoneId: ZoneId): string {
  return ZONE_LABELS[zoneId] ?? zoneId;
}

export function zonePins(): Record<ZoneId, { top: number; left: number }> {
  return Object.fromEntries(ZONE_IDS.map((id) => [id, ZONES[id].pin])) as Record<
    ZoneId,
    { top: number; left: number }
  >;
}

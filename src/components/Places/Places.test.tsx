import { render } from '@testing-library/react';
import type { GameController } from '../../types/game';
import Places from './index';

const PLACE_NAMES = [
  'holmes-house',
  'museum',
  'bar',
  'big-bang',
  'drugstore',
  'book-store',
  'locksmith',
  'key',
  'bridge',
  'docks',
  'park',
  'pawnshop',
  'theater',
  'hotel',
  'cigar-shop',
  'graveyard',
  'carriage-station',
  'bank',
  'street',
  'scotland-yard',
];

const makeGame = (): GameController => ({
  gameShift: () => ({
    player: { id: 1, name: 'John', color: 'blue', position: { row: 0, column: 0, place: null } },
    availableSquares: [],
    status: 'waiting',
    players: [],
  }),
  updatePlayerPosition: vi.fn(),
  updateAvailableSquares: vi.fn(),
});

describe('Places', () => {
  test('renders 20 place elements', () => {
    const { container } = render(<Places game={makeGame()} />);
    expect(container.querySelectorAll('.place')).toHaveLength(20);
  });

  test.each(PLACE_NAMES)('renders the %s place', (name) => {
    const { container } = render(<Places game={makeGame()} />);
    expect(container.querySelector(`.${name}`)).toBeInTheDocument();
  });
});

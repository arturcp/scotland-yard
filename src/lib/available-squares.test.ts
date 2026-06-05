import type { AvailableSquare } from '../types/game';
import AvailableSquares from './available-squares';

const makePlayer = (row = 0, column = 10) => ({
  id: 1,
  name: 'John',
  color: 'blue',
  position: { row, column, place: null },
});

describe('AvailableSquares', () => {
  describe('all', () => {
    test('returns an array', () => {
      const results = new AvailableSquares(makePlayer()).all(1);
      expect(Array.isArray(results)).toBe(true);
    });

    test('each result has id, row, column, and path', () => {
      const results = new AvailableSquares(makePlayer()).all(1);
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('path');
        expect(Array.isArray(result.path)).toBe(true);
        if (!result.place) {
          expect(result).toHaveProperty('row');
          expect(result).toHaveProperty('column');
        }
      }
    });

    test('does not include the starting position', () => {
      const results = new AvailableSquares(makePlayer(0, 10)).all(1);
      expect(results.some((r) => r.id === '0,10')).toBe(false);
    });

    test('returns only unique positions', () => {
      const results = new AvailableSquares(makePlayer()).all(3);
      const ids = results.map((r) => r.id);
      expect(ids.length).toBe(new Set(ids).size);
    });

    test('returns more squares for a higher dice roll', () => {
      const as = new AvailableSquares(makePlayer());
      const low = as.all(1).length;
      const high = as.all(3).length;
      expect(high).toBeGreaterThan(low);
    });

    test('path for each result leads from the starting position', () => {
      const results = new AvailableSquares(makePlayer(0, 10)).all(1);
      for (const result of results) {
        expect(result.path.length).toBeGreaterThan(0);
        expect(result.path[result.path.length - 1]).toBe(result.id);
      }
    });

    test('includes reachable zones with place set', () => {
      const results = new AvailableSquares(makePlayer(7, 3)).all(3);
      const zones = results.filter((r) => r.place);
      expect(zones.length).toBeGreaterThan(0);
      for (const zone of zones) {
        expect(zone.path[zone.path.length - 1]).toBe(zone.place);
      }
    });

    test('zone path ends with zone id after grid steps', () => {
      const results = new AvailableSquares(makePlayer(7, 3)).all(2);
      const docks = results.find((r) => r.place === 'docks');
      expect(docks).toBeDefined();
      expect(docks!.path[docks!.path.length - 1]).toBe('docks');
      expect(docks!.path.some((step) => step.includes(','))).toBe(true);
    });

    test('does not include park from the north path beside the zone', () => {
      const results = new AvailableSquares(makePlayer(6, 10)).all(2);
      expect(results.some((r) => r.place === 'park')).toBe(false);
    });

    test('includes park when approaching entrance from the correct direction', () => {
      const results = new AvailableSquares(makePlayer(7, 6)).all(2);
      const park = results.find((r) => r.place === 'park');
      expect(park).toBeDefined();
      expect(park?.path).toEqual(['7,7', 'park']);
    });

    test('includes docks when approaching along the horizontal path', () => {
      const results = new AvailableSquares(makePlayer(7, 3)).all(2);
      const docks = results.find((r) => r.place === 'docks');
      expect(docks).toBeDefined();
      expect(docks?.path).toEqual(['7,2', 'docks']);
    });

    test('includes pawnshop when stepping down from the vertical path', () => {
      const results = new AvailableSquares(makePlayer(7, 14)).all(2);
      const pawnshop = results.find((r) => r.place === 'pawnshop');
      expect(pawnshop).toBeDefined();
      expect(pawnshop?.path).toEqual(['8,14', 'pawnshop']);
    });

    test('includes docks from the vertical path beside the zone', () => {
      const results = new AvailableSquares(makePlayer(6, 10)).all(1);
      const docks = results.find((r) => r.place === 'docks');
      expect(docks).toBeDefined();
      expect(docks?.path).toEqual(['5,10', 'docks']);
    });

    test('includes docks when stepping left along the horizontal path', () => {
      const results = new AvailableSquares(makePlayer(7, 6)).all(5);
      expect(results.some((r) => r.place === 'docks')).toBe(true);
    });

    test('when inside a zone, first mandatory tile is the tile used to enter it', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'docks', id: 'docks', path: ['7,2', 'docks'] },
      };
      const results = new AvailableSquares(playerInZone).all(2);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((result) => result.path[0] === '7,2')).toBe(true);
    });

    test('with dice 1 inside a zone, only the mandatory exit tile is reachable', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'docks', id: 'docks', path: ['7,2', 'docks'] },
      };
      const results = new AvailableSquares(playerInZone).all(1);
      expect(results).toEqual([
        { id: '7,2', row: 7, column: 2, place: null, path: ['7,2'] },
      ]);
    });
  });

  describe('existInArray', () => {
    test('returns true when the id is present', () => {
      const as = new AvailableSquares(makePlayer());
      expect(as.existInArray([{ id: '5,5' } as AvailableSquare], '5,5')).toBe(true);
    });

    test('returns false when the id is absent', () => {
      const as = new AvailableSquares(makePlayer());
      expect(as.existInArray([{ id: '5,5' } as AvailableSquare], '7,7')).toBe(false);
    });

    test('returns false for an empty array', () => {
      const as = new AvailableSquares(makePlayer());
      expect(as.existInArray([], '5,5')).toBe(false);
    });
  });
});

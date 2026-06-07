import { ZONE_IDS } from '../board';
import type { AvailableSquare } from '../types/game';
import { getAvailableSquares, hasAvailableSquare } from './available-squares';

const makePlayer = (row = 0, column = 10) => ({
  id: 1,
  name: 'John',
  color: 'blue',
  position: { row, column, place: null },
});

describe('AvailableSquares', () => {
  describe('all', () => {
    test('returns an array', () => {
      const results = getAvailableSquares(makePlayer(), 1);
      expect(Array.isArray(results)).toBe(true);
    });

    test('each result has id, row, column, and path', () => {
      const results = getAvailableSquares(makePlayer(), 1);
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
      const results = getAvailableSquares(makePlayer(0, 10), 1);
      expect(results.some((r) => r.id === '0,10')).toBe(false);
    });

    test('returns only unique positions', () => {
      const results = getAvailableSquares(makePlayer(), 3);
      const ids = results.map((r) => r.id);
      expect(ids.length).toBe(new Set(ids).size);
    });

    test('returns more squares for a higher dice roll', () => {
      const low = getAvailableSquares(makePlayer(), 1).length;
      const high = getAvailableSquares(makePlayer(), 3).length;
      expect(high).toBeGreaterThan(low);
    });

    test('path for each result leads from the starting position', () => {
      const results = getAvailableSquares(makePlayer(0, 10), 1);
      for (const result of results) {
        expect(result.path.length).toBeGreaterThan(0);
        expect(result.path[result.path.length - 1]).toBe(result.id);
      }
    });

    test('includes reachable zones with place set', () => {
      const results = getAvailableSquares(makePlayer(7, 3), 3);
      const zones = results.filter((r) => r.place);
      expect(zones.length).toBeGreaterThan(0);
      for (const zone of zones) {
        expect(zone.path[zone.path.length - 1]).toBe(zone.place);
      }
    });

    test('zone path ends with zone id after grid steps', () => {
      const results = getAvailableSquares(makePlayer(7, 3), 2);
      const hotel = results.find((r) => r.place === 'hotel');
      expect(hotel).toBeDefined();
      expect(hotel!.path[hotel!.path.length - 1]).toBe('hotel');
      expect(hotel!.path.some((step) => step.includes(','))).toBe(true);
    });

    test('does not include park from the north path beside the zone', () => {
      const results = getAvailableSquares(makePlayer(6, 10), 2);
      expect(results.some((r) => r.place === 'park')).toBe(false);
    });

    test('includes park when approaching entrance from the correct direction', () => {
      const results = getAvailableSquares(makePlayer(7, 6), 2);
      const park = results.find((r) => r.place === 'park');
      expect(park).toBeDefined();
      expect(park?.path).toEqual(['7,7', 'park']);
    });

    test('includes hotel when approaching along the horizontal path', () => {
      const results = getAvailableSquares(makePlayer(7, 3), 2);
      const hotel = results.find((r) => r.place === 'hotel');
      expect(hotel).toBeDefined();
      expect(hotel?.path).toEqual(['7,2', 'hotel']);
    });

    test('includes pawnshop when stepping down from the vertical path', () => {
      const results = getAvailableSquares(makePlayer(7, 14), 2);
      const pawnshop = results.find((r) => r.place === 'pawnshop');
      expect(pawnshop).toBeDefined();
      expect(pawnshop?.path).toEqual(['8,14', 'pawnshop']);
    });

    test('includes docks from the vertical path beside the zone', () => {
      const results = getAvailableSquares(makePlayer(6, 10), 2);
      const docks = results.find((r) => r.place === 'docks');
      expect(docks).toBeDefined();
      expect(docks?.path).toEqual(['5,10', 'docks']);
    });

    test('includes docks when stepping left along the horizontal path', () => {
      const results = getAvailableSquares(makePlayer(5, 11), 2);
      const docks = results.find((r) => r.place === 'docks');
      expect(docks).toBeDefined();
      expect(docks?.path).toEqual(['5,10', 'docks']);
    });

    test('includes locksmith when stepping left onto the entrance arrow', () => {
      const results = getAvailableSquares(makePlayer(3, 5), 2);
      const locksmith = results.find((r) => r.place === 'locksmith');
      expect(locksmith).toBeDefined();
      expect(locksmith?.path).toEqual(['3,4', 'locksmith']);
    });

    test('includes book-store when stepping right onto the entrance arrow', () => {
      const results = getAvailableSquares(makePlayer(3, 6), 2);
      const bookStore = results.find((r) => r.place === 'book-store');
      expect(bookStore).toBeDefined();
      expect(bookStore?.path).toEqual(['3,7', 'book-store']);
    });

    test('does not include a zone when the roll reaches the entrance but cannot step in', () => {
      const results = getAvailableSquares(makePlayer(10, 15), 3);
      expect(results.some((r) => r.place === 'drugstore')).toBe(false);
      expect(results.some((r) => r.id === '13,15')).toBe(true);
    });

    test('includes a zone when the roll reaches the entrance with a move left to step in', () => {
      const results = getAvailableSquares(makePlayer(10, 15), 4);
      const drugstore = results.find((r) => r.place === 'drugstore');
      expect(drugstore).toBeDefined();
      expect(drugstore?.path).toEqual(['11,15', '12,15', '13,15', 'drugstore']);
    });

    test('includes a zone when already standing on the entrance arrow', () => {
      const results = getAvailableSquares(makePlayer(13, 15), 2);
      const drugstore = results.find((r) => r.place === 'drugstore');
      expect(drugstore).toBeDefined();
      expect(drugstore?.path).toEqual(['13,15', 'drugstore']);
    });

    test('with dice 1 inside drugstore, the entrance tile is reachable', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'drugstore', id: 'drugstore', path: ['13,15', 'drugstore'] },
      };
      const results = getAvailableSquares(playerInZone, 1);
      expect(results).toEqual([{ id: '13,15', row: 13, column: 15, place: null, path: ['13,15'] }]);
    });

    test('with dice 1 inside drugstore, resolves the entrance when path omits the grid tile', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'drugstore', id: 'drugstore', path: ['drugstore'] },
      };
      const results = getAvailableSquares(playerInZone, 1);
      expect(results).toEqual([{ id: '13,15', row: 13, column: 15, place: null, path: ['13,15'] }]);
    });

    test('crosses the bridge from the top-left path tile to the hotel entrance', () => {
      const results = getAvailableSquares(makePlayer(3, 4), 1);
      const bridgeExit = results.find((r) => r.id === '7,2');
      expect(bridgeExit).toBeDefined();
      expect(bridgeExit?.path).toEqual(['7,2']);
    });

    test('reaches the hotel entrance via the bridge from the path before it', () => {
      const results = getAvailableSquares(makePlayer(3, 5), 2);
      const bridgeExit = results.find((r) => r.id === '7,2');
      expect(bridgeExit).toBeDefined();
      expect(bridgeExit?.path).toEqual(['3,4', '7,2']);
    });

    test('when inside a multi-entrance zone, paths start from a valid exit tile', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'hotel', id: 'hotel', path: ['7,2', 'hotel'] },
      };
      const results = getAvailableSquares(playerInZone, 2);
      const validExits = new Set(['7,2', '11,0']);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((result) => validExits.has(result.path[0]))).toBe(true);
    });

    test('with dice 1 inside a single-entrance zone, only that exit tile is reachable', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'drugstore', id: 'drugstore', path: ['13,15', 'drugstore'] },
      };
      const results = getAvailableSquares(playerInZone, 1);
      expect(results).toEqual([{ id: '13,15', row: 13, column: 15, place: null, path: ['13,15'] }]);
    });

    test('with dice 1 inside a multi-entrance zone, all exit tiles are reachable', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'park', id: 'park', path: ['7,7', 'park'] },
      };
      const results = getAvailableSquares(playerInZone, 1);
      expect(results).toEqual(
        expect.arrayContaining([
          { id: '7,7', row: 7, column: 7, place: null, path: ['7,7'] },
          { id: '10,10', row: 10, column: 10, place: null, path: ['10,10'] },
        ]),
      );
      expect(results).toHaveLength(2);
    });

    test('with dice 1 inside hotel, both exit tiles are reachable', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'hotel', id: 'hotel', path: ['7,2', 'hotel'] },
      };
      const results = getAvailableSquares(playerInZone, 1);
      expect(results).toEqual(
        expect.arrayContaining([
          { id: '7,2', row: 7, column: 2, place: null, path: ['7,2'] },
          { id: '11,0', row: 11, column: 0, place: null, path: ['11,0'] },
        ]),
      );
      expect(results).toHaveLength(2);
    });

    test('when inside carriage-station, offers teleport to every other zone', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'carriage-station', id: 'carriage-station', path: ['18,3', 'carriage-station'] },
      };
      const results = getAvailableSquares(playerInZone, 1);
      const expectedZones = ZONE_IDS.filter((zoneId) => zoneId !== 'carriage-station');

      expect(results).toHaveLength(expectedZones.length);
      for (const zoneId of expectedZones) {
        expect(results).toContainEqual({ id: zoneId, place: zoneId, path: [zoneId] });
      }
    });

    test('when inside carriage-station, does not offer grid tiles', () => {
      const playerInZone = {
        id: 1,
        name: 'John',
        color: 'blue',
        position: { place: 'carriage-station', id: 'carriage-station', path: ['carriage-station'] },
      };
      const results = getAvailableSquares(playerInZone, 3);
      expect(results.every((result) => result.place && !result.place.includes(','))).toBe(true);
    });
  });

  describe('hasAvailableSquare', () => {
    test('returns true when the id is present', () => {
      expect(hasAvailableSquare([{ id: '5,5' } as AvailableSquare], '5,5')).toBe(true);
    });

    test('returns false when the id is absent', () => {
      expect(hasAvailableSquare([{ id: '5,5' } as AvailableSquare], '7,7')).toBe(false);
    });

    test('returns false for an empty array', () => {
      expect(hasAvailableSquare([], '5,5')).toBe(false);
    });
  });
});

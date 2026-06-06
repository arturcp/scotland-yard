import { movePlayer, parseNotation, STEP_DURATION_MS } from './movement-animation';

const makePlayer = (id = 1) => ({
  id,
  name: 'John',
  color: 'blue',
  position: { row: 0, column: 0, place: null },
});

beforeEach(() => {
  document.body.innerHTML = '<div id="player-1"></div>';
});

afterEach(() => {
  vi.useRealTimers();
});

describe('movement animation', () => {
  describe('parseNotation', () => {
    test('parses row,column notation into a position object', () => {
      expect(parseNotation('5,3')).toEqual({ row: 5, column: 3, place: null });
    });

    test('parses a place name into a position object', () => {
      expect(parseNotation('hotel')).toEqual({ place: 'hotel' });
    });

    test('handles single-digit coordinates', () => {
      expect(parseNotation('0,0')).toEqual({ row: 0, column: 0, place: null });
    });

    test('handles multi-digit coordinates', () => {
      expect(parseNotation('18,22')).toEqual({ row: 18, column: 22, place: null });
    });
  });

  describe('movePlayer', () => {
    test('returns the parsed last position in the path', () => {
      const result = movePlayer(makePlayer(), [makePlayer()], ['3,2', '3,3', '4,3']);
      expect(result).toEqual({ row: 4, column: 3, place: null });
    });

    test('returns a single-step position correctly', () => {
      expect(movePlayer(makePlayer(), [makePlayer()], ['2,5'])).toEqual({
        row: 2,
        column: 5,
        place: null,
      });
    });

    test('updates the player pin top and left via DOM after each step', () => {
      vi.useFakeTimers();
      movePlayer(makePlayer(), [makePlayer()], ['1,2']);
      vi.runAllTimers();

      const pin = document.querySelector('#player-1') as HTMLElement;
      expect(pin.style.top).toBe('64.5px');
      expect(pin.style.left).toBe('113.5px');
    });

    test('animates each step with a STEP_DURATION_MS delay', () => {
      vi.useFakeTimers();
      const pin = document.querySelector('#player-1') as HTMLElement;

      movePlayer(makePlayer(), [makePlayer()], ['1,0', '2,0']);

      vi.advanceTimersByTime(0);
      expect(pin.style.top).toBe('64.5px');

      vi.advanceTimersByTime(STEP_DURATION_MS);
      expect(pin.style.top).toBe('113.5px');
    });

    test('returns zone destination keeping the traversed path', () => {
      const path = ['7,2', 'hotel'];
      expect(movePlayer(makePlayer(), [makePlayer()], path)).toEqual({
        place: 'hotel',
        id: 'hotel',
        path,
      });
    });
  });
});

import MovementAnimation, { STEP_DURATION_MS } from './movement-animation';

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

describe('MovementAnimation', () => {
  describe('parse', () => {
    test('parses row,column notation into a position object', () => {
      const anim = new MovementAnimation(makePlayer());
      expect(anim.parse('5,3')).toEqual({ row: 5, column: 3, place: null });
    });

    test('parses a place name into a position object', () => {
      const anim = new MovementAnimation(makePlayer());
      expect(anim.parse('hotel')).toEqual({ place: 'hotel' });
    });

    test('handles single-digit coordinates', () => {
      const anim = new MovementAnimation(makePlayer());
      expect(anim.parse('0,0')).toEqual({ row: 0, column: 0, place: null });
    });

    test('handles multi-digit coordinates', () => {
      const anim = new MovementAnimation(makePlayer());
      expect(anim.parse('18,22')).toEqual({ row: 18, column: 22, place: null });
    });
  });

  describe('move', () => {
    test('returns the parsed last position in the path', () => {
      const anim = new MovementAnimation(makePlayer());
      const result = anim.move(['3,2', '3,3', '4,3']);
      expect(result).toEqual({ row: 4, column: 3, place: null });
    });

    test('returns a single-step position correctly', () => {
      const anim = new MovementAnimation(makePlayer());
      expect(anim.move(['2,5'])).toEqual({ row: 2, column: 5, place: null });
    });

    test('updates the player pin top and left via DOM after each step', () => {
      vi.useFakeTimers();
      const anim = new MovementAnimation(makePlayer());
      anim.move(['1,2']);
      vi.runAllTimers();

      const pin = document.querySelector('#player-1') as HTMLElement;
      expect(pin.style.top).toBe('56px');
      expect(pin.style.left).toBe('110.5px');
    });

    test('animates each step with a STEP_DURATION_MS delay', () => {
      vi.useFakeTimers();
      const anim = new MovementAnimation(makePlayer());
      const pin = document.querySelector('#player-1') as HTMLElement;

      anim.move(['1,0', '2,0']);

      vi.advanceTimersByTime(0);
      expect(pin.style.top).toBe('56px');

      vi.advanceTimersByTime(STEP_DURATION_MS);
      expect(pin.style.top).toBe('105px');
    });

    test('returns zone destination keeping the traversed path', () => {
      const anim = new MovementAnimation(makePlayer());
      const path = ['7,2', 'docks'];
      expect(anim.move(path)).toEqual({ place: 'docks', id: 'docks', path });
    });
  });
});

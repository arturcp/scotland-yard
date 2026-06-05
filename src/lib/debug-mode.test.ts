import { isDebugMode } from './debug-mode';

describe('isDebugMode', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  test('returns true when debug=true is in the query string', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { search: '?debug=true' },
    });

    expect(isDebugMode()).toBe(true);
  });

  test('returns false when debug is absent', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { search: '' },
    });

    expect(isDebugMode()).toBe(false);
  });

  test('returns false when debug is not true', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { search: '?debug=false' },
    });

    expect(isDebugMode()).toBe(false);
  });
});

import AvailableSquares from './available-squares'

const makePlayer = (row = 0, column = 10) => ({
  id: 1,
  name: 'John',
  color: 'blue',
  position: { row, column, place: null },
})

describe('AvailableSquares', () => {
  describe('all', () => {
    test('returns an array', () => {
      const results = new AvailableSquares(makePlayer()).all(1)
      expect(Array.isArray(results)).toBe(true)
    })

    test('each result has id, row, column, and path', () => {
      const results = new AvailableSquares(makePlayer()).all(1)
      expect(results.length).toBeGreaterThan(0)
      for (const result of results) {
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('row')
        expect(result).toHaveProperty('column')
        expect(result).toHaveProperty('path')
        expect(Array.isArray(result.path)).toBe(true)
      }
    })

    test('does not include the starting position', () => {
      const results = new AvailableSquares(makePlayer(0, 10)).all(1)
      expect(results.some((r) => r.id === '0,10')).toBe(false)
    })

    test('returns only unique positions', () => {
      const results = new AvailableSquares(makePlayer()).all(3)
      const ids = results.map((r) => r.id)
      expect(ids.length).toBe(new Set(ids).size)
    })

    test('returns more squares for a higher dice roll', () => {
      const as = new AvailableSquares(makePlayer())
      const low = as.all(1).length
      const high = as.all(3).length
      expect(high).toBeGreaterThan(low)
    })

    test('path for each result leads from the starting position', () => {
      const results = new AvailableSquares(makePlayer(0, 10)).all(1)
      for (const result of results) {
        expect(result.path.length).toBeGreaterThan(0)
        expect(result.path[result.path.length - 1]).toBe(result.id)
      }
    })
  })

  describe('existInArray', () => {
    test('returns true when the id is present', () => {
      const as = new AvailableSquares(makePlayer())
      expect(as.existInArray([{ id: '5,5' }, { id: '6,6' }], '5,5')).toBe(true)
    })

    test('returns false when the id is absent', () => {
      const as = new AvailableSquares(makePlayer())
      expect(as.existInArray([{ id: '5,5' }], '7,7')).toBe(false)
    })

    test('returns false for an empty array', () => {
      const as = new AvailableSquares(makePlayer())
      expect(as.existInArray([], '5,5')).toBe(false)
    })
  })
})

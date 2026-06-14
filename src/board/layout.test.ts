import { describe, expect, test } from 'vitest';
import { getPiecePlacement, PIECE_SIZE, SQUARE_SIZE } from './layout';

function pieceBounds(index: number, count: number) {
  const { offsetX, offsetY, scale } = getPiecePlacement(index, count);
  const half = (PIECE_SIZE * scale) / 2;
  const centerX = SQUARE_SIZE / 2 + offsetX;
  const centerY = SQUARE_SIZE / 2 + offsetY;

  return {
    left: centerX - half,
    right: centerX + half,
    top: centerY - half,
    bottom: centerY + half,
  };
}

function assertAllPiecesFit(count: number) {
  for (let i = 0; i < count; i++) {
    const bounds = pieceBounds(i, count);
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(SQUARE_SIZE);
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThanOrEqual(SQUARE_SIZE);
  }
}

describe('getPiecePlacement', () => {
  test('single piece is centered at full scale', () => {
    expect(getPiecePlacement(0, 1)).toEqual({ offsetX: 0, offsetY: 0, scale: 1 });
  });

  test.each([2, 4, 6, 8])('fits %i pieces within tile bounds', (count) => {
    assertAllPiecesFit(count);
  });

  test('scales down when more than 4 pieces share a tile', () => {
    const placement = getPiecePlacement(0, 8);
    expect(placement.scale).toBeLessThan(1);
  });

  test('keeps full scale for up to 4 pieces', () => {
    for (let count = 2; count <= 4; count++) {
      expect(getPiecePlacement(0, count).scale).toBe(1);
    }
  });
});

import { cellKey } from './grid';

export interface BridgeEndpoint {
  row: number;
  column: number;
}

/**
 * Bidirectional bridge shortcuts between existing path tiles.
 * Coordinates use grid row/column (see cellKey); board labels may use column,row.
 */
const BRIDGE_PAIRS: [BridgeEndpoint, BridgeEndpoint][] = [
  [
    { row: 3, column: 4 },
    { row: 7, column: 2 },
  ],
];

const bridgeDestinations = new Map<string, BridgeEndpoint>();

for (const [a, b] of BRIDGE_PAIRS) {
  bridgeDestinations.set(cellKey(a.row, a.column), b);
  bridgeDestinations.set(cellKey(b.row, b.column), a);
}

export function bridgeDestination(row: number, column: number): BridgeEndpoint | undefined {
  return bridgeDestinations.get(cellKey(row, column));
}

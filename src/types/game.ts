export interface Position {
  row?: number;
  column?: number;
  place?: string | null;
  id?: string;
  path?: string[];
}

export interface Player {
  id: number;
  name: string;
  color: string;
  position: Position;
}

export interface AvailableSquare extends Position {
  id: string;
  path: string[];
}

export type GameShiftStatus = 'waiting' | 'in-progress';

export interface GameShiftState {
  status: GameShiftStatus;
  availableSquares: AvailableSquare[];
  playerId: number;
}

export interface GameShiftView {
  player: Player;
  availableSquares: AvailableSquare[];
  status: GameShiftStatus;
}

export interface GameController {
  gameShift: () => GameShiftView;
  updatePlayerPosition: (playerId: number, position: Position) => void;
  updateAvailableSquares: (availableSquares: AvailableSquare[]) => void;
}

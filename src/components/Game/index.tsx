import { useCallback, useState } from 'react';
import { ZONES } from '../../board';
import type { ZoneId } from '../../board/types';
import useIsDesktop from '../../hooks/useIsDesktop';
import { getAvailableSquares } from '../../lib/available-squares';
import Board from '../Board';
import Notes from '../Notes';
import Sidebar from '../Sidebar';
import MobileWarning from './MobileWarning';
import TopBar from './TopBar';
import type {
  AvailableSquare,
  GameController,
  GameShiftState,
  Player,
  Position,
} from '../../types/game';

import './styles.css';

const INITIAL_PLAYERS: Player[] = [
  { id: 1, name: 'John', color: 'blue', position: { row: 10, column: 10, place: null } },
  { id: 2, name: 'Jane', color: 'yellow', position: { row: 10, column: 10, place: null } },
  { id: 3, name: 'Josh', color: 'brown', position: { row: 10, column: 10, place: null } },
  { id: 4, name: 'Joan', color: 'lightpink', position: { row: 10, column: 10, place: null } },
];

const INITIAL_GAME_SHIFT: GameShiftState = {
  status: 'waiting',
  availableSquares: [],
  playerId: 1,
  diceResult: null,
};

export default function Game() {
  const isDesktop = useIsDesktop();
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [gameShift, setGameShift] = useState<GameShiftState>(INITIAL_GAME_SHIFT);
  const [notesByPlayer, setNotesByPlayer] = useState<Record<number, string>>({});
  const [visitedZonesByPlayer, setVisitedZonesByPlayer] = useState<Record<number, ZoneId[]>>({});
  const [rolling, setRolling] = useState(false);

  const handleRollComplete = useCallback(
    (diceResult: number) => {
      const player = players.find((p) => p.id === gameShift.playerId)!;
      const results = getAvailableSquares(player, diceResult);
      setGameShift((prev) => ({
        ...prev,
        availableSquares: results,
        status: 'in-progress',
        diceResult,
      }));
      setRolling(false);
    },
    [gameShift.playerId, players],
  );

  function updatePlayerPosition(playerId: number, position: Position) {
    const zoneId = position.place as ZoneId | null | undefined;
    const zone = zoneId ? ZONES[zoneId] : null;
    const visited = visitedZonesByPlayer[playerId] ?? [];
    const isNewZoneVisit = !!zone && !visited.includes(zoneId as ZoneId);

    if (isNewZoneVisit && zoneId && zone) {
      window.alert(`Puzzle: ${zone.puzzleId}`);
      setVisitedZonesByPlayer((prev) => ({
        ...prev,
        [playerId]: [...(prev[playerId] ?? []), zoneId as ZoneId],
      }));
      setNotesByPlayer((prev) => {
        const previous = prev[playerId] ?? '';
        const updated = previous ? `${previous}\n${zone.clueText}` : zone.clueText;
        return { ...prev, [playerId]: updated };
      });
    }

    setPlayers((prev) =>
      prev.map((player) => (player.id === playerId ? { ...player, position } : player)),
    );
    setGameShift((prev) => ({
      availableSquares: [],
      playerId: prev.playerId,
      status: 'waiting',
      diceResult: null,
    }));
  }

  function updateAvailableSquares(availableSquares: AvailableSquare[], diceResult: number) {
    setGameShift((prev) => ({ ...prev, availableSquares, status: 'in-progress', diceResult }));
  }

  function updateNotes(playerId: number, notes: string) {
    setNotesByPlayer((prev) => ({ ...prev, [playerId]: notes }));
  }

  const game: GameController = {
    gameShift: () => ({
      player: players.find((p) => p.id === gameShift.playerId)!,
      availableSquares: gameShift.availableSquares,
      status: gameShift.status,
      diceResult: gameShift.diceResult,
      players,
    }),
    updatePlayerPosition,
    updateAvailableSquares,
  };

  const activePlayerId = gameShift.playerId;
  const notes = notesByPlayer[activePlayerId] ?? '';

  if (!isDesktop) {
    return <MobileWarning />;
  }

  return (
    <div id="container">
      <div id="vignette" aria-hidden="true" />
      <Sidebar game={game} rolling={rolling} onRollStart={() => setRolling(true)} />
      <main id="main-content">
        <TopBar />
        <div id="board-spotlight">
          <Board
            players={players}
            game={game}
            rolling={rolling}
            onRollComplete={handleRollComplete}
          />
        </div>
      </main>
      <Notes notes={notes} onNotesChange={(value) => updateNotes(activePlayerId, value)} />
    </div>
  );
}

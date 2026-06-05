import { useState } from 'react';
import { ZONES } from '../../board';
import type { ZoneId } from '../../board/types';
import Board from '../Board';
import Notes from '../Notes';
import Sidebar from '../Sidebar';
import type { AvailableSquare, GameController, GameShiftState, Player, Position } from '../../types/game';

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
};

export default function Game() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [gameShift, setGameShift] = useState<GameShiftState>(INITIAL_GAME_SHIFT);
  const [notesByPlayer, setNotesByPlayer] = useState<Record<number, string>>({});
  const [visitedZonesByPlayer, setVisitedZonesByPlayer] = useState<Record<number, ZoneId[]>>({});

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
    setGameShift((prev) => ({ availableSquares: [], playerId: prev.playerId, status: 'waiting' }));
  }

  function updateAvailableSquares(availableSquares: AvailableSquare[]) {
    setGameShift((prev) => ({ ...prev, availableSquares, status: 'in-progress' }));
  }

  function updateNotes(playerId: number, notes: string) {
    setNotesByPlayer((prev) => ({ ...prev, [playerId]: notes }));
  }

  const game: GameController = {
    gameShift: () => ({
      player: players.find((p) => p.id === gameShift.playerId)!,
      availableSquares: gameShift.availableSquares,
      status: gameShift.status,
      players,
    }),
    updatePlayerPosition,
    updateAvailableSquares,
  };

  const activePlayerId = gameShift.playerId;
  const notes = notesByPlayer[activePlayerId] ?? '';

  return (
    <div id="container">
      <Sidebar players={players} game={game} />
      <Board players={players} game={game} />
      <Notes notes={notes} onNotesChange={(value) => updateNotes(activePlayerId, value)} />
    </div>
  );
}

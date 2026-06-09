import { render, screen } from '@testing-library/react';
import PlayersModal from './index';
import type { Player } from '../../types/game';

const players: Player[] = [
  {
    id: 1,
    name: 'Alice',
    color: 'blue',
    connected: true,
    eliminated: false,
    position: { row: 0, column: 0, place: 'museum' },
  },
  {
    id: 2,
    name: 'Bob',
    color: 'yellow',
    connected: true,
    eliminated: false,
    position: { row: 0, column: 0, place: 'holmes-house' },
  },
];

describe('PlayersModal', () => {
  test('shows which player is currently on their turn', () => {
    render(<PlayersModal players={players} turnOrder={[1, 2]} activePlayerId={1} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Jogando')).toBeInTheDocument();
    expect(screen.queryByText('Eliminado')).not.toBeInTheDocument();
  });

  test('does not show an active player when no one is on their turn', () => {
    render(<PlayersModal players={players} turnOrder={[1, 2]} activePlayerId={null} />);

    expect(screen.queryByText('Jogando')).not.toBeInTheDocument();
  });
});

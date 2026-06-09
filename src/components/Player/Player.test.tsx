import { render } from '@testing-library/react';
import Player from './index';

const player = {
  id: 2,
  name: 'Jane',
  color: 'yellow',
  position: { row: 3, column: 5, place: null },
};

describe('Player', () => {
  test('renders with the correct id', () => {
    const { container } = render(<Player player={player} style={{}} />);
    expect(container.querySelector('#player-2')).toBeInTheDocument();
  });

  test('applies the player color as a class', () => {
    const { container } = render(<Player player={player} style={{}} />);
    expect(container.querySelector('.player')).toHaveClass('yellow');
  });

  test('renders the user icon', () => {
    const { container } = render(<Player player={player} style={{}} />);
    expect(container.querySelector('.lucide-user-round')).toBeInTheDocument();
  });

  test('applies color to the rendered style', () => {
    const { container } = render(<Player player={player} style={{ top: 10, left: 20 }} />);
    const el = container.querySelector('#player-2') as HTMLElement;
    expect(el.style.color).toBe('rgb(250, 204, 21)');
  });
});

import { render } from '@testing-library/react';
import Game from './index';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

beforeAll(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Game', () => {
  test('renders the main container', () => {
    const { container } = render(<Game />);
    expect(container.querySelector('#container')).toBeInTheDocument();
  });

  test('renders the board', () => {
    const { container } = render(<Game />);
    expect(container.querySelector('#board')).toBeInTheDocument();
  });

  test('renders the sidebar', () => {
    const { container } = render(<Game />);
    expect(container.querySelector('#sidebar')).toBeInTheDocument();
  });

  test('renders the notes modal', () => {
    const { container } = render(<Game />);
    expect(container.querySelector('#modal-notes')).toBeInTheDocument();
  });

  test('renders all 4 players', () => {
    const { container } = render(<Game />);
    expect(container.querySelectorAll('[id^="player-"]')).toHaveLength(4);
  });

  test('play button starts with pulsate-fwd class', () => {
    const { container } = render(<Game />);
    expect(container.querySelector('.fa-play')).toHaveClass('pulsate-fwd');
  });
});

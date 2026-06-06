import { render, screen } from '@testing-library/react';
import Game from './index';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

function mockDesktopViewport(isDesktop: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isDesktop,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('Game', () => {
  beforeEach(() => {
    mockDesktopViewport(true);
  });

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

  test('dice button starts with pulsate-fwd class', () => {
    const { container } = render(<Game />);
    expect(container.querySelector('.dice-roll-trigger')).toHaveClass('pulsate-fwd');
  });

  test('shows mobile warning on small viewports', () => {
    mockDesktopViewport(false);
    const { container } = render(<Game />);

    expect(container.querySelector('#mobile-warning')).toBeInTheDocument();
    expect(container.querySelector('#container')).not.toBeInTheDocument();
    expect(screen.getByText('Apenas para desktop')).toBeInTheDocument();
    expect(
      screen.getByText(/Este jogo foi desenvolvido para ser jogado em computadores/i),
    ).toBeInTheDocument();
  });
});

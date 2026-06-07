import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Game from './index';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

vi.mock('../../hooks/useGameSocket', () => ({
  useGameSocket: () => ({
    connected: false,
    connecting: false,
    error: null,
    room: null,
    playerId: null,
    notes: [],
    caseFields: [],
    turnOrderRolls: [],
    turnBanner: null,
    verifyingMessage: null,
    gameOverMessage: null,
    lastDiceRoll: null,
    remoteMove: null,
    officialSolution: null,
    solutionNarrative: null,
    lastSubmittedAnswers: null,
    join: vi.fn(),
    reconnect: vi.fn(),
    startGame: vi.fn(),
    rollDice: vi.fn(),
    move: vi.fn(),
    updateNotes: vi.fn(),
    submitSolution: vi.fn(),
    revealSolution: vi.fn(),
    clearRemoteMove: vi.fn(),
    clearTurnBanner: vi.fn(),
    clearLastDiceRoll: vi.fn(),
    phase: null,
    shift: undefined,
    players: [],
    visiblePlayers: [],
    isMyTurn: false,
    canInteract: false,
    showDice: false,
    isCreator: false,
    activePlayers: [],
  }),
}));

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

function renderGame() {
  return render(
    <MemoryRouter>
      <Game roomCode="ABC123" />
    </MemoryRouter>,
  );
}

describe('Game', () => {
  beforeEach(() => {
    mockDesktopViewport(true);
  });

  test('renders the lobby before joining a room', () => {
    renderGame();
    expect(screen.getByText('Sala ABC123')).toBeInTheDocument();
  });

  test('shows mobile warning on small viewports', () => {
    mockDesktopViewport(false);
    const { container } = renderGame();

    expect(container.querySelector('#mobile-warning')).toBeInTheDocument();
    expect(screen.getByText('Apenas para desktop')).toBeInTheDocument();
    expect(
      screen.getByText(/Este jogo foi desenvolvido para ser jogado em computadores/i),
    ).toBeInTheDocument();
  });
});

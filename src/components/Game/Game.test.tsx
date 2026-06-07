import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Game from './index';

vi.mock('micromodal', () => ({ default: { init: vi.fn() } }));

const mockUseGameSocket = vi.hoisted(() => vi.fn());

vi.mock('../../hooks/useGameSocket', () => ({
  useGameSocket: mockUseGameSocket,
}));

function defaultSocketState() {
  return {
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
    rollTurnOrderDice: vi.fn(),
    rollDice: vi.fn(),
    showTurnOrderDice: false,
    move: vi.fn(),
    updateNotes: vi.fn(),
    submitSolution: vi.fn(),
    revealSolution: vi.fn(),
    leaveGame: vi.fn(),
    leftGame: false,
    roomClosed: false,
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
  };
}

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
    mockUseGameSocket.mockReturnValue(defaultSocketState());
  });

  test('renders the lobby before joining a room', () => {
    renderGame();
    expect(screen.getByText('Sala ABC123')).toBeInTheDocument();
  });

  test('shows turn order roll prompt when it is the player turn to roll', async () => {
    const user = userEvent.setup();

    mockUseGameSocket.mockReturnValue({
      ...defaultSocketState(),
      connected: true,
      phase: 'turnOrder',
      playerId: 1,
      showTurnOrderDice: true,
      caseFields: [
        { key: 'who', label: 'Quem cometeu o crime?' },
        { key: 'where', label: 'Onde o crime aconteceu?' },
      ],
      room: {
        code: 'ABC123',
        phase: 'turnOrder',
        creatorId: 1,
        caseTitle: 'O Mistério',
        caseIntro: 'Um caso intrigante.',
        turnOrderPendingIds: [1, 2],
        turnOrderRolls: [],
        players: [
          { id: 1, name: 'Alice', color: 'blue', connected: true, eliminated: false, position: null },
          { id: 2, name: 'Bob', color: 'yellow', connected: true, eliminated: false, position: null },
        ],
        shift: { status: 'waiting', playerId: 0, availableSquares: [], diceResult: null },
      },
    });

    renderGame();

    expect(screen.getByText('Perguntas a responder')).toBeInTheDocument();
    expect(screen.getByText('Quem cometeu o crime?')).toBeInTheDocument();
    expect(screen.getByText(/barra lateral/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Começar investigação' }));

    expect(screen.getByRole('button', { name: 'Rolar dado' })).toBeInTheDocument();
    expect(screen.getByText(/Role o dado para entrar na fila/i)).toBeInTheDocument();
  });

  test('reopens the case from the sidebar during play', async () => {
    const user = userEvent.setup();

    mockUseGameSocket.mockReturnValue({
      ...defaultSocketState(),
      connected: true,
      phase: 'playing',
      playerId: 1,
      caseFields: [{ key: 'who', label: 'Quem cometeu o crime?' }],
      room: {
        code: 'ABC123',
        phase: 'playing',
        creatorId: 1,
        caseTitle: 'O Mistério',
        caseIntro: 'Um caso intrigante.',
        turnOrderPendingIds: [],
        turnOrderRolls: [],
        players: [
          {
            id: 1,
            name: 'Alice',
            color: 'blue',
            connected: true,
            eliminated: false,
            position: { row: 0, column: 0, place: 'holmes-house' },
          },
        ],
        visitedZonesByPlayer: {},
        shift: { status: 'waiting', playerId: 1, availableSquares: [], diceResult: null },
      },
    });

    renderGame();

    await user.click(screen.getByTestId('show-case-trigger'));

    expect(screen.getByText('Um caso intrigante.')).toBeInTheDocument();
    expect(screen.getByText('Quem cometeu o crime?')).toBeInTheDocument();
    expect(screen.queryByText(/menu Caso na barra lateral/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
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

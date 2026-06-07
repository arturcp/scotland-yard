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
    pendingClue: null,
    pendingLockedZone: null,
    masterKeysRemaining: 0,
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
    passTurn: vi.fn(),
    lockZone: vi.fn(),
    resolveLockedZone: vi.fn(),
    setMasterKeysPerPlayer: vi.fn(),
    updateNotes: vi.fn(),
    submitSolution: vi.fn(),
    revealSolution: vi.fn(),
    leaveGame: vi.fn(),
    leftGame: false,
    roomClosed: false,
    clearRemoteMove: vi.fn(),
    clearTurnBanner: vi.fn(),
    clearLastDiceRoll: vi.fn(),
    clearPendingClue: vi.fn(),
    clearPendingLockedZone: vi.fn(),
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
        turnOrder: [],
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

  test('shows turn order summary after all players roll', async () => {
    const user = userEvent.setup();
    const baseRoom = {
      code: 'ABC123',
      phase: 'turnOrder' as const,
      creatorId: 1,
      caseTitle: 'O Mistério',
      caseIntro: 'Um caso intrigante.',
      turnOrder: [2, 1],
      turnOrderPendingIds: [],
      turnOrderRolls: [
        { playerId: 1, playerName: 'Alice', value: 4 },
        { playerId: 2, playerName: 'Bob', value: 6 },
      ],
      visitedZonesByPlayer: {},
      lockedZones: {},
      masterKeysPerPlayer: 2,
      masterKeysRemainingByPlayer: {},
      players: [
        { id: 1, name: 'Alice', color: 'blue', connected: true, eliminated: false, position: null },
        { id: 2, name: 'Bob', color: 'yellow', connected: true, eliminated: false, position: null },
      ],
      shift: { status: 'waiting' as const, playerId: 0, availableSquares: [], diceResult: null },
    };

    mockUseGameSocket.mockReturnValue({
      ...defaultSocketState(),
      connected: true,
      phase: 'turnOrder',
      playerId: 1,
      turnOrderRolls: baseRoom.turnOrderRolls,
      room: baseRoom,
    });

    const { rerender } = render(
      <MemoryRouter>
        <Game roomCode="ABC123" />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Começar investigação' }));

    mockUseGameSocket.mockReturnValue({
      ...defaultSocketState(),
      connected: true,
      phase: 'playing',
      playerId: 1,
      turnOrderRolls: baseRoom.turnOrderRolls,
      turnBanner: 'Bob está jogando',
      room: {
        ...baseRoom,
        phase: 'playing' as const,
        shift: { status: 'waiting' as const, playerId: 2, availableSquares: [], diceResult: null },
        players: [
          {
            id: 1,
            name: 'Alice',
            color: 'blue',
            connected: true,
            eliminated: false,
            position: { row: 0, column: 0, place: 'holmes-house' },
          },
          {
            id: 2,
            name: 'Bob',
            color: 'yellow',
            connected: true,
            eliminated: false,
            position: { row: 0, column: 0, place: 'holmes-house' },
          },
        ],
      },
    });

    rerender(
      <MemoryRouter>
        <Game roomCode="ABC123" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Ordem de jogada definida')).toBeInTheDocument();
    expect(screen.getByText('Bob começa a investigação.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Começar investigação' })).toBeInTheDocument();
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
        turnOrder: [],
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

  test('shows the clue modal when a new clue is discovered', () => {
    mockUseGameSocket.mockReturnValue({
      ...defaultSocketState(),
      connected: true,
      phase: 'playing',
      playerId: 1,
      pendingClue: {
        zoneId: 'museum',
        zoneName: 'Museu',
        text: 'Uma pista importante.',
      },
      masterKeysRemaining: 2,
      room: {
        code: 'ABC123',
        phase: 'playing',
        creatorId: 1,
        caseTitle: 'O Mistério',
        caseIntro: 'Um caso intrigante.',
        masterKeysPerPlayer: 2,
        masterKeysRemainingByPlayer: { 1: 2 },
        lockedZones: {},
        pendingLockedZoneEntry: null,
        turnOrderPendingIds: [],
        turnOrderRolls: [],
        turnOrder: [],
        players: [
          {
            id: 1,
            name: 'Alice',
            color: 'blue',
            connected: true,
            eliminated: false,
            position: { row: 0, column: 0, place: 'museum' },
          },
        ],
        visitedZonesByPlayer: { 1: ['museum'] },
        shift: { status: 'awaiting-clue', playerId: 1, availableSquares: [], diceResult: null },
      },
    });

    renderGame();

    expect(screen.getByRole('heading', { name: 'Museu' })).toBeInTheDocument();
    expect(screen.getByText('Uma pista importante.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Passar turno' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trancar zona' })).toBeInTheDocument();
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

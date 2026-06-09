import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { GameController, GameShiftStatus, Player } from '../../types/game';
import Sidebar from './index';

const mockMicroModalShow = vi.hoisted(() => vi.fn());

vi.mock('micromodal', () => ({ default: { show: mockMicroModalShow } }));

const players: Player[] = [
  { id: 1, name: 'John', color: 'blue', position: { row: 0, column: 0, place: null } },
];

const makeGame = (
  status: GameShiftStatus = 'waiting',
  diceResult: number | null = null,
): GameController => ({
  gameShift: () => ({ player: players[0], availableSquares: [], status, players, diceResult }),
  updateAvailableSquares: vi.fn(),
  updatePlayerPosition: vi.fn(),
});

const defaultProps = {
  rolling: false,
  showDice: true,
  onRollStart: vi.fn(),
};

function renderSidebar(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Sidebar', () => {
  beforeEach(() => {
    mockMicroModalShow.mockClear();
  });

  describe('rendering', () => {
    test('renders the sidebar element', () => {
      const { container } = renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('#sidebar')).toBeInTheDocument();
    });

    test('renders the notes icon', () => {
      const { container } = renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('.lucide-file-text')).toBeInTheDocument();
    });

    test('renders the players icon', () => {
      const { container } = renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('.lucide-users')).toBeInTheDocument();
    });

    test('renders the case button when showCase is true', () => {
      const onShowCase = vi.fn();
      renderSidebar(
        <Sidebar game={makeGame()} {...defaultProps} showCase onShowCase={onShowCase} />,
      );
      expect(screen.getByTestId('show-case-trigger')).toBeInTheDocument();
      expect(screen.getByText('Caso')).toBeInTheDocument();
    });

    test('hides the case button when showCase is false', () => {
      renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(screen.queryByTestId('show-case-trigger')).not.toBeInTheDocument();
    });

    test('renders the help icon', () => {
      const { container } = renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(container.querySelector('.lucide-circle-question-mark')).toBeInTheDocument();
    });

    test('renders the dice roll trigger when showDice is true', () => {
      renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(screen.getByTestId('dice-roll-trigger')).toBeInTheDocument();
    });

    test('hides the dice roll trigger when showDice is false', () => {
      renderSidebar(<Sidebar game={makeGame()} {...defaultProps} showDice={false} />);
      expect(screen.queryByTestId('dice-roll-trigger')).not.toBeInTheDocument();
    });

    test('renders the Scotland Yard title', () => {
      renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(screen.getByText('Scotland Yard')).toBeInTheDocument();
    });

    test('links the header to the home page', () => {
      renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      expect(screen.getByRole('link', { name: 'Voltar para a página inicial' })).toHaveAttribute(
        'href',
        '/',
      );
    });
  });

  describe('modal triggers', () => {
    test('opens the notes modal when clicked', () => {
      renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      fireEvent.click(screen.getByTestId('show-notes-trigger'));
      expect(mockMicroModalShow).toHaveBeenCalledWith('modal-notes');
    });

    test('opens the players modal when clicked', () => {
      renderSidebar(<Sidebar game={makeGame()} {...defaultProps} />);
      fireEvent.click(screen.getByTestId('show-players-trigger'));
      expect(mockMicroModalShow).toHaveBeenCalledWith('modal-players');
    });
  });

  describe('dice button classes', () => {
    test('has pulsate-fwd class when game status is waiting', () => {
      renderSidebar(<Sidebar game={makeGame('waiting')} {...defaultProps} />);
      expect(screen.getByTestId('dice-roll-trigger')).toHaveClass('pulsate-fwd');
    });

    test('does not have pulsate-fwd class when game status is in-progress', () => {
      renderSidebar(<Sidebar game={makeGame('in-progress')} {...defaultProps} />);
      expect(screen.getByTestId('dice-roll-trigger')).not.toHaveClass('pulsate-fwd');
    });
  });

  describe('case button click', () => {
    test('calls onShowCase when clicked', () => {
      const onShowCase = vi.fn();
      renderSidebar(
        <Sidebar game={makeGame()} {...defaultProps} showCase onShowCase={onShowCase} />,
      );
      fireEvent.click(screen.getByTestId('show-case-trigger'));
      expect(onShowCase).toHaveBeenCalledTimes(1);
    });
  });

  describe('dice button click', () => {
    test('calls onRollStart when clicked', () => {
      const onRollStart = vi.fn();
      renderSidebar(
        <Sidebar game={makeGame('waiting')} rolling={false} showDice onRollStart={onRollStart} />,
      );
      fireEvent.click(screen.getByTestId('dice-roll-trigger'));
      expect(onRollStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('dice result badge', () => {
    test('shows the rolled value on the dice icon', () => {
      renderSidebar(<Sidebar game={makeGame('in-progress', 4)} {...defaultProps} />);
      expect(screen.getByTestId('dice-result-badge')).toHaveTextContent('4');
    });

    test('hides the badge when there is no active dice result', () => {
      renderSidebar(<Sidebar game={makeGame('waiting', null)} {...defaultProps} />);
      expect(screen.queryByTestId('dice-result-badge')).not.toBeInTheDocument();
    });
  });
});

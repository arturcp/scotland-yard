import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClueModal from './index';

describe('ClueModal', () => {
  test('shows pass turn and lock zone actions', async () => {
    const user = userEvent.setup();
    const onPassTurn = vi.fn();
    const onLockZone = vi.fn();

    render(
      <ClueModal
        clue={{ zoneName: 'Museu', text: 'Uma pista importante.' }}
        masterKeysRemaining={2}
        onPassTurn={onPassTurn}
        onLockZone={onLockZone}
      />,
    );

    expect(screen.getByText(/Chaves-mestras disponíveis/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Passar turno' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trancar zona' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Passar turno' }));
    expect(onPassTurn).toHaveBeenCalledTimes(1);
  });

  test('disables lock zone when there are no keys', () => {
    render(
      <ClueModal
        clue={{ zoneName: 'Teatro', text: 'Outra pista.' }}
        masterKeysRemaining={0}
        onPassTurn={vi.fn()}
        onLockZone={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Trancar zona' })).toBeDisabled();
  });
});

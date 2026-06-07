import { fireEvent, render } from '@testing-library/react';
import Notes from './index';
import type { NoteEntry } from '../../types/game';

describe('Notes', () => {
  const onCustomNotesChange = vi.fn();

  test('renders the notes modal', () => {
    const { container } = render(
      <Notes
        visitedZones={[]}
        clueNotes={[]}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    expect(container.querySelector('#modal-notes')).toBeInTheDocument();
  });

  test('renders the title', () => {
    const { getByText } = render(
      <Notes
        visitedZones={[]}
        clueNotes={[]}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    expect(getByText('Notas')).toBeInTheDocument();
  });

  test('renders visited places', () => {
    const { getByText } = render(
      <Notes
        visitedZones={['museum', 'bar']}
        clueNotes={[]}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    expect(getByText('Locais visitados')).toBeInTheDocument();
    expect(getByText('Museu')).toBeInTheDocument();
    expect(getByText('Bar')).toBeInTheDocument();
  });

  test('renders collected clues', () => {
    const clueNotes: NoteEntry[] = [
      {
        kind: 'clue',
        zoneId: 'museum',
        zoneName: 'Museu',
        text: 'Uma pista importante.',
        at: '2026-01-01T00:00:00.000Z',
      },
    ];

    const { getByText } = render(
      <Notes
        visitedZones={['museum']}
        clueNotes={clueNotes}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    expect(getByText('Pistas coletadas')).toBeInTheDocument();
    expect(getByText('Uma pista importante.')).toBeInTheDocument();
  });

  test('renders empty state when nothing collected yet', () => {
    const { getByText } = render(
      <Notes
        visitedZones={[]}
        clueNotes={[]}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    expect(getByText('Nenhum local visitado ou pista coletada ainda.')).toBeInTheDocument();
  });

  test('renders the textarea', () => {
    const { container } = render(
      <Notes
        visitedZones={[]}
        clueNotes={[]}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    expect(container.querySelector('.notes__editor')).toBeInTheDocument();
  });

  test('textarea is empty by default', () => {
    const { container } = render(
      <Notes
        visitedZones={[]}
        clueNotes={[]}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    expect((container.querySelector('.notes__editor') as HTMLTextAreaElement).value).toBe('');
  });

  test('textarea updates when typed into', () => {
    const { container } = render(
      <Notes
        visitedZones={[]}
        clueNotes={[]}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    const textarea = container.querySelector('.notes__editor') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test note' } });
    expect(onCustomNotesChange).toHaveBeenCalledWith('test note');
  });

  test('renders close button', () => {
    const { getByText } = render(
      <Notes
        visitedZones={[]}
        clueNotes={[]}
        customText=""
        onCustomNotesChange={onCustomNotesChange}
      />,
    );
    expect(getByText('Fechar')).toBeInTheDocument();
  });
});

import { fireEvent, render } from '@testing-library/react';
import Notes from './index';

describe('Notes', () => {
  const onCustomNotesChange = vi.fn();

  test('renders the notes modal', () => {
    const { container } = render(
      <Notes clueNotes={[]} customText="" onCustomNotesChange={onCustomNotesChange} />,
    );
    expect(container.querySelector('#modal-notes')).toBeInTheDocument();
  });

  test('renders the title', () => {
    const { getByText } = render(
      <Notes clueNotes={[]} customText="" onCustomNotesChange={onCustomNotesChange} />,
    );
    expect(getByText('Notas')).toBeInTheDocument();
  });

  test('renders the textarea', () => {
    const { container } = render(
      <Notes clueNotes={[]} customText="" onCustomNotesChange={onCustomNotesChange} />,
    );
    expect(container.querySelector('.notes__editor')).toBeInTheDocument();
  });

  test('textarea is empty by default', () => {
    const { container } = render(
      <Notes clueNotes={[]} customText="" onCustomNotesChange={onCustomNotesChange} />,
    );
    expect((container.querySelector('.notes__editor') as HTMLTextAreaElement).value).toBe('');
  });

  test('textarea updates when typed into', () => {
    const { container } = render(
      <Notes clueNotes={[]} customText="" onCustomNotesChange={onCustomNotesChange} />,
    );
    const textarea = container.querySelector('.notes__editor') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test note' } });
    expect(onCustomNotesChange).toHaveBeenCalledWith('test note');
  });

  test('renders close button', () => {
    const { getByText } = render(
      <Notes clueNotes={[]} customText="" onCustomNotesChange={onCustomNotesChange} />,
    );
    expect(getByText('Fechar')).toBeInTheDocument();
  });
});

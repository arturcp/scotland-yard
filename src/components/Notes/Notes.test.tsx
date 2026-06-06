import { fireEvent, render } from '@testing-library/react';
import Notes from './index';

describe('Notes', () => {
  const onNotesChange = vi.fn();

  test('renders the notes modal', () => {
    const { container } = render(<Notes notes="" onNotesChange={onNotesChange} />);
    expect(container.querySelector('#modal-notes')).toBeInTheDocument();
  });

  test('renders the title', () => {
    const { getByText } = render(<Notes notes="" onNotesChange={onNotesChange} />);
    expect(getByText('Notas')).toBeInTheDocument();
  });

  test('renders the textarea', () => {
    const { container } = render(<Notes notes="" onNotesChange={onNotesChange} />);
    expect(container.querySelector('.notes__editor')).toBeInTheDocument();
  });

  test('textarea is empty by default', () => {
    const { container } = render(<Notes notes="" onNotesChange={onNotesChange} />);
    expect((container.querySelector('.notes__editor') as HTMLTextAreaElement).value).toBe('');
  });

  test('textarea updates when typed into', () => {
    const { container } = render(<Notes notes="" onNotesChange={onNotesChange} />);
    const textarea = container.querySelector('.notes__editor') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test note' } });
    expect(onNotesChange).toHaveBeenCalledWith('test note');
  });

  test('renders save and close buttons', () => {
    const { getByText } = render(<Notes notes="" onNotesChange={onNotesChange} />);
    expect(getByText('Salvar')).toBeInTheDocument();
    expect(getByText('Close')).toBeInTheDocument();
  });
});

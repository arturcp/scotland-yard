import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import CaseIntro from './index';

describe('CaseIntro', () => {
  test('renders plain text as paragraphs', () => {
    render(<CaseIntro text={'Primeiro trecho.\n\nSegundo trecho.'} textClassName="intro" />);

    expect(screen.getByText(/Primeiro trecho\./)).toHaveClass('intro');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('replaces the image marker with an image in the same position', () => {
    const { container } = render(
      <CaseIntro
        text={'Antes da imagem.\n\n{{image:/images/cases/caso-113.png}}\n\nDepois da imagem.'}
      />,
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/images/cases/caso-113.png');
    expect(container.textContent).not.toContain('{{');
    expect(container.textContent).not.toContain('image:');

    const children = Array.from(container.children).map((child) => child.tagName);
    expect(children).toEqual(['P', 'IMG', 'P']);
  });
});

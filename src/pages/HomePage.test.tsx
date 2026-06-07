import { fireEvent, render, screen, within } from '@testing-library/react';
import HomePage from './HomePage';

function renderHomePage() {
  return render(<HomePage />);
}

describe('HomePage', () => {
  describe('page structure', () => {
    test('renders the main landmark', () => {
      renderHomePage();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('renders all anchor sections', () => {
      renderHomePage();

      expect(document.getElementById('como-funciona')).toBeInTheDocument();
      expect(document.getElementById('deducao')).toBeInTheDocument();
      expect(document.getElementById('ambientacao')).toBeInTheDocument();
      expect(document.getElementById('regras')).toBeInTheDocument();
      expect(document.getElementById('cta-final')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    test('renders the site nav with section links', () => {
      renderHomePage();

      const nav = within(screen.getByRole('banner')).getByRole('navigation');
      expect(within(nav).getByRole('link', { name: 'Como Jogar' })).toHaveAttribute(
        'href',
        '#como-funciona',
      );
      expect(within(nav).getByRole('link', { name: 'A Dedução' })).toHaveAttribute('href', '#deducao');
      expect(within(nav).getByRole('link', { name: 'Ambientação' })).toHaveAttribute(
        'href',
        '#ambientacao',
      );
      expect(within(nav).getByRole('link', { name: 'Regras' })).toHaveAttribute('href', '#regras');
    });

    test('renders footer links to legal pages', () => {
      renderHomePage();

      const footer = screen.getByRole('contentinfo');
      expect(within(footer).getByRole('link', { name: 'Termos' })).toHaveAttribute(
        'href',
        '/termos',
      );
      expect(within(footer).getByRole('link', { name: 'Privacidade' })).toHaveAttribute(
        'href',
        '/privacidade',
      );
      expect(within(footer).getByRole('link', { name: 'Créditos' })).toHaveAttribute(
        'href',
        '/creditos',
      );
    });
  });

  describe('hero', () => {
    test('renders the headline and intro copy', () => {
      renderHomePage();

      expect(
        screen.getByRole('heading', { level: 1, name: 'Londres precisa novamente de você.' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Quartel-general dos detetives')).toBeInTheDocument();
      expect(
        screen.getByText(/Reúna seus amigos, assuma o papel dos detetives de Scotland Yard/),
      ).toBeInTheDocument();
    });

    test('renders create-room and join-room controls', () => {
      renderHomePage();

      expect(screen.getAllByRole('link', { name: /Criar Sala/i }).length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByLabelText('Código da sala')).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: 'Entrar' })).toHaveLength(2);
    });
  });

  describe('how it works', () => {
    test('renders the three investigation steps', () => {
      renderHomePage();

      expect(screen.getByRole('heading', { level: 2, name: 'Como funciona' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Crie uma sala' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Escolha seu papel' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Investigue' })).toBeInTheDocument();
    });
  });

  describe('content sections', () => {
    test('renders the Holmes quote banner', () => {
      renderHomePage();

      expect(
        screen.getByText(/Quando você elimina o impossível, o que resta/),
      ).toBeInTheDocument();
      expect(screen.getByText('— Sherlock Holmes')).toBeInTheDocument();
    });

    test('renders the deduction and ambiance sections', () => {
      renderHomePage();

      expect(
        screen.getByRole('heading', { level: 2, name: 'A arte da dedução' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Explore uma Londres cheia de mistérios',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByAltText('Ruas enevoadas da Londres vitoriana iluminadas por lampiões a gás'),
      ).toBeInTheDocument();
    });

    test('renders why-play reasons and case stats', () => {
      renderHomePage();

      expect(screen.getByRole('heading', { level: 2, name: 'Por que jogar?' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Estratégia' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Dedução' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Blefe' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Cooperação' })).toBeInTheDocument();

      expect(screen.getByText('12.547')).toBeInTheDocument();
      expect(screen.getByText('Partidas concluídas')).toBeInTheDocument();
      expect(screen.getByText('42 min')).toBeInTheDocument();
    });

    test('renders the final call to action', () => {
      renderHomePage();

      expect(
        screen.getByRole('heading', { level: 2, name: 'A investigação começou' }),
      ).toBeInTheDocument();
      expect(screen.getByText('Os detetives estão reunidos. Falta apenas você.')).toBeInTheDocument();
    });
  });

  describe('new players', () => {
    test('renders the beginners section', () => {
      renderHomePage();

      expect(
        screen.getByRole('heading', { level: 2, name: 'Primeira investigação?' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Como jogar' })).toBeInTheDocument();
    });

    test('opens and closes the how-to-play modal', () => {
      renderHomePage();

      fireEvent.click(screen.getByRole('button', { name: 'Como jogar' }));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { level: 2, name: 'Como jogar' })).toBeInTheDocument();
      expect(within(dialog).getByText('Objetivo')).toBeInTheDocument();
      expect(within(dialog).getByText('Locais do tabuleiro')).toBeInTheDocument();

      fireEvent.click(within(dialog).getAllByRole('button', { name: 'Fechar' })[0]);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('closes the how-to-play modal with Escape', () => {
      renderHomePage();

      fireEvent.click(screen.getByRole('button', { name: 'Como jogar' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('footer', () => {
    test('renders branding and tagline', () => {
      renderHomePage();

      const footer = screen.getByRole('contentinfo');
      expect(within(footer).getByText('Departamento de Investigação · Londres')).toBeInTheDocument();
      expect(
        within(footer).getByText('“Cada pista conta uma história.” — Documento confidencial de Scotland Yard'),
      ).toBeInTheDocument();
    });
  });
});

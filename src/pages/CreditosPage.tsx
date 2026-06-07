import '../landing.css';
import { GitHubRibbon } from '@/components/landing/github-ribbon';
import { LegalLayout } from '@/components/landing/legal-layout';

const REPO_URL = 'https://github.com/arturcp/scotland-yard';

export default function CreditosPage() {
  return (
    <LegalLayout title="Créditos" subtitle="Reconhecimentos">
      <GitHubRibbon href={REPO_URL} />
      <p>
        Esta versão online de Scotland Yard existe graças ao trabalho de várias pessoas e projetos.
        Abaixo estão os créditos e reconhecimentos devidos.
      </p>

      <section>
        <h2>O jogo</h2>
        <p>
          <strong className="text-ivory">Scotland Yard</strong> é um jogo de tabuleiro originalmente
          publicado na Alemanha. No Brasil, o jogo é propriedade da{' '}
          <strong className="text-ivory">Grow Jogos de Tabuleiro</strong> e de seus licenciadores.
          Todos os direitos sobre as regras, mecânicas, identidade visual e elementos do jogo
          pertencem à Grow e aos respectivos titulares de propriedade intelectual.
        </p>
        <p>
          Este site é uma implementação digital independente, criada por fãs do jogo para facilitar
          partidas online entre amigos. Não é um produto oficial da Grow.
        </p>
      </section>

      <section>
        <h2>Este site</h2>
        <p>
          A versão online foi concebida, desenvolvida e mantida por{' '}
          <strong className="text-ivory">Artur Caliendo Prado</strong> — um projeto pessoal, sem
          fins lucrativos, feito com carinho para quem quer jogar Scotland Yard à distância. O
          código-fonte está disponível no{' '}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:text-ivory hover:decoration-ivory/60"
          >
            GitHub
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Tecnologias</h2>
        <p>Este site foi construído com as seguintes ferramentas de código aberto:</p>
        <ul>
          <li>
            <strong className="text-ivory">React</strong> — interface do usuário
          </li>
          <li>
            <strong className="text-ivory">Vite</strong> — build e desenvolvimento
          </li>
          <li>
            <strong className="text-ivory">Tailwind CSS</strong> — estilos
          </li>
          <li>
            <strong className="text-ivory">@3d-dice/dice-box</strong> — simulação de dados
          </li>
          <li>
            <strong className="text-ivory">Lucide React</strong> — ícones
          </li>
          <li>
            <strong className="text-ivory">Font Awesome</strong> — ícones adicionais
          </li>
        </ul>
      </section>

      <section>
        <h2>Imagens e ambientação</h2>
        <p>
          As imagens de ambientação, texturas e elementos visuais do tabuleiro digital foram
          produzidas ou adaptadas para esta versão online. O design geral busca evocar a atmosfera
          noir de Londres, em homenagem ao espírito do jogo original.
        </p>
      </section>

      <p className="text-sm text-muted-foreground">Obrigado por jogar. Boa caçada a Mr. X.</p>
    </LegalLayout>
  );
}

import '../landing.css';
import { LegalLayout } from '@/components/landing/legal-layout';

export default function TermosPage() {
  return (
    <LegalLayout title="Termos de Uso" subtitle="Documento confidencial">
      <p>
        Ao acessar e utilizar esta versão online de Scotland Yard, você concorda com os
        termos descritos abaixo. Se não concordar, por favor, não utilize o serviço.
      </p>

      <section>
        <h2>Sobre este serviço</h2>
        <p>
          Este site oferece uma versão online gratuita do jogo de tabuleiro Scotland Yard,
          destinada exclusivamente ao entretenimento entre amigos. Trata-se de um projeto
          independente, sem fins lucrativos, criado para facilitar partidas remotas — não é
          um produto oficial da editora nem está associado a qualquer distribuidor
          comercial.
        </p>
      </section>

      <section>
        <h2>Propriedade intelectual</h2>
        <p>
          O jogo de tabuleiro Scotland Yard, incluindo suas regras, mecânicas, elementos
          visuais e identidade, é propriedade da{' '}
          <strong className="text-ivory">Grow Jogos de Tabuleiro</strong> e de seus
          licenciadores. Todos os direitos sobre a obra original permanecem com seus
          respectivos titulares.
        </p>
        <p>
          Esta implementação online não reivindica propriedade sobre o jogo. O código-fonte
          deste site refere-se apenas à interface digital que reproduz a experiência de
          jogo; o conceito, o design e as regras do Scotland Yard pertencem à Grow e aos
          detentores dos direitos autorais originais.
        </p>
      </section>

      <section>
        <h2>Uso permitido</h2>
        <p>Você pode utilizar este site para:</p>
        <ul>
          <li>Jogar partidas gratuitas com amigos e familiares;</li>
          <li>Criar salas e participar de jogos sem qualquer cobrança;</li>
          <li>Compartilhar o link do site para convidar outros jogadores.</li>
        </ul>
      </section>

      <section>
        <h2>Uso proibido</h2>
        <p>É expressamente proibido:</p>
        <ul>
          <li>Monetizar, cobrar ou lucrar com o acesso a este site ou às partidas;</li>
          <li>Vender, sublicenciar ou comercializar este serviço ou qualquer parte dele;</li>
          <li>Apresentar este site como produto oficial da Grow ou de qualquer editora;</li>
          <li>Utilizar o serviço de forma que viole a legislação brasileira ou os direitos de
            terceiros.</li>
        </ul>
      </section>

      <section>
        <h2>Isenção de responsabilidade</h2>
        <p>
          O serviço é oferecido &ldquo;como está&rdquo;, sem garantias de disponibilidade
          contínua, ausência de erros ou adequação a qualquer finalidade específica. Os
          responsáveis por este site não se responsabilizam por interrupções, perda de dados
          de partida ou quaisquer danos decorrentes do uso da plataforma.
        </p>
      </section>

      <section>
        <h2>Alterações</h2>
        <p>
          Estes termos podem ser atualizados a qualquer momento. O uso continuado do site
          após alterações constitui aceitação dos novos termos. Recomendamos revisar esta
          página periodicamente.
        </p>
      </section>

      <p className="text-sm text-muted-foreground">
        Última atualização: junho de 2026.
      </p>
    </LegalLayout>
  );
}

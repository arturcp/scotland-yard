import '../landing.css';
import { LegalLayout } from '@/components/landing/legal-layout';

export default function PrivacidadePage() {
  return (
    <LegalLayout title="Política de Privacidade" subtitle="Documento confidencial">
      <p>
        Esta política descreve como tratamos informações no contexto desta versão online
        gratuita de Scotland Yard. Levamos a privacidade a sério e mantemos a coleta de
        dados no mínimo necessário — que, neste caso, é praticamente nenhum.
      </p>

      <section>
        <h2>Dados que coletamos</h2>
        <p>
          Este site <strong className="text-ivory">não exige cadastro</strong> e{' '}
          <strong className="text-ivory">não solicita dados pessoais</strong> como nome,
          e-mail, telefone ou endereço. Para jogar, basta criar ou entrar em uma sala com
          um código — nenhuma informação identificável precisa ser fornecida.
        </p>
        <p>
          Dados técnicos básicos (como endereço IP e tipo de navegador) podem ser
          registrados automaticamente pelo servidor de hospedagem para fins de segurança e
          operação da infraestrutura, mas não são utilizados por nós para perfilamento ou
          marketing.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          <strong className="text-ivory">Não utilizamos cookies.</strong> Este site não
          emprega cookies de sessão, cookies de rastreamento, pixels de análise nem
          tecnologias similares para monitorar sua navegação ou identificar visitantes.
        </p>
      </section>

      <section>
        <h2>Armazenamento local</h2>
        <p>
          O site não grava preferências ou dados pessoais no seu navegador por meio de{' '}
          <em>localStorage</em> ou <em>sessionStorage</em>. O estado das partidas é mantido
          apenas durante a sessão de jogo ativa e não persiste informações pessoais após o
          encerramento.
        </p>
      </section>

      <section>
        <h2>Compartilhamento de dados</h2>
        <p>
          Não vendemos, alugamos nem compartilhamos dados com terceiros para fins
          comerciais. Como não coletamos dados pessoais de forma ativa, não há informações
          suas a serem compartilhadas.
        </p>
      </section>

      <section>
        <h2>Serviços de terceiros</h2>
        <p>
          O site pode carregar recursos estáticos (como fontes ou imagens) a partir de
          servidores de hospedagem. Não integramos ferramentas de análise de audiência,
          publicidade ou redes sociais que rastreiem usuários.
        </p>
      </section>

      <section>
        <h2>Seus direitos (LGPD)</h2>
        <p>
          De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem
          direito de solicitar informações sobre o tratamento de dados pessoais. Como este
          serviço não coleta dados pessoais de forma ativa, na prática não há dados seus
          armazenados em nossa base. Caso tenha dúvidas, entre em contato pelos canais
          indicados no rodapé do site.
        </p>
      </section>

      <section>
        <h2>Menores de idade</h2>
        <p>
          O jogo Scotland Yard é recomendado para jogadores a partir de 10 anos. Este site
          não coleta dados de menores e não requer informações de idade ou identidade para
          participar de partidas.
        </p>
      </section>

      <section>
        <h2>Alterações nesta política</h2>
        <p>
          Podemos atualizar esta política para refletir mudanças no funcionamento do site.
          Qualquer alteração relevante será publicada nesta página. Recomendamos consultá-la
          periodicamente.
        </p>
      </section>

      <p className="text-sm text-muted-foreground">
        Última atualização: junho de 2026.
      </p>
    </LegalLayout>
  );
}

import { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';

const helpers = [{ icon: BookOpen, label: 'Como jogar', modal: 'how-to-play' as const }];

const boardLocations = [
  'Museu',
  'Bar',
  'Farmácia',
  'Casa de Penhores',
  'Teatro',
  'Banco',
  'Livraria',
  'Chaveiro',
  'Docas',
  'Hotel',
  'Charutaria',
  'Estação de Carruagens',
  'Scotland Yard',
  'Parque',
];

export function NewPlayers() {
  const [openModal, setOpenModal] = useState<'how-to-play' | null>(null);

  return (
    <section id="regras" className="bg-background py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="mb-4 font-body text-sm tracking-[0.35em] text-gold uppercase">
          Para iniciantes
        </p>
        <h2 className="font-heading text-4xl font-semibold text-balance text-ivory sm:text-5xl">
          Primeira investigação?
        </h2>
        <p className="mt-5 font-body text-lg leading-relaxed text-pretty text-muted-foreground">
          Comece pelo básico e esteja pronto para a caçada em poucos minutos.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {helpers.map((h) => {
            const Icon = h.icon;

            if (h.modal) {
              return (
                <button
                  key={h.label}
                  type="button"
                  onClick={() => setOpenModal(h.modal)}
                  className="cursor-pointer inline-flex items-center gap-2 rounded-sm border border-gold/50 px-6 py-3 font-body tracking-wide text-ivory/85 transition-colors hover:bg-gold hover:text-background"
                >
                  <Icon className="size-4" />
                  {h.label}
                </button>
              );
            }

            return (
              <a
                key={h.label}
                href="#"
                className="inline-flex items-center gap-2 rounded-sm border border-gold/50 px-6 py-3 font-body tracking-wide text-ivory/85 transition-colors hover:bg-gold hover:text-background"
              >
                <Icon className="size-4" />
                {h.label}
              </a>
            );
          })}
        </div>
      </div>

      {openModal === 'how-to-play' && <HowToPlayModal onClose={() => setOpenModal(null)} />}
    </section>
  );
}

function HowToPlayModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-sm border border-gold/40 bg-card shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
          <h2
            id="how-to-play-title"
            className="font-heading text-2xl font-semibold text-ivory sm:text-3xl"
          >
            Como jogar
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-ivory"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="scrollbar-noir overflow-y-auto px-6 py-6">
          <RuleSection title="Objetivo">
            <p>
              Resolver um dos casos policiais antes dos outros jogadores, descobrindo informações
              como:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>quem cometeu o crime;</li>
              <li>qual foi a arma;</li>
              <li>qual o motivo;</li>
              <li>ou outras respostas específicas exigidas pelo caso.</li>
            </ul>
          </RuleSection>

          <RuleSection title="Preparação">
            <ul className="list-disc space-y-1 pl-5">
              <li>Escolhe-se uma cartela de caso.</li>
              <li>Um jogador lê a introdução do caso para todos.</li>
              <li>Cada jogador recebe uma folha de anotações.</li>
              <li>Todos começam a investigação no tabuleiro.</li>
            </ul>
          </RuleSection>

          <RuleSection title="Como jogar">
            <p>Na sua vez:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Jogue o dado.</li>
              <li>Mova seu peão pelo número de casas obtido.</li>
              <li>
                Ao chegar a um local (Museu, Banco, Hotel, Bar, Docas, etc.), consulte a pista
                correspondente daquele local no livro do caso.
              </li>
              <li>Anote as informações que considerar importantes.</li>
            </ul>
          </RuleSection>

          <RuleSection title="Chaves-mestras">
            <p>Cada jogador possui uma quantidade limitada de chaves-mestras.</p>
            <p className="mt-3">
              Quando encontrava uma pista muito importante, podia &ldquo;trancá-la&rdquo;. Outros
              jogadores só poderiam consultar essa pista gastando uma de suas próprias
              chaves-mestras.
            </p>
          </RuleSection>

          <RuleSection title="Solução do caso">
            <p>Quando acreditar ter resolvido o mistério:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Dirija-se à casa de Sherlock Holmes.</li>
              <li>Consulte secretamente o livro de soluções.</li>
              <li>Se estiver correto, você vence a partida.</li>
              <li>Se estiver errado, você é eliminado e os demais continuam investigando.</li>
            </ul>
          </RuleSection>

          <RuleSection title="Locais do tabuleiro">
            <ul className="mt-3 grid list-none grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {boardLocations.map((location) => (
                <li key={location}>{location}</li>
              ))}
            </ul>
          </RuleSection>
        </div>
      </div>
    </div>
  );
}

function RuleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="font-heading text-xl font-semibold text-gold">{title}</h3>
      <div className="mt-3 font-body leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

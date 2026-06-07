const places = ['Museu', 'Docas', 'Hotel', 'Parque', 'Teatro', 'Livraria', 'Bar', 'Farmácia'];

export function Ambiance() {
  return (
    <section id="ambientacao" className="bg-secondary py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="relative">
          <div className="vignette relative overflow-hidden rounded-sm border border-gold/30">
            <img
              src="/images/london-streets.png"
              alt="Ruas enevoadas da Londres vitoriana iluminadas por lampiões a gás"
              className="h-full w-full object-cover sepia-[0.25]"
            />
          </div>
          <div className="paper-card absolute -bottom-6 -right-4 hidden rotate-3 rounded-sm px-6 py-4 sm:block">
            <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-2" />
            <p className="font-heading text-xl text-wood italic">“O jogo começou.”</p>
          </div>
        </div>

        <div>
          <p className="mb-4 font-body text-sm tracking-[0.35em] text-gold uppercase">
            O Tabuleiro
          </p>
          <h2 className="font-heading text-4xl font-semibold text-balance text-ivory sm:text-5xl">
            Explore uma Londres cheia de mistérios
          </h2>
          <p className="mt-6 font-body text-lg leading-relaxed text-pretty text-ivory/75">
            Museus, docas, hotéis, parques, teatros e ruas movimentadas se tornam peças de um grande
            quebra-cabeça. Cada local é um possível esconderijo — ou a próxima pista.
          </p>

          <ul className="mt-8 flex flex-wrap gap-3">
            {places.map((place) => (
              <li
                key={place}
                className="rounded-sm border border-gold/30 bg-card px-4 py-2 font-body text-sm tracking-wide text-ivory/80"
              >
                {place}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

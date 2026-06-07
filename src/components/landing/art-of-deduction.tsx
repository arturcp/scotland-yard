export function ArtOfDeduction() {
  return (
    <section id="deducao" className="relative overflow-hidden bg-secondary py-24">
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/london-streets.png)' }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
        <div className="paper-card rotate-[0.5deg] rounded-sm p-10 sm:p-12">
          <span className="tape -top-3 left-10 -rotate-3" />
          <span className="tape -top-3 right-10 rotate-3" />
          <p className="font-body text-sm tracking-[0.3em] text-wood/60 uppercase">
            Caderno de anotações
          </p>
          <blockquote className="mt-6 font-heading text-3xl leading-snug text-balance text-wood">
            “Na arte da dedução é fundamental distinguir, dentre todos os fatos,
            quais são os essenciais e quais são os circunstanciais.”
          </blockquote>
        </div>

        <div>
          <p className="mb-4 font-body text-sm tracking-[0.35em] text-gold uppercase">
            Estratégia &amp; Lógica
          </p>
          <h2 className="font-heading text-4xl font-semibold text-balance text-ivory sm:text-5xl">
            A arte da dedução
          </h2>
          <p className="mt-6 font-body text-lg leading-relaxed text-pretty text-ivory/75">
            Cada movimento importa. Observe padrões, acompanhe os meios de
            transporte utilizados e descubra onde seu adversário pretende
            aparecer.
          </p>
          <p className="mt-4 font-body text-lg leading-relaxed text-pretty text-muted-foreground">
            Os detetives veem os rastros de Mr. X apenas em momentos
            específicos. Entre uma aparição e outra, resta a dedução: para onde
            ele foi, e para onde irá?
          </p>

          <p className="mt-8 font-heading text-2xl text-gold/80 italic">
            “Você vê, mas não observa.”
          </p>
        </div>
      </div>
    </section>
  )
}

import { ArrowRight } from 'lucide-react';

export function FinalCta() {
  return (
    <section id="cta-final" className="vignette relative overflow-hidden py-28">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/london-map-dark.png)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-background/70" aria-hidden="true" />

      <div className="relative z-20 mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-shadow-noir font-heading text-5xl font-semibold text-balance text-ivory sm:text-6xl">
          A investigação começou
        </h2>
        <p className="mt-6 font-body text-xl leading-relaxed text-pretty text-ivory/80">
          Os detetives estão reunidos. Falta apenas você.
        </p>

        <div className="mt-12 flex flex-col items-center gap-6">
          <a
            href="#"
            className="group inline-flex items-center gap-2 rounded-sm bg-gold px-10 py-5 font-heading text-xl font-semibold tracking-wide text-background transition-colors hover:bg-ivory"
          >
            Criar Sala
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </a>

          <form className="flex items-stretch overflow-hidden rounded-sm border border-gold/50 bg-background/70 backdrop-blur-sm">
            <input
              type="text"
              placeholder="Código da sala"
              aria-label="Código da sala"
              className="w-40 bg-transparent px-4 py-3 font-body text-sm tracking-widest text-ivory uppercase placeholder:text-ivory/40 focus:outline-none"
            />
            <button
              type="submit"
              className="border-l border-gold/50 bg-gold/10 px-6 py-3 font-body text-sm tracking-wide text-gold transition-colors hover:bg-gold hover:text-background"
            >
              Entrar
            </button>
          </form>
        </div>

        <p className="mt-14 font-heading text-2xl text-gold/70 italic">
          “Nem tudo o que está oculto permanecerá oculto.”
        </p>
      </div>
    </section>
  );
}

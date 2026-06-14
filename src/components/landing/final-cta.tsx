import { RoomActions } from './room-actions';

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
          <RoomActions
            createClassName="group inline-flex items-center gap-2 rounded-sm bg-gold px-10 py-5 font-heading text-xl font-semibold tracking-wide text-background transition-colors hover:bg-ivory"
          />
        </div>

        <p className="mt-14 font-heading text-2xl text-gold/70 italic">
          “Nem tudo o que está oculto permanecerá oculto.”
        </p>
      </div>
    </section>
  );
}

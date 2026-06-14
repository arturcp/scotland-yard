import { RoomActions } from './room-actions';

export function Hero() {
  return (
    <section className="vignette relative flex min-h-screen items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/london-map-dark.png)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-background/55" aria-hidden="true" />

      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pt-28 pb-16">
        <div className="max-w-2xl">
          <p className="mb-6 font-body text-sm tracking-[0.35em] text-gold uppercase">
            Quartel-general dos detetives
          </p>

          <h1 className="text-shadow-noir font-heading text-5xl leading-[1.05] font-semibold text-balance text-ivory sm:text-6xl lg:text-7xl">
            Londres precisa novamente de você.
          </h1>

          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-pretty text-ivory/75">
            Reúna seus amigos, assuma o papel dos detetives de Scotland Yard e use lógica,
            observação e dedução para desvendar os crimes mais recentes de Londres.
          </p>

          <div className="mt-10">
            <RoomActions />
          </div>
        </div>
      </div>
    </section>
  );
}

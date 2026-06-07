import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section className="vignette relative flex min-h-screen items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/london-map-dark.png)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-background/55"
        aria-hidden="true"
      />

      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pt-28 pb-16">
        <div className="max-w-2xl">
          <p className="mb-6 font-body text-sm tracking-[0.35em] text-gold uppercase">
            Quartel-general dos detetives
          </p>

          <h1 className="text-shadow-noir font-heading text-5xl leading-[1.05] font-semibold text-balance text-ivory sm:text-6xl lg:text-7xl">
            Londres está novamente à procura de Mr. X.
          </h1>

          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-pretty text-ivory/75">
            Reúna seus amigos, assuma o papel dos detetives de Scotland Yard e
            use lógica, observação e dedução para capturar o criminoso mais
            procurado de Londres.
          </p>

          <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <a
              href="#cta-final"
              className="group inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-4 font-heading text-lg font-semibold tracking-wide text-background transition-colors hover:bg-ivory"
            >
              Criar Sala
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </a>

            <RoomTicket />
          </div>
        </div>
      </div>
    </section>
  )
}

function RoomTicket() {
  return (
    <form className="flex items-stretch overflow-hidden rounded-sm border border-gold/50 bg-background/70 backdrop-blur-sm">
      <input
        type="text"
        placeholder="Código da sala"
        aria-label="Código da sala"
        className="w-36 bg-transparent px-4 py-3 font-body text-sm tracking-widest text-ivory uppercase placeholder:text-ivory/40 focus:outline-none"
      />
      <button
        type="submit"
        className="border-l border-gold/50 bg-gold/10 px-5 py-3 font-body text-sm tracking-wide text-gold transition-colors hover:bg-gold hover:text-background"
      >
        Entrar
      </button>
    </form>
  )
}

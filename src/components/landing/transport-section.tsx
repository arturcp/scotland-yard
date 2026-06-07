import { SectionHeading } from './how-it-works'
import { Bus, TramFront, Eye } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Transport = {
  icon: LucideIcon
  name: string
  text: string
}

const transports: Transport[] = [
  {
    icon: TaxiIcon,
    name: 'Táxi',
    text: 'Movimentos curtos e precisos por ruas próximas. Ideal para ajustes finos.',
  },
  {
    icon: Bus,
    name: 'Ônibus',
    text: 'Percursos de média distância que conectam bairros distantes.',
  },
  {
    icon: TramFront,
    name: 'Metrô',
    text: 'Saltos longos pela cidade. Rápido, porém deixa rastros marcantes.',
  },
  {
    icon: Eye,
    name: 'Movimento secreto',
    text: 'Exclusivo de Mr. X. Esconde completamente o meio utilizado.',
  },
]

function TaxiIcon(props: React.ComponentProps<'svg'>) {
  // Reusa estilo de ícone consistente — carrinho de táxi simplificado
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 17h14M3 17l1.5-6A2 2 0 0 1 6.4 9.5h11.2a2 2 0 0 1 1.9 1.5L21 17" />
      <path d="M9 9.5V7h6v2.5" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  )
}

export function TransportSection() {
  return (
    <section id="transportes" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Os Meios"
          title="Cada trajeto deixa um rastro"
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {transports.map((t) => {
            const Icon = t.icon
            return (
              <article
                key={t.name}
                className="flex flex-col items-center rounded-sm border border-border bg-card p-8 text-center transition-colors hover:border-gold/50"
              >
                <span className="mb-5 flex size-14 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Icon className="size-7" />
                </span>
                <h3 className="font-heading text-2xl font-semibold text-ivory">
                  {t.name}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                  {t.text}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

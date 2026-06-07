import { SectionHeading } from './how-it-works'
import { Brain, Lightbulb, VenetianMask, Users } from 'lucide-react'

const reasons = [
  {
    icon: Brain,
    title: 'Estratégia',
    text: 'Cada decisão altera o rumo da investigação.',
  },
  {
    icon: Lightbulb,
    title: 'Dedução',
    text: 'Encontre padrões escondidos nos rastros deixados.',
  },
  {
    icon: VenetianMask,
    title: 'Blefe',
    text: 'Mr. X pode enganar e despistar os detetives.',
  },
  {
    icon: Users,
    title: 'Cooperação',
    text: 'Os investigadores precisam trabalhar juntos.',
  },
]

export function WhyPlay() {
  return (
    <section className="relative bg-secondary py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="O Caso" title="Por que jogar?" />

        <div className="mt-16 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => {
            const Icon = r.icon
            return (
              <div
                key={r.title}
                className="bg-card p-8 transition-colors hover:bg-card/60"
              >
                <Icon className="mb-5 size-7 text-gold" />
                <h3 className="font-heading text-2xl font-semibold text-ivory">
                  {r.title}
                </h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground">
                  {r.text}
                </p>
              </div>
            )
          })}
        </div>

        <p className="mt-12 text-center font-heading text-2xl text-balance text-gold/70 italic">
          “Não existem coincidências. Apenas conexões ainda não descobertas.”
        </p>
      </div>
    </section>
  )
}

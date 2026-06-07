import { Search } from 'lucide-react'

export function QuoteBanner() {
  return (
    <section className="relative overflow-hidden bg-secondary py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="paper-card relative mx-auto rotate-[-0.6deg] rounded-sm px-8 py-14 sm:px-16">
          <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[2deg]" />

          <Search className="mx-auto mb-6 size-8 text-wood/60" />

          <blockquote className="text-center font-heading text-2xl leading-snug text-balance text-wood sm:text-3xl">
            “Quando você elimina o impossível, o que resta, por mais improvável
            que pareça, deve ser a verdade.”
          </blockquote>

          <p className="mt-6 text-center font-body text-sm tracking-[0.3em] text-wood/60 uppercase">
            — Sherlock Holmes
          </p>
        </div>
      </div>
    </section>
  )
}

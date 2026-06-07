import { BookOpen, ScrollText, GraduationCap } from 'lucide-react';

const helpers = [
  { icon: BookOpen, label: 'Como jogar', href: '#' },
  { icon: ScrollText, label: 'Regras rápidas', href: '#' },
  { icon: GraduationCap, label: 'Tutorial', href: '#' },
];

export function NewPlayers() {
  return (
    <section className="bg-background py-24">
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
            return (
              <a
                key={h.label}
                href={h.href}
                className="inline-flex items-center gap-2 rounded-sm border border-gold/50 px-6 py-3 font-body tracking-wide text-ivory/85 transition-colors hover:bg-gold hover:text-background"
              >
                <Icon className="size-4" />
                {h.label}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

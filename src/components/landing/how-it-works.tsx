import { DoorOpen, UserSearch, Footprints } from 'lucide-react';

const steps = [
  {
    icon: DoorOpen,
    number: 'I',
    title: 'Crie uma sala',
    text: 'Convide seus amigos em segundos e abra a investigação.',
  },
  {
    icon: UserSearch,
    number: 'II',
    title: 'Escolha seu papel',
    text: 'Jogue como um dos detetives da Scotland Yard.',
  },
  {
    icon: Footprints,
    number: 'III',
    title: 'Investigue',
    text: 'Analise pistas, acompanhe trajetos e monte sua estratégia.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow="O Procedimento" title="Como funciona" />

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.number}
                className="group relative rounded-sm border border-border bg-card p-8 transition-colors hover:border-gold/50"
              >
                <span className="absolute top-6 right-6 font-heading text-4xl text-gold/20">
                  {step.number}
                </span>
                <span className="mb-6 flex size-12 items-center justify-center rounded-full border border-gold/40 text-gold">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-heading text-2xl font-semibold text-ivory">{step.title}</h3>
                <p className="mt-3 font-body leading-relaxed text-muted-foreground">{step.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  center = true,
}: {
  eyebrow: string;
  title: string;
  center?: boolean;
}) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className="mb-4 font-body text-sm tracking-[0.35em] text-gold uppercase">{eyebrow}</p>
      <h2 className="font-heading text-4xl font-semibold text-balance text-ivory sm:text-5xl">
        {title}
      </h2>
      {center && <div className="gold-divider mx-auto mt-6 w-24" />}
    </div>
  );
}

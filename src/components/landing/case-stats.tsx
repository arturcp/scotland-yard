const stats = [
  { value: '12.547', label: 'Partidas concluídas' },
  { value: '3.821', label: 'Mr. X capturados' },
  { value: '8.726', label: 'Detetives participantes' },
  { value: '42 min', label: 'Duração média' },
]

export function CaseStats() {
  return (
    <section className="relative overflow-hidden bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-12 text-center font-body text-sm tracking-[0.35em] text-gold uppercase">
          Casos resolvidos
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-5xl font-semibold text-gold sm:text-6xl">
                {s.value}
              </p>
              <p className="mt-3 font-body text-sm tracking-wide text-muted-foreground uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

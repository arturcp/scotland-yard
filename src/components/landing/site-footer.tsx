import { Search } from 'lucide-react';

const links = [
  { label: 'Como jogar', href: '#como-funciona' },
  { label: 'Regras', href: '#regras' },
  { label: 'Termos', href: '#' },
  { label: 'Privacidade', href: '#' },
  { label: 'Créditos', href: '#' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/20 bg-sidebar py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-gold/50 text-gold">
              <Search className="size-4" />
            </span>
            <div>
              <p className="font-heading text-base font-semibold tracking-[0.25em] text-ivory uppercase">
                Scotland Yard
              </p>
              <p className="font-body text-xs tracking-wide text-muted-foreground">
                Departamento de Investigação · Londres
              </p>
            </div>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-body text-sm tracking-wide text-ivory/70 transition-colors hover:text-gold"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="gold-divider my-8" />

        <p className="text-center font-body text-xs tracking-wide text-muted-foreground">
          “Cada pista conta uma história.” — Documento confidencial de Scotland Yard
        </p>
      </div>
    </footer>
  );
}

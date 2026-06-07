import { Search } from 'lucide-react';

const links = [
  { label: 'Como Jogar', href: '#como-funciona' },
  { label: 'A Dedução', href: '#deducao' },
  { label: 'Ambientação', href: '#ambientacao' },
];

export function SiteNav() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#" className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full border border-gold/50 text-gold">
            <Search className="size-4" />
          </span>
          <span className="font-heading text-lg font-semibold tracking-[0.25em] text-ivory uppercase">
            Scotland Yard
          </span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-body text-sm tracking-wide text-ivory/70 transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#cta-final"
          className="rounded-sm border border-gold/60 px-5 py-2 font-body text-sm tracking-wide text-gold transition-colors hover:bg-gold hover:text-background"
        >
          Criar Sala
        </a>
      </nav>
    </header>
  );
}

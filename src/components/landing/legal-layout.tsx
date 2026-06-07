import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { SiteFooter } from './site-footer';

type LegalLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function LegalLayout({ title, subtitle, children }: LegalLayoutProps) {
  return (
    <main className="relative min-h-screen bg-background">
      <header className="border-b border-gold/20 bg-sidebar">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full border border-gold/50 text-gold">
              <Search className="size-4" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-[0.25em] text-ivory uppercase">
              Scotland Yard
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-sm tracking-wide text-ivory/70 transition-colors hover:text-gold"
          >
            <ArrowLeft className="size-4" />
            Voltar ao início
          </Link>
        </nav>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="mb-3 font-body text-sm tracking-[0.35em] text-gold uppercase">
          {subtitle}
        </p>
        <h1 className="font-heading text-4xl font-semibold text-ivory sm:text-5xl">
          {title}
        </h1>
        <div className="gold-divider my-10" />
        <div className="legal-content space-y-8 font-body text-base leading-relaxed text-ivory/80">
          {children}
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { CasePreview } from '@/types/game';

interface CaseStoryModalProps {
  casePreview: CasePreview | null;
  loading: boolean;
  onClose: () => void;
}

export function CaseStoryModal({ casePreview, loading, onClose }: CaseStoryModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const title = casePreview
    ? `Caso ${String(casePreview.number).padStart(3, '0')}: ${casePreview.title}`
    : 'História do caso';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-story-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-sm border border-gold/40 bg-card shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
          <h2
            id="case-story-title"
            className="font-heading text-2xl font-semibold text-ivory sm:text-3xl"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-ivory"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="scrollbar-noir overflow-y-auto px-6 py-6">
          {loading && <p className="font-body text-muted-foreground">Carregando história…</p>}
          {!loading && casePreview && (
            <>
              <p className="font-body text-base leading-relaxed whitespace-pre-wrap text-ivory/85">
                {casePreview.intro}
              </p>

              {casePreview.questions.length > 0 && (
                <section className="mt-8 border-t border-gold/20 pt-6">
                  <h3 className="mb-4 font-heading text-lg font-semibold text-gold">
                    Perguntas a responder
                  </h3>
                  <ol className="list-decimal space-y-2 pl-5 font-body text-base leading-relaxed text-ivory/85">
                    {casePreview.questions.map((question) => (
                      <li key={question.key}>{question.label}</li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="shrink-0 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-gold/50 px-5 py-2 font-body text-sm tracking-wide text-ivory/85 transition-colors hover:bg-gold hover:text-background"
          >
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}

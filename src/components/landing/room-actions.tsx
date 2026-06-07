import { ArrowRight, BookOpen } from 'lucide-react';
import { CaseStoryModal } from './case-story-modal';
import { useRoomActions } from './use-room-actions';

interface RoomActionsProps {
  createLabel?: string;
  createClassName?: string;
}

export function RoomActions({
  createLabel = 'Criar Sala',
  createClassName = 'group inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-4 font-heading text-lg font-semibold tracking-wide text-background transition-colors hover:bg-ivory',
}: RoomActionsProps) {
  const {
    joinCode,
    setJoinCode,
    cases,
    selectedCaseId,
    setSelectedCaseId,
    error,
    loading,
    previewOpen,
    previewLoading,
    casePreview,
    handleOpenCasePreview,
    handleCloseCasePreview,
    handleCreate,
    handleJoin,
  } = useRoomActions();

  return (
    <>
      <div className="flex flex-col items-start gap-3">
        <label className="flex w-full max-w-md flex-col gap-2 font-body text-sm text-ivory/80">
          <span>Escolha o caso</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full rounded-sm border border-gold/50 bg-background/70 px-4 py-3 text-ivory focus:outline-none sm:flex-1"
              disabled={loading || cases.length === 0}
            >
              {cases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  Caso {String(caseItem.number).padStart(3, '0')}: {caseItem.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleOpenCasePreview}
              disabled={loading || !selectedCaseId}
              className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-sm border border-gold/50 px-4 py-3 font-body text-sm tracking-wide text-ivory/85 transition-colors hover:bg-gold hover:text-background disabled:opacity-50"
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Ler história
            </button>
          </div>
        </label>

        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <button
            type="button"
            className={createClassName}
            disabled={loading || !selectedCaseId}
            onClick={handleCreate}
          >
            {createLabel}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </button>

          <form
            className="flex items-stretch overflow-hidden rounded-sm border border-gold/50 bg-background/70 backdrop-blur-sm"
            onSubmit={handleJoin}
          >
            <input
              type="text"
              placeholder="Código da sala"
              aria-label="Código da sala"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-42 bg-transparent px-4 py-3 font-body text-sm tracking-widest text-ivory uppercase placeholder:text-ivory/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="border-l border-gold/50 bg-gold/10 px-5 py-3 font-body text-sm tracking-wide text-gold transition-colors hover:bg-gold hover:text-background"
            >
              Entrar
            </button>
          </form>
        </div>
        {error && <p className="font-body text-sm text-red-300">{error}</p>}
      </div>

      {previewOpen && (
        <CaseStoryModal
          casePreview={casePreview}
          loading={previewLoading}
          onClose={handleCloseCasePreview}
        />
      )}
    </>
  );
}

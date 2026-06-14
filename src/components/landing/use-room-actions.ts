import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, fetchCasePreview, fetchCases, fetchRoomSummary } from '@/lib/api';
import type { CaseListItem, CasePreview } from '@/types/game';

export function useRoomActions() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [casePreview, setCasePreview] = useState<CasePreview | null>(null);

  useEffect(() => {
    void fetchCases()
      .then((loadedCases) => {
        setCases(loadedCases);
        if (loadedCases[0]) {
          setSelectedCaseId(loadedCases[0].id);
        }
      })
      .catch(() => {
        setError('Não foi possível carregar os casos disponíveis.');
      });
  }, []);

  async function handleOpenCasePreview() {
    if (!selectedCaseId) {
      setError('Selecione um caso para ler a história.');
      return;
    }

    setPreviewOpen(true);
    setPreviewLoading(true);
    setCasePreview(null);
    setError(null);

    try {
      const preview = await fetchCasePreview(selectedCaseId);
      setCasePreview(preview);
    } catch (previewError) {
      setPreviewOpen(false);
      setError(
        previewError instanceof Error
          ? previewError.message
          : 'Não foi possível carregar a história do caso.',
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  function handleCloseCasePreview() {
    setPreviewOpen(false);
    setCasePreview(null);
  }

  async function handleCreate() {
    if (!selectedCaseId) {
      setError('Selecione um caso para investigar.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const room = await createRoom(selectedCaseId);
      navigate(`/jogo/${room.code}`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Não foi possível criar a sala.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(event: FormEvent) {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setError('Informe o código da sala.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const summary = await fetchRoomSummary(code);
      if (!summary.exists) {
        setError('Sala não encontrada.');
        return;
      }
      navigate(`/jogo/${code}`);
    } catch {
      setError('Não foi possível entrar na sala.');
    } finally {
      setLoading(false);
    }
  }

  return {
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
  };
}

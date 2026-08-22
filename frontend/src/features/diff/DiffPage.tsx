import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GitCompare, RotateCcw, ArrowLeft, CheckCircle2, AlertCircle, Edit } from 'lucide-react';
import apiClient from '../../api/client';
import { DiffViewer } from './DiffViewer';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { MaterialDiffResponse } from '@shared/contracts';

import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export const DiffPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  useDocumentMetadata('Comparar Versões', 'Compare as diferenças e alterações linha por linha entre diferentes revisões históricas do mesmo documento.');
  const navigate = useNavigate();

  const [v1, setV1] = useState<string>('1');
  const [v2, setV2] = useState<string>('2');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch diff
  const { data: diffData, isLoading, isError, refetch } = useQuery<MaterialDiffResponse>({
    queryKey: ['diff', id, v1, v2],
    queryFn: async () => {
      const res = await apiClient.get<MaterialDiffResponse>(
        `/api/content/materials/${id}/diff?v1=${v1}&v2=${v2}`
      );
      return res.data;
    },
    enabled: !!id,
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (targetVersion: number) => {
      const res = await apiClient.post(`/api/content/materials/${id}/rollback`, {
        versao_num: targetVersion,
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSuccessMsg(data.message || `Rollback para versão ${v1} executado com sucesso!`);
      setErrorMsg('');
      refetch();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Falha ao executar rollback da versão.');
    },
  });

  const handleRollback = () => {
    const targetVersion = parseInt(v1, 10);
    if (window.confirm(`Tem certeza que deseja reverter o documento para a Versão ${targetVersion}?`)) {
      rollbackMutation.mutate(targetVersion);
    }
  };

  const versionOptions = [
    { value: '1', label: 'Versão 1 (Inicial)' },
    { value: '2', label: 'Versão 2 (Atual)' },
    { value: '3', label: 'Versão 3 (Rascunho)' },
  ];

  return (
    <div id="page-diff" data-testid="page-diff" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            id="btn-diff-voltar"
            data-testid="btn-diff-voltar"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Acervo
          </Button>

          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-brand-400" />
              <span>Histórico & Visualizador de Diffs</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Material ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/editor/${id}`}>
            <Button
              id="btn-diff-editar"
              data-testid="btn-diff-editar"
              variant="secondary"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-1.5" />
              Abrir no Editor
            </Button>
          </Link>
          <Button
            id="btn-executar-rollback"
            data-testid="btn-executar-rollback"
            variant="danger"
            size="sm"
            onClick={handleRollback}
            isLoading={rollbackMutation.isPending}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reverter (Rollback para V{v1})
          </Button>
        </div>
      </div>

      {/* Status Notifications */}
      {successMsg && (
        <div
          id="alert-rollback-success"
          data-testid="alert-rollback-success"
          className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm flex items-center gap-3 animate-in fade-in"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          id="alert-rollback-error"
          data-testid="alert-rollback-error"
          className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm flex items-center gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Version Selectors Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="select-diff-v1"
          data-testid="select-diff-v1"
          label="Versão Base (V1 - Comparada)"
          options={versionOptions}
          value={v1}
          onChange={(e) => setV1(e.target.value)}
        />

        <Select
          id="select-diff-v2"
          data-testid="select-diff-v2"
          label="Versão Alvo (V2 - Atual/Recente)"
          options={versionOptions}
          value={v2}
          onChange={(e) => setV2(e.target.value)}
        />
      </div>

      {/* Diff Output Area */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Calculando diffs linha a linha...</span>
        </div>
      ) : isError ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-sm">
          Não foi possível calcular o diff entre as versões informadas.
        </div>
      ) : (
        <DiffViewer changes={diffData?.changes || []} />
      )}
    </div>
  );
};

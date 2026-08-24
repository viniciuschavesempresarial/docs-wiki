import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitCommit, ArrowLeft, CheckCircle2, AlertCircle, Eye, Columns, Trash2 } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../auth/useAuth';
import { OKFEditor } from './OKFEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { CommitModal } from './CommitModal';
import { Button } from '../../components/ui/Button';

const DEFAULT_OKF_TEMPLATE = `---
title: Novo Documento Docs-Wiki
slug: novo-documento-docs-wiki-${Date.now().toString(36)}
type: artigo
category: Arquitetura de Software
tags:
  - novidade
  - docs
author: Administrador
author_id: 00000000-0000-0000-0000-000000000001
data_publicacao: '${new Date().toISOString().split('T')[0]}'
---

# Novo Documento Docs-Wiki

## 1. Visão Geral
Este documento segue a especificação **Open Knowledge Format (OKF)** combinando metadados estruturados em YAML com corpo completo em Markdown.

## 2. Padrões e Detalhes
- Versionamento imutável Git-like com SHA-256.
- Suporte a geração automática de embeddings e chunking estruturado.
`;

import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  useDocumentMetadata(id ? 'Editar Documento' : 'Novo Documento', 'Editor avançado com suporte a metadados estruturados (OKF), versionamento imutável e Markdown para a base de conhecimento.');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN') || false;

  const [content, setContent] = useState<string>(DEFAULT_OKF_TEMPLATE);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  // Carrega material existente se houver ID
  const { data: materialData, isLoading: isLoadingMaterial } = useQuery({
    queryKey: ['material', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/api/content/materials/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    const okfContent = materialData?.head_version?.conteudo_okf || materialData?.versao?.conteudo_okf;
    if (okfContent) {
      setContent(okfContent);
    }
  }, [materialData]);

  // Mutation para comitar / salvar
  const commitMutation = useMutation({
    mutationFn: async (commitMessage: string) => {
      if (id) {
        const parentVersionId = materialData?.head_version?.id || materialData?.material?.versao_head_id;
        const res = await apiClient.post(`/api/content/materials/${id}/versions`, {
          conteudo_okf: content,
          commit_message: commitMessage,
          parent_version_id: parentVersionId,
        });
        return res.data;
      } else {
        const res = await apiClient.post('/api/content/materials', {
          conteudo_okf: content,
          commit_message: commitMessage,
        });
        return res.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['categories-dynamic-tree'] });
      setSuccessMessage('Versão salva e comitada com sucesso! Hash SHA-256 gerado.');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 4000);
      if (!id && data.material?.id) {
        navigate(`/editor/${data.material.id}`, { replace: true });
      }
    },
    onError: (err: any) => {
      const detailsMsg = Array.isArray(err.response?.data?.details)
        ? err.response.data.details.map((d: any) => `${d.path?.join('.') || d.field || ''}: ${d.message}`).join('; ')
        : '';
      const msg = detailsMsg || err.response?.data?.error || err.response?.data?.message || 'Erro ao salvar documento.';
      setErrorMessage(msg);
    },
  });

  // Mutation para exclusão completa em cascata
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await apiClient.delete(`/api/content/materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['categories-dynamic-tree'] });
      setIsDeleteModalOpen(false);
      navigate('/', { replace: true });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erro ao excluir material do acervo.';
      setErrorMessage(msg);
      setIsDeleteModalOpen(false);
    },
  });

  const handleCommitConfirm = async (commitMessage: string) => {
    await commitMutation.mutateAsync(commitMessage);
  };

  const handleDeleteConfirm = async () => {
    await deleteMutation.mutateAsync();
  };

  return (
    <div id="page-editor" data-testid="page-editor" className="w-full max-w-full px-4 sm:px-6 lg:px-8 py-4 space-y-3 flex flex-col h-[calc(100vh-4.5rem)]">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            id="btn-editor-voltar"
            data-testid="btn-editor-voltar"
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
              <span>{id ? 'Editar Material OKF' : 'Novo Material OKF'}</span>
              {materialData?.material?.status && (
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {materialData.material.status}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {id ? `ID: ${id}` : 'Rascunho de novo documento'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle (Mobile / Desktop) & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden sm:flex bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              id="btn-view-split"
              data-testid="btn-view-split"
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                viewMode === 'split' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Dividido
            </button>
            <button
              id="btn-view-edit"
              data-testid="btn-view-edit"
              onClick={() => setViewMode('edit')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                viewMode === 'edit' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Editor
            </button>
            <button
              id="btn-view-preview"
              data-testid="btn-view-preview"
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                viewMode === 'preview' ? 'bg-slate-800 text-brand-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          {/* Botão de Excluir Material (Apenas para Admin em materiais existentes) */}
          {id && isAdmin && (
            <Button
              id="btn-abrir-delete-modal"
              data-testid="btn-abrir-delete-modal"
              variant="danger"
              size="md"
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30"
              title="Excluir material e todas as suas versões permanentemente"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Excluir
            </Button>
          )}

          <Button
            id="btn-abrir-commit-modal"
            data-testid="btn-abrir-commit-modal"
            variant="primary"
            size="md"
            onClick={() => setIsCommitModalOpen(true)}
          >
            <GitCommit className="w-4 h-4 mr-2" />
            Salvar & Comitar
          </Button>
        </div>
      </div>

      {/* Status Notifications */}
      {successMessage && (
        <div
          id="alert-editor-success"
          data-testid="alert-editor-success"
          className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          id="alert-editor-error"
          data-testid="alert-editor-error"
          className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Editor Split View Area */}
      {isLoadingMaterial ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div
          className={`flex-1 min-h-0 w-full ${
            viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'flex flex-col'
          }`}
        >
          {/* Left Panel: OKF Editor */}
          {viewMode !== 'preview' && (
            <div className="h-full flex-1 flex flex-col w-full min-h-0">
              <OKFEditor content={content} onChange={setContent} />
            </div>
          )}

          {/* Right Panel: Live Markdown Preview */}
          {viewMode !== 'edit' && (
            <div className="h-full flex-1 flex flex-col w-full min-h-0">
              <MarkdownPreview content={content} />
            </div>
          )}
        </div>
      )}

      {/* Commit Version Modal */}
      <CommitModal
        isOpen={isCommitModalOpen}
        onClose={() => setIsCommitModalOpen(false)}
        onConfirm={handleCommitConfirm}
        isLoading={commitMutation.isPending}
      />

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Excluir Material</h3>
                <p className="text-xs text-rose-400">Esta ação é permanente e irreversível</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Tem certeza que deseja apagar o documento{' '}
              <strong className="text-slate-100 font-semibold">"{materialData?.versao?.conteudo_jsonb?.title || materialData?.material?.slug || 'este material'}"</strong>?
            </p>

            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
              <p>• Todo o histórico de versões Git-like será removido.</p>
              <p>• Todos os chunks vetoriais (embeddings pgvector) serão apagados.</p>
              <p>• O documento será expurgado imediatamente da busca híbrida e RAG.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                id="btn-cancel-delete"
                data-testid="btn-cancel-delete"
                variant="ghost"
                size="md"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                id="btn-confirm-delete"
                data-testid="btn-confirm-delete"
                variant="danger"
                size="md"
                onClick={handleDeleteConfirm}
                isLoading={deleteMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Sim, Excluir Definitivamente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

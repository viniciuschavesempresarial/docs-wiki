import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  AlertCircle,
  FileSearch,
  CheckSquare,
  Square,
  Trash2,
  X,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import apiClient from '../../api/client';
import { useFilterStore } from '../../stores/useFilterStore';
import { useMaterialSelectionStore } from '../../stores/useMaterialSelectionStore';
import { useChatStore } from '../../stores/useChatStore';
import { useAuth } from '../auth/useAuth';
import { SearchBar } from './SearchBar';
import { AdvancedFilters } from './AdvancedFilters';
import { CategoryTree } from './CategoryTree';
import { DocumentCard } from './DocumentCard';
import { Pagination } from '../../components/ui/Pagination';
import { BulkDeleteModal } from '../../components/ui/BulkDeleteModal';
import { Button } from '../../components/ui/Button';
import { SearchResponse } from '@shared/contracts';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export const HomePage: React.FC = () => {
  useDocumentMetadata(
    'Home - Busca Híbrida Inteligente',
    'Explore a base de conhecimento do Docs-Wiki com busca híbrida avançada baseada em palavras-chave, semântica e resumos automáticos por IA.'
  );

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const {
    termo,
    summarize,
    dataInicio,
    dataFim,
    categoria,
    tipo,
    tags,
    fuzzy,
    page,
    limit,
    setPage,
    setLimit,
  } = useFilterStore();

  const {
    selectedIds,
    selectAllOnPage,
    clearSelection,
    isAllPageSelected,
  } = useMaterialSelectionStore();

  const { selectedDocIds, setSelectedDocs } = useChatStore();

  // Estados locais para exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<{ id: string; title: string }[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Busca no Acervo via React Query
  const { data, isLoading, isError, refetch } = useQuery<SearchResponse>({
    queryKey: [
      'search',
      { termo, summarize, dataInicio, dataFim, categoria, tipo, tags, fuzzy, page, limit },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (termo) params.append('q', termo);
      if (summarize) params.append('summarize', 'true');
      if (categoria) params.append('categoria', categoria);
      if (tipo) params.append('tipo', tipo);
      if (tags.length > 0) params.append('tags', tags.join(','));
      if (dataInicio) params.append('date_from', dataInicio);
      if (dataFim) params.append('date_to', dataFim);
      if (fuzzy) params.append('fuzzy', 'true');
      params.append('page', String(page));
      params.append('limit', String(limit));

      const res = await apiClient.get<SearchResponse>(`/api/search?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 30, // 30s
  });

  const currentPageIds = data?.results.map((item) => item.material_id) || [];
  const isAllCurrentPageSelected = isAllPageSelected(currentPageIds);

  // Mutation para Exclusão em Massa / Individual
  const deleteMutation = useMutation({
    mutationFn: async (materialIds: string[]) => {
      const res = await apiClient.post<{ message: string; deleted_count: number; deleted_ids: string[] }>(
        '/api/content/materials/bulk-delete',
        { material_ids: materialIds }
      );
      return res.data;
    },
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ['search'] });
      clearSelection();
      setDeleteModalOpen(false);
      setItemsToDelete([]);
      setActionFeedback(`${resData.deleted_count} material(is) excluído(s) com sucesso em CASCADE.`);
      setTimeout(() => setActionFeedback(null), 5000);
    },
    onError: (err: any) => {
      console.error('Erro ao excluir materiais:', err);
      alert(err.response?.data?.error || 'Erro ao realizar a exclusão de materiais.');
    },
  });

  // Abertura do modal para itens selecionados
  const handleOpenBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const selectedItems = (data?.results || [])
      .filter((doc) => selectedIds.includes(doc.material_id))
      .map((doc) => ({ id: doc.material_id, title: doc.titulo }));

    // Se houver IDs selecionados de páginas anteriores não visíveis no array atual
    const finalItems = selectedIds.map((id) => {
      const found = selectedItems.find((item) => item.id === id);
      return found || { id, title: `Material ID: ${id}` };
    });

    setItemsToDelete(finalItems);
    setDeleteModalOpen(true);
  };

  // Abertura do modal para exclusão de um único item
  const handleOpenSingleDelete = (id: string, title: string) => {
    setItemsToDelete([{ id, title }]);
    setDeleteModalOpen(true);
  };

  // Confirmação de exclusão
  const handleConfirmDelete = async () => {
    const ids = itemsToDelete.map((item) => item.id);
    await deleteMutation.mutateAsync(ids);
  };

  // Adicionar todos os selecionados ao painel RAG
  const handleAddSelectedToRAG = () => {
    const merged = Array.from(new Set([...selectedDocIds, ...selectedIds]));
    setSelectedDocs(merged);
    setActionFeedback(`${selectedIds.length} documento(s) adicionado(s) ao contexto do RAG.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div id="page-home" data-testid="page-home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto pt-2">
        <SearchBar onSearchSubmit={() => refetch()} />
      </div>

      {/* Action feedback alert */}
      {actionFeedback && (
        <div
          id="alert-action-feedback"
          data-testid="alert-action-feedback"
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 text-sm animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button
            id="btn-close-action-feedback"
            data-testid="btn-close-action-feedback"
            onClick={() => setActionFeedback(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Summary Box (when available) */}
      {data?.ai_summary && (
        <div
          id="box-ai-summary"
          data-testid="box-ai-summary"
          className="p-5 rounded-2xl bg-gradient-to-r from-brand-950/60 via-slate-900/80 to-purple-950/40 border border-brand-500/30 backdrop-blur-md shadow-xl animate-in fade-in duration-300"
        >
          <div className="flex items-center gap-2 text-brand-300 font-semibold text-sm mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Síntese Gerada por IA (Gemini)</span>
          </div>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">{data.ai_summary}</p>
        </div>
      )}

      {/* Main Grid: Filters & Navigation + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Sidebar Filters */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          <AdvancedFilters />
          <CategoryTree />
        </div>

        {/* Right Column: Search Results */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          {/* Top Bar: Title + Results Count */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-brand-400" />
              <span>Resultados do Acervo</span>
              {data && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {data.total} encontrados
                </span>
              )}
            </h2>

            {/* Select All on Page Button */}
            {data && data.results.length > 0 && (
              <button
                id="btn-select-all-page"
                data-testid="btn-select-all-page"
                onClick={() => selectAllOnPage(currentPageIds)}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 transition"
              >
                {isAllCurrentPageSelected ? (
                  <CheckSquare className="w-4 h-4 text-brand-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>
                  {isAllCurrentPageSelected ? 'Desmarcar Todos da Página' : 'Selecionar Todos da Página'}
                </span>
              </button>
            )}
          </div>

          {/* Multi-Selection Action Toolbar (Floating/Bar) */}
          {selectedIds.length > 0 && (
            <div
              id="toolbar-multi-selection"
              data-testid="toolbar-multi-selection"
              className="p-3.5 rounded-xl bg-slate-900/90 border border-brand-500/40 backdrop-blur-md shadow-xl flex items-center justify-between flex-wrap gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">
                  <strong className="text-brand-400">{selectedIds.length}</strong> material(is) selecionado(s)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Add to RAG Button */}
                <Button
                  id="btn-bulk-add-rag"
                  data-testid="btn-bulk-add-rag"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddSelectedToRAG}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  <span>Adicionar ao RAG</span>
                </Button>

                {/* Admin Bulk Delete Button */}
                {isAdmin && (
                  <Button
                    id="btn-bulk-delete"
                    data-testid="btn-bulk-delete"
                    size="sm"
                    variant="danger"
                    onClick={handleOpenBulkDelete}
                    className="text-xs bg-rose-600/90 hover:bg-rose-500 text-white flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Selecionados ({selectedIds.length})</span>
                  </Button>
                )}

                {/* Clear Selection Button */}
                <Button
                  id="btn-clear-selection"
                  data-testid="btn-clear-selection"
                  size="sm"
                  variant="ghost"
                  onClick={clearSelection}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div
              id="search-loading"
              data-testid="search-loading"
              className="py-16 flex flex-col items-center justify-center gap-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl"
            >
              <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              <span className="text-sm text-slate-400 font-medium">
                Executando busca híbrida vetorial + lexical...
              </span>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div
              id="search-error"
              data-testid="search-error"
              className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3"
            >
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Falha ao carregar resultados da busca.</p>
                <p className="text-xs text-rose-400 mt-0.5">
                  Verifique a conexão ou tente novamente.
                </p>
              </div>
            </div>
          )}

          {/* Results list */}
          {data && data.results.length > 0 && (
            <div id="grid-search-results" data-testid="grid-search-results" className="grid grid-cols-1 gap-4">
              {data.results.map((item) => (
                <DocumentCard
                  key={item.material_id}
                  id={item.material_id}
                  titulo={item.titulo}
                  slug={item.slug}
                  autor={item.autor}
                  categoria={item.categoria}
                  tipo={item.tipo}
                  tags={item.tags}
                  tamanho_bytes={item.tamanho_bytes}
                  numero_palavras={item.numero_palavras}
                  data_publicacao={item.data_publicacao}
                  resumo_okf={item.resumo_okf}
                  hybrid_score={item.hybrid_score}
                  onDelete={handleOpenSingleDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {data && data.total > 0 && (
            <Pagination
              currentPage={page}
              totalItems={data.total}
              pageSize={limit}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
              className="mt-6 border-t border-slate-800/80 pt-4"
            />
          )}

          {/* Empty state */}
          {data && data.results.length === 0 && (
            <div
              id="search-empty-state"
              data-testid="search-empty-state"
              className="py-16 text-center bg-slate-900/30 border border-slate-800/60 rounded-2xl p-8 space-y-3"
            >
              <FileSearch className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Nenhum documento encontrado</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tente ajustar seus termos de pesquisa, limpar os filtros avançados ou ativar a opção de busca tolerante (Fuzzy).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk / Single Delete Modal */}
      <BulkDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemsToDelete([]);
        }}
        onConfirm={handleConfirmDelete}
        itemCount={itemsToDelete.length}
        itemTitles={itemsToDelete.map((i) => i.title)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

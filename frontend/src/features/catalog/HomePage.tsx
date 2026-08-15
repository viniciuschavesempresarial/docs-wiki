import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, AlertCircle, FileSearch } from 'lucide-react';
import apiClient from '../../api/client';
import { useFilterStore } from '../../stores/useFilterStore';
import { SearchBar } from './SearchBar';
import { AdvancedFilters } from './AdvancedFilters';
import { CategoryTree } from './CategoryTree';
import { DocumentCard } from './DocumentCard';
import { SearchResponse } from '@shared/contracts';

export const HomePage: React.FC = () => {
  const { termo, summarize, dataInicio, dataFim, categoria, tipo, tags, fuzzy } = useFilterStore();

  const { data, isLoading, isError, refetch } = useQuery<SearchResponse>({
    queryKey: ['search', { termo, summarize, dataInicio, dataFim, categoria, tipo, tags, fuzzy }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (termo) params.append('q', termo);
      if (summarize) params.append('summarize', 'true');
      if (categoria) params.append('categoria', categoria);
      if (tipo) params.append('tipo', tipo);
      if (tags.length > 0) params.append('tags', tags.join(','));
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      if (fuzzy) params.append('fuzzy', 'true');

      const res = await apiClient.get<SearchResponse>(`/api/search?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 30, // 30s
  });

  return (
    <div id="page-home" data-testid="page-home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto pt-2">
        <SearchBar onSearchSubmit={() => refetch()} />
      </div>

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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-brand-400" />
              <span>Resultados do Acervo</span>
              {data && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {data.total} encontrados
                </span>
              )}
            </h2>
          </div>

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
                />
              ))}
            </div>
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
    </div>
  );
};

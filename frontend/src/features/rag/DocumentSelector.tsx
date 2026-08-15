import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layers, CheckSquare, Square } from 'lucide-react';
import apiClient from '../../api/client';
import { useChatStore } from '../../stores/useChatStore';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';

export const DocumentSelector: React.FC = () => {
  const { selectedDocIds, toggleDocSelection, setSelectedDocs, clearSelection } = useChatStore();

  const { data: materialsData, isLoading } = useQuery({
    queryKey: ['materials', 'list'],
    queryFn: async () => {
      const res = await apiClient.get('/api/content/materials?limit=100');
      return res.data;
    },
  });

  const materials = Array.isArray(materialsData)
    ? materialsData
    : materialsData?.materials || materialsData?.items || [];

  const handleSelectAll = () => {
    setSelectedDocs(materials.map((m: any) => m.id));
  };

  return (
    <aside
      id="panel-seletor-documentos-rag"
      data-testid="panel-seletor-documentos-rag"
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Contexto RAG ({selectedDocIds.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            id="btn-rag-select-all"
            data-testid="btn-rag-select-all"
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs text-slate-400 hover:text-slate-200"
            title="Selecionar Todos"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </Button>
          <Button
            id="btn-rag-clear-all"
            data-testid="btn-rag-clear-all"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-xs text-slate-400 hover:text-slate-200"
            title="Limpar Seleção"
          >
            <Square className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Selecione os materiais que serão incorporados no prompt com Gemini para geração da resposta fundamentada.
      </p>

      {isLoading ? (
        <div className="py-6 flex justify-center">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : materials.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">
          Nenhum material encontrado no acervo.
        </div>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {materials.map((m: any) => {
            const isSelected = selectedDocIds.includes(m.id);
            const title = m.titulo || m.title || m.slug || 'Documento';
            const category = m.categoria || 'Geral';
            const type = m.tipo || 'artigo';
            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border transition ${
                  isSelected
                    ? 'bg-purple-950/20 border-purple-500/40 text-purple-200'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Checkbox
                  id={`checkbox-select-doc-${m.id}`}
                  data-testid={`checkbox-select-doc-${m.id}`}
                  checked={isSelected}
                  onChange={() => toggleDocSelection(m.id)}
                  label={
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold line-clamp-1">{title}</span>
                      <span className="text-[10px] text-slate-500 font-mono capitalize">
                        {category} • {type}
                      </span>
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};

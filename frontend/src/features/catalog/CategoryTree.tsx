import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Folder, FileText, ChevronRight, Layers } from 'lucide-react';
import apiClient from '../../api/client';
import { useFilterStore } from '../../stores/useFilterStore';

interface MaterialItem {
  id: string;
  categoria?: string;
  tipo?: string;
}

export const CategoryTree: React.FC = () => {
  const { categoria, setCategoria, tipo, setTipo } = useFilterStore();

  // Busca todos os materiais para extrair categorias e tipos reais existentes
  const { data: materialsData, isLoading } = useQuery({
    queryKey: ['categories-dynamic-tree'],
    queryFn: async () => {
      const res = await apiClient.get<{ materials: MaterialItem[] }>('/api/content/materials?limit=100');
      return res.data.materials || [];
    },
    staleTime: 1000 * 30, // 30s
  });

  const categories = useMemo(() => {
    if (!materialsData || materialsData.length === 0) {
      return [];
    }

    const catMap = new Map<string, { count: number; typesMap: Map<string, number> }>();

    materialsData.forEach((m) => {
      const catName = m.categoria?.trim() || 'Sem Categoria';
      const typeName = m.tipo?.trim() || 'geral';

      if (!catMap.has(catName)) {
        catMap.set(catName, { count: 0, typesMap: new Map() });
      }

      const catEntry = catMap.get(catName)!;
      catEntry.count += 1;
      catEntry.typesMap.set(typeName, (catEntry.typesMap.get(typeName) || 0) + 1);
    });

    return Array.from(catMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      types: Array.from(data.typesMap.entries()).map(([typeName, count]) => ({
        name: typeName,
        count,
      })),
    }));
  }, [materialsData]);

  return (
    <div
      id="category-tree-nav"
      data-testid="category-tree-nav"
      className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 backdrop-blur-sm space-y-3"
    >
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          Navegação Estruturada
        </h3>
        {categoria && (
          <button
            onClick={() => {
              setCategoria('');
              setTipo('');
            }}
            className="text-[11px] text-brand-400 hover:text-brand-300 font-medium"
          >
            Limpar
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-500 animate-pulse">
          Carregando categorias...
        </div>
      ) : categories.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500">
          Nenhum material catalogado ainda.
        </div>
      ) : (
        <div className="space-y-1">
          {categories.map((cat) => {
            const isCatSelected = categoria === cat.name;
            return (
              <div key={cat.name} className="space-y-1">
                <button
                  id={`cat-tree-item-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  data-testid={`cat-tree-item-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => {
                    setCategoria(isCatSelected ? '' : cat.name);
                    if (isCatSelected) setTipo('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition text-left ${
                    isCatSelected
                      ? 'bg-brand-600/20 text-brand-300 font-semibold border border-brand-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className={`w-4 h-4 shrink-0 ${isCatSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {cat.count}
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isCatSelected ? 'rotate-90 text-brand-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                </button>

                {/* Sub-items (tipos) quando categoria selecionada */}
                {isCatSelected && (
                  <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-slate-800 ml-4 animate-in slide-in-from-top-2 duration-150">
                    {cat.types.map((t) => {
                      const isTypeSelected = tipo === t.name;
                      return (
                        <button
                          key={t.name}
                          id={`cat-tree-sub-${t.name}`}
                          data-testid={`cat-tree-sub-${t.name}`}
                          onClick={() => setTipo(isTypeSelected ? '' : t.name)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition capitalize text-left ${
                            isTypeSelected
                              ? 'bg-brand-500/10 text-brand-300 font-medium'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 opacity-70 shrink-0" />
                            <span className="truncate">{t.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {t.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

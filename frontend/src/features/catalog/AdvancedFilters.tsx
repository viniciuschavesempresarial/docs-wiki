import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { useFilterStore } from '../../stores/useFilterStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';

const CATEGORIAS = [
  { value: '', label: 'Todas as Categorias' },
  { value: 'Arquitetura de Software', label: 'Arquitetura de Software' },
  { value: 'Inteligência Artificial', label: 'Inteligência Artificial' },
  { value: 'Segurança & IAM', label: 'Segurança & IAM' },
  { value: 'DevOps & Cloud', label: 'DevOps & Cloud' },
  { value: 'Banco de Dados', label: 'Banco de Dados' },
];

const TIPOS = [
  { value: '', label: 'Todos os Tipos' },
  { value: 'livro', label: 'Livro' },
  { value: 'artigo', label: 'Artigo' },
  { value: 'manual', label: 'Manual' },
  { value: 'especificacao', label: 'Especificação' },
];

export const AdvancedFilters: React.FC = () => {
  const {
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    categoria,
    setCategoria,
    tipo,
    setTipo,
    tags,
    setTags,
    fuzzy,
    setFuzzy,
    resetFilters,
  } = useFilterStore();

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setTags(parsed);
  };

  return (
    <aside
      id="panel-filtros-avancados"
      data-testid="panel-filtros-avancados"
      className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md space-y-6"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <Filter className="w-4 h-4 text-brand-400" />
          <span>Filtros Avançados</span>
        </div>
        <Button
          id="btn-limpar-filtros"
          data-testid="btn-limpar-filtros"
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Limpar
        </Button>
      </div>

      {/* Intervalo de Datas */}
      <div className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Data de Publicação
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            id="input-filtro-data-inicio"
            data-testid="input-filtro-data-inicio"
            type="date"
            label="Início"
            className="px-2.5 py-2 text-xs"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <Input
            id="input-filtro-data-fim"
            data-testid="input-filtro-data-fim"
            type="date"
            label="Fim"
            className="px-2.5 py-2 text-xs"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      {/* Categoria e Tipo */}
      <div className="space-y-3">
        <Select
          id="select-filtro-categoria"
          data-testid="select-filtro-categoria"
          label="Categoria"
          options={CATEGORIAS}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />

        <Select
          id="select-filtro-tipo"
          data-testid="select-filtro-tipo"
          label="Tipo de Material"
          options={TIPOS}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        />
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Input
          id="input-filtro-tags"
          data-testid="input-filtro-tags"
          type="text"
          label="Tags (separadas por vírgula)"
          placeholder="ex: ia, rag, microsserviços"
          value={tags.join(', ')}
          onChange={handleTagsChange}
        />
      </div>

      {/* Toggle Levenshtein / Fuzzy */}
      <div className="pt-2 border-t border-slate-800/80">
        <Checkbox
          id="toggle-filtro-fuzzy"
          data-testid="toggle-filtro-fuzzy"
          checked={fuzzy}
          onChange={(e) => setFuzzy(e.target.checked)}
          label={
            <span className="text-xs text-slate-300">
              Busca Tolerante a Falhas (Fuzzy / Levenshtein)
            </span>
          }
        />
      </div>
    </aside>
  );
};

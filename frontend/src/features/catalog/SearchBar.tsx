import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useFilterStore } from '../../stores/useFilterStore';
import { Button } from '../../components/ui/Button';

export interface SearchBarProps {
  onSearchSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearchSubmit }) => {
  const { termo, setTermo, summarize, setSummarize } = useFilterStore();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <form
      id="form-busca-principal"
      data-testid="form-busca-principal"
      onSubmit={handleFormSubmit}
      className="w-full space-y-3"
    >
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-slate-500">
          <Search className="w-5 h-5" />
        </div>

        <input
          id="input-busca-termo"
          data-testid="input-busca-termo"
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por título, autor, categoria, tags ou conteúdo semântico..."
          className="w-full pl-12 pr-32 py-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-xl shadow-slate-950/50 text-sm md:text-base transition"
        />

        <div className="absolute right-2.5 flex items-center gap-2">
          <Button
            id="btn-executar-busca"
            data-testid="btn-executar-busca"
            type="submit"
            variant="primary"
            size="sm"
            className="rounded-lg shadow-none"
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Toggle IA Summarize */}
      <div className="flex items-center justify-between px-1">
        <label
          htmlFor="toggle-ia-summarize"
          className="inline-flex items-center gap-2.5 cursor-pointer text-xs md:text-sm text-slate-300 hover:text-slate-100 select-none group"
        >
          <input
            id="toggle-ia-summarize"
            data-testid="toggle-ia-summarize"
            type="checkbox"
            checked={summarize}
            onChange={(e) => setSummarize(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-950 transition cursor-pointer"
          />
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Sumarizar resultados com IA (Gemini)
          </span>
        </label>
      </div>
    </form>
  );
};

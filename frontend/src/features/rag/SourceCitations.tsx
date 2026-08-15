import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SourceCitationItem {
  material_id: string;
  titulo: string;
  chunk_index: number;
  similarity: number;
}

export interface SourceCitationsProps {
  sources: SourceCitationItem[];
}

export const SourceCitations: React.FC<SourceCitationsProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div
      id="box-chat-fontes"
      data-testid="box-chat-fontes"
      className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs"
    >
      <div className="flex items-center gap-1.5 text-purple-400 font-semibold uppercase tracking-wider text-[11px]">
        <BookOpen className="w-3.5 h-3.5" />
        <span>Fontes & Chunks Citados (pgvector)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((src, idx) => (
          <div
            key={`${src.material_id}-${src.chunk_index}-${idx}`}
            id={`source-citation-card-${idx}`}
            data-testid={`source-citation-card-${idx}`}
            className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2"
          >
            <div className="flex flex-col truncate">
              <Link
                to={`/editor/${src.material_id}`}
                className="font-medium text-slate-200 hover:text-brand-300 truncate"
              >
                {src.titulo}
              </Link>
              <span className="text-[10px] text-slate-500 font-mono">
                Seção / Chunk #{src.chunk_index}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{(src.similarity * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

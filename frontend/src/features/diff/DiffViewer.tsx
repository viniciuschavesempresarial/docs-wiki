import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { DiffChangeItem } from '@shared/contracts';

export interface DiffViewerProps {
  changes: DiffChangeItem[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ changes }) => {
  if (!changes || changes.length === 0) {
    return (
      <div
        id="diff-empty-state"
        data-testid="diff-empty-state"
        className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-xl border border-slate-800"
      >
        Nenhuma alteração encontrada entre as duas versões selecionadas.
      </div>
    );
  }

  return (
    <div
      id="container-diff-viewer"
      data-testid="container-diff-viewer"
      className="w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs md:text-sm shadow-xl"
    >
      <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Comparação Linha a Linha (Git Diff)</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400">
            <Plus className="w-3.5 h-3.5" /> Adições
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <Minus className="w-3.5 h-3.5" /> Remoções
          </span>
        </div>
      </div>

      <div className="overflow-x-auto divide-y divide-slate-800/40">
        {changes.map((change, idx) => {
          if (change.type === 'added') {
            return (
              <div
                key={`diff-${idx}`}
                id={`diff-line-added-${idx}`}
                data-testid="diff-line-added"
                className="flex items-stretch bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/40 transition-colors"
              >
                <div className="w-12 py-1 px-2 text-right text-slate-600 bg-emerald-950/40 select-none shrink-0 border-r border-emerald-900/40">
                  {/* v1 is empty */}
                </div>
                <div className="w-12 py-1 px-2 text-right text-emerald-400 bg-emerald-950/40 select-none shrink-0 border-r border-emerald-900/40">
                  {change.line_v2 ?? idx + 1}
                </div>
                <div className="w-8 py-1 flex items-center justify-center text-emerald-400 font-bold select-none shrink-0">
                  +
                </div>
                <div className="py-1 px-3 flex-1 whitespace-pre-wrap break-all font-mono">
                  {change.content}
                </div>
              </div>
            );
          }

          if (change.type === 'removed') {
            return (
              <div
                key={`diff-${idx}`}
                id={`diff-line-removed-${idx}`}
                data-testid="diff-line-removed"
                className="flex items-stretch bg-rose-950/30 text-rose-300 hover:bg-rose-950/40 transition-colors"
              >
                <div className="w-12 py-1 px-2 text-right text-rose-400 bg-rose-950/40 select-none shrink-0 border-r border-rose-900/40">
                  {change.line_v1 ?? idx + 1}
                </div>
                <div className="w-12 py-1 px-2 text-right text-slate-600 bg-rose-950/40 select-none shrink-0 border-r border-rose-900/40">
                  {/* v2 is empty */}
                </div>
                <div className="w-8 py-1 flex items-center justify-center text-rose-400 font-bold select-none shrink-0">
                  -
                </div>
                <div className="py-1 px-3 flex-1 whitespace-pre-wrap break-all font-mono">
                  {change.content}
                </div>
              </div>
            );
          }

          // Unchanged line
          return (
            <div
              key={`diff-${idx}`}
              id={`diff-line-unchanged-${idx}`}
              data-testid="diff-line-unchanged"
              className="flex items-stretch text-slate-400 hover:bg-slate-900/50 transition-colors"
            >
              <div className="w-12 py-1 px-2 text-right text-slate-600 select-none shrink-0 border-r border-slate-800">
                {change.line_v1}
              </div>
              <div className="w-12 py-1 px-2 text-right text-slate-600 select-none shrink-0 border-r border-slate-800">
                {change.line_v2}
              </div>
              <div className="w-8 py-1 flex items-center justify-center text-slate-600 select-none shrink-0">
                &nbsp;
              </div>
              <div className="py-1 px-3 flex-1 whitespace-pre-wrap break-all font-mono text-slate-300">
                {change.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

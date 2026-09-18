import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { Button } from './Button';

export interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemCount: number;
  itemTitles?: string[];
  isLoading?: boolean;
}

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemTitles = [],
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-bulk-delete-backdrop"
      data-testid="modal-bulk-delete-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="modal-bulk-delete"
        data-testid="modal-bulk-delete"
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Confirmar Exclusão em Massa
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ação Administrativa com Remoção em CASCADE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Alert */}
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Atenção: Exclusão Permanente e Irreversível</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Você está prestes a excluir <strong className="text-white font-bold">{itemCount} material(is)</strong> selecionado(s).
            Esta operação realizará a <strong className="text-rose-300">exclusão em CASCADE</strong> de:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1 text-[11px]">
            <li>Todos os registros de documentos no banco de dados</li>
            <li>Todo o histórico de versões Git-like e commits associados</li>
            <li>Todos os chunks vetoriais semânticos e índices de busca híbrida</li>
            <li>Expurgo de cache vetorial no Redis e eventos no RabbitMQ</li>
          </ul>
        </div>

        {/* Selected preview (if available) */}
        {itemTitles.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">
              Materiais a serem excluídos ({itemTitles.length}):
            </span>
            <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-300">
              {itemTitles.map((title, idx) => (
                <div key={idx} className="truncate flex items-center gap-1.5">
                  <span className="text-slate-500">•</span>
                  <span className="truncate">{title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <Button
            id="btn-cancel-bulk-delete"
            data-testid="btn-cancel-bulk-delete"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            id="btn-confirm-bulk-delete"
            data-testid="btn-confirm-bulk-delete"
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Excluindo...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirmar Exclusão ({itemCount})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

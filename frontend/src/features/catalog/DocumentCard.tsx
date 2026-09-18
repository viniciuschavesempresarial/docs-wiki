import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, HardDrive, Hash, GitCompare, Edit, Sparkles, Trash2, CheckSquare, Square } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useChatStore } from '../../stores/useChatStore';
import { useMaterialSelectionStore } from '../../stores/useMaterialSelectionStore';
import { useAuth } from '../auth/useAuth';

export interface DocumentCardProps {
  id: string;
  titulo: string;
  slug?: string;
  autor?: string;
  categoria?: string;
  tipo?: string;
  tags?: string[];
  tamanho_bytes?: number;
  numero_palavras?: number;
  data_publicacao?: string | Date;
  resumo_okf?: string;
  hybrid_score?: number;
  onDelete?: (id: string, titulo: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  titulo,
  autor = 'Autor Desconhecido',
  categoria = 'Geral',
  tipo = 'artigo',
  tags = [],
  tamanho_bytes = 0,
  numero_palavras = 0,
  data_publicacao,
  resumo_okf,
  hybrid_score,
  onDelete,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ADMIN');

  const { selectedDocIds, toggleDocSelection } = useChatStore();
  const isSelectedForRAG = selectedDocIds.includes(id);

  const { isSelected, toggleSelection } = useMaterialSelectionStore();
  const isChecked = isSelected(id);

  const formattedSize =
    tamanho_bytes >= 1024 * 1024
      ? `${(tamanho_bytes / (1024 * 1024)).toFixed(1)} MB`
      : tamanho_bytes >= 1024
      ? `${(tamanho_bytes / 1024).toFixed(1)} KB`
      : `${tamanho_bytes} B`;

  const formattedWords = numero_palavras.toLocaleString('pt-BR');

  const formattedDate = data_publicacao
    ? typeof data_publicacao === 'string'
      ? data_publicacao.split('T')[0]
      : new Date(data_publicacao).toLocaleDateString('pt-BR')
    : 'Recentemente';

  return (
    <Card
      id={`card-doc-${id}`}
      data-testid={`card-doc-${id}`}
      className={`flex flex-col justify-between transition group relative ${
        isChecked
          ? 'border-brand-500/80 bg-brand-950/20 shadow-lg shadow-brand-500/5'
          : 'hover:border-slate-700'
      }`}
    >
      <div>
        {/* Top Header: Checkbox + Badges & Scores */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Multi-Selection Checkbox */}
            <button
              id={`checkbox-select-${id}`}
              data-testid={`checkbox-select-${id}`}
              onClick={() => toggleSelection(id)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition p-0.5 rounded focus:outline-none"
              title={isChecked ? 'Desmarcar material' : 'Selecionar material'}
            >
              {isChecked ? (
                <CheckSquare className="w-5 h-5 text-brand-400 fill-brand-500/20" />
              ) : (
                <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
              )}
            </button>

            <Badge id={`badge-cat-${id}`} data-testid={`badge-cat-${id}`} variant="primary">
              {categoria}
            </Badge>
            <Badge id={`badge-tipo-${id}`} data-testid={`badge-tipo-${id}`} variant="secondary">
              {tipo}
            </Badge>
          </div>

          {hybrid_score !== undefined && (
            <div
              id={`badge-score-${id}`}
              data-testid={`badge-score-${id}`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold"
              title="Score Híbrido: 0.3*BM25 + 0.7*Vector"
            >
              <Sparkles className="w-3 h-3" />
              <span>{(hybrid_score * 100).toFixed(0)}% Match</span>
            </div>
          )}
        </div>

        {/* Title & Summary */}
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-brand-300 transition mb-2">
          <Link
            id={`link-doc-title-${id}`}
            data-testid={`link-doc-title-${id}`}
            to={`/editor/${id}`}
          >
            {titulo}
          </Link>
        </h3>

        {resumo_okf && (
          <p
            id={`text-doc-resumo-${id}`}
            data-testid={`text-doc-resumo-${id}`}
            className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed"
          >
            {resumo_okf}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                id={`tag-${id}-${tag}`}
                data-testid={`tag-${id}-${tag}`}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-750"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Metadata Grid & Action Buttons */}
      <div className="pt-4 border-t border-slate-800/80 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{autor}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedSize}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedWords} palavras</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            id={`btn-select-rag-${id}`}
            data-testid={`btn-select-rag-${id}`}
            onClick={() => toggleDocSelection(id)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition font-medium flex items-center gap-1.5 ${
              isSelectedForRAG
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            {isSelectedForRAG ? 'Selecionado p/ RAG' : '+ Adicionar ao RAG'}
          </button>

          <div className="flex items-center gap-2">
            <Link id={`link-doc-diff-${id}`} data-testid={`link-doc-diff-${id}`} to={`/diff/${id}`}>
              <Button
                id={`btn-doc-diff-${id}`}
                data-testid={`btn-doc-diff-${id}`}
                variant="ghost"
                size="sm"
                className="text-xs text-slate-400 hover:text-slate-200"
                title="Histórico de Versões e Diffs"
              >
                <GitCompare className="w-3.5 h-3.5 mr-1" />
                Diff
              </Button>
            </Link>
            <Link id={`link-doc-edit-${id}`} data-testid={`link-doc-edit-${id}`} to={`/editor/${id}`}>
              <Button
                id={`btn-doc-edit-${id}`}
                data-testid={`btn-doc-edit-${id}`}
                variant="secondary"
                size="sm"
                className="text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Editar
              </Button>
            </Link>

            {/* Admin Delete Action */}
            {isAdmin && onDelete && (
              <Button
                id={`btn-doc-delete-${id}`}
                data-testid={`btn-doc-delete-${id}`}
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id, titulo)}
                className="text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-500/10"
                title="Excluir Material (Admin)"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

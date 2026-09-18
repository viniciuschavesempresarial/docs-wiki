import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Gera array de páginas com elipses
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalItems <= 0) {
    return null;
  }

  return (
    <div
      id="pagination-container"
      data-testid="pagination-container"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 ${className}`}
    >
      {/* Resumo de itens */}
      <div className="text-xs text-slate-400 font-medium">
        Mostrando <span className="font-semibold text-slate-200">{startItem}</span> a{' '}
        <span className="font-semibold text-slate-200">{endItem}</span> de{' '}
        <span className="font-semibold text-slate-200">{totalItems}</span> materiais
      </div>

      {/* Controles de Navegação */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Primeira página */}
        <Button
          id="btn-page-first"
          data-testid="btn-page-first"
          variant="ghost"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          className="p-1.5 h-8 w-8 text-slate-400 hover:text-white disabled:opacity-30"
          title="Primeira Página"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Página Anterior */}
        <Button
          id="btn-page-prev"
          data-testid="btn-page-prev"
          variant="ghost"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 h-8 w-8 text-slate-400 hover:text-white disabled:opacity-30"
          title="Página Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Números das Páginas */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-xs text-slate-500 font-mono select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                id={`btn-page-${pageNum}`}
                data-testid={`btn-page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs font-medium font-mono transition-colors ${
                  isCurrent
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-900/40 border border-slate-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Próxima Página */}
        <Button
          id="btn-page-next"
          data-testid="btn-page-next"
          variant="ghost"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 h-8 w-8 text-slate-400 hover:text-white disabled:opacity-30"
          title="Próxima Página"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Última Página */}
        <Button
          id="btn-page-last"
          data-testid="btn-page-last"
          variant="ghost"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="p-1.5 h-8 w-8 text-slate-400 hover:text-white disabled:opacity-30"
          title="Última Página"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Seletor de tamanho de página (opcional) */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Itens por pág:</span>
          <select
            id="select-page-size"
            data-testid="select-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      )}
    </div>
  );
};

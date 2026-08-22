import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  useDocumentMetadata('404 - Página Não Encontrada', 'A página que você está procurando não existe, foi removida ou o endereço está incorreto.');
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-center select-none">
      <div className="relative mb-6">
        {/* Glow behind icon */}
        <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full w-24 h-24 mx-auto"></div>
        <FileQuestion className="relative h-20 w-20 text-brand-500 mx-auto stroke-[1.5] animate-bounce" />
      </div>
      
      <h1 className="text-5xl font-extrabold text-slate-100 sm:text-6xl tracking-tight mb-2">
        404
      </h1>
      <h2 className="text-xl font-semibold text-slate-300 mb-4">
        Página Não Encontrada
      </h2>
      <p className="max-w-md text-base text-slate-400 mb-8 mx-auto leading-relaxed">
        Desculpe, a página que você tentou acessar não existe, foi removida ou o endereço está incorreto.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          id="btn-back"
          variant="secondary" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button 
          id="btn-home"
          variant="primary" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Home className="h-4 w-4" />
          Ir para a Home
        </Button>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand-500 animate-pulse" />
          <span className="font-semibold text-lg bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity select-none">
            QAndora
          </span>
        </div>
        <p className="text-sm text-slate-400 text-center sm:text-right">
          &copy; {new Date().getFullYear()} QAndora. Todos os direitos reservados. Foco em Quality Assurance.
        </p>
      </div>
    </footer>
  );
};

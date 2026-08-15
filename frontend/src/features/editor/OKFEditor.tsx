import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface OKFEditorProps {
  content: string;
  onChange: (content: string) => void;
  onUpload?: (fileContent: string) => void;
}

export const OKFEditor: React.FC<OKFEditorProps> = ({ content, onChange, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onChange(text);
          if (onUpload) onUpload(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab indent
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div
      id="container-okf-editor"
      data-testid="container-okf-editor"
      className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-inner"
    >
      {/* Editor Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span>Editor OKF (YAML + Markdown)</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".md,.markdown,.txt"
            className="hidden"
            id="hidden-file-upload-input"
            data-testid="hidden-file-upload-input"
          />
          <Button
            id="btn-upload-okf"
            data-testid="btn-upload-okf"
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            Carregar Arquivo .md
          </Button>
        </div>
      </div>

      {/* Editor Textarea */}
      <div className="flex-1 relative flex">
        <textarea
          id="textarea-okf-editor"
          data-testid="textarea-okf-editor"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`---\ntitle: Título do Documento\nslug: titulo-do-documento\ntype: artigo\ncategory: Arquitetura de Software\ntags:\n  - microsserviços\nauthor: Nome do Autor\nauthor_id: usr-admin-1\ndata_publicacao: '2026-02-01'\n---\n\n# Título do Documento\n\nComece a escrever o conteúdo aqui...`}
          className="w-full h-full p-4 bg-transparent text-slate-200 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 selection:bg-brand-600/40"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

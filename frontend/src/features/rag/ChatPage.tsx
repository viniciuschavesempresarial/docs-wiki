import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Bot, Trash2 } from 'lucide-react';
import apiClient from '../../api/client';
import { useChatStore } from '../../stores/useChatStore';
import { DocumentSelector } from './DocumentSelector';
import { AIResponseBox } from './AIResponseBox';
import { Button } from '../../components/ui/Button';
import { ChatResponse } from '@shared/contracts';

export const ChatPage: React.FC = () => {
  const [pergunta, setPergunta] = useState('');
  const { messages, selectedDocIds, addMessage, clearMessages, isLoading, setIsLoading } =
    useChatStore();

  const chatMutation = useMutation({
    mutationFn: async (userQuery: string) => {
      const res = await apiClient.post<ChatResponse>('/api/search/chat', {
        query: userQuery,
        material_ids: selectedDocIds,
      });
      return res.data;
    },
    onSuccess: (data) => {
      addMessage({
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      });
      setIsLoading(false);
    },
    onError: (err: any) => {
      addMessage({
        role: 'assistant',
        content:
          err.response?.data?.message ||
          'Desculpe, ocorreu um erro ao consultar o modelo Gemini. Verifique a chave de API.',
      });
      setIsLoading(false);
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pergunta.trim() || isLoading) return;

    const queryText = pergunta.trim();
    setPergunta('');

    // Add user message
    addMessage({
      role: 'user',
      content: queryText,
    });

    setIsLoading(true);
    chatMutation.mutate(queryText);
  };

  return (
    <div id="page-ai-chat" data-testid="page-ai-chat" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col h-[calc(100vh-4.5rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Painel de Agentes IA & RAG Contextual</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Gemini Pro
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Converse com a base de conhecimento com grounded context e citações automáticas
            </p>
          </div>
        </div>

        <Button
          id="btn-chat-limpar"
          data-testid="btn-chat-limpar"
          variant="ghost"
          size="sm"
          onClick={clearMessages}
          className="text-xs text-slate-400 hover:text-slate-200"
          title="Limpar Histórico"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Limpar Conversa
        </Button>
      </div>

      {/* Main Chat & Sidebar Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Left Column: Context Document Selector */}
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <DocumentSelector />
        </div>

        {/* Right Column: Chat Box & Input */}
        <div className="lg:col-span-3 flex flex-col min-h-0 gap-4">
          <AIResponseBox messages={messages} isLoading={isLoading} />

          {/* Chat Form Input */}
          <form
            id="form-chat"
            data-testid="form-chat"
            onSubmit={handleSendMessage}
            className="flex items-center gap-3 shrink-0"
          >
            <input
              id="input-chat-pergunta"
              data-testid="input-chat-pergunta"
              type="text"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder={
                selectedDocIds.length > 0
                  ? `Pergunte algo sobre os ${selectedDocIds.length} documentos selecionados...`
                  : 'Selecione ao menos um documento no painel lateral para contextualizar a pergunta...'
              }
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            />

            <Button
              id="btn-chat-enviar"
              data-testid="btn-chat-enviar"
              type="submit"
              variant="primary"
              size="md"
              disabled={!pergunta.trim() || isLoading}
              isLoading={isLoading}
              className="bg-purple-600 hover:bg-purple-500 focus:ring-purple-500 shadow-purple-950/40"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

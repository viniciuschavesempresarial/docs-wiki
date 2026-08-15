import React from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '../../stores/useChatStore';
import { SourceCitations } from './SourceCitations';

export interface AIResponseBoxProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const AIResponseBox: React.FC<AIResponseBoxProps> = ({ messages, isLoading = false }) => {
  return (
    <div
      id="box-chat-resposta"
      data-testid="box-chat-resposta"
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-950/60 rounded-2xl border border-slate-800 backdrop-blur-sm"
    >
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            id={`chat-msg-${msg.id}`}
            data-testid={`chat-msg-${msg.id}`}
            className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                isUser
                  ? 'bg-brand-600 text-white'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Message Body */}
            <div
              className={`flex-1 rounded-2xl p-4 text-sm leading-relaxed border ${
                isUser
                  ? 'bg-brand-600/15 border-brand-500/30 text-slate-100 rounded-tr-none'
                  : 'bg-slate-900/90 border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="font-semibold text-xs text-slate-300">
                  {isUser ? 'Você' : 'Docs-Wiki AI (Gemini)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
              </div>

              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Citations if available */}
              {msg.sources && msg.sources.length > 0 && <SourceCitations sources={msg.sources} />}
            </div>
          </div>
        );
      })}

      {/* Typing / Loading indicator */}
      {isLoading && (
        <div
          id="chat-typing-indicator"
          data-testid="chat-typing-indicator"
          className="flex items-center gap-3 mr-auto max-w-md p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs animate-pulse"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <span>Consultando vetores no pgvector e sintetizando com Gemini...</span>
        </div>
      )}
    </div>
  );
};

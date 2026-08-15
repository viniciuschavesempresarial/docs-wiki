import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    material_id: string;
    titulo: string;
    chunk_index: number;
    similarity: number;
  }>;
  timestamp: string;
}

export interface ChatState {
  selectedDocIds: string[];
  messages: ChatMessage[];
  isLoading: boolean;
  toggleDocSelection: (id: string) => void;
  setSelectedDocs: (ids: string[]) => void;
  clearSelection: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  selectedDocIds: [],
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'Olá! Sou o assistente RAG com Gemini do Docs-Wiki. Selecione os documentos no painel lateral e faça qualquer pergunta para consultar o acervo com citações precisas.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  isLoading: false,
  toggleDocSelection: (id) =>
    set((state) => ({
      selectedDocIds: state.selectedDocIds.includes(id)
        ? state.selectedDocIds.filter((item) => item !== id)
        : [...state.selectedDocIds, id],
    })),
  setSelectedDocs: (ids) => set({ selectedDocIds: ids }),
  clearSelection: () => set({ selectedDocIds: [] }),
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    })),
  setIsLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}));

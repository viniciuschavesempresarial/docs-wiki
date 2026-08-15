import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './testUtils';
import { ChatPage } from '../features/rag/ChatPage';
import apiClient from '../api/client';

jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockMaterialsList = {
  items: [
    {
      id: 'mat-001',
      titulo: 'Guia de Arquitetura Distribuída',
      categoria: 'Arquitetura de Software',
      tipo: 'livro',
    },
    {
      id: 'mat-002',
      titulo: 'NLP e Embeddings Modernos',
      categoria: 'Inteligência Artificial',
      tipo: 'artigo',
    },
  ],
};

const mockChatResponse = {
  answer: 'Resposta fundamentada pelo modelo Gemini com base nos documentos selecionados.',
  sources: [
    {
      material_id: 'mat-001',
      titulo: 'Guia de Arquitetura Distribuída',
      chunk_index: 1,
      similarity: 0.95,
    },
  ],
};

describe('Feature: Painel de Agentes IA & RAG Contextual', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar seletor de documentos, caixa de mensagens e enviar pergunta ao Gemini', async () => {
    const user = userEvent.setup();
    mockedApiClient.get.mockResolvedValueOnce({ data: mockMaterialsList });
    mockedApiClient.post.mockResolvedValueOnce({ data: mockChatResponse });

    renderWithProviders(<ChatPage />);

    // Check document selector and chat elements
    expect(screen.getByTestId('panel-seletor-documentos-rag')).toBeInTheDocument();
    expect(screen.getByTestId('input-chat-pergunta')).toBeInTheDocument();
    expect(screen.getByTestId('btn-chat-enviar')).toBeInTheDocument();
    expect(screen.getByTestId('box-chat-resposta')).toBeInTheDocument();

    // Check material checkboxes in context selector
    await waitFor(() => {
      expect(screen.getByTestId('checkbox-select-doc-mat-001')).toBeInTheDocument();
      expect(screen.getByTestId('checkbox-select-doc-mat-002')).toBeInTheDocument();
    });

    const inputPergunta = screen.getByTestId('input-chat-pergunta');
    const btnEnviar = screen.getByTestId('btn-chat-enviar');

    await user.type(inputPergunta, 'Como funciona o pgvector com MPNet?');
    await user.click(btnEnviar);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/search/chat',
        expect.objectContaining({
          query: 'Como funciona o pgvector com MPNet?',
        })
      );
      expect(
        screen.getByText('Resposta fundamentada pelo modelo Gemini com base nos documentos selecionados.')
      ).toBeInTheDocument();
      expect(screen.getByTestId('box-chat-fontes')).toBeInTheDocument();
    });
  });
});

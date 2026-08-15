import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './testUtils';
import { HomePage } from '../features/catalog/HomePage';
import apiClient from '../api/client';

jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockSearchResults = {
  results: [
    {
      material_id: 'mat-001',
      titulo: 'Guia de Arquitetura Distribuída',
      slug: 'guia-arquitetura-distribuida',
      autor: 'Martin Fowler',
      categoria: 'Arquitetura de Software',
      tipo: 'livro',
      tags: ['microsserviços', 'distribuído'],
      resumo_okf: 'Padrões de mensageria e resiliência.',
      data_publicacao: '2026-01-15',
      text_score: 0.85,
      vector_score: 0.92,
      hybrid_score: 0.89,
    },
  ],
  total: 1,
  page: 1,
  limit: 10,
  ai_summary: 'Síntese de teste gerada pelo Gemini.',
};

describe('Feature: Acervo e Busca Inteligente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar a busca principal, filtros avançados e resultados do acervo', async () => {
    mockedApiClient.get.mockImplementation((url: string) => {
      if (url.includes('/api/content/materials')) {
        return Promise.resolve({ data: { materials: [] } } as any);
      }
      return Promise.resolve({ data: mockSearchResults } as any);
    });

    renderWithProviders(<HomePage />);

    // Check search bar inputs
    expect(screen.getByTestId('input-busca-termo')).toBeInTheDocument();
    expect(screen.getByTestId('btn-executar-busca')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-ia-summarize')).toBeInTheDocument();

    // Check advanced filter inputs
    expect(screen.getByTestId('input-filtro-data-inicio')).toBeInTheDocument();
    expect(screen.getByTestId('input-filtro-data-fim')).toBeInTheDocument();
    expect(screen.getByTestId('select-filtro-categoria')).toBeInTheDocument();
    expect(screen.getByTestId('select-filtro-tipo')).toBeInTheDocument();
    expect(screen.getByTestId('input-filtro-tags')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-filtro-fuzzy')).toBeInTheDocument();

    // Check category navigation tree
    expect(screen.getByTestId('category-tree-nav')).toBeInTheDocument();

    // Wait for results
    await waitFor(() => {
      expect(screen.getByTestId('card-doc-mat-001')).toBeInTheDocument();
      expect(screen.getByText('Guia de Arquitetura Distribuída')).toBeInTheDocument();
      expect(screen.getByTestId('badge-score-mat-001')).toBeInTheDocument();
      expect(screen.getByTestId('box-ai-summary')).toBeInTheDocument();
    });
  });

  test('deve disparar busca com novo termo ao submeter o formulário', async () => {
    const user = userEvent.setup();
    mockedApiClient.get.mockResolvedValue({ data: mockSearchResults });

    renderWithProviders(<HomePage />);

    const searchInput = screen.getByTestId('input-busca-termo');
    const searchBtn = screen.getByTestId('btn-executar-busca');

    await user.type(searchInput, 'microsserviços');
    await user.click(searchBtn);

    await waitFor(() => {
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/search')
      );
    });
  });
});

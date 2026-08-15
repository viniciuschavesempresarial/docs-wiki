import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './testUtils';
import { DiffPage } from '../features/diff/DiffPage';
import apiClient from '../api/client';

jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockDiffResponse = {
  material_id: 'mat-001',
  v1: 1,
  v2: 2,
  changes: [
    { type: 'unchanged' as const, line_v1: 1, line_v2: 1, content: '---' },
    { type: 'removed' as const, line_v1: 2, content: 'title: Título Antigo' },
    { type: 'added' as const, line_v2: 2, content: 'title: Título Novo e Atualizado' },
    { type: 'unchanged' as const, line_v1: 3, line_v2: 3, content: '---' },
  ],
};

describe('Feature: Visualizador de Diffs e Rollback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  test('deve renderizar seletores de versão e linhas de diff adicionadas e removidas', async () => {
    mockedApiClient.get.mockResolvedValueOnce({ data: mockDiffResponse });

    renderWithProviders(
      <Routes>
        <Route path="/diff/:id" element={<DiffPage />} />
      </Routes>,
      { routerInitialEntries: ['/diff/mat-001'] }
    );

    expect(screen.getByTestId('select-diff-v1')).toBeInTheDocument();
    expect(screen.getByTestId('select-diff-v2')).toBeInTheDocument();
    expect(screen.getByTestId('btn-executar-rollback')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('container-diff-viewer')).toBeInTheDocument();
      expect(screen.getByTestId('diff-line-removed')).toHaveTextContent('title: Título Antigo');
      expect(screen.getByTestId('diff-line-added')).toHaveTextContent('title: Título Novo e Atualizado');
    });
  });

  test('deve executar rollback para a versão selecionada ao clicar no botão de ação', async () => {
    const user = userEvent.setup();
    mockedApiClient.get.mockResolvedValue({ data: mockDiffResponse });
    mockedApiClient.post.mockResolvedValueOnce({
      data: { message: 'Rollback para a versão 1 executado com sucesso', versao_head: 1 },
    });

    renderWithProviders(
      <Routes>
        <Route path="/diff/:id" element={<DiffPage />} />
      </Routes>,
      { routerInitialEntries: ['/diff/mat-001'] }
    );

    const rollbackBtn = screen.getByTestId('btn-executar-rollback');
    await user.click(rollbackBtn);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/rollback'),
        expect.objectContaining({
          versao_num: 1,
        })
      );
    });
  });
});


import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './testUtils';
import { EditorPage } from '../features/editor/EditorPage';
import { renderMarkdownSafely } from '../features/editor/MarkdownPreview';
import apiClient from '../api/client';

jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Feature: Editor OKF e Sanitização XSS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve sanitizar scripts maliciosos ao renderizar preview Markdown com DOMPurify', () => {
    const maliciousInput = `
# Título Seguro
<script>alert("xss")</script>
<img src="invalid" onerror="alert('xss')" />
[Link Seguro](https://example.com)
`;
    const sanitized = renderMarkdownSafely(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toContain('Título Seguro');
    expect(sanitized).toContain('https://example.com');
  });

  test('deve permitir edição de texto e comitar nova versão via modal', async () => {
    const user = userEvent.setup();
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        material: { id: 'mat-saved-1' },
        versao: { id: 'ver-saved-1', versao_num: 2 },
      },
    });

    renderWithProviders(<EditorPage />);

    // Check editor and preview
    const textarea = screen.getByTestId('textarea-okf-editor');
    const previewContainer = screen.getByTestId('container-markdown-preview');
    const commitOpenBtn = screen.getByTestId('btn-abrir-commit-modal');

    expect(textarea).toBeInTheDocument();
    expect(previewContainer).toBeInTheDocument();
    expect(commitOpenBtn).toBeInTheDocument();

    // Click to open commit modal
    await user.click(commitOpenBtn);

    // Modal elements
    const commitInput = screen.getByTestId('input-commit-message');
    const confirmCommitBtn = screen.getByTestId('btn-confirmar-commit');

    expect(commitInput).toBeInTheDocument();
    expect(confirmCommitBtn).toBeInTheDocument();

    await user.type(commitInput, 'Atualiza especificações de busca vetorial');
    await user.click(confirmCommitBtn);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/content/materials',
        expect.objectContaining({
          commit_message: 'Atualiza especificações de busca vetorial',
        })
      );
    });
  });
});

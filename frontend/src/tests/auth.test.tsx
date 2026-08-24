import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './testUtils';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import apiClient from '../api/client';

jest.mock('../api/client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Feature: Autenticação e Gestão de Contas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar campos de login e submeter credenciais com sucesso', async () => {
    const user = userEvent.setup();
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        user: {
          id: 'usr-admin-1',
          email: 'admin@docswiki.local',
          nome: 'Administrador',
          roles: ['ADMIN'],
          permissions: [],
        },
      },
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByTestId('input-login-email');
    const senhaInput = screen.getByTestId('input-login-senha');
    const submitBtn = screen.getByTestId('btn-login-submit');

    expect(emailInput).toBeInTheDocument();
    expect(senhaInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();

    await user.type(emailInput, 'admin@docswiki.local');
    await user.type(senhaInput, '123456');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/iam/login',
        expect.objectContaining({
          email: 'admin@docswiki.local',
          password: '123456',
        })
      );
    });
  });

  test('deve renderizar campos de registro e submeter novo usuário com sucesso', async () => {
    const user = userEvent.setup();
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        user: {
          id: 'usr-new-1',
          nome: 'Novo Usuário',
          email: 'novo@docswiki.local',
          roles: ['USER'],
          permissions: [],
        },
      },
    });

    renderWithProviders(<RegisterPage />);

    const nomeInput = screen.getByTestId('input-register-nome');
    const emailInput = screen.getByTestId('input-register-email');
    const senhaInput = screen.getByTestId('input-register-senha');
    const submitBtn = screen.getByTestId('btn-register-submit');

    expect(nomeInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(senhaInput).toBeInTheDocument();
    expect(submitBtn).toBeInTheDocument();

    await user.type(nomeInput, 'Novo Usuário');
    await user.type(emailInput, 'novo@docswiki.local');
    await user.type(senhaInput, 'senhaSegura123');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/iam/register',
        expect.objectContaining({
          nome: 'Novo Usuário',
          email: 'novo@docswiki.local',
          password: 'senhaSegura123',
        })
      );
    });
  });
});

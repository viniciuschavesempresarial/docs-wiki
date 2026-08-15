import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { UserResponse } from '@shared/contracts';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery<UserResponse | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>('/api/iam/me');
        return res.data?.user || res.data || null;
      } catch (err: any) {
        if (err.response?.status === 401) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 min
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; senha?: string; password?: string }) => {
      const payload = {
        email: credentials.email,
        password: credentials.password || credentials.senha,
      };
      const res = await apiClient.post<any>('/api/iam/login', payload);
      return res.data?.user || res.data;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(['auth', 'me'], newUser);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { nome: string; email: string; senha?: string; password?: string }) => {
      const payload = {
        nome: userData.nome,
        email: userData.email,
        password: userData.password || userData.senha,
      };
      const res = await apiClient.post<any>('/api/iam/register', payload);
      return res.data?.user || res.data;
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(['auth', 'me'], newUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/api/iam/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
    },
  });

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    isError,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
  };
};

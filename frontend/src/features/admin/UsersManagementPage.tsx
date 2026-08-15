import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Search, 
  BookOpen, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound
} from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../auth/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';

export interface AdminUserItem {
  id: string;
  email: string;
  nome: string;
  is_active: boolean;
  is_system_protected: boolean;
  roles: string[];
  created_at: string;
}

export const UsersManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userToDelete, setUserToDelete] = useState<AdminUserItem | null>(null);

  // Busca lista completa de usuários com seus papéis
  const { data: usersData, isLoading, isError, refetch } = useQuery<{ users: AdminUserItem[] }>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await apiClient.get<{ users: AdminUserItem[] }>('/api/iam/users');
      return res.data;
    },
    staleTime: 1000 * 10,
  });

  // Mutation para atualizar papéis/permissões do usuário
  const updateRolesMutation = useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) => {
      const res = await apiClient.put(`/api/iam/users/${userId}/roles`, { roles });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setSuccessMessage('Permissões do usuário atualizadas com sucesso!');
      setErrorMessage('');
      setTimeout(() => setSuccessMessage(''), 3500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Falha ao atualizar permissões.';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  // Mutation para excluir usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/api/iam/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setUserToDelete(null);
      setSuccessMessage('Usuário excluído com sucesso!');
      setTimeout(() => setSuccessMessage(''), 3500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Falha ao excluir usuário.';
      setErrorMessage(msg);
      setUserToDelete(null);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const handleRoleToggle = (user: AdminUserItem, roleToToggle: string, isChecked: boolean) => {
    let currentRoles = [...(user.roles || [])];
    if (isChecked) {
      if (!currentRoles.includes(roleToToggle)) {
        currentRoles.push(roleToToggle);
      }
    } else {
      currentRoles = currentRoles.filter((r) => r !== roleToToggle);
    }

    // Garante que o usuário tenha pelo menos um papel (se desmarcar todos, mantém LEITOR)
    if (currentRoles.length === 0) {
      currentRoles = ['LEITOR'];
    }

    updateRolesMutation.mutate({ userId: user.id, roles: currentRoles });
  };

  // Filtragem de usuários por nome ou email
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    if (!searchTerm.trim()) return usersData.users;

    const term = searchTerm.toLowerCase().trim();
    return usersData.users.filter(
      (u) => u.nome.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [usersData, searchTerm]);

  // Contadores estatísticos
  const stats = useMemo(() => {
    const all = usersData?.users || [];
    return {
      total: all.length,
      admins: all.filter((u) => u.roles?.includes('ADMIN')).length,
      editors: all.filter((u) => u.roles?.includes('EDITOR')).length,
      readers: all.filter((u) => u.roles?.includes('LEITOR')).length,
    };
  }, [usersData]);

  return (
    <div id="page-admin-users" data-testid="page-admin-users" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
            <KeyRound className="w-3.5 h-3.5" />
            Painel Administrativo
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Gerenciamento de Acesso & Usuários
          </h1>
          <p className="text-sm text-slate-400">
            Defina os níveis de permissão (Leitura, Edição e Administração) para cada colaborador.
          </p>
        </div>

        <Button
          id="btn-refresh-users"
          data-testid="btn-refresh-users"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="self-start sm:self-auto text-slate-400 hover:text-slate-200"
        >
          Atualizar Lista
        </Button>
      </div>

      {/* Status Notifications */}
      {successMessage && (
        <div
          id="alert-users-success"
          data-testid="alert-users-success"
          className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          id="alert-users-error"
          data-testid="alert-users-error"
          className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card id="card-stat-total" className="p-4 bg-slate-900/60 border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total de Usuários</p>
            <p className="text-xl font-bold text-slate-100">{stats.total}</p>
          </div>
        </Card>

        <Card id="card-stat-admins" className="p-4 bg-slate-900/60 border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Administradores</p>
            <p className="text-xl font-bold text-purple-300">{stats.admins}</p>
          </div>
        </Card>

        <Card id="card-stat-editors" className="p-4 bg-slate-900/60 border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Editores OKF</p>
            <p className="text-xl font-bold text-emerald-300">{stats.editors}</p>
          </div>
        </Card>

        <Card id="card-stat-readers" className="p-4 bg-slate-900/60 border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Leitores</p>
            <p className="text-xl font-bold text-blue-300">{stats.readers}</p>
          </div>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="input-search-users"
            data-testid="input-search-users"
            type="text"
            placeholder="Buscar usuário por nome ou email institucional..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition shadow-inner"
          />
        </div>
        {searchTerm && (
          <Button
            id="btn-clear-search-users"
            data-testid="btn-clear-search-users"
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm('')}
            className="text-slate-400 hover:text-slate-200"
          >
            Limpar Busca
          </Button>
        )}
      </div>

      {/* Users Table */}
      <Card id="card-users-table" className="overflow-hidden border-slate-800 shadow-2xl bg-slate-900/40 backdrop-blur-sm p-0">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Carregando usuários do sistema...</span>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-300">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <p className="font-semibold">Erro ao carregar lista de usuários.</p>
            <p className="text-xs text-rose-400 mt-1">Verifique se possui privilégios de administrador.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <User className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold">Nenhum usuário encontrado</p>
            <p className="text-xs text-slate-500">Tente ajustar o termo de pesquisa.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="table-admin-users" data-testid="table-admin-users" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 sm:px-6">Usuário</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Leitura (LEITOR)</th>
                  <th className="py-3.5 px-4 text-center">Edição (EDITOR)</th>
                  <th className="py-3.5 px-4 text-center">Administração (ADMIN)</th>
                  <th className="py-3.5 px-4">Cadastro</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {filteredUsers.map((u) => {
                  const isProtected = u.is_system_protected;
                  const isSelf = currentUser?.id === u.id;
                  const hasLeitor = u.roles?.includes('LEITOR');
                  const hasEditor = u.roles?.includes('EDITOR');
                  const hasAdmin = u.roles?.includes('ADMIN');

                  return (
                    <tr
                      key={u.id}
                      id={`row-user-${u.id}`}
                      data-testid={`row-user-${u.id}`}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-100 truncate">{u.nome}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                                  Você
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono truncate block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              u.is_active ? 'bg-emerald-400' : 'bg-slate-600'
                            }`}
                          />
                          <span className="text-xs">{u.is_active ? 'Ativo' : 'Inativo'}</span>
                          {isProtected && (
                            <span
                              title="Usuário protegido pelo sistema (não pode ser excluído nem rebaixado)"
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"
                            >
                              <KeyRound className="w-2.5 h-2.5" />
                              Protegido
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Checkbox Leitor */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            id={`chk-leitor-${u.id}`}
                            data-testid={`chk-leitor-${u.id}`}
                            checked={hasLeitor}
                            onChange={(e) => handleRoleToggle(u, 'LEITOR', e.target.checked)}
                            disabled={updateRolesMutation.isPending}
                          />
                        </div>
                      </td>

                      {/* Checkbox Editor */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            id={`chk-editor-${u.id}`}
                            data-testid={`chk-editor-${u.id}`}
                            checked={hasEditor}
                            onChange={(e) => handleRoleToggle(u, 'EDITOR', e.target.checked)}
                            disabled={updateRolesMutation.isPending}
                          />
                        </div>
                      </td>

                      {/* Checkbox Admin */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            id={`chk-admin-${u.id}`}
                            data-testid={`chk-admin-${u.id}`}
                            checked={hasAdmin}
                            onChange={(e) => handleRoleToggle(u, 'ADMIN', e.target.checked)}
                            disabled={updateRolesMutation.isPending || isProtected}
                          />
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <Button
                          id={`btn-delete-user-${u.id}`}
                          data-testid={`btn-delete-user-${u.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToDelete(u)}
                          disabled={isProtected || isSelf}
                          className={`text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 ${
                            isProtected || isSelf ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title={
                            isProtected
                              ? 'Usuário protegido do sistema não pode ser removido'
                              : isSelf
                              ? 'Você não pode excluir sua própria conta'
                              : 'Excluir usuário'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Confirmação de Exclusão de Usuário */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Excluir Usuário</h3>
                <p className="text-xs text-rose-400">Revogação permanente de credenciais</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Tem certeza que deseja remover o usuário{' '}
              <strong className="text-slate-100 font-semibold">{userToDelete.nome}</strong> ({userToDelete.email})?
            </p>

            <p className="text-xs text-slate-400">
              Todas as sessões ativas serão invalidadas e o usuário perderá o acesso à plataforma.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                id="btn-cancel-delete-user"
                data-testid="btn-cancel-delete-user"
                variant="ghost"
                size="md"
                onClick={() => setUserToDelete(null)}
                disabled={deleteUserMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                id="btn-confirm-delete-user"
                data-testid="btn-confirm-delete-user"
                variant="danger"
                size="md"
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
                isLoading={deleteUserMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Sim, Excluir Usuário
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

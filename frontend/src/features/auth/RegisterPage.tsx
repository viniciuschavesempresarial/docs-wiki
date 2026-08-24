import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from './useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export const RegisterPage: React.FC = () => {
  useDocumentMetadata('Criar Conta - Registrar-se', 'Crie sua conta na plataforma Docs-Wiki para começar a criar, organizar e gerenciar páginas e documentos de conhecimento.');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, isRegistering } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await register({ nome, email, password: senha });
      navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Falha ao realizar cadastro. Tente novamente.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card id="card-register" data-testid="card-register" className="w-full max-w-md border-slate-800 shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Criar Nova Conta</h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastre-se para colaborar na base de conhecimento
          </p>
        </div>

        {errorMsg && (
          <div
            id="register-error-alert"
            data-testid="register-error-alert"
            className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form id="form-register" data-testid="form-register" onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="input-register-nome"
            data-testid="input-register-nome"
            type="text"
            label="Nome Completo"
            placeholder="Nome do Usuário"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            id="input-register-email"
            data-testid="input-register-email"
            type="email"
            label="Email Institucional"
            placeholder="novo.usuario@docswiki.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="input-register-senha"
            data-testid="input-register-senha"
            type="password"
            label="Senha (Mínimo 6 caracteres)"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />

          <Button
            id="btn-register-submit"
            data-testid="btn-register-submit"
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isRegistering}
            className="w-full mt-2"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Criar Minha Conta
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Já possui conta?{' '}
          <Link
            id="link-go-to-login"
            data-testid="link-go-to-login"
            to="/login"
            className="text-brand-400 hover:text-brand-300 font-semibold"
          >
            Faça login aqui
          </Link>
        </div>
      </Card>
    </div>
  );
};

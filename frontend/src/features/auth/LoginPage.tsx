import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from './useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login({ email, password: senha });
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Falha ao autenticar. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card id="card-login" data-testid="card-login" className="w-full max-w-md border-slate-800 shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Acesse sua Conta</h1>
          <p className="text-sm text-slate-400 mt-1">
            Entre para gerenciar materiais, criar versões e consultar via RAG
          </p>
        </div>

        {errorMsg && (
          <div
            id="login-error-alert"
            data-testid="login-error-alert"
            className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form id="form-login" data-testid="form-login" onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="input-login-email"
            data-testid="input-login-email"
            type="email"
            label="Email Institucional"
            placeholder="usuario@docswiki.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="input-login-senha"
            data-testid="input-login-senha"
            type="password"
            label="Senha de Acesso"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            id="btn-login-submit"
            data-testid="btn-login-submit"
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoggingIn}
            className="w-full mt-2"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Entrar na Plataforma
          </Button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Não possui uma conta?{' '}
          <Link
            id="link-go-to-register"
            data-testid="link-go-to-register"
            to="/register"
            className="text-brand-400 hover:text-brand-300 font-semibold"
          >
            Cadastre-se aqui
          </Link>
        </div>
      </Card>
    </div>
  );
};

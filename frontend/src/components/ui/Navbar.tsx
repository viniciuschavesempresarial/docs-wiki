import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Edit3, Bot, LogOut, LogIn, UserPlus, User } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.roles?.includes('ADMIN');

  const navLinks = [
    { to: '/', label: 'Acervo & Busca', icon: BookOpen, id: 'nav-link-acervo' },
    { to: '/editor', label: 'Editor OKF', icon: Edit3, id: 'nav-link-editor' },
    { to: '/ai-chat', label: 'Painel IA RAG', icon: Bot, id: 'nav-link-ai-chat' },
    ...(isAdmin ? [{ to: '/admin/users', label: 'Gestão de Usuários', icon: User, id: 'nav-link-admin-users' }] : []),
  ];

  return (
    <header
      id="main-navbar"
      data-testid="main-navbar"
      className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          id="link-brand-logo"
          data-testid="link-brand-logo"
          to="/"
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
              Docs-Wiki
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
              v1.0
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                id={link.id}
                data-testid={link.id}
                to={link.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Auth State */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p id="user-display-name" data-testid="user-display-name" className="text-sm font-medium text-slate-200">
                  {user.nome}
                </p>
                <p id="user-display-role" data-testid="user-display-role" className="text-xs text-brand-400 font-mono">
                  {user.roles?.[0] || 'USER'}
                </p>
              </div>
              <Button
                id="btn-logout"
                data-testid="btn-logout"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                title="Encerrar Sessão"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Sair</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button
                  id="btn-nav-login"
                  data-testid="btn-nav-login"
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Entrar
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  id="btn-nav-register"
                  data-testid="btn-nav-register"
                  variant="primary"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  Cadastrar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

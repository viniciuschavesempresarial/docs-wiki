import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/ui/Navbar';
import { HomePage } from './features/catalog/HomePage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { AuthGuard } from './features/auth/AuthGuard';
import { EditorPage } from './features/editor/EditorPage';
import { DiffPage } from './features/diff/DiffPage';
import { ChatPage } from './features/rag/ChatPage';
import { UsersManagementPage } from './features/admin/UsersManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/editor"
                element={
                  <AuthGuard>
                    <EditorPage />
                  </AuthGuard>
                }
              />
              <Route
                path="/editor/:id"
                element={
                  <AuthGuard>
                    <EditorPage />
                  </AuthGuard>
                }
              />
              <Route path="/diff/:id" element={<DiffPage />} />
              <Route path="/ai-chat" element={<ChatPage />} />
              <Route
                path="/admin/users"
                element={
                  <AuthGuard>
                    <UsersManagementPage />
                  </AuthGuard>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

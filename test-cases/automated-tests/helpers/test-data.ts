/**
 * Standard test data for Playwright test execution
 * Follows guidelines in prompts/10-AUTOMATED_TEST_GENERATION.md
 */

export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@docswiki.local',
    password: '123456',
    nome: 'Administrador do Sistema',
    role: 'ADMIN',
  },
  editor: {
    email: 'editor@docswiki.local',
    password: 'EditorPassword123',
    nome: 'Editor Principal',
    role: 'EDITOR',
  },
  invalid: {
    email: 'invaliduser@docswiki.local',
    password: 'wrongpassword',
  },
  newUser: {
    nome: 'Novo Testador Automação',
    email: 'testUser@docswiki.local',
    password: 'Abc@1234',
  },
};

export const NEW_TEST_DOC_OKF = `---
title: Novo Documento TEST AUTOMATION
slug: novo-documento-test-automation
type: artigo
category: Arquitetura de Software e Testes
tags:
  - novidade
  - docs
  - teste
  - automação
author: Administrador
author_id: 00000000-0000-0000-0000-000000000001
data_publicacao: '2026-08-18'
---

# Novo Documento TEST AUTOMATION

## 1. Visão Geral TEST AUTOMATION
Este documento segue a especificação **Open Knowledge Format (OKF)** combinando metadados estruturados em YAML com corpo completo em Markdown.É um documento gerado pela automação para validar nosso conceito

## 2. Padrões e Detalhes
- Versionamento imutável Git-like com SHA-256.
- Suporte a geração automática de embeddings e chunking estruturado.
- Automação de testes E2E de nível integração
`;

export const MOCK_ADMIN_USERS_LIST = [
  {
    id: 'usr-admin-1',
    email: 'admin@docswiki.local',
    nome: 'Administrador do Sistema',
    is_active: true,
    is_system_protected: true,
    roles: ['ADMIN'],
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-editor-2',
    email: 'editor@docswiki.local',
    nome: 'Editor Conteúdo',
    is_active: true,
    is_system_protected: false,
    roles: ['EDITOR', 'LEITOR'],
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'usr-target-delete-3',
    email: 'usuario.temporario@docswiki.local',
    nome: 'Usuário Temporário Descartável',
    is_active: true,
    is_system_protected: false,
    roles: ['LEITOR'],
    created_at: '2026-03-10T14:30:00Z',
  },
];

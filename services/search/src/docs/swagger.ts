import { Application, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Docs-Wiki API - Plataforma Consolidada de Conteúdo, NLP e Busca Híbrida',
    version: '1.0.0',
    description: `
Documentação OpenAPI consolidada de todos os microsserviços da plataforma **Docs-Wiki**:
- **IAM Service**: Autenticação, Gestão de Usuários e RBAC (\`/api/v1/auth\`)
- **Content Service**: Gestão de Conteúdo OKF e Versionamento Git-like (\`/api/v1/content\`)
- **Search & NLP Service**: Busca Híbrida Ponderada, Chunks Vetoriais e Gemini RAG (\`/api/v1/search\`)
    `,
    contact: {
      name: 'Equipe de Engenharia Docs-Wiki'
    }
  },
  servers: [
    {
      url: '/',
      description: 'API Gateway / Nginx Reverse Proxy (HTTPS Porta 443)'
    },
    {
      url: 'http://localhost:3004',
      description: 'Servidor Search Service Local (Porta 3004)'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'Token JWT em Cookie HttpOnly'
      }
    }
  },
  paths: {
    // ==========================================
    // ROTAS DE BUSCA HÍBRIDA E RAG
    // ==========================================
    '/search': {
      get: {
        summary: 'Busca Híbrida Ponderada (0.3 BM25 + 0.7 Vetor) e Sumarização por IA',
        tags: ['Busca Híbrida & Gemini RAG'],
        parameters: [
          { in: 'query', name: 'q', schema: { type: 'string' }, description: 'Termo de pesquisa livre' },
          { in: 'query', name: 'autor', schema: { type: 'string' }, description: 'Filtrar por nome do autor' },
          { in: 'query', name: 'categoria', schema: { type: 'string' }, description: 'Filtrar por categoria' },
          { in: 'query', name: 'tipo', schema: { type: 'string' }, description: 'Filtrar por tipo de material' },
          { in: 'query', name: 'tag', schema: { type: 'string' }, description: 'Filtrar por tag' },
          { in: 'query', name: 'date_from', schema: { type: 'string', format: 'date' }, description: 'Data inicial' },
          { in: 'query', name: 'date_to', schema: { type: 'string', format: 'date' }, description: 'Data final' },
          { in: 'query', name: 'fuzzy', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Busca fuzzy Levenshtein (pg_trgm)' },
          { in: 'query', name: 'summarize', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Ativar sumarização automática por IA via Gemini' },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Número da página' },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 }, description: 'Limite de resultados por página' }
        ],
        responses: {
          '200': { description: 'Resultados com scores combinados e sumarização opcional' },
          '400': { description: 'Parâmetros de consulta inválidos' }
        }
      }
    },
    '/chat': {
      post: {
        summary: 'Chat RAG Contextual Aterrado em Documentos Selecionados',
        tags: ['Busca Híbrida & Gemini RAG'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['query', 'material_ids'],
                properties: {
                  query: { type: 'string', example: 'Como funciona o cálculo de hash e a imutabilidade?' },
                  material_ids: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                    example: ['00000000-0000-0000-0000-000000000001']
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Resposta contextual aterrada gerada pela Gemini API com fontes' },
          '400': { description: 'Payload inválido' }
        }
      }
    },
    '/health': {
      get: {
        summary: 'Healthcheck do Serviço de Busca',
        tags: ['Sistema'],
        responses: {
          '200': { description: 'Serviço operacional' }
        }
      }
    },

    // ==========================================
    // ROTAS IAM & AUTH (/api/v1/auth)
    // ==========================================
    '/api/v1/auth/register': {
      post: {
        summary: 'Cadastrar Novo Usuário',
        tags: ['IAM & Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'nome', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'usuario@docswiki.local' },
                  nome: { type: 'string', example: 'Nome do Usuário' },
                  password: { type: 'string', format: 'password', example: 'SenhaSegura123' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Usuário registrado com sucesso (Role: LEITOR)' },
          '409': { description: 'E-mail já cadastrado' },
          '400': { description: 'Dados de entrada inválidos' }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Autenticar Usuário e Emitir Cookie HttpOnly',
        tags: ['IAM & Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'admin@docswiki.local' },
                  password: { type: 'string', format: 'password', example: '123456' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Login bem-sucedido com emissão de Cookie token HttpOnly' },
          '401': { description: 'Credenciais inválidas' }
        }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Encerrar Sessão (Limpar Cookie)',
        tags: ['IAM & Autenticação'],
        responses: {
          '200': { description: 'Sessão encerrada com sucesso' }
        }
      }
    },
    '/api/v1/auth/me': {
      get: {
        summary: 'Obter Dados do Usuário Autenticado',
        tags: ['IAM & Autenticação'],
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'Dados do usuário, roles e permissões' },
          '401': { description: 'Não autenticado' }
        }
      }
    },

    // ==========================================
    // ROTAS DE CONTEÚDO E GIT-LIKE (/api/v1/content)
    // ==========================================
    '/api/v1/content/materials': {
      get: {
        summary: 'Listar Todos os Materiais Cadastrados',
        tags: ['Gestão de Conteúdo & Git-Like'],
        responses: {
          '200': { description: 'Lista de materiais cadastrados' }
        }
      },
      post: {
        summary: 'Criar Novo Material OKF (Commit Inicial)',
        tags: ['Gestão de Conteúdo & Git-Like'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['conteudo_okf', 'commit_message'],
                properties: {
                  conteudo_okf: {
                    type: 'string',
                    example: '---\ntitle: "Meu Documento"\nslug: "meu-documento"\ntype: "artigo"\ncategory: "engenharia"\ntags: ["node"]\nauthor: "Autor"\nauthor_id: "00000000-0000-0000-0000-000000000001"\n---\n# Conteúdo Markdown'
                  },
                  commit_message: { type: 'string', example: 'Criação inicial do documento' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Material e versão 1 criados com sucesso' },
          '400': { description: 'Formato OKF inválido' }
        }
      }
    },
    '/api/v1/content/materials/{id}': {
      get: {
        summary: 'Obter Detalhes do Material e Versão HEAD',
        tags: ['Gestão de Conteúdo & Git-Like'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: {
          '200': { description: 'Detalhes do material' },
          '404': { description: 'Material não encontrado' }
        }
      }
    },
    '/api/v1/content/materials/{id}/versions': {
      post: {
        summary: 'Criar Nova Versão (Commit Git-Like com Concorrência Otimista)',
        tags: ['Gestão de Conteúdo & Git-Like'],
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['conteudo_okf', 'commit_message', 'parent_version_id'],
                properties: {
                  conteudo_okf: { type: 'string' },
                  commit_message: { type: 'string' },
                  parent_version_id: { type: 'string', format: 'uuid' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Nova versão criada' },
          '409': { description: 'Conflito de versão (parent_version_id incompatível com HEAD)' }
        }
      }
    },
    '/api/v1/content/materials/{id}/rollback': {
      post: {
        summary: 'Executar Rollback Imutável para Versão Anterior',
        tags: ['Gestão de Conteúdo & Git-Like'],
        security: [{ cookieAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['target_version_num', 'commit_message'],
                properties: {
                  target_version_num: { type: 'integer', example: 1 },
                  commit_message: { type: 'string', example: 'Rollback para a versão 1' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Rollback realizado (nova versão criada contendo dados da versão alvo)' }
        }
      }
    },
    '/api/v1/content/materials/{id}/diff': {
      get: {
        summary: 'Visualizar Diffs Estruturados Linha por Linha entre Duas Versões',
        tags: ['Gestão de Conteúdo & Git-Like'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'v1', required: true, schema: { type: 'integer' } },
          { in: 'query', name: 'v2', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          '200': { description: 'Lista estruturada de diferenças com tipo (added, removed, unchanged)' }
        }
      }
    }
  }
};

export function setupSwagger(app: Application): void {
  app.get('/api-docs/openapi.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerSpec);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Docs-Wiki API Docs - Documentação Consolidada',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  );

  console.log('[SWAGGER] Documentação OpenAPI consolidada configurada na rota /api-docs');
}

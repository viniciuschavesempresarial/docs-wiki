import { app } from './app.js';
import { env } from './config/env.config.js';
import { checkDatabaseConnection, pool } from './config/database.js';
import { connectRedis, redis } from './config/redis.js';

async function startServer(): Promise<void> {
  console.log('=====================================================');
  console.log('🔍 Iniciando Docs-Wiki Search & Gemini RAG API');
  console.log('=====================================================');

  const isDbOk = await checkDatabaseConnection();
  if (!isDbOk) {
    console.warn('[SEARCH_SERVER] Aviso: Não foi possível conectar inicialmente ao PostgreSQL.');
  } else {
    console.log('[SEARCH_SERVER] PostgreSQL conectado com sucesso.');
  }

  await connectRedis();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Search Service rodando na porta ${env.PORT}`);
    console.log(`📚 Documentação OpenAPI disponível em http://localhost:${env.PORT}/api-docs`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[SEARCH_SERVER] Sinal ${signal} recebido. Encerrando servidor...`);
    server.close(async () => {
      await redis.quit().catch(() => {});
      await pool.end();
      console.log('[SEARCH_SERVER] Recursos liberados com sucesso.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((err) => {
  console.error('[SEARCH_SERVER] Erro fatal durante a inicialização:', err);
  process.exit(1);
});

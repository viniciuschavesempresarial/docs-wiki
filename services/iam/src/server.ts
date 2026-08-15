import { createApp } from './app.js';
import { env } from './config/env.js';
import { closePool } from './config/database.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 IAM Service iniciado com sucesso na porta ${env.PORT}`);
  console.log(`📡 Ambiente: ${env.NODE_ENV}`);
});

async function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Sinal ${signal} recebido. Encerrando IAM Service graciosamente...`);
  server.close(async () => {
    try {
      await closePool();
      console.log('✅ Pool de banco de dados encerrado.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Erro ao fechar recursos:', err);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

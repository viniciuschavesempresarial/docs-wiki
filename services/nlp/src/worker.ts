import { checkDatabaseConnection, pool } from './config/database.js';
import { connectRedis, redis } from './config/redis.js';
import { startNLPConsumer, stopNLPConsumer } from './consumer/nlp.consumer.js';
import { closeRabbitMQ } from './config/rabbitmq.js';

async function bootstrapWorker(): Promise<void> {
  console.log('=====================================================');
  console.log('🚀 Iniciando Docs-Wiki NLP & Embeddings Worker');
  console.log('=====================================================');

  // 1. Verifica conexão com o PostgreSQL (schema busca)
  const isDbOk = await checkDatabaseConnection();
  if (!isDbOk) {
    console.error('[WORKER:NLP] Falha crítica: Não foi possível conectar ao banco de dados PostgreSQL.');
    process.exit(1);
  }
  console.log('[WORKER:NLP] PostgreSQL conectado com sucesso.');

  // 2. Conecta ao Redis de Cache (com suporte a fallback offline)
  await connectRedis();

  // 3. Inicia o Consumidor RabbitMQ
  await startNLPConsumer();

  console.log('✅ Worker de NLP em execução e aguardando novos materiais.');
}

async function shutdownGracefully(signal: string): Promise<void> {
  console.log(`\n[WORKER:NLP] Sinal ${signal} recebido. Encerrando worker de forma graciosa...`);

  try {
    await stopNLPConsumer();
    await closeRabbitMQ();
    await redis.quit().catch(() => {});
    await pool.end();
    console.log('[WORKER:NLP] Todos os recursos foram liberados com sucesso. Encerrando processo.');
    process.exit(0);
  } catch (error) {
    console.error('[WORKER:NLP] Erro durante o encerramento dos recursos:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdownGracefully('SIGINT'));
process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));

bootstrapWorker().catch((err) => {
  console.error('[WORKER:NLP] Erro fatal durante a inicialização do worker:', err);
  process.exit(1);
});

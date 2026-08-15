import { app } from './app.js';
import { config } from './config/env.js';
import { checkDatabaseConnection, closeDatabase } from './config/database.js';
import { getRabbitMQChannel, closeRabbitMQ } from './config/rabbitmq.js';

async function bootstrap() {
  console.log('Iniciando content-service...');

  // Verifica conexão com o banco de dados
  const dbOk = await checkDatabaseConnection();
  if (dbOk) {
    console.log('✓ Conexão com PostgreSQL estabelecida com sucesso.');
  } else {
    console.warn('⚠️ Não foi possível conectar ao PostgreSQL. O serviço continuará tentando.');
  }

  // Inicializa canal do RabbitMQ
  const rmqChannel = await getRabbitMQChannel();
  if (rmqChannel) {
    console.log('✓ Conexão com RabbitMQ (plataforma.eventos) estabelecida com sucesso.');
  } else {
    console.warn('⚠️ Não foi possível conectar ao RabbitMQ imediatamente.');
  }

  const server = app.listen(config.port, () => {
    console.log(`🚀 content-service rodando na porta ${config.port} [NODE_ENV: ${config.nodeEnv}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\nSinal ${signal} recebido. Encerrando content-service graciosamente...`);
    server.close(async () => {
      await closeRabbitMQ();
      await closeDatabase();
      console.log('content-service encerrado com sucesso.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Falha crítica ao inicializar content-service:', err);
  process.exit(1);
});

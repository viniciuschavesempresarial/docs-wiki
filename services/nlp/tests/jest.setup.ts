/**
 * Variáveis de ambiente para os testes do nlp-service.
 * Injetadas ANTES de qualquer módulo ser carregado (setupFiles do Jest).
 * Não contém valores reais — apenas stubs para satisfazer a validação Zod.
 */
process.env.DATABASE_URL = 'postgres://test_user:test_pass@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://:test_redis@localhost:6379';
process.env.RABBITMQ_URL = 'amqp://test_rabbit:test_pass@localhost:5672';
process.env.SENTENCE_TRANSFORMER_MODEL = 'paraphrase-multilingual-mpnet-base-v2';
process.env.EMBEDDING_DIMENSIONS = '768';
process.env.NODE_ENV = 'test';

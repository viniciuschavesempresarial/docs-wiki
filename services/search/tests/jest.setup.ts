/**
 * Variáveis de ambiente para os testes do search-service.
 * Injetadas ANTES de qualquer módulo ser carregado (setupFiles do Jest).
 * Não contém valores reais — apenas stubs para satisfazer a validação Zod.
 */
process.env.DATABASE_URL = 'postgres://test_user:test_pass@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://:test_redis@localhost:6379';
process.env.GEMINI_API_KEY = 'mock_gemini_api_key_for_tests';
process.env.GEMINI_MODEL = 'gemini-2.0-flash';
process.env.JWT_SECRET = 'test_jwt_secret_com_pelo_menos_32_caracteres_ok';
process.env.EMBEDDING_DIMENSIONS = '768';
process.env.NODE_ENV = 'test';

import pg from 'pg';
import { env } from './env.config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
  console.error('[DATABASE:NLP] Erro inesperado no pool de conexões do PostgreSQL:', err);
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('[DATABASE:NLP] Falha ao conectar ao PostgreSQL:', error);
    return false;
  }
}

import pg from 'pg';
import { env } from './env.config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
  console.error('[DATABASE:SEARCH] Erro inesperado no pool do PostgreSQL:', err);
});

export class DatabaseManager {
  public pool = pool;

  public async checkDatabaseConnection(): Promise<boolean> {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      console.error('[DATABASE:SEARCH] Falha ao conectar ao PostgreSQL:', (error as Error).message);
      return false;
    }
  }
}

export const dbManager = new DatabaseManager();
export const checkDatabaseConnection = () => dbManager.checkDatabaseConnection();

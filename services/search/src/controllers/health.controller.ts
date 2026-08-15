import { Request, Response } from 'express';
import { dbManager } from '../config/database.js';
import { getIsRedisConnected } from '../config/redis.js';

export async function healthHandler(_req: Request, res: Response): Promise<void> {
  const isDbHealthy = await dbManager.checkDatabaseConnection();
  const isRedisHealthy = getIsRedisConnected();

  const status = isDbHealthy ? 'healthy' : 'degraded';
  const statusCode = isDbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    service: 'search-service',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: isDbHealthy ? 'connected' : 'disconnected',
      redis: isRedisHealthy ? 'connected' : 'offline_fallback'
    }
  });
}

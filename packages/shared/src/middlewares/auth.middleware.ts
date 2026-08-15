import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export function authMiddleware(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ error: 'Acesso não autorizado: token de autenticação ausente' });
      return;
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as UserPayload;
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  };
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Acesso não autorizado' });
      return;
    }

    if (req.user.roles.includes('ADMIN') || req.user.permissions.includes(permission)) {
      next();
      return;
    }

    res.status(403).json({ error: `Acesso negado: permissão '${permission}' necessária` });
  };
}

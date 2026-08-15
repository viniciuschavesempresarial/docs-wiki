import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, user } = await this.authService.login(req.body);

      const isSecure = req.secure;

      res.cookie('token', token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 horas em milissegundos
        path: '/'
      });

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isSecure = req.secure;

      res.clearCookie('token', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/'
      });

      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      next(error);
    }
  };
}

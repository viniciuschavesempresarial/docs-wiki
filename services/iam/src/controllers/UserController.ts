import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import { UnauthorizedError, BadRequestError } from '../middlewares/errorHandler.js';

export class UserController {
  constructor(private userService: UserService) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.sub) {
        throw new UnauthorizedError('Usuário não autenticado');
      }

      const user = await this.userService.getMe(req.user.sub);
      res.status(200).json({ ...user, user });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(200).json({ message: 'Usuário excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.listUsers();
      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  };

  updateUserRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { roles } = req.body;

      if (!Array.isArray(roles)) {
        throw new BadRequestError('O campo roles deve ser um array de strings.');
      }

      const updatedUser = await this.userService.updateUserRoles(id, roles);
      res.status(200).json({
        message: 'Permissões atualizadas com sucesso',
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };
}

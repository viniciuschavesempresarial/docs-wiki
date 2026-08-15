import { z } from 'zod';
import {
  AuthRegisterDTOSchema,
  AuthRegisterDTO,
  AuthLoginDTOSchema,
  AuthLoginDTO
} from '@shared/contracts';

export {
  AuthRegisterDTOSchema,
  AuthRegisterDTO,
  AuthLoginDTOSchema,
  AuthLoginDTO
};

export const UserIdParamSchema = z.object({
  id: z.string().uuid('ID de usuário inválido (formato UUID esperado)')
});

export type UserIdParamDTO = z.infer<typeof UserIdParamSchema>;

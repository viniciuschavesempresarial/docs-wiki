import { z } from 'zod';

export const AuthRegisterDTOSchema = z.object({
  email: z.string().email('E-mail inválido'),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  password: z
    .string()
    .min(8, 'A senha deve conter no mínimo 8 caracteres')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'A senha deve conter pelo menos uma letra e um número')
});

export type AuthRegisterDTO = z.infer<typeof AuthRegisterDTOSchema>;

export const AuthLoginDTOSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória')
});

export type AuthLoginDTO = z.infer<typeof AuthLoginDTOSchema>;

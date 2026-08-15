import { z } from 'zod';

export const OKFFrontmatterSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
  slug: z
    .string()
    .min(3, 'O slug deve ter no mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'O slug deve conter apenas letras minúsculas, números e hífens'),
  type: z.string().min(2, 'O tipo é obrigatório'),
  category: z.string().min(2, 'A categoria é obrigatória'),
  tags: z.array(z.string()).default([]),
  author: z.string().min(2, 'O autor é obrigatório'),
  author_id: z.string().uuid('author_id deve ser um UUID válido').optional(),
  data_publicacao: z.string().optional()
});

export type OKFFrontmatterDTO = z.infer<typeof OKFFrontmatterSchema>;

export const CreateMaterialDTOSchema = z.object({
  conteudo_okf: z.string().min(10, 'Conteúdo OKF muito curto'),
  commit_message: z.string().min(3, 'A mensagem de commit é obrigatória')
});

export type CreateMaterialDTO = z.infer<typeof CreateMaterialDTOSchema>;

export const CommitVersionDTOSchema = z.object({
  conteudo_okf: z.string().min(10, 'Conteúdo OKF muito curto'),
  commit_message: z.string().min(3, 'A mensagem de commit é obrigatória'),
  parent_version_id: z.string().uuid('parent_version_id deve ser um UUID válido')
});

export type CommitVersionDTO = z.infer<typeof CommitVersionDTOSchema>;

export const RollbackDTOSchema = z.object({
  target_version_num: z.number().int().positive('Número de versão inválido'),
  commit_message: z.string().min(3, 'A mensagem de commit para o rollback é obrigatória')
});

export type RollbackDTO = z.infer<typeof RollbackDTOSchema>;

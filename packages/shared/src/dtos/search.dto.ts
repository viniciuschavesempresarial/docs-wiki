import { z } from 'zod';

export const SearchQueryDTOSchema = z.object({
  q: z.string().optional(),
  autor: z.string().optional(),
  categoria: z.string().optional(),
  tipo: z.string().optional(),
  tag: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  fuzzy: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  summarize: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
});

export type SearchQueryDTO = z.infer<typeof SearchQueryDTOSchema>;

export const ChatRequestDTOSchema = z.object({
  query: z.string().min(3, 'A pergunta deve ter no mínimo 3 caracteres'),
  material_ids: z.array(z.string().uuid()).min(1, 'Selecione pelo menos um documento para o chat')
});

export type ChatRequestDTO = z.infer<typeof ChatRequestDTOSchema>;

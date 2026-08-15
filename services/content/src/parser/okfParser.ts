import matter from 'gray-matter';
import { OKFFrontmatterSchema, OKFFrontmatterDTO } from '@shared/contracts';

export interface ParsedOKF {
  frontmatter: OKFFrontmatterDTO;
  markdownBody: string;
  raw: string;
}

export class OKFParseError extends Error {
  public errors?: unknown;

  constructor(message: string, errors?: unknown) {
    super(message);
    this.name = 'OKFParseError';
    this.errors = errors;
  }
}

/**
 * Parser estrito do formato OKF (YAML Frontmatter + Markdown Body).
 * Utiliza gray-matter e validação Zod via OKFFrontmatterSchema.
 */
export function parseOKF(conteudoOkf: string): ParsedOKF {
  if (!conteudoOkf || typeof conteudoOkf !== 'string' || conteudoOkf.trim().length === 0) {
    throw new OKFParseError('Conteúdo OKF não pode ser vazio ou inválido.');
  }

  const trimmed = conteudoOkf.trim();
  if (!trimmed.startsWith('---')) {
    throw new OKFParseError('O documento OKF deve conter um bloco de Frontmatter YAML delimitado por ---.');
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(conteudoOkf);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao processar YAML';
    throw new OKFParseError(`Erro de sintaxe no Frontmatter YAML: ${errorMsg}`);
  }

  if (!parsed.data || typeof parsed.data !== 'object' || Object.keys(parsed.data).length === 0) {
    throw new OKFParseError('Erro de sintaxe no Frontmatter YAML: bloco de metadados inválido ou vazio.');
  }

  const result = OKFFrontmatterSchema.safeParse(parsed.data);
  if (!result.success) {
    const errorMessages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new OKFParseError(`Frontmatter inválido: ${errorMessages}`, result.error.format());
  }

  return {
    frontmatter: result.data,
    markdownBody: parsed.content.trim(),
    raw: conteudoOkf
  };
}

/**
 * Formata metadados Frontmatter e corpo Markdown em uma string OKF válida.
 */
export function stringifyOKF(frontmatter: OKFFrontmatterDTO, markdownBody: string): string {
  return matter.stringify(markdownBody, frontmatter);
}

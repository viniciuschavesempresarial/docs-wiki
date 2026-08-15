export interface OKFFrontmatter {
  title: string;
  slug: string;
  type: string;
  category: string;
  tags: string[];
  author: string;
  author_id?: string;
  data_publicacao?: string;
  [key: string]: unknown;
}

export interface Material {
  id: string;
  slug: string;
  tipo: string;
  categoria: string;
  status: 'draft' | 'published' | 'archived';
  versao_head_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MaterialVersao {
  id: string;
  material_id: string;
  versao_num: number;
  parent_version_id?: string | null;
  conteudo_okf: string;
  conteudo_jsonb: OKFFrontmatter;
  commit_message: string;
  autor_id: string;
  hash_sha256: string;
  created_at: Date;
}

export type DiffChangeType = 'added' | 'removed' | 'unchanged';

export interface DiffChangeItem {
  type: DiffChangeType;
  line_v1?: number;
  line_v2?: number;
  content: string;
}

export interface MaterialDiffResponse {
  material_id: string;
  v1: number;
  v2: number;
  changes: DiffChangeItem[];
}

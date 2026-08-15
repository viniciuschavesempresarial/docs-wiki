export interface IndiceBusca {
  id: string;
  material_id: string;
  versao_num: number;
  titulo: string;
  slug: string;
  autor?: string;
  categoria?: string;
  tipo?: string;
  tags: string[];
  numero_palavras: number;
  tamanho_bytes: number;
  resumo_okf?: string;
  data_publicacao?: Date;
  updated_at: Date;
}

export interface MaterialChunk {
  id: string;
  material_id: string;
  chunk_index: number;
  titulo_secao?: string;
  conteudo_chunk: string;
  embedding: number[];
  created_at: Date;
}

export interface SearchResultItem {
  material_id: string;
  titulo: string;
  slug: string;
  autor?: string;
  categoria?: string;
  tipo?: string;
  tags: string[];
  numero_palavras?: number;
  tamanho_bytes?: number;
  resumo_okf?: string;
  data_publicacao?: string;
  text_score: number;
  vector_score: number;
  hybrid_score: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  ai_summary?: string;
}

export interface ChatSourceCitation {
  material_id: string;
  titulo: string;
  chunk_index: number;
  similarity: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSourceCitation[];
}

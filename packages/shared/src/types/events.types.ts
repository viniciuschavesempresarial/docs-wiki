export interface MaterialCriadoEvent {
  event: 'material.criado';
  material_id: string;
  versao_num: number;
  slug: string;
  titulo: string;
  autor: string;
  autor_id: string;
  categoria: string;
  tipo: string;
  tags: string[];
  conteudo_okf: string;
  timestamp: string;
}

export interface MaterialAtualizadoEvent {
  event: 'material.atualizado';
  material_id: string;
  versao_num: number;
  slug: string;
  titulo: string;
  autor: string;
  autor_id: string;
  categoria: string;
  tipo: string;
  tags: string[];
  conteudo_okf: string;
  timestamp: string;
}

export interface MaterialEnriquecidoEvent {
  event: 'material.enriquecido';
  material_id: string;
  versao_num: number;
  chunks_count: number;
  timestamp: string;
}

export type DomainEvent = MaterialCriadoEvent | MaterialAtualizadoEvent | MaterialEnriquecidoEvent;

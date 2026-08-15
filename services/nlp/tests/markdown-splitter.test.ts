import { splitMarkdownIntoChunks } from '../src/chunker/markdown-splitter.js';

describe('Markdown Header Splitter (Parent-Document Chunking)', () => {
  it('deve particionar documento com múltiplos níveis de cabeçalhos (# e ##)', () => {
    const markdown = `
# Guia de Arquitetura

Este é o parágrafo introdutório do guia de arquitetura.

## Microsserviços e Comunicação

Microsserviços comunicam-se via eventos assíncronos no RabbitMQ.

## Banco de Dados e Vetores

Utilizamos PostgreSQL com extensão pgvector para busca semântica.
`;

    const chunks = splitMarkdownIntoChunks(markdown, { defaultTitle: 'Guia' });

    expect(chunks.length).toBe(3);
    expect(chunks[0].titulo_secao).toBe('Guia de Arquitetura');
    expect(chunks[0].conteudo_chunk).toContain('parágrafo introdutório');
    expect(chunks[1].titulo_secao).toBe('Microsserviços e Comunicação');
    expect(chunks[1].conteudo_chunk).toContain('RabbitMQ');
    expect(chunks[2].titulo_secao).toBe('Banco de Dados e Vetores');
    expect(chunks[2].conteudo_chunk).toContain('pgvector');
  });

  it('deve lidar com documentos sem cabeçalhos usando o título padrão', () => {
    const markdown = 'Este é um texto simples sem nenhum título formatado em markdown.';

    const chunks = splitMarkdownIntoChunks(markdown, { defaultTitle: 'Documento Padrão' });

    expect(chunks.length).toBe(1);
    expect(chunks[0].titulo_secao).toBe('Documento Padrão');
    expect(chunks[0].conteudo_chunk).toBe(markdown);
  });

  it('deve retornar array vazio para markdown em branco', () => {
    const chunks = splitMarkdownIntoChunks('   \n  \n\t  ');
    expect(chunks).toEqual([]);
  });

  it('deve subdividir seções muito longas aplicando sobreposição contextual (overlap)', () => {
    // Cria uma seção longa de 150 palavras
    const words = Array.from({ length: 150 }, (_, i) => `palavra${i + 1}`);
    const longMarkdown = `# Seção Extensa\n\n${words.join(' ')}`;

    const chunks = splitMarkdownIntoChunks(longMarkdown, {
      maxWordsPerChunk: 60,
      overlapWords: 15
    });

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].titulo_secao).toBe('Seção Extensa (Parte 1)');
    expect(chunks[1].titulo_secao).toBe('Seção Extensa (Parte 2)');

    // Verifica que existe sobreposição entre o final do chunk 1 e o início do chunk 2
    const chunk1Words = chunks[0].conteudo_chunk.split(/\s+/);
    const chunk2Words = chunks[1].conteudo_chunk.split(/\s+/);
    const overlapWordSample = chunk1Words[chunk1Words.length - 5];
    expect(chunk2Words).toContain(overlapWordSample);
  });
});

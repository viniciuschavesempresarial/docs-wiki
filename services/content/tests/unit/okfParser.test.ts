import { parseOKF, stringifyOKF, OKFParseError } from '../../src/parser/okfParser.js';

describe('OKFParser (Unit)', () => {
  const validOKF = `---
title: "Guia de Arquitetura de Software"
slug: "guia-arquitetura-software"
type: "artigo"
category: "engenharia"
tags: ["node", "postgres", "arquitetura"]
author: "Nome do Autor"
author_id: "00000000-0000-0000-0000-000000000001"
data_publicacao: "2026-08-08T00:00:00.000Z"
---
# Introdução aos Padrões Arquiteturais

Conteúdo detalhado do documento formatado em Markdown padrão...
`;

  it('deve realizar o parse correto de um documento OKF válido', () => {
    const result = parseOKF(validOKF);

    expect(result.frontmatter).toBeDefined();
    expect(result.frontmatter.title).toBe('Guia de Arquitetura de Software');
    expect(result.frontmatter.slug).toBe('guia-arquitetura-software');
    expect(result.frontmatter.type).toBe('artigo');
    expect(result.frontmatter.category).toBe('engenharia');
    expect(result.frontmatter.tags).toEqual(['node', 'postgres', 'arquitetura']);
    expect(result.frontmatter.author).toBe('Nome do Autor');
    expect(result.frontmatter.author_id).toBe('00000000-0000-0000-0000-000000000001');
    expect(result.markdownBody).toContain('# Introdução aos Padrões Arquiteturais');
    expect(result.raw).toBe(validOKF);
  });

  it('deve lançar erro quando o conteúdo for vazio', () => {
    expect(() => parseOKF('')).toThrow(OKFParseError);
    expect(() => parseOKF('')).toThrow('Conteúdo OKF não pode ser vazio ou inválido.');
  });

  it('deve lançar erro quando o frontmatter YAML estiver ausente', () => {
    const noFrontmatter = '# Apenas Markdown sem Frontmatter';
    expect(() => parseOKF(noFrontmatter)).toThrow(OKFParseError);
    expect(() => parseOKF(noFrontmatter)).toThrow('O documento OKF deve conter um bloco de Frontmatter YAML delimitado por ---.');
  });

  it('deve lançar erro quando o frontmatter YAML for sintaticamente inválido', () => {
    const invalidYaml = `---
title: @invalid_character_unquoted
---
# Markdown
`;
    expect(() => parseOKF(invalidYaml)).toThrow(OKFParseError);
    expect(() => parseOKF(invalidYaml)).toThrow(/Erro de sintaxe no Frontmatter YAML/);
  });

  it('deve lançar erro de validação Zod quando o slug for inválido (maiúsculas ou espaços)', () => {
    const invalidSlugOKF = `---
title: "Guia"
slug: "Guia Invalido com Espacos!"
type: "artigo"
category: "engenharia"
author: "Autor"
author_id: "00000000-0000-0000-0000-000000000001"
---
Corpo markdown
`;
    expect(() => parseOKF(invalidSlugOKF)).toThrow(OKFParseError);
    expect(() => parseOKF(invalidSlugOKF)).toThrow(/slug/);
  });

  it('deve lançar erro quando author_id não for um UUID válido', () => {
    const invalidUuidOKF = `---
title: "Guia Válido"
slug: "guia-valido"
type: "artigo"
category: "engenharia"
author: "Autor"
author_id: "123-nao-e-uuid"
---
Corpo markdown
`;
    expect(() => parseOKF(invalidUuidOKF)).toThrow(OKFParseError);
    expect(() => parseOKF(invalidUuidOKF)).toThrow(/author_id/);
  });

  it('deve converter frontmatter e body em string OKF com stringifyOKF', () => {
    const frontmatter = {
      title: 'Documento Teste',
      slug: 'documento-teste',
      type: 'artigo',
      category: 'tecnologia',
      tags: ['teste'],
      author: 'Tester',
      author_id: '00000000-0000-0000-0000-000000000001'
    };
    const body = '# Conteúdo do Teste';

    const okfString = stringifyOKF(frontmatter, body);
    expect(okfString).toContain('title: Documento Teste');
    expect(okfString).toContain('slug: documento-teste');
    expect(okfString).toContain('# Conteúdo do Teste');

    const reparsed = parseOKF(okfString);
    expect(reparsed.frontmatter.title).toBe(frontmatter.title);
  });
});

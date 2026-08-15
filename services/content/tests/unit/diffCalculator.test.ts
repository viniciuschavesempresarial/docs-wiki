import { calculateLineDiff } from '../../src/parser/diffCalculator.js';

describe('DiffCalculator (Unit)', () => {
  const materialId = '00000000-0000-0000-0000-000000000001';

  it('deve calcular corretamente diferenças linha por linha com adições, remoções e linhas inalteradas', () => {
    const v1 = `---
title: "Titulo Antigo"
slug: "meu-artigo"
---
# Introducao Antiga
Linha Mantida`;

    const v2 = `---
title: "Titulo Novo e Atualizado"
slug: "meu-artigo"
---
# Introducao Nova
Linha Mantida
Nova Linha Adicionada`;

    const diff = calculateLineDiff(materialId, 1, 2, v1, v2);

    expect(diff.material_id).toBe(materialId);
    expect(diff.v1).toBe(1);
    expect(diff.v2).toBe(2);
    expect(diff.changes.length).toBeGreaterThan(0);

    // Linha de título antiga deve estar como removed
    const removedTitle = diff.changes.find(
      (c) => c.type === 'removed' && c.content.includes('Titulo Antigo')
    );
    expect(removedTitle).toBeDefined();
    expect(removedTitle?.line_v1).toBe(2);

    // Linha de título nova deve estar como added
    const addedTitle = diff.changes.find(
      (c) => c.type === 'added' && c.content.includes('Titulo Novo e Atualizado')
    );
    expect(addedTitle).toBeDefined();
    expect(addedTitle?.line_v2).toBe(2);

    // Linha inalterada
    const unchangedLine = diff.changes.find(
      (c) => c.type === 'unchanged' && c.content === 'Linha Mantida'
    );
    expect(unchangedLine).toBeDefined();
    expect(unchangedLine?.line_v1).toBeDefined();
    expect(unchangedLine?.line_v2).toBeDefined();

    // Nova linha adicionada no final
    const addedEnd = diff.changes.find(
      (c) => c.type === 'added' && c.content === 'Nova Linha Adicionada'
    );
    expect(addedEnd).toBeDefined();
  });

  it('deve identificar quando dois textos são idênticos (todos unchanged)', () => {
    const text = `---\ntitle: "Teste"\n---\n# Corpo`;
    const diff = calculateLineDiff(materialId, 1, 2, text, text);

    expect(diff.changes.every((c) => c.type === 'unchanged')).toBe(true);
    expect(diff.changes.length).toBe(4);
  });
});

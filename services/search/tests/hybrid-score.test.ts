describe('Fórmula do Score de Busca Híbrida Ponderada', () => {
  function calculateHybridScore(textScore: number, vectorScore: number): number {
    const rawScore = 0.3 * textScore + 0.7 * vectorScore;
    return parseFloat(rawScore.toFixed(4));
  }

  it('deve calcular corretamente a ponderação de 0.3 BM25 + 0.7 Vetor', () => {
    const bm25 = 0.8;
    const vector = 0.9;
    const expected = 0.3 * 0.8 + 0.7 * 0.9; // 0.24 + 0.63 = 0.87

    const score = calculateHybridScore(bm25, vector);
    expect(score).toBe(0.87);
  });

  it('deve priorizar a similaridade vetorial mesmo com score textual nulo', () => {
    const bm25 = 0.0;
    const vector = 0.85;
    const expected = 0.3 * 0.0 + 0.7 * 0.85; // 0.595

    const score = calculateHybridScore(bm25, vector);
    expect(score).toBe(0.595);
  });

  it('deve retornar pontuação textual quando a similaridade vetorial for zero', () => {
    const bm25 = 0.6;
    const vector = 0.0;
    const expected = 0.3 * 0.6 + 0.7 * 0.0; // 0.18

    const score = calculateHybridScore(bm25, vector);
    expect(score).toBe(0.18);
  });

  it('deve retornar 1.0 para matches máximos em ambos os métodos', () => {
    const score = calculateHybridScore(1.0, 1.0);
    expect(score).toBe(1.0);
  });
});

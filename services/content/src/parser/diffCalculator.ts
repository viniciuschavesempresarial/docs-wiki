import { DiffChangeItem, MaterialDiffResponse } from '@shared/contracts';

/**
 * Calcula a diferença linha por linha entre dois textos OKF usando o algoritmo LCS.
 */
export function calculateLineDiff(
  materialId: string,
  v1Num: number,
  v2Num: number,
  text1: string,
  text2: string
): MaterialDiffResponse {
  const lines1 = text1.replace(/\r\n/g, '\n').split('\n');
  const lines2 = text2.replace(/\r\n/g, '\n').split('\n');

  const n = lines1.length;
  const m = lines2.length;

  // Matriz LCS para encontrar a maior subsequência comum
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstrução do diff navegando pela matriz
  const rawChanges: { type: 'unchanged' | 'added' | 'removed'; content: string }[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      rawChanges.push({ type: 'unchanged', content: lines1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawChanges.push({ type: 'added', content: lines2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawChanges.push({ type: 'removed', content: lines1[i - 1] });
      i--;
    }
  }

  rawChanges.reverse();

  // Atribuição de índices de linhas (1-based)
  let lineV1 = 1;
  let lineV2 = 1;

  const changes: DiffChangeItem[] = rawChanges.map((change) => {
    if (change.type === 'unchanged') {
      const item: DiffChangeItem = {
        type: 'unchanged',
        line_v1: lineV1,
        line_v2: lineV2,
        content: change.content
      };
      lineV1++;
      lineV2++;
      return item;
    } else if (change.type === 'removed') {
      const item: DiffChangeItem = {
        type: 'removed',
        line_v1: lineV1,
        content: change.content
      };
      lineV1++;
      return item;
    } else {
      const item: DiffChangeItem = {
        type: 'added',
        line_v2: lineV2,
        content: change.content
      };
      lineV2++;
      return item;
    }
  });

  return {
    material_id: materialId,
    v1: v1Num,
    v2: v2Num,
    changes
  };
}

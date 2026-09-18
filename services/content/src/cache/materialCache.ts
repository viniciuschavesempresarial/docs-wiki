import { Material } from '@shared/contracts';

interface CachedList {
  data: { materials: Material[]; total: number };
  expiresAt: number;
}

const listCache = new Map<string, CachedList>();
const LIST_CACHE_TTL_MS = 15000; // 15 segundos de cache em memória

export function getCachedMaterialsList(cacheKey: string): { materials: Material[]; total: number } | null {
  const cached = listCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  return null;
}

export function setCachedMaterialsList(cacheKey: string, data: { materials: Material[]; total: number }): void {
  if (listCache.size >= 500) {
    const firstKey = listCache.keys().next().value;
    if (firstKey) listCache.delete(firstKey);
  }
  listCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + LIST_CACHE_TTL_MS,
  });
}

export function invalidateMaterialsCache(): void {
  listCache.clear();
}

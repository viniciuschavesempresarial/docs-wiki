import crypto from 'crypto';

/**
 * Calcula o hash SHA-256 determinístico de uma string (ex: conteúdo OKF).
 */
export function calculateSHA256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

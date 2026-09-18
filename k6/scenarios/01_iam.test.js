import { check, sleep } from 'k6';
import { httpClient } from '../helpers/http_client.js';
import { authenticate } from '../helpers/auth.js';
import { teardown as teardownCleanup } from '../helpers/teardown.js';
import { getOptions } from '../config/scenarios.js';

export const options = getOptions(__ENV.SCENARIO || 'smoke');

export function setup() {
  const token = authenticate();
  return { token };
}

export function teardown(data) {
  teardownCleanup(data);
}

export default function (data) {
  // 1. Autenticação e Login
  const token = (data && data.token) || authenticate();

  if (token) {
    // 2. Consulta de Perfil do Usuário Autenticado (/api/v1/auth/me)
    const meRes = httpClient.get('/api/v1/auth/me', token, { type: 'auth' });
    check(meRes, {
      'IAM /me: status é 200': (r) => r.status === 200,
      'IAM /me: retorna email válido': (r) => {
        try {
          const body = JSON.parse(r.body);
          return Boolean(body.email || (body.data && body.data.email));
        } catch (e) {
          return false;
        }
      },
    });

    // 3. Validação de Listagem de Chaves ou Usuários
    const keysRes = httpClient.get('/api/v1/auth/api-keys', token, { type: 'auth' });
    check(keysRes, {
      'IAM /api-keys: status é 200 ou 404/vazio': (r) => r.status === 200 || r.status === 404,
    });
  }

  sleep(1);
}

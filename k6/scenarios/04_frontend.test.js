import { check, sleep } from 'k6';
import { httpClient } from '../helpers/http_client.js';
import { getOptions } from '../config/scenarios.js';

export const options = getOptions(__ENV.SCENARIO || 'smoke');

export default function () {
  // 1. Acesso à página inicial (HTML)
  const homeRes = httpClient.get('/', null, { type: 'frontend' });
  check(homeRes, {
    'Frontend /: status é 200': (r) => r.status === 200,
    'Frontend /: HTML retornado': (r) => r.body.includes('<html') || r.body.includes('<!DOCTYPE html>') || r.body.includes('root') || r.body.includes('vite'),
  });

  // 2. Acesso à rota de Login
  const loginPageRes = httpClient.get('/login', null, { type: 'frontend' });
  check(loginPageRes, {
    'Frontend /login: status é 200': (r) => r.status === 200,
  });

  // 3. Acesso à rota de Busca / Explorar
  const searchPageRes = httpClient.get('/search', null, { type: 'frontend' });
  check(searchPageRes, {
    'Frontend /search: status é 200': (r) => r.status === 200,
  });

  sleep(1);
}

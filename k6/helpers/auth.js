import http from 'k6/http';
import { check } from 'k6';
import { CONFIG } from '../config/environments.js';
import { httpErrorsCounter } from './http_client.js';

/**
 * Realiza login e retorna o Access Token JWT
 */
export function authenticate(email = CONFIG.adminEmail, password = CONFIG.adminPassword) {
  const url = `${CONFIG.baseUrl}/api/v1/auth/login`;
  const payload = JSON.stringify({ email, password });
  const vuId = (typeof __VU !== 'undefined' && __VU > 0) ? __VU : 1;
  const virtualIp = `198.51.100.${(vuId % 250) + 1}`;
  const params = {
    headers: {
      ...CONFIG.headers,
      'X-Forwarded-For': virtualIp,
      'X-Real-IP': virtualIp,
    },
    tags: { name: '/api/v1/auth/login', type: 'auth' },
    timeout: CONFIG.timeout,
  };

  const res = http.post(url, payload, params);

  if (res.status >= 400 || res.status === 0) {
    httpErrorsCounter.add(1, {
      endpoint: '/api/v1/auth/login',
      status: `${res.status}`,
      method: 'POST',
    });
  }

  let token = null;

  // 1. Tenta extrair token dos cookies da resposta (padrão HttpOnly do IAM)
  if (res.cookies && res.cookies.token && res.cookies.token.length > 0) {
    token = res.cookies.token[0].value;
  } else if (res.headers && res.headers['Set-Cookie']) {
    const match = res.headers['Set-Cookie'].match(/token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  // 2. Fallback: extrai do corpo JSON
  if (!token) {
    try {
      const data = JSON.parse(res.body);
      token = data.token || data.accessToken || (data.data && (data.data.token || data.data.accessToken));
    } catch (e) {}
  }

  const loginSuccess = check(res, {
    'IAM: Login status é 200': (r) => r.status === 200,
    'IAM: Token JWT emitido (cookie ou body)': () => Boolean(token),
  });

  if (!loginSuccess || !token) {
    console.warn(`[K6:AUTH] Falha ao autenticar usuário ${email} - Status: ${res.status}, Body: ${res.body}`);
    return null;
  }

  return token;
}

/**
 * Cria um usuário de teste temporário no IAM
 */
export function registerTestUser(email, password = 'TestUser@123', name = 'K6 Test User') {
  const url = `${CONFIG.baseUrl}/api/v1/auth/register`;
  const payload = JSON.stringify({ email, password, name });
  const vuId = (typeof __VU !== 'undefined' && __VU > 0) ? __VU : 1;
  const virtualIp = `198.51.100.${(vuId % 250) + 1}`;
  const params = {
    headers: {
      ...CONFIG.headers,
      'X-Forwarded-For': virtualIp,
      'X-Real-IP': virtualIp,
    },
    tags: { name: '/api/v1/auth/register', type: 'auth' },
    timeout: CONFIG.timeout,
  };
  const res = http.post(url, payload, params);
  if (res.status >= 400 || res.status === 0) {
    httpErrorsCounter.add(1, {
      endpoint: '/api/v1/auth/register',
      status: `${res.status}`,
      method: 'POST',
    });
  }
  return res.status === 201 || res.status === 200;
}

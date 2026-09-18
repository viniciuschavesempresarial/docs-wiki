import http from 'k6/http';
import { Counter } from 'k6/metrics';
import { CONFIG } from '../config/environments.js';

// Métrica personalizada para rastrear erros por código de status e endpoint exato
export const httpErrorsCounter = new Counter('http_errors_by_status');

/**
 * Utilitário padronizado para execução de requisições HTTP no k6 com tags e rastreamento de erros
 */
export class HttpClient {
  constructor(baseUrl = CONFIG.baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Constrói cabeçalhos padrão incluindo token JWT se fornecido e IP virtual por VU
   */
  getHeaders(token = null, customHeaders = {}) {
    const vuId = (typeof __VU !== 'undefined' && __VU > 0) ? __VU : 1;
    const virtualIp = `198.51.100.${(vuId % 250) + 1}`;

    const headers = {
      ...CONFIG.headers,
      'X-Forwarded-For': virtualIp,
      'X-Real-IP': virtualIp,
      ...customHeaders,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['Cookie'] = `token=${token}`;
    }
    return headers;
  }

  /**
   * Registra status codes com falha (>= 400)
   */
  trackResponse(res, endpoint, method = 'GET') {
    if (res.status >= 400) {
      httpErrorsCounter.add(1, {
        endpoint: endpoint,
        status: `${res.status}`,
        method: method,
      });
    }
    return res;
  }

  /**
   * Executa requisição GET
   */
  get(path, token = null, tags = {}) {
    const cleanPath = path.split('?')[0];
    const url = `${this.baseUrl}${path}`;
    const params = {
      headers: this.getHeaders(token),
      tags: { name: cleanPath, ...tags },
      timeout: CONFIG.timeout,
    };
    const res = http.get(url, params);
    return this.trackResponse(res, cleanPath, 'GET');
  }

  /**
   * Executa requisição POST
   */
  post(path, payload, token = null, tags = {}) {
    const cleanPath = path.split('?')[0];
    const url = `${this.baseUrl}${path}`;
    const params = {
      headers: this.getHeaders(token),
      tags: { name: cleanPath, ...tags },
      timeout: CONFIG.timeout,
    };
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const res = http.post(url, body, params);
    return this.trackResponse(res, cleanPath, 'POST');
  }

  /**
   * Executa requisição PUT
   */
  put(path, payload, token = null, tags = {}) {
    const cleanPath = path.split('?')[0];
    const url = `${this.baseUrl}${path}`;
    const params = {
      headers: this.getHeaders(token),
      tags: { name: cleanPath, ...tags },
      timeout: CONFIG.timeout,
    };
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const res = http.put(url, body, params);
    return this.trackResponse(res, cleanPath, 'PUT');
  }

  /**
   * Executa requisição DELETE
   */
  del(path, token = null, tags = {}) {
    const cleanPath = path.split('?')[0];
    const url = `${this.baseUrl}${path}`;
    const params = {
      headers: this.getHeaders(token),
      tags: { name: cleanPath, ...tags },
      timeout: CONFIG.timeout,
    };
    const res = http.del(url, null, params);
    return this.trackResponse(res, cleanPath, 'DELETE');
  }
}

export const httpClient = new HttpClient();

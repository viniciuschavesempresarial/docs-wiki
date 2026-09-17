/**
 * Configurações de Ambiente para os Testes de Carga Grafana k6
 */
export const CONFIG = {
  // URL base padrão: VM Staging (https://192.168.0.107) ou sobreposta via __ENV.BASE_URL
  baseUrl: (__ENV.BASE_URL || 'https://192.168.0.107').replace(/\/+$/, ''),
  insecureSkipTLSVerify: true,

  // Credenciais administrativas para setup e autenticação
  adminEmail: __ENV.ADMIN_EMAIL || 'admin@docswiki.local',
  adminPassword: __ENV.ADMIN_PASSWORD || '123456',

  // Configurações de timeout padrão (em ms)
  timeout: '10s',

  // Headers globais
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'k6-load-runner/1.0',
  },

  // URLs de Observabilidade
  prometheusRemoteUrl: __ENV.K6_PROMETHEUS_REMOTE_URL || 'http://victoriametrics:8428/api/v1/write',
};

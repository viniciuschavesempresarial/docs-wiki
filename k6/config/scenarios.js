/**
 * Definições de Cenários e Thresholds para a Suíte Grafana k6
 * Calibrado com SLAs:
 * - Load: 15 a 25 VUs
 * - Stress: 80 VUs
 * - p(95) < 450ms global e por serviço
 */

export const THRESHOLDS = {
  // Taxa de falhas HTTP deve ser inferior a 5%
  http_req_failed: ['rate<0.05'],

  // Latência global percentílica
  http_req_duration: ['p(95)<450', 'p(99)<900'],

  // Thresholds por tag de tipo de operação (SLA acordado p(95) < 450ms)
  'http_req_duration{type:auth}': ['p(95)<450'],
  'http_req_duration{type:content}': ['p(95)<450'],
  'http_req_duration{type:search}': ['p(95)<450'],
  'http_req_duration{type:rag_mock}': ['p(95)<650'],
  'http_req_duration{type:frontend}': ['p(95)<450'],
};

export const SCENARIOS = {
  // 1. SMOKE TEST (Validação rápida de sanidade - 5 VUs)
  smoke: {
    executor: 'constant-vus',
    vus: 5,
    duration: '1m',
    gracefulStop: '10s',
  },

  // 2. LOAD TEST (Carga diária sustentada - 15 a 25 VUs)
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 15 },  // Rampa de subida inicial
      { duration: '3m', target: 25 },  // Rampa até o pico operacional
      { duration: '5m', target: 25 },  // Sustentação em 25 VUs
      { duration: '1m', target: 0 },   // Rampa de descida
    ],
    gracefulRampDown: '15s',
  },

  // 3. STRESS / SPIKE TEST (Pico súbito até 80 VUs para avaliar resiliência)
  stress: {
    executor: 'ramping-vus',
    startVUs: 5,
    stages: [
      { duration: '30s', target: 20 },
      { duration: '1m', target: 50 },
      { duration: '1m', target: 80 },  // Pico em 80 VUs
      { duration: '2m', target: 40 },  
      { duration: '1m', target: 20 },  
      { duration: '30s', target: 0 },
    ],
    gracefulRampDown: '15s',
  },

  // 4. SOAK TEST (Teste de estabilidade contínua - 15 VUs)
  soak: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 15 },
      { duration: '20m', target: 15 }, // Carga constante para verificar vazamentos
      { duration: '1m', target: 0 },
    ],
    gracefulRampDown: '20s',
  },
};

/**
 * Retorna as opções completas do k6 de acordo com o cenário solicitado via variável de ambiente SCENARIO
 */
export function getOptions(selectedScenario = __ENV.SCENARIO || 'load') {
  const scenarioConfig = SCENARIOS[selectedScenario] || SCENARIOS.load;

  return {
    insecureSkipTLSVerify: true,
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    thresholds: THRESHOLDS,
    scenarios: {
      [selectedScenario]: scenarioConfig,
    },
  };
}

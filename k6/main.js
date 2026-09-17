import userJourneyDefault, { setup as userJourneySetup } from './scenarios/05_e2e_user_journey.test.js';
import { generateHtmlReport } from './helpers/reporter.js';
import { getOptions } from './config/scenarios.js';

export const options = getOptions(__ENV.SCENARIO || 'smoke');

export function setup() {
  return userJourneySetup();
}

export default function (data) {
  userJourneyDefault(data);
}

/**
 * Hook de encerramento do k6 para geração dos relatórios HTML e JSON
 */
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    '/reports/k6-summary.html': generateHtmlReport(data),
    '/reports/k6-summary.json': JSON.stringify(data, null, 2),
  };
}

/**
 * Formatação de texto para console stdout padrão
 */
function textSummary(data, options) {
  const p95 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A';
  const totalReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  const failRate = data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 0;

  return `
================================================================================
                    DOCS-WIKI: RESUMO DO TESTE DE CARGA K6
================================================================================
  - Total de Requisições: ${totalReqs}
  - Latência p(95):       ${p95} ms (SLA <= 450 ms)
  - Taxa de Erro HTTP:    ${failRate} % (SLA < 1.00 %)
  - Relatório HTML:       /reports/k6-summary.html
  - Relatório JSON:       /reports/k6-summary.json
================================================================================
`;
}

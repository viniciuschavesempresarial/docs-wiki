import userJourneyDefault, { setup as userJourneySetup } from './scenarios/05_e2e_user_journey.test.js';
import { teardown as teardownCleanup } from './helpers/teardown.js';
import { generateHtmlReport } from './helpers/reporter.js';
import { getOptions } from './config/scenarios.js';

export const options = getOptions(__ENV.SCENARIO || 'smoke');

export function setup() {
  return userJourneySetup();
}

export default function (data) {
  userJourneyDefault(data);
}

export function teardown(data) {
  teardownCleanup(data);
}

/**
 * Hook de encerramento do k6 para geração dos relatórios HTML e JSON por cenário
 */
export function handleSummary(data) {
  const scenario = (__ENV.SCENARIO || 'smoke').toLowerCase();
  const htmlReport = generateHtmlReport(data);
  const jsonReport = JSON.stringify(data, null, 2);

  const outputs = {
    'stdout': formatTerminalSummary(data, scenario),
    [`/reports/k6-summary-${scenario}.html`]: htmlReport,
    [`/reports/k6-summary-${scenario}.json`]: jsonReport,
  };

  return outputs;
}

/**
 * Formatação compacta e limpa para saída no console do terminal (sem linhas em branco extras)
 */
function formatTerminalSummary(data, scenario = 'smoke') {
  const p95 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 'N/A';
  const avg = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['avg'].toFixed(2) : 'N/A';
  const totalReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  const reqRate = data.metrics.http_reqs ? data.metrics.http_reqs.values.rate.toFixed(2) : '0';
  const failRate = data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : '0';
  const fails = data.metrics.http_req_failed ? data.metrics.http_req_failed.values.passes : 0;

  const checksPass = data.metrics.checks ? data.metrics.checks.values.passes : 0;
  const checksFail = data.metrics.checks ? data.metrics.checks.values.fails : 0;
  const checksTotal = checksPass + checksFail;
  const checksRate = checksTotal > 0 ? ((checksPass / checksTotal) * 100).toFixed(1) : '100.0';

  const isOk = parseFloat(failRate) <= 1.0 && (p95 === 'N/A' || parseFloat(p95) <= 450);

  return [
    '================================================================================',
    `   DOCS-WIKI: RESUMO [${scenario.toUpperCase()}] | ${isOk ? '✓ SLA APROVADO' : '⚠ SLA VIOLADO'}`,
    '================================================================================',
    `  • Cenário Executado:   ${scenario.toUpperCase()}`,
    `  • Total Requisições:   ${totalReqs} (${reqRate} req/s)`,
    `  • Latência Média:      ${avg} ms`,
    `  • Latência p(95):       ${p95} ms (Meta SLA <= 450 ms)`,
    `  • Taxa de Falhas HTTP: ${failRate}% (${fails} falhas)`,
    `  • Integridade Checks:  ${checksRate}% aprovados (${checksPass} ok / ${checksFail} falhas)`,
    `  • Relatório HTML:       k6/reports/k6-summary-${scenario}.html`,
    `  • Relatório JSON:       k6/reports/k6-summary-${scenario}.json`,
    '================================================================================'
  ].join('\n');
}

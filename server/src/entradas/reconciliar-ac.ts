import { readFileSync } from 'node:fs';
import { pino } from 'pino';
import { carregarConfigWorker } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { opcoesLog } from '../plataforma/log.js';
import { agregadosDoPainel, esquemaDash, reconciliar, resumir } from '../modulos/acelerato/index.js';

// Entrada `pnpm --filter @metricas-dspd/server exec tsx src/entradas/reconciliar-ac.ts <arquivo.json>`: reconciliação de 1% (D-6) do painel
// novo do Acelerato contra os números AGREGADOS por mês que o dono tirou do dash (arquivo JSON `{ "AAAA-MM": { "criados": n, ... } }`).
// Só lê (papel `dspd_coletor`); imprime contagens e situação, nunca linha de chamado nem pessoa. Sai com 4 se algum indicador divergir.
const arquivo = process.argv[2];
if (arquivo === undefined) {
  process.stderr.write('uso: reconciliar-ac.ts <arquivo-com-os-agregados-do-dash.json>\n');
  process.exit(2);
}
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const dash = esquemaDash.parse(JSON.parse(readFileSync(arquivo, 'utf8')));
  const worker = carregarConfigWorker();
  const log = pino(opcoesLog(worker.LOG_LEVEL));
  pool = criarPool(worker.PG_COLETOR_URL, { statementTimeoutMs: 60_000, log: (msg, ctx) => log.warn(ctx, msg) });
  const linhas = reconciliar(await agregadosDoPainel(pool, montarEsquemas(worker.DSPD_SCHEMA_PREFIXO)), dash);
  process.stdout.write(`${JSON.stringify({ resumo: resumir(linhas), linhas }, null, 2)}\n`);
  process.exitCode = linhas.some((l) => l.situacao === 'diverge') ? 4 : 0;
} catch {
  process.stderr.write('reconciliação falhou: arquivo ou configuração inválidos\n');
  process.exitCode = 1;
} finally {
  await pool?.end();
}

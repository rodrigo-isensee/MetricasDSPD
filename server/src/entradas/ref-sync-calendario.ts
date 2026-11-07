import { pino } from 'pino';
import { carregarConfigRef } from '../plataforma/config.js';
import { categoriaDoErro } from '../plataforma/categoria-erro.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { opcoesLog } from '../plataforma/log.js';
import { ErroCalendario, dataCivilValida, lerCalendario, sincronizarCalendario } from '../modulos/referencia/index.js';

// Entrada `pnpm --filter @metricas-dspd/server run ref:sync-calendario [AAAA-MM-DD]`: grava os calendários, as aplicações por domínio e classe e os
// feriados do arquivo versionado `docs/architecture/fontes/calendario.json` (ADR 0027), com a vigência (padrão: hoje, horário de Brasília) e uma
// versão de critério (T2.6) por domínio com o hash do arquivo. Usa o papel `dspd_ref`; idempotente; feriado gravado nunca muda. Imprime só
// contagens e o hash: nunca a URL, a senha nem o texto do erro do banco.
const dia = process.argv[2] ?? new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);
if (!dataCivilValida(dia) || process.argv.length > 3) {
  process.stderr.write('uso: ref:sync-calendario [AAAA-MM-DD]\n');
  process.exit(2);
}
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const cfg = carregarConfigRef();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  const lido = lerCalendario();
  pool = criarPool(cfg.PG_REF_URL, { max: 1, log: (msg, ctx) => log.warn(ctx, msg) });
  const r = await sincronizarCalendario(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), lido, dia, new Date());
  process.stdout.write(`${JSON.stringify({ vigenteDesde: dia, ...r })}\n`);
} catch (e) {
  process.stderr.write(`ref:sync-calendario falhou: ${e instanceof ErroCalendario ? e.message : categoriaDoErro(e)}\n`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}

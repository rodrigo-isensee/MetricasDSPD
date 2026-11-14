import { carregarConfigMigrar } from '../plataforma/config.js';
import { categoriaDoErro } from '../plataforma/categoria-erro.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { ErroReprojecao, reprojetarEtapasAcelerato } from '../modulos/acelerato/index.js';

// Entrada `pnpm --filter @metricas-dspd/server ac:reprojetar-etapas` (K-308; ADR 0027, item 7.4): refaz os intervalos por etapa (D-7) dos chamados já
// projetados com o dia útil de 8 h 48 e registra a versão de critério `099:D-7-528` (marca T2.6 de S1, S4, S9, S10 e EI), numa transação só.
// Credencial do migrador. Rode depois do `ref:sync-calendario`. Imprime só contagens; recusa (código 4) sem gravar nada se o calendário da
// referência difere do da montagem. Nunca imprime a URL, a senha nem o texto do erro do banco.
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const cfg = carregarConfigMigrar();
  pool = criarPool(cfg.PG_MIGRADOR_URL, { max: 1 });
  const r = await reprojetarEtapasAcelerato(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), () => new Date());
  process.stdout.write(`${JSON.stringify(r)}\n`);
} catch (e) {
  const recusa = e instanceof ErroReprojecao;
  process.stderr.write(`ac:reprojetar-etapas falhou: ${recusa ? e.message : categoriaDoErro(e)}\n`);
  process.exitCode = recusa ? 4 : 1;
} finally {
  await pool?.end();
}

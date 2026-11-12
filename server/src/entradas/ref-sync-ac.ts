import { pino } from 'pino';
import { carregarConfigRef } from '../plataforma/config.js';
import { categoriaDoErro } from '../plataforma/categoria-erro.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { opcoesLog } from '../plataforma/log.js';
import {
  ErroAlvos, ErroDominio, dataCivilValida, lerArquivoAlvos, lerDominio, sincronizarAlvos, sincronizarDominio,
} from '../modulos/referencia/index.js';

// Entrada `pnpm --filter @metricas-dspd/server run ac:ref-sync [AAAA-MM-DD]`: grava em `dspd_ac.ref_dominio` as listas do arquivo versionado
// `docs/architecture/fontes/acelerato-dominio.json` (E4.28), com vigência (padrão: hoje, horário de Brasília) e versão de critério (T2.6)
// com o hash do arquivo. Depois grava os alvos de prioridade (`ref_alvo_prioridade`, D3 do pedido 099) do arquivo versionado
// `docs/architecture/fontes/acelerato-alvos.json`, com a unidade de cada prazo, na mesma data de vigência. Os dois arquivos são lidos e validados
// antes de qualquer escrita. Usa o papel `dspd_ref`; idempotente. Imprime só contagens e os hashes: nunca a URL, a senha nem o texto do erro do banco.
const dia = process.argv[2] ?? new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);
if (!dataCivilValida(dia) || process.argv.length > 3) {
  process.stderr.write('uso: ac:ref-sync [AAAA-MM-DD]\n');
  process.exit(2);
}
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const cfg = carregarConfigRef();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  const lido = lerDominio();
  const alvos = lerArquivoAlvos();
  pool = criarPool(cfg.PG_REF_URL, { max: 1, log: (msg, ctx) => log.warn(ctx, msg) });
  const r = await sincronizarDominio(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), lido, dia, new Date());
  const a = await sincronizarAlvos(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), alvos, dia, new Date());
  process.stdout.write(`${JSON.stringify({ vigenteDesde: dia, ...r, alvos: a })}\n`);
} catch (e) {
  process.stderr.write(`ac:ref-sync falhou: ${e instanceof ErroDominio || e instanceof ErroAlvos ? e.message : categoriaDoErro(e)}\n`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}

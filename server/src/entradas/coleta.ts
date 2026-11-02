import { pino } from 'pino';
import { carregarConfigAcelerato, coletarAcelerato, ErroColeta, prepararTls, projetarAcelerato } from '../modulos/acelerato/index.js';
import { carregarConfigWorker } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { opcoesLog } from '../plataforma/log.js';

// Entrada do `pnpm coleta ac [--releitura] [--reconhecer-mudanca]`: coleta manual do Acelerato (plano 056 §4.4), só na máquina
// do dono. Lê o ambiente (credencial `dspd_coletor` do PostgreSQL e as variáveis ACELERATO_MYSQL_*), imprime o resultado
// em JSON (só contagens e códigos) no stdout. Nunca imprime configuração, senha, host nem o texto de erro do driver.
const [fonte, ...opcoes] = process.argv.slice(2);
const conhecidas = ['--releitura', '--reconhecer-mudanca'];
if (fonte !== 'ac' || opcoes.some((o) => !conhecidas.includes(o))) {
  process.stderr.write('uso: pnpm coleta ac [--releitura] [--reconhecer-mudanca]\n');
  process.exit(2);
}
const releitura = opcoes.includes('--releitura');
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const worker = carregarConfigWorker();
  const config = carregarConfigAcelerato();
  const S = montarEsquemas(worker.DSPD_SCHEMA_PREFIXO);
  const tls = prepararTls(config.tlsSha256, config.tlsCertFile);
  const log = pino(opcoesLog(worker.LOG_LEVEL));
  pool = criarPool(worker.PG_COLETOR_URL, { statementTimeoutMs: 60_000, log: (msg, ctx) => log.warn(ctx, msg) });
  const r = await coletarAcelerato({
    pool, config, tls, S, agora: () => new Date(), log, reconhecerMudanca: opcoes.includes('--reconhecer-mudanca'),
  }, releitura ? 'releitura' : 'incremental');
  // F2: projeta o staging na dimensão e nos intervalos por etapa (independente e repetível; só roda depois de uma coleta concluída).
  const projecao = r.estado === 'ok' ? await projetarAcelerato(pool, S, () => new Date()) : null;
  process.stdout.write(`${JSON.stringify({ coleta: r, projecao }, null, 2)}\n`);
  if (r.estado === 'ok' && r.foraOrganizacoes !== null && r.foraOrganizacoes > 0) {
    process.stderr.write(`ATENÇÃO: ${r.foraOrganizacoes} chamado(s) SSSC das equipes ficam fora das organizações do recorte; leve ao dono antes de publicar o painel (ADR 0023, item 5).\n`);
  }
  process.exitCode = r.estado === 'ok' ? 0 : 3;
} catch (e) {
  const detalhe = e instanceof ErroColeta ? e.paraLog() : { codigo: 'erro-interno' };
  process.stderr.write(`coleta ac falhou: ${JSON.stringify(detalhe)}\n`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}

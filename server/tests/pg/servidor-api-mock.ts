/**
 * Servidor REAL local para a paridade mock x API (FA-4) e o E2E em `VITE_FONTE=api` (FA-5).
 * Migra um conjunto de schemas com prefixo próprio no banco de teste, semeia o MESMO mock do front
 * (semente e escala padrão), sobe a API (`DADOS_FONTE=mock`) e, ao receber SIGINT/SIGTERM, remove os schemas.
 *
 * Uso: PG_TESTE_URL=postgres://dspd_migrador:...@127.0.0.1:5432/metricas_test PORT=3100 tsx tests/pg/servidor-api-mock.ts
 * Imprime `API_PRONTA <porta>` quando aceita conexões. Só ambiente de desenvolvimento/CI.
 */
import { gerarBaseMock } from '@metricas-dspd/mock';
import pg from 'pg';
import { buildApp } from '../../src/app.js';
import { migrar } from '../../src/plataforma/db/migrar.js';
import { montarEsquemas, prefixoDeTeste } from '../../src/plataforma/db/esquemas.js';
import { criarPool, urlDoPapel } from '../../src/plataforma/db/pool.js';
import { semear } from '../../src/plataforma/db/seed.js';

const urlMigrador = process.env.PG_TESTE_URL;
if (!urlMigrador) throw new Error('PG_TESTE_URL ausente (URL do migrador no banco de teste)');
const porta = Number(process.env.PORT ?? 3100);
const prefixo = prefixoDeTeste();
const S = montarEsquemas(prefixo);

await migrar(urlMigrador, { prefixo });
const migrador = criarPool(urlMigrador);
const base = gerarBaseMock();
await semear(migrador, base, S);
// Ajuste de fixture: o seed grava só a coleta `projecao`; sem uma `coleta_incremental` bem-sucedida o estado da coleta
// diz "Nenhuma coleta concluída" e os painéis nem renderizam os cartões. Registrado como defeito do seed (docs/qa/bugs).
for (const s of [S.bm, S.ac]) {
  await migrador.query(
    `INSERT INTO ${s}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor)
     VALUES ('coleta_incremental', $1, $1, 'sucesso', 'fixture-fa4-fa5')`, [base.config.hoje]);
}
await migrador.end();

const pool = criarPool(urlDoPapel(urlMigrador, 'dspd_api', process.env.DSPD_PWD_API ?? 'api_dev'), { statementTimeoutMs: 10_000 });
const app = await buildApp({ db: pool, S, agora: () => new Date(), nivelLog: 'silent', fonteDados: 'mock' });

let encerrando = false;
const encerrar = async (): Promise<void> => {
  if (encerrando) return;
  encerrando = true;
  await app.close();
  await pool.end();
  const c = new pg.Client({ connectionString: urlMigrador });
  await c.connect();
  try {
    for (const s of [S.bm, S.ac, S.core]) await c.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
  } finally {
    await c.end();
  }
  process.exit(0);
};
process.once('SIGINT', () => void encerrar());
process.once('SIGTERM', () => void encerrar());
await app.listen({ host: '127.0.0.1', port: porta });
console.log(`API_PRONTA ${porta} PREFIXO ${prefixo}`);

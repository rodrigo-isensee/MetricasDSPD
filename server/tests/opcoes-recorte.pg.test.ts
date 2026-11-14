import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { opcoesFiltroSchema } from '@metricas-dspd/contratos';
import { opcoesFiltro } from '../src/modulos/referencia/servico.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const AGORA = new Date('2026-11-14T12:00:00-03:00');

/**
 * K-215 (desenho, seção 6, passo 1): a rota `filtros/acelerato` lê o recorte de `dspd_ac.ref_dominio` sob o papel `dspd_api` real
 * (sem GRANT novo). Schemas isolados por prefixo: nenhuma linha de outro teste entra. Roda só no CI (banco local proibido).
 */
d('opcoes.recorte sobre o PostgreSQL (papel dspd_api, K-215)', () => {
  const p = prefixoDeTeste();
  const E = montarEsquemas(p);
  let mig: pg.Pool;
  let api: pg.Pool;
  beforeAll(async () => {
    mig = poolDe();
    await migrar(url!, { prefixo: p });
    api = poolDe('dspd_api');
    const ins = (campo: string, codigo: string, ordem: number, rotulo: string, ate: string | null = null): Promise<unknown> =>
      mig.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, vigente_ate, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4, $5)`, [campo, codigo, ate, rotulo, ordem]);
    await ins('organizacao_recorte', 'o1', 1, 'Organização Alfa');
    await ins('organizacao_recorte', 'o0', 2, 'Organização Encerrada', '2026-06-01');
    await ins('tipo_recorte', 't1', 1, 'Tipo Beta');
    // ordem (ordem, codigo): z tem ordem menor que a, b e a empatam em 2 e desempatam por codigo.
    await ins('equipe', 'z', 1, 'Equipe Primeira');
    await ins('equipe', 'b', 2, 'Equipe Segunda B');
    await ins('equipe', 'a', 2, 'Equipe Segunda A');
    await ins('equipe', 'x', 3, 'Equipe Encerrada', '2026-06-01');
  }, 120_000);
  afterAll(async () => {
    for (const s of [E.bm, E.ac, E.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await api.end();
    await mig.end();
  });

  it('lê os três campos vigentes, deixa a linha com vigente_ate preenchido fora e ordena por (ordem, codigo)', async () => {
    const o = await opcoesFiltro(api, 'acelerato', AGORA, E);
    expect(o).toMatchObject({
      recorte: { organizacoes: ['Organização Alfa'], tipos: ['Tipo Beta'], equipes: ['Equipe Primeira', 'Equipe Segunda A', 'Equipe Segunda B'] },
    });
    expect(opcoesFiltroSchema.safeParse(o).success).toBe(true);
  });
});

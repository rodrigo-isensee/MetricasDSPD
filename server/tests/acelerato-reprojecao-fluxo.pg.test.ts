import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { coletarAcelerato, projetarAcelerato, reprojetarFluxoAcelerato } from '../src/modulos/acelerato/index.js';
import { VERSAO_REPROJECAO_FLUXO } from '../src/modulos/acelerato/reprojecao-fluxo.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { CONFIG, LISTAS_BANCO, TLS, criarMysqlFalso, linha } from './acelerato-duble.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/**
 * Pedido 105, E6.16: `ac:reprojetar-fluxo` contra PostgreSQL real, com o migrador (dono) e a coleta pelo papel `dspd_coletor`. Os testes
 * seguem em ordem (cada um parte do que o anterior deixou).
 */
d('reprojeção do fluxo (D2) dos chamados já projetados (pg)', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  const relogio = new Date('2026-11-15T12:00:00Z');
  const log = { info: () => undefined, error: () => undefined };
  let dono: pg.Pool, coletor: pg.Pool;

  const estatisticas = (etapas: [string, string][]): string => JSON.stringify({
    workflow: { etapas: etapas.map(([descricao, workflow], i) => ({ etapaKey: 100 + i, descricao, descricaoWorkflow: workflow, tempoSla: 600, tempoSlaHoras: 600 / 3600, quantidadeDeVezes: 1 })) },
  });
  // 401: um workflow só. 402: dois workflows (múltiplo). 403: sem etapa. 404: um workflow, mas a dimensão já tem outro valor.
  const tabela = [
    linha({ ticket_key: 401, data_pronto: '2026-09-16 15:00:00', estatisticas: estatisticas([['Pendente', 'Fluxo Novo']]) }),
    linha({ ticket_key: 402, data_pronto: '2026-09-16 15:00:00', estatisticas: estatisticas([['Pendente', 'Fluxo A'], ['Aguardando atribuicao', 'Fluxo B']]) }),
    linha({ ticket_key: 403, data_pronto: '2026-09-16 15:00:00', estatisticas: estatisticas([]) }),
    linha({ ticket_key: 404, data_pronto: '2026-09-16 15:00:00', estatisticas: estatisticas([['Pendente', 'Fluxo Novo']]) }),
  ];

  const foto = async (schema: string, tabelaNome: string): Promise<string> => {
    const r = await dono.query<{ n: string; h: string }>(
      `SELECT count(*)::text AS n, coalesce(md5(string_agg(t::text, '|' ORDER BY t::text)), '') AS h FROM ${schema}.${tabelaNome} t`);
    return `${r.rows[0]!.n}:${r.rows[0]!.h}`;
  };
  const dados = async (): Promise<string[]> => {
    const out: string[] = [];
    for (const t of ['stg_chamado', 'stg_etapa', 'dim_chamado_versao', 'dim_chamado', 'fato_etapa_chamado']) out.push(await foto(E.ac, t));
    return out;
  };
  const fluxos = async (): Promise<Record<string, string | null>> =>
    Object.fromEntries((await dono.query<{ chamado_id: string; fluxo: string | null }>(`SELECT chamado_id, fluxo FROM ${E.ac}.dim_chamado ORDER BY chamado_id`)).rows.map((r) => [r.chamado_id, r.fluxo]));
  const execucoes = async (): Promise<number> =>
    Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${E.ac}.ctl_coleta WHERE versao_coletor = $1`, [VERSAO_REPROJECAO_FLUXO])).rows[0]!.n);

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
    const listas = [...LISTAS_BANCO, { campo: 'etapa', codigo: 'Pendente', rotulo: 'Pendente' }, { campo: 'natureza_prefixo', codigo: 'SSSC - Incidente', rotulo: 'incidente' },
      ...['Fluxo Novo', 'Fluxo A', 'Fluxo B'].map((w) => ({ campo: 'descricao_workflow', codigo: w, rotulo: w }))];
    for (const [i, l] of listas.entries()) {
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4)`, [l.campo, l.codigo, l.rotulo, i]);
    }
    await coletarAcelerato({
      pool: coletor, config: CONFIG, tls: TLS, S: E, agora: () => new Date('2026-10-30T12:00:00Z'), log, cliente: { conectar: criarMysqlFalso(tabela).conectar }, dormir: () => Promise.resolve(),
    }, 'releitura');
    await projetarAcelerato(coletor, E, () => new Date('2026-10-30T12:00:00Z'));
    // Estado de antes da D2: os chamados já projetados com fluxo nulo, menos o 404, que já tem um valor (de outra origem) que não pode mudar.
    await dono.query(`UPDATE ${E.ac}.dim_chamado SET fluxo = NULL WHERE chamado_id <> '404'`);
    await dono.query(`UPDATE ${E.ac}.dim_chamado SET fluxo = 'Fluxo Anterior' WHERE chamado_id = '404'`);
  });
  afterAll(async () => {
    await coletor.end();
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('ponto de partida: a projeção preencheu o fluxo; o estado de antes da D2 está montado', async () => {
    expect(await fluxos()).toEqual({ '401': null, '402': null, '403': null, '404': 'Fluxo Anterior' });
  });

  it('nulo com um workflow ganha fluxo; múltiplo e sem etapa seguem nulos; preenchido não muda; só dim_chamado muda', async () => {
    const antes = await dados();
    const r = await reprojetarFluxoAcelerato(dono, E, () => relogio);
    expect(r).toMatchObject({ lidos: 3, preenchidos: 1, fluxoMultiplo: 1, semFluxo: 1 });
    expect(r.coletaId).toBeGreaterThan(0);
    expect(await fluxos()).toEqual({ '401': 'Fluxo Novo', '402': null, '403': null, '404': 'Fluxo Anterior' });
    const depois = await dados();
    // stg_chamado, stg_etapa, dim_chamado_versao e fato_etapa_chamado intactos; dim_chamado mudou (índice 3)
    expect(depois.filter((_, i) => i !== 3)).toEqual(antes.filter((_, i) => i !== 3));
    expect(depois[3]).not.toBe(antes[3]);
    const ctl = await dono.query<{ status: string; tarefa: string }>(`SELECT status, tarefa FROM ${E.ac}.ctl_coleta WHERE coleta_id = $1`, [r.coletaId]);
    expect(ctl.rows[0]).toEqual({ status: 'sucesso', tarefa: 'projecao' });
    const cont = await dono.query<{ entidade: string; lidos: number; inseridos: number }>(`SELECT entidade, lidos, inseridos FROM ${E.ac}.ctl_coleta_contagem WHERE coleta_id = $1 ORDER BY entidade`, [r.coletaId]);
    expect(cont.rows).toEqual([
      { entidade: 'reprojecao_fluxo_chamado', lidos: 3, inseridos: 1 },
      { entidade: 'reprojecao_fluxo_multiplo', lidos: 1, inseridos: 0 },
      { entidade: 'reprojecao_fluxo_sem_fluxo', lidos: 1, inseridos: 0 },
    ]);
  });

  it('K-397: segunda execução não muda tabela alguma e não registra execução (a marca d agua não se move)', async () => {
    const antes = await dados();
    const execAntes = await execucoes();
    const r = await reprojetarFluxoAcelerato(dono, E, () => relogio);
    expect(r).toMatchObject({ coletaId: null, lidos: 2, preenchidos: 0, fluxoMultiplo: 1, semFluxo: 1 });
    expect(await dados()).toEqual(antes);
    expect(await execucoes()).toBe(execAntes);
  });
});

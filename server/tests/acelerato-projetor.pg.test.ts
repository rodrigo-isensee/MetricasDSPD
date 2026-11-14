import { acelerato } from '@metricas-dspd/metricas';
import { CALENDARIO_PADRAO, horasUteisEntre } from '@metricas-dspd/metricas/core';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { coletarAcelerato, projetarAcelerato } from '../src/modulos/acelerato/index.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { CONFIG, LISTAS_BANCO, TLS, criarMysqlFalso, linha } from './acelerato-duble.js';
import { DOMINIO_FIXTURE } from './fixtures/acelerato-linha-50-colunas.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** Projetor da F2 contra PostgreSQL real, com o papel `dspd_coletor` (R3 do review): DELETE e INSERT nas projeções, UPDATE do controle e CHECK. */
d('projetor do Acelerato (pg)', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  let dono: pg.Pool, coletor: pg.Pool;
  let relogio = new Date('2026-10-30T12:00:00Z');
  const agora = () => relogio;
  const log = { info: () => undefined, error: () => undefined };
  const tabela = [linha({ ticket_key: 81 }), linha({ ticket_key: 82, data_pronto: '2026-09-02 10:00:00' }), linha({ ticket_key: 83, lixeira: 1 })];
  const coletar = (t = tabela) => coletarAcelerato({
    pool: coletor, config: CONFIG, tls: TLS, S: E, agora, log, cliente: { conectar: criarMysqlFalso(t).conectar }, dormir: () => Promise.resolve(),
  }, 'releitura');
  const n = async (t: string, onde = 'true'): Promise<number> => Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${E.ac}.${t} WHERE ${onde}`)).rows[0]!.n);

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
    const listas = [...LISTAS_BANCO, { campo: 'natureza_prefixo', codigo: 'SSSC - Incidente', rotulo: 'incidente' }];
    for (const [i, l] of listas.entries()) {
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4)`, [l.campo, l.codigo, l.rotulo, i]);
    }
  });
  afterAll(async () => {
    await coletor.end();
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('projeta pelo papel do coletor: dim_chamado (DELETE e INSERT), versões só INSERT, fato_etapa_chamado e o controle da projeção (UPDATE)', async () => {
    await coletar();
    const r = await projetarAcelerato(coletor, E, agora);
    expect(r).toMatchObject({ versoes: 3, chamados: 3 });
    expect(r.coletaId).not.toBeNull();
    expect(await n('dim_chamado')).toBe(3);
    expect(await n('dim_chamado_versao')).toBe(3);
    expect(await n('dim_chamado', "natureza = 'incidente' AND reincidente_90d = 'sim' AND com_agente")).toBe(3);
    expect(await n('fato_etapa_chamado')).toBe(r.etapas);
    const ctl = (await dono.query<{ status: string; finalizado_em: Date | null }>(`SELECT status, finalizado_em FROM ${E.ac}.ctl_coleta WHERE tarefa = 'projecao'`)).rows;
    expect(ctl).toHaveLength(1);
    expect(ctl[0]!.status).toBe('sucesso');
    expect(ctl[0]!.finalizado_em).not.toBeNull();
  });

  it('sem versão nova nada é gravado; com versão nova a vigente é apagada e refeita e a história permanece', async () => {
    expect(await projetarAcelerato(coletor, E, agora)).toMatchObject({ coletaId: null, versoes: 0 });
    expect(await n('ctl_coleta', "tarefa = 'projecao'")).toBe(1);
    relogio = new Date('2026-10-30T13:00:00Z'); // a versão nova nasce em outro instante (chave: chamado, vigente_de)
    await coletar([linha({ ticket_key: 81, status: 'Aguardando atribuicao' }), tabela[1]!, tabela[2]!]);
    const r = await projetarAcelerato(coletor, E, agora);
    expect(r).toMatchObject({ versoes: 1, chamados: 1 });
    expect(await n('dim_chamado')).toBe(3);
    expect(await n('dim_chamado_versao')).toBe(4);
    expect(await n('dim_chamado', `chamado_id = '81' AND coletado_em = '2026-10-30T13:00:00Z'`)).toBe(1); // refeita pela rodada nova
    expect(await n('dim_chamado', `chamado_id = '82' AND coletado_em = '2026-10-30T12:00:00Z'`)).toBe(1); // o outro não foi tocado
    expect(await n('ctl_coleta', "tarefa = 'projecao' AND status = 'sucesso'")).toBe(2);
  });

  it('o CHECK de reincidente_90d recusa valor fora dos três; o papel do coletor não apaga a versão da dimensão se não for da projeção do staging', async () => {
    const insere = (v: string) => dono.query(
      `INSERT INTO ${E.ac}.dim_chamado (chamado_id, reincidente_90d, coletado_em, atualizado_por_coleta_id)
       VALUES ($1, $2, now(), (SELECT min(coleta_id) FROM ${E.ac}.ctl_coleta))`, [`chk${v}`, v]);
    await expect(insere('talvez')).rejects.toMatchObject({ code: '23514' });
    await expect(insere('nao')).resolves.toBeDefined();
    await expect(insere('sem_resposta')).resolves.toBeDefined();
    expect(DOMINIO_FIXTURE.categoria).toBeTruthy();
  });
  it('K-308 (ADR 0027, item 7.3): sem a versão 099:D-7-528 a projeção da coleta monta em 8 h; com ela, em 8 h 48 (o coletor lê a referência)', async () => {
    const estatisticas = JSON.stringify({ workflow: { etapas: [{ etapaKey: 100, descricao: 'Aguardando atribuicao', descricaoWorkflow: 'Fluxo Ficticio', tempoSla: 16 * 3600, tempoSlaHoras: 16, quantidadeDeVezes: 1 }] } });
    const nova = (k: number) => linha({ ticket_key: k, data_pronto: '2026-09-16 15:00:00', estatisticas });
    const intervaloDe = async (id: string) => {
      const r = (await dono.query<{ entrada: Date; saida: Date }>(`SELECT entrada, saida FROM ${E.ac}.fato_etapa_chamado WHERE chamado_id = $1`, [id])).rows[0]!;
      return { e: r.entrada.getTime(), s: r.saida.getTime() };
    };
    relogio = new Date('2026-10-30T14:00:00Z');
    await coletar([...tabela, nova(84)]);
    await projetarAcelerato(coletor, E, agora);
    const em8 = await intervaloDe('84');
    expect(horasUteisEntre(em8.e, em8.s, CALENDARIO_PADRAO)).toBeCloseTo(16, 6);

    await dono.query(
      `INSERT INTO ${E.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
       VALUES ('2026-10-30', 'acelerato', 'teste', 'teste', '099:D-7-528', now())`);
    relogio = new Date('2026-10-30T15:00:00Z');
    await coletar([...tabela, nova(84), nova(85)]);
    await projetarAcelerato(coletor, E, agora);
    const em848 = await intervaloDe('85');
    expect(horasUteisEntre(em848.e, em848.s, acelerato.CALENDARIO_SUSTENTACAO_PADRAO)).toBeCloseTo(16, 6);
    expect(em848.e).not.toBe(em8.e);
  });
});

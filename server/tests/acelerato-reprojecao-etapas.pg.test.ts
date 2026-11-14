import { acelerato } from '@metricas-dspd/metricas';
import { CALENDARIO_PADRAO, horasUteisEntre } from '@metricas-dspd/metricas/core';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { coletarAcelerato, projetarAcelerato } from '../src/modulos/acelerato/index.js';
import { ErroReprojecao, VERSAO_REPROJECAO_D7, reprojetarEtapasAcelerato } from '../src/modulos/acelerato/reprojecao-etapas.js';
import { lerVersoes } from '../src/modulos/operacao/repositorio.js';
import { analisarCalendario, lerCalendario, sincronizarCalendario } from '../src/modulos/referencia/index.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { criarPool, urlDoPapel } from '../src/plataforma/db/pool.js';
import { CONFIG, LISTAS_BANCO, TLS, criarMysqlFalso, linha } from './acelerato-duble.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/**
 * K-308 (ADR 0027, itens 7.4 e 7.8): `ac:reprojetar-etapas` contra PostgreSQL real, com o migrador (dono) e a coleta pelo papel `dspd_coletor`.
 * Um conjunto próprio de schemas; os testes seguem em ordem (cada um parte do que o anterior deixou).
 */
d('reprojeção das etapas D-7 em 8 h 48 (pg)', () => {
  const prefixo = prefixoDeTeste();
  const E = montarEsquemas(prefixo);
  const SUST = acelerato.CALENDARIO_SUSTENTACAO_PADRAO;
  const relogio = new Date('2026-11-14T02:30:00Z'); // 23:30 de 13/11 em Brasília
  const log = { info: () => undefined, error: () => undefined };
  let dono: pg.Pool, coletor: pg.Pool;

  const estatisticas = (etapas: [string, number][]): string => JSON.stringify({
    workflow: { etapas: etapas.map(([descricao, s], i) => ({ etapaKey: 100 + i, descricao, descricaoWorkflow: 'Fluxo Ficticio', tempoSla: s, tempoSlaHoras: s / 3600, quantidadeDeVezes: 1 })) },
  });
  // 301: 16 h em Pendente, finalizado numa quarta às 15:00. 302: 12 min em Aguardando atribuicao, finalizado numa quarta às 18:30. 303: aberto.
  const tabela = [
    linha({ ticket_key: 301, data_pronto: '2026-09-16 15:00:00', estatisticas: estatisticas([['Pendente', 16 * 3600]]) }),
    linha({ ticket_key: 302, data_pronto: '2026-09-16 18:30:00', estatisticas: estatisticas([['Aguardando atribuicao', 720]]) }),
    linha({ ticket_key: 303, data_pronto: null, estatisticas: estatisticas([['Pendente', 3600]]) }),
  ];

  const foto = async (schema: string, tabelaNome: string): Promise<string> => {
    const r = await dono.query<{ n: string; h: string }>(
      `SELECT count(*)::text AS n, coalesce(md5(string_agg(t::text, '|' ORDER BY t::text)), '') AS h FROM ${schema}.${tabelaNome} t`);
    return `${r.rows[0]!.n}:${r.rows[0]!.h}`;
  };
  const TABELAS_AC = ['stg_chamado', 'stg_etapa', 'dim_chamado_versao', 'dim_chamado', 'fato_etapa_chamado'] as const;
  const fotos = async (): Promise<Record<string, string>> => {
    const out: Record<string, string> = {};
    for (const t of TABELAS_AC) out[`ac.${t}`] = await foto(E.ac, t);
    out['core.ref_versao_criterio'] = await foto(E.core, 'ref_versao_criterio');
    out['core.ref_versao_criterio_metrica'] = await foto(E.core, 'ref_versao_criterio_metrica');
    return out;
  };
  const fotoBm = async (): Promise<Record<string, string>> => {
    const ts = (await dono.query<{ tablename: string }>('SELECT tablename FROM pg_tables WHERE schemaname = $1 ORDER BY tablename', [E.bm])).rows;
    const out: Record<string, string> = {};
    for (const t of ts) out[t.tablename] = await foto(E.bm, t.tablename);
    return out;
  };
  const n = async (schema: string, t: string, onde = 'true'): Promise<number> => Number((await dono.query<{ n: string }>(`SELECT count(*) AS n FROM ${schema}.${t} WHERE ${onde}`)).rows[0]!.n);
  const intervalo = async (chamado: string): Promise<{ entrada: number; saida: number; etapa: string }[]> =>
    (await dono.query<{ entrada: Date; saida: Date; etapa: string }>(`SELECT etapa, entrada, saida FROM ${E.ac}.fato_etapa_chamado WHERE chamado_id = $1 ORDER BY etapa, entrada`, [chamado]))
      .rows.map((r) => ({ entrada: r.entrada.getTime(), saida: r.saida.getTime(), etapa: r.etapa }));
  const conteudoFato = async (): Promise<string> =>
    (await dono.query<{ h: string }>(`SELECT md5(string_agg(chamado_id || '|' || etapa || '|' || entrada::text || '|' || saida::text, ';' ORDER BY chamado_id, etapa, entrada)) AS h FROM ${E.ac}.fato_etapa_chamado`)).rows[0]!.h;
  const reprojetar = () => reprojetarEtapasAcelerato(dono, E, () => relogio);

  beforeAll(async () => {
    await migrar(url!, { prefixo });
    dono = poolDe();
    coletor = criarPool(urlDoPapel(url!, 'dspd_coletor', process.env.DSPD_PWD_COLETOR ?? 'coletor_dev'), { max: 2 });
    const listas = [...LISTAS_BANCO, { campo: 'etapa', codigo: 'Pendente', rotulo: 'Pendente' }, { campo: 'natureza_prefixo', codigo: 'SSSC - Incidente', rotulo: 'incidente' }];
    for (const [i, l] of listas.entries()) {
      await dono.query(`INSERT INTO ${E.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, '2026-01-01', $3, $4)`, [l.campo, l.codigo, l.rotulo, i]);
    }
    await coletarAcelerato({
      pool: coletor, config: CONFIG, tls: TLS, S: E, agora: () => new Date('2026-10-30T12:00:00Z'), log, cliente: { conectar: criarMysqlFalso(tabela).conectar }, dormir: () => Promise.resolve(),
    }, 'releitura');
    await projetarAcelerato(coletor, E, () => new Date('2026-10-30T12:00:00Z'));
  });
  afterAll(async () => {
    await coletor.end();
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('ponto de partida: a projeção da coleta, sem a versão nova, montou os intervalos em 8 h (16 h em Pendente medem 16 h no dia de 8 h)', async () => {
    expect(await n(E.core, 'ref_versao_criterio', "referencia = '099:D-7-528'")).toBe(0);
    const [a] = await intervalo('301');
    expect(horasUteisEntre(a!.entrada, a!.saida, CALENDARIO_PADRAO)).toBeCloseTo(16, 6);
    expect(horasUteisEntre(a!.entrada, a!.saida, SUST)).toBeGreaterThan(16.5);
    expect(await n(E.ac, 'fato_etapa_chamado', "chamado_id = '303'")).toBe(0); // aberto não tem intervalo
  });

  it('(a) sem calendário na referência e com calendário divergente: recusa e nenhuma tabela muda', async () => {
    const antes = await fotos();
    await expect(reprojetar()).rejects.toThrow(/rode ref:sync-calendario antes/);
    expect(await fotos()).toEqual(antes);

    // calendário da Sustentação gravado com o dia de 8 h (turnos 08-12 e 13-17): diverge do da montagem
    const divergente = JSON.parse(JSON.stringify(lerCalendario().arquivo)) as { calendarios: { nome: string; turnos?: { inicio: string; fim: string }[] }[] };
    divergente.calendarios.find((c) => c.nome === 'dspd-acelerato')!.turnos = [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '17:00' }];
    await sincronizarCalendario(dono, E, { arquivo: analisarCalendario(JSON.stringify(divergente)).arquivo, sha256: 'a'.repeat(64) }, '2026-11-01', relogio);
    const antes2 = await fotos();
    const erro = await reprojetar().then(() => null, (e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroReprojecao);
    expect((erro as Error).message).toContain('turnos: referência 480-720;780-1020, código 480-720;780-1068');
    expect(await fotos()).toEqual(antes2);
    expect(await n(E.ac, 'ctl_coleta', `versao_coletor = '${VERSAO_REPROJECAO_D7}'`)).toBe(0);
  });

  it('(b) (c) (d) com a referência igual ao código: intervalos em 8 h 48, staging e dimensão intactos, BusinessMap intacto, versão com as cinco métricas', async () => {
    await sincronizarCalendario(dono, E, lerCalendario(), '2026-11-02', relogio);
    const antesBase = await fotos();
    const antesBm = await fotoBm();
    const antigoA = (await intervalo('301'))[0]!;

    const r = await reprojetar();
    expect(r).toMatchObject({ vigenteDesde: '2026-11-13', versaoNova: true, chamados: 2, etapas: 2, semIntervalo: 0 });
    expect(r.coletaId).toBeGreaterThan(0);

    // (b) S9 de um chamado de 16 h em Pendente = 16 h; S10 do chamado das 18:30 = 0,2 h e conta em "aceitos em 15 min" (0,25 h)
    const a = (await intervalo('301'))[0]!;
    expect(a.etapa).toBe('Pendente');
    expect(horasUteisEntre(a.entrada, a.saida, SUST)).toBeCloseTo(16, 6);
    expect(a.entrada).not.toBe(antigoA.entrada);
    const b = (await intervalo('302'))[0]!;
    expect(horasUteisEntre(b.entrada, b.saida, SUST)).toBeCloseTo(0.2, 6);
    expect(horasUteisEntre(b.entrada, b.saida, SUST)).toBeLessThanOrEqual(0.25);
    expect(await n(E.ac, 'fato_etapa_chamado', "chamado_id = '303'")).toBe(0);

    // (c) o coletado e as versões não mudam; só `fato_etapa_chamado` (derivada) e a referência
    const depois = await fotos();
    for (const t of ['stg_chamado', 'stg_etapa', 'dim_chamado_versao', 'dim_chamado'] as const) expect(depois[`ac.${t}`], t).toBe(antesBase[`ac.${t}`]);
    expect(depois['ac.fato_etapa_chamado']).not.toBe(antesBase['ac.fato_etapa_chamado']);
    expect(await fotoBm()).toEqual(antesBm);

    // (d) a versão existe com as cinco métricas e vigente_desde = o dia do relógio injetado; as versões anteriores continuam
    const v = (await dono.query<{ versao_id: string; vigente_desde: string; dominio: string }>(
      `SELECT versao_id, vigente_desde::text AS vigente_desde, dominio FROM ${E.core}.ref_versao_criterio WHERE referencia = '099:D-7-528'`)).rows;
    expect(v).toHaveLength(1);
    expect(v[0]).toMatchObject({ vigente_desde: '2026-11-13', dominio: 'acelerato' });
    const metricas = (await dono.query<{ metrica_id: string }>(`SELECT metrica_id FROM ${E.core}.ref_versao_criterio_metrica WHERE versao_id = $1 ORDER BY metrica_id`, [v[0]!.versao_id])).rows.map((x) => x.metrica_id);
    expect(metricas).toEqual(['EI_SUST', 'S1', 'S10', 'S4', 'S9']);
    // marca T2.6: a versão aparece em `afeta` das cinco métricas
    const marca = (await lerVersoes(dono, 'acelerato', E)).find((x) => x.id === String(v[0]!.versao_id))!;
    expect(marca.data).toBe('2026-11-13');
    expect([...marca.afeta].sort()).toEqual(['EI_SUST', 'S1', 'S10', 'S4', 'S9']);
  });

  it('(e) (f) rodar duas vezes deixa uma versão só e as mesmas linhas de fato_etapa_chamado; cada rodada abre um ctl_coleta de projeção', async () => {
    const conteudo = await conteudoFato();
    const nFato = await n(E.ac, 'fato_etapa_chamado');
    expect(await n(E.ac, 'ctl_coleta', `tarefa = 'projecao' AND versao_coletor = '${VERSAO_REPROJECAO_D7}' AND status = 'sucesso'`)).toBe(1);
    const r = await reprojetar();
    expect(r).toMatchObject({ versaoNova: false, chamados: 2, etapas: 2 });
    expect(await n(E.core, 'ref_versao_criterio', "referencia = '099:D-7-528'")).toBe(1);
    expect(await n(E.ac, 'fato_etapa_chamado')).toBe(nFato);
    expect(await conteudoFato()).toBe(conteudo);
    expect(await n(E.ac, 'ctl_coleta', `tarefa = 'projecao' AND versao_coletor = '${VERSAO_REPROJECAO_D7}' AND status = 'sucesso'`)).toBe(2);
  });
});

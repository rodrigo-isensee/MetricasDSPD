import { gerarBaseMock } from '@metricas-dspd/mock';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { montarEsquemas, prefixoDeTeste, type Esquemas } from '../src/plataforma/db/esquemas.js';
import { limparSeed } from '../src/plataforma/db/limpar-seed.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { semear } from '../src/plataforma/db/seed.js';
import { poolDe, url } from './pg/ctx.js';

const d = describe.skipIf(!url);

/** Cada cenário usa o próprio conjunto de schemas (o comando mexe em tudo que é do seed no schema). */
d('limpar-seed contra PostgreSQL 17 (seed e carga real juntos no mesmo esquema)', () => {
  const base = gerarBaseMock({ escala: 0.05 });
  let db: pg.Pool;
  const criados: Esquemas[] = [];
  const n = async (t: string, onde = 'true'): Promise<number> => Number((await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${t} WHERE ${onde}`)).rows[0]!.n);
  const ref = ['ref_quadro', 'ref_coluna', 'ref_dominio', 'ref_limite_wip_fluxo', 'ref_limite_frentes', 'ref_sle', 'ref_alocacao_acordada', 'ref_ficha_resultado'];

  /** Esquemas migrados e semeados, mais uma carga "real": coleta, staging, card, transição, bloqueio, referência e chamado. */
  async function cenario(): Promise<{ E: Esquemas; real: number; realAc: number }> {
    const p = prefixoDeTeste();
    const E = montarEsquemas(p);
    criados.push(E);
    await migrar(url!, { prefixo: p });
    expect(await semear(db, base, E)).toBe('semeado');
    const col = async (s: string, versao: string): Promise<number> => Number((await db.query<{ coleta_id: string }>(
      `INSERT INTO ${s}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor) VALUES ('coleta_incremental', now(), now(), 'sucesso', $1) RETURNING coleta_id`, [versao])).rows[0]!.coleta_id);
    const real = await col(E.bm, 'bm-f3/1');
    const realAc = await col(E.ac, 'ac-f1/1');
    await db.query(`INSERT INTO ${E.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
      VALUES ('9001', NULL, $1, '{}', '77', false, false, now(), $2)`, [Buffer.alloc(32, 1), real]);
    await db.query(`INSERT INTO ${E.bm}.dim_card (card_id, criado_em, quadro_id, coletado_em, atualizado_por_coleta_id) VALUES ('9001', now(), '77', now(), $1)`, [real]);
    await db.query(`INSERT INTO ${E.bm}.fato_transicao (card_id, quadro_id, coluna_destino_id, fonte, id_origem, ocorrido_em, coletado_em, coleta_id)
      VALUES ('9001', '77', 'c9', 'revision', 'real-1', now(), now(), $1)`, [real]);
    await db.query(`INSERT INTO ${E.bm}.fato_bloqueio (card_id, id_origem, inicio, coletado_em, atualizado_por_coleta_id) VALUES ('9001', 'real-b1', now(), now(), $1)`, [real]);
    await db.query(`INSERT INTO ${E.bm}.ref_quadro (quadro_id, vigente_de, equipe, nivel) VALUES ('77', '2026-01-01', 'Equipe Real', 'time')`);
    await db.query(`INSERT INTO ${E.bm}.ref_coluna (quadro_id, coluna_id, vigente_de, nome, tipo_coluna, ordem, workflow_id, eh_folha, motivo) VALUES ('77', 'c9', '2026-01-01', 'Coluna Real', 'execucao', 0, 'w1', true, 'processo')`);
    await db.query(`INSERT INTO ${E.bm}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('sistema', 'REAL', '2026-02-02', 'Real', 0)`);
    await db.query(`INSERT INTO ${E.ac}.dim_chamado (chamado_id, aberto_em, coletado_em, atualizado_por_coleta_id) VALUES ('A9001', now(), now(), $1)`, [realAc]);
    await db.query(`INSERT INTO ${E.ac}.fato_etapa_chamado (chamado_id, etapa, entrada, coletado_em, atualizado_por_coleta_id) VALUES ('A9001', 'aberto', now(), now(), $1)`, [realAc]);
    await db.query(`INSERT INTO ${E.ac}.ref_alvo_prioridade (prioridade, vigente_de, prazo_pa_horas_uteis, prazo_r_horas_uteis) VALUES ('REAL', '2026-03-03', 1, 2)`);
    return { E, real, realAc };
  }

  /** Foto da carga real (linhas completas, ordenadas) para provar que ficou idêntica. */
  async function fotoReal(E: Esquemas, real: number, realAc: number): Promise<string> {
    const q = async (sql: string, v: unknown[] = []): Promise<unknown[]> => (await db.query(sql, v)).rows;
    return JSON.stringify([
      await q(`SELECT * FROM ${E.bm}.dim_card WHERE atualizado_por_coleta_id = $1 ORDER BY card_id`, [real]),
      await q(`SELECT * FROM ${E.bm}.fato_transicao WHERE coleta_id = $1 ORDER BY transicao_sk`, [real]),
      await q(`SELECT * FROM ${E.bm}.fato_bloqueio WHERE atualizado_por_coleta_id = $1 ORDER BY bloqueio_sk`, [real]),
      await q(`SELECT * FROM ${E.bm}.stg_card ORDER BY stg_sk`),
      await q(`SELECT * FROM ${E.bm}.ctl_coleta WHERE coleta_id = $1`, [real]),
      await q(`SELECT * FROM ${E.bm}.ref_quadro WHERE quadro_id = '77'`),
      await q(`SELECT * FROM ${E.bm}.ref_coluna WHERE quadro_id = '77'`),
      await q(`SELECT * FROM ${E.bm}.ref_dominio WHERE codigo = 'REAL'`),
      await q(`SELECT * FROM ${E.ac}.dim_chamado WHERE atualizado_por_coleta_id = $1`, [realAc]),
      await q(`SELECT * FROM ${E.ac}.fato_etapa_chamado WHERE atualizado_por_coleta_id = $1`, [realAc]),
      await q(`SELECT * FROM ${E.ac}.ref_alvo_prioridade WHERE prioridade = 'REAL'`),
      await q(`SELECT * FROM ${E.ac}.ctl_coleta WHERE coleta_id = $1`, [realAc]),
    ]);
  }
  const contagens = async (E: Esquemas): Promise<number[]> => [
    ...await Promise.all(['dim_card', 'fato_transicao', 'fato_bloqueio', 'ctl_coleta', 'stg_card', ...ref].map((t) => n(`${E.bm}.${t}`))),
    ...await Promise.all(['dim_chamado', 'fato_etapa_chamado', 'ctl_coleta', 'ref_alvo_prioridade'].map((t) => n(`${E.ac}.${t}`))),
  ];

  beforeAll(() => { db = poolDe(); });
  afterAll(async () => {
    for (const E of criados) for (const s of [E.bm, E.ac, E.core]) await db.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
    await db.end();
  });

  it('simulação não escreve; aplicação tira só o seed; a carga real fica idêntica; a segunda execução não faz nada', async () => {
    const { E, real, realAc } = await cenario();
    const foto = await fotoReal(E, real, realAc);
    const antes = await contagens(E);
    expect(await n(`${E.bm}.dim_card`)).toBe(base.bm.cards.length + 1);

    const sim = await limparSeed(db, { aplicar: false, S: E });
    expect(sim.modo).toBe('simulacao');
    expect(sim.fontes[0]).toMatchObject({ fonte: 'businessmap', coletas: 2 });
    expect(sim.fontes[0]!.tabelas).toMatchObject({
      dim_card: base.bm.cards.length, fato_transicao: base.bm.transicoes.length, fato_bloqueio: base.bm.bloqueios.length,
      ref_quadro: new Set(base.bm.config.equipes.map((e) => e.nome)).size, ctl_coleta: 2,
    });
    expect(sim.fontes[1]!.tabelas).toMatchObject({ dim_chamado: base.ac.chamados.length, fato_etapa_chamado: base.ac.etapas.length, ctl_coleta: 2 });
    expect(await contagens(E)).toEqual(antes);
    expect(await fotoReal(E, real, realAc)).toBe(foto);

    const ap = await limparSeed(db, { aplicar: true, S: E });
    expect(ap.modo).toBe('aplicado');
    expect(ap.fontes.map((f) => f.tabelas)).toEqual(sim.fontes.map((f) => f.tabelas));
    // só a carga real sobra, idêntica, e nenhuma linha de coleta do seed
    expect(await fotoReal(E, real, realAc)).toBe(foto);
    expect(await n(`${E.bm}.dim_card`)).toBe(1);
    expect(await n(`${E.bm}.fato_transicao`)).toBe(1);
    expect(await n(`${E.bm}.fato_bloqueio`)).toBe(1);
    expect(await n(`${E.bm}.ctl_coleta`)).toBe(1);
    expect(await n(`${E.ac}.dim_chamado`)).toBe(1);
    expect(await n(`${E.ac}.ctl_coleta`)).toBe(1);
    for (const t of ref) expect(await n(`${E.bm}.${t}`, "vigente_de <> '2026-01-01' AND vigente_de <> '2026-02-02'")).toBe(0);
    expect(await n(`${E.bm}.ctl_coleta`, "starts_with(versao_coletor, 'seed-mock')")).toBe(0);
    // o gatilho de imutabilidade voltou: o DELETE direto continua barrado para o dono
    expect(await n('pg_trigger', `tgrelid = '${E.bm}.fato_transicao'::regclass AND NOT tgisinternal AND tgenabled <> 'O'`)).toBe(0);
    await expect(db.query(`DELETE FROM ${E.bm}.fato_transicao`)).rejects.toThrow(/append-only/);

    const depois = await contagens(E);
    const segunda = await limparSeed(db, { aplicar: true, S: E });
    expect(segunda.fontes).toEqual([{ fonte: 'businessmap', coletas: 0, tabelas: {} }, { fonte: 'acelerato', coletas: 0, tabelas: {} }]);
    expect(await contagens(E)).toEqual(depois);
    expect(await fotoReal(E, real, realAc)).toBe(foto);
  });

  it('o papel sem posse das tabelas não consegue aplicar e nada fica pela metade', async () => {
    const { E } = await cenario();
    const antes = await contagens(E);
    const coletor = poolDe('dspd_coletor');
    try {
      await expect(limparSeed(coletor, { aplicar: true, S: E })).rejects.toThrow();
    } finally {
      await coletor.end();
    }
    expect(await contagens(E)).toEqual(antes);
  });

  it('sem parâmetros utilizáveis na coleta seed-mock: recusa e não remove nada', async () => {
    const { E } = await cenario();
    const antes = await contagens(E);
    await db.query(`UPDATE ${E.bm}.ctl_coleta SET parametros = NULL WHERE versao_coletor = 'seed-mock'`);
    await expect(limparSeed(db, { aplicar: true, S: E })).rejects.toMatchObject({ codigo: 'sem-parametros' });
    expect(await contagens(E)).toEqual(antes);
  });

  it('falha fechada: staging com card do seed (ADR 0022) não deixa remover nada', async () => {
    const { E, real } = await cenario();
    const cardDoSeed = (await db.query<{ card_id: string }>(`SELECT card_id FROM ${E.bm}.dim_card WHERE atualizado_por_coleta_id <> $1 LIMIT 1`, [real])).rows[0]!.card_id;
    await db.query(`INSERT INTO ${E.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
      VALUES ($1, NULL, $2, '{}', '77', false, false, now(), $3)`, [cardDoSeed, Buffer.alloc(32, 2), real]);
    const antes = await contagens(E);
    await expect(limparSeed(db, { aplicar: true, S: E })).rejects.toMatchObject({ codigo: 'ligada-a-dado-real' });
    expect(await contagens(E)).toEqual(antes);
  });

  it('falha fechada: transição de coleta real num card do seed, e linha com a marca da coleta do seed fora das tabelas removidas', async () => {
    const { E, real } = await cenario();
    const cardDoSeed = (await db.query<{ card_id: string }>(`SELECT card_id FROM ${E.bm}.dim_card WHERE atualizado_por_coleta_id <> $1 LIMIT 1`, [real])).rows[0]!.card_id;
    await db.query(`INSERT INTO ${E.bm}.fato_transicao (card_id, quadro_id, coluna_destino_id, fonte, id_origem, ocorrido_em, coletado_em, coleta_id)
      VALUES ($1, '77', 'c9', 'revision', 'real-2', now(), now(), $2)`, [cardDoSeed, real]);
    const antes = await contagens(E);
    await expect(limparSeed(db, { aplicar: true, S: E })).rejects.toThrow(/fato_transicao: 1 linha\(s\) de coleta real com item do seed/);
    expect(await contagens(E)).toEqual(antes);

    const { E: E2 } = await cenario();
    const seed2 = (await db.query<{ coleta_id: string }>(`SELECT coleta_id FROM ${E2.bm}.ctl_coleta WHERE versao_coletor = 'seed-mock'`)).rows[0]!.coleta_id;
    await db.query(`INSERT INTO ${E2.bm}.ctl_coleta_falha (coleta_id, entidade, erro) VALUES ($1, 'card', 'x')`, [seed2]);
    const antes2 = await contagens(E2);
    await expect(limparSeed(db, { aplicar: true, S: E2 })).rejects.toThrow(/ctl_coleta_falha: 1 linha/);
    expect(await contagens(E2)).toEqual(antes2);
  });

  it('falha fechada: referência com a chave do seed e conteúdo de outra origem fica e para o comando', async () => {
    const { E } = await cenario();
    await db.query(`UPDATE ${E.bm}.ref_quadro SET equipe = 'Equipe de outra origem' WHERE quadro_id = (SELECT min(quadro_id) FROM ${E.bm}.ref_quadro WHERE quadro_id <> '77')`);
    const antes = await contagens(E);
    await expect(limparSeed(db, { aplicar: true, S: E })).rejects.toThrow(/ref_quadro: 1 linha\(s\) com a chave do seed e conteúdo de outra origem/);
    expect(await contagens(E)).toEqual(antes);
  });

  it('a lista de ref_* do comando cobre tudo o que o seed grava em referência (BusinessMap e Acelerato)', async () => {
    const { E } = await cenario();
    const sim = await limparSeed(db, { aplicar: false, S: E });
    const bm = Object.keys(sim.fontes[0]!.tabelas).filter((t) => t.startsWith('ref_')).sort();
    expect(bm).toEqual([...ref].sort());
    expect(Object.keys(sim.fontes[1]!.tabelas).filter((t) => t.startsWith('ref_'))).toEqual(['ref_alvo_prioridade']);
  });
});

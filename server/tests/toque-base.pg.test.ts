import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { coletarToque } from '../src/modulos/businessmap/toque-coleta.js';
import { gravarLeitura, projetarToque } from '../src/modulos/businessmap/toque-gravacao.js';
import type { ResultadoToque } from '../src/modulos/businessmap/toque.js';
import { hash, novaColeta, poolDe, S, unico, url } from './pg/ctx.js';

// Pedido 105, B7b (O22, ADR 0020 R6-3, R6-4, R6-6, R6-8 e R6-11): a base do primeiro toque contra o PostgreSQL. Esquema (CHECKs, append-only), grants (a API lê
// `dim_card.primeiro_toque_em` e `toque_situacao`, nada mais do toque; o papel da aba Apontamento não lê nada dele), projetor (regras do R6-6) e a coleta inteira com API falsa.
const d = describe.skipIf(!url);
const CRIADO = new Date('2026-11-01T10:00:00Z');
const ms = (iso: string): number => Date.parse(iso);

d('toque: base, grants e projeção (R6-11)', () => {
  let dono: pg.Pool, coletor: pg.Pool, api: pg.Pool;
  let coleta: number;
  beforeAll(async () => {
    dono = poolDe(); coletor = poolDe('dspd_coletor'); api = poolDe('dspd_api');
    coleta = await novaColeta(dono, S.bm);
  });
  afterAll(async () => { await Promise.all([dono.end(), coletor.end(), api.end()]); });

  const novoCard = async (criadoEm: Date | null = CRIADO, extra: { tipo?: string; granularidade?: string } = {}): Promise<string> => {
    const id = String(Math.floor(Math.random() * 9e8) + 1e8);
    await dono.query(
      `INSERT INTO ${S.bm}.dim_card (card_id, criado_em, tipo, granularidade, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, $3, $4, now(), $5)`,
      [id, criadoEm, extra.tipo ?? 'Melhoria', extra.granularidade ?? 'story', coleta]);
    return id;
  };
  const leitura = (cardId: string, r: Partial<ResultadoToque> = {}): ResultadoToque =>
    ({ cardId, revisaoLida: 3, estado: 'lido', motivo: null, eventos: [], revisoesSemAutor: 0, comentariosExternos: 0, ...r });
  const situacao = async (id: string) =>
    (await dono.query<{ toque_situacao: string | null; primeiro_toque_em: Date | null }>(`SELECT toque_situacao, primeiro_toque_em FROM ${S.bm}.dim_card WHERE card_id = $1`, [id])).rows[0]!;

  it('migração: as duas tabelas, as duas colunas e o valor carga_toque em ctl_coleta.tarefa', async () => {
    const t = await dono.query<{ t: string }>(`SELECT table_name AS t FROM information_schema.tables WHERE table_schema = $1 AND table_name IN ('stg_toque_instante', 'ctl_toque_leitura')`, [S.bm]);
    expect(t.rows.map((x) => x.t).sort()).toEqual(['ctl_toque_leitura', 'stg_toque_instante']);
    const c = await dono.query<{ c: string }>(`SELECT column_name AS c FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'dim_card' AND column_name IN ('primeiro_toque_em', 'toque_situacao')`, [S.bm]);
    expect(c.rows).toHaveLength(2);
    await expect(dono.query(`INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('carga_toque', now(), 'sucesso', 'teste')`)).resolves.toBeDefined();
  });

  it('stg_toque_instante: só escalares, evento_id só r<n> (n >= 2) ou c<id>, dedupe por (card, evento) e append-only até para o dono', async () => {
    const card = unico('9').replace(/\D/g, '').slice(0, 6).padEnd(6, '1');
    const novos = await coletor.query(
      `INSERT INTO ${S.bm}.stg_toque_instante (card_id, evento_id, ocorrido_em, conta_como_toque, coletado_em, coleta_id) VALUES ($1, 'r2', now(), true, now(), $2), ($1, 'c15', now(), false, now(), $2)`, [card, coleta]);
    expect(novos.rowCount).toBe(2);
    const repetido = await coletor.query(
      `INSERT INTO ${S.bm}.stg_toque_instante (card_id, evento_id, ocorrido_em, conta_como_toque, coletado_em, coleta_id) VALUES ($1, 'r2', now(), false, now(), $2) ON CONFLICT ON CONSTRAINT uq_stg_toque_instante DO NOTHING`, [card, coleta]);
    expect(repetido.rowCount).toBe(0);
    for (const ruim of ['r1', 'r0', 'r', 'c0', 'x2', 'r02', 'c', 'r2 ', "r2'--"]) {
      await expect(coletor.query(`INSERT INTO ${S.bm}.stg_toque_instante (card_id, evento_id, ocorrido_em, conta_como_toque, coletado_em, coleta_id) VALUES ($1, $3, now(), true, now(), $2)`, [card, coleta, ruim]), ruim).rejects.toMatchObject({ code: '23514' });
    }
    await expect(coletor.query(`INSERT INTO ${S.bm}.stg_toque_instante (card_id, evento_id, ocorrido_em, conta_como_toque, coletado_em, coleta_id) VALUES ('abc', 'r2', now(), true, now(), $1)`, [coleta])).rejects.toMatchObject({ code: '23514' });
    await expect(dono.query(`UPDATE ${S.bm}.stg_toque_instante SET conta_como_toque = false WHERE card_id = $1`, [card])).rejects.toMatchObject({ code: '55000' });
    await expect(dono.query(`DELETE FROM ${S.bm}.stg_toque_instante WHERE card_id = $1`, [card])).rejects.toMatchObject({ code: '55000' });
    await expect(dono.query(`TRUNCATE ${S.bm}.stg_toque_instante`)).rejects.toMatchObject({ code: '55000' });
    const colunas = await dono.query<{ c: string }>(`SELECT column_name AS c FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'stg_toque_instante' ORDER BY ordinal_position`, [S.bm]);
    expect(colunas.rows.map((x) => x.c)).toEqual(['toque_sk', 'card_id', 'evento_id', 'ocorrido_em', 'conta_como_toque', 'coletado_em', 'coleta_id', 'sistema_origem']);
  });

  it('ctl_toque_leitura: estado e motivo coerentes, uma linha por (card, coleta), só INSERT e append-only até para o dono', async () => {
    const card = await novoCard();
    const ins = (estado: string, motivo: string | null, revisao: number | null, c = coleta) =>
      coletor.query(`INSERT INTO ${S.bm}.ctl_toque_leitura (card_id, coleta_id, revisao_lida, lido_em, estado, motivo) VALUES ($1, $2, $3, now(), $4, $5)`, [card, c, revisao, estado, motivo]);
    await expect(ins('lido', 'lista_curta', 3)).rejects.toMatchObject({ code: '23514' });
    await expect(ins('leitura_incompleta', null, 3)).rejects.toMatchObject({ code: '23514' });
    await expect(ins('leitura_incompleta', 'motivo_inventado', 3)).rejects.toMatchObject({ code: '23514' });
    await expect(ins('lido', null, null)).rejects.toMatchObject({ code: '23514' });
    await expect(ins('lido', null, 0)).rejects.toMatchObject({ code: '23514' });
    await expect(ins('sem_toque', null, 3)).rejects.toMatchObject({ code: '23514' });
    await ins('leitura_incompleta', 'revisao_invalida', null);
    await expect(ins('lido', null, 3)).rejects.toMatchObject({ code: '23505' });
    const outra = await novaColeta(dono, S.bm);
    await ins('leitura_incompleta', 'comentario_invalido', 3, outra);
    await expect(coletor.query(`UPDATE ${S.bm}.ctl_toque_leitura SET estado = 'lido' WHERE card_id = $1`, [card])).rejects.toBeDefined();
    await expect(dono.query(`UPDATE ${S.bm}.ctl_toque_leitura SET revisao_lida = 9 WHERE card_id = $1`, [card])).rejects.toMatchObject({ code: '55000' });
    await expect(dono.query(`DELETE FROM ${S.bm}.ctl_toque_leitura WHERE card_id = $1`, [card])).rejects.toMatchObject({ code: '55000' });
    await expect(dono.query(`TRUNCATE ${S.bm}.ctl_toque_leitura`)).rejects.toMatchObject({ code: '55000' });
  });

  it('grants: a API lê dim_card.primeiro_toque_em e toque_situacao, nada de stg_toque_instante nem ctl_toque_leitura', async () => {
    await expect(api.query(`SELECT primeiro_toque_em, toque_situacao FROM ${S.bm}.dim_card LIMIT 1`)).resolves.toBeDefined();
    await expect(api.query(`SELECT 1 FROM ${S.bm}.stg_toque_instante LIMIT 1`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`SELECT 1 FROM ${S.bm}.ctl_toque_leitura LIMIT 1`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`SELECT card_id FROM ${S.bm}.ctl_toque_leitura LIMIT 1`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`INSERT INTO ${S.bm}.ctl_toque_leitura (card_id, coleta_id, lido_em, estado, revisao_lida) VALUES ('1', 1, now(), 'lido', 2)`)).rejects.toMatchObject({ code: '42501' });
    await expect(api.query(`UPDATE ${S.bm}.dim_card SET primeiro_toque_em = now()`)).rejects.toMatchObject({ code: '42501' });
  });

  it('R-T5 (casos 13 e 14): o papel da aba Apontamento não lê o toque, nem em dim_card nem nas tabelas novas', async () => {
    // pelo catálogo (não depende da senha do papel no banco local); `dspd_api_apontamento` lê só a lista de `COLUNAS_API_APONTAMENTO`
    const le = async (tabela: string, coluna: string): Promise<boolean> =>
      (await dono.query<{ ok: boolean }>(`SELECT has_column_privilege('dspd_api_apontamento', $1, $2, 'SELECT') AS ok`, [`${S.bm}.${tabela}`, coluna])).rows[0]!.ok;
    expect(await le('dim_card', 'primeiro_toque_em')).toBe(false);
    expect(await le('dim_card', 'toque_situacao')).toBe(false);
    for (const [tabela, colunas] of [['stg_toque_instante', ['card_id', 'evento_id', 'ocorrido_em', 'conta_como_toque']], ['ctl_toque_leitura', ['card_id', 'estado', 'motivo', 'revisao_lida', 'lido_em']]] as const) {
      for (const c of colunas) expect(await le(tabela, c), `${tabela}.${c}`).toBe(false);
    }
    expect(await le('dim_card', 'titulo')).toBe(true);
  });

  it('o coletor insere os eventos e o controle, mas nunca altera nem apaga (sem UPDATE e sem DELETE nas duas tabelas)', async () => {
    await expect(coletor.query(`UPDATE ${S.bm}.stg_toque_instante SET conta_como_toque = true`)).rejects.toMatchObject({ code: '42501' });
    await expect(coletor.query(`DELETE FROM ${S.bm}.stg_toque_instante`)).rejects.toMatchObject({ code: '42501' });
    await expect(coletor.query(`DELETE FROM ${S.bm}.ctl_toque_leitura`)).rejects.toMatchObject({ code: '42501' });
  });

  it('projetor (R6-6): sem controle é nao_lido; lido sem evento é sem_toque; toque igual a criado_em não conta; só depois de criado_em; autor_pendente e leitura_incompleta nunca viram sem_toque', async () => {
    const naoLido = await novoCard();
    const semToque = await novoCard();
    const igual = await novoCard();
    const comToque = await novoCard();
    const pendente = await novoCard();
    const incompleta = await novoCard();
    const externo = await novoCard();
    const sozinhoCriacao = await novoCard(null);
    const grava = async (r: ResultadoToque) => { const c = await novaColeta(dono, S.bm); await gravarLeitura(coletor, S, c, new Date(), r); };
    await grava(leitura(semToque));
    await grava(leitura(igual, { eventos: [{ eventoId: 'r2', ocorridoEm: CRIADO.getTime(), contaComoToque: true }] }));
    await grava(leitura(comToque, {
      eventos: [{ eventoId: 'c9', ocorridoEm: ms('2026-11-03T09:00:00Z'), contaComoToque: true }, { eventoId: 'r2', ocorridoEm: ms('2026-11-02T09:00:00Z'), contaComoToque: true }, { eventoId: 'r3', ocorridoEm: CRIADO.getTime(), contaComoToque: true }],
    }));
    await grava(leitura(pendente, { estado: 'autor_pendente', eventos: [{ eventoId: 'c9', ocorridoEm: ms('2026-11-03T09:00:00Z'), contaComoToque: true }] }));
    await grava(leitura(incompleta, { estado: 'leitura_incompleta', motivo: 'lista_curta' }));
    await grava(leitura(externo, { eventos: [{ eventoId: 'c1', ocorridoEm: ms('2026-11-03T09:00:00Z'), contaComoToque: false }] }));
    await grava(leitura(sozinhoCriacao, { eventos: [{ eventoId: 'r2', ocorridoEm: ms('2026-11-03T09:00:00Z'), contaComoToque: true }] }));
    const todos = [naoLido, semToque, igual, comToque, pendente, incompleta, externo, sozinhoCriacao];
    expect(await projetarToque(coletor, S, todos)).toBe(8);
    expect(await situacao(naoLido)).toEqual({ toque_situacao: 'nao_lido', primeiro_toque_em: null });
    expect(await situacao(semToque)).toEqual({ toque_situacao: 'sem_toque', primeiro_toque_em: null });
    expect(await situacao(igual)).toEqual({ toque_situacao: 'sem_toque', primeiro_toque_em: null });
    expect(await situacao(comToque)).toEqual({ toque_situacao: 'com_toque', primeiro_toque_em: new Date('2026-11-02T09:00:00Z') });
    expect(await situacao(pendente)).toEqual({ toque_situacao: 'autor_pendente', primeiro_toque_em: null });
    expect(await situacao(incompleta)).toEqual({ toque_situacao: 'leitura_incompleta', primeiro_toque_em: null });
    expect(await situacao(externo)).toEqual({ toque_situacao: 'sem_toque', primeiro_toque_em: null });
    // sem `criado_em` o toque não se compara: não é "com toque" (a comparação com nulo não passa)
    expect(await situacao(sozinhoCriacao)).toEqual({ toque_situacao: 'sem_toque', primeiro_toque_em: null });
    // idempotente: reprojetar o mesmo estado não escreve nada
    expect(await projetarToque(coletor, S, todos)).toBe(0);
    // a linha vigente é a de maior `leitura_sk`: uma leitura nova do mesmo card muda a situação
    await grava(leitura(pendente, { eventos: [{ eventoId: 'c9', ocorridoEm: ms('2026-11-03T09:00:00Z'), contaComoToque: true }] }));
    expect(await projetarToque(coletor, S, [pendente])).toBe(1);
    expect(await situacao(pendente)).toEqual({ toque_situacao: 'com_toque', primeiro_toque_em: new Date('2026-11-03T09:00:00Z') });
  });

  it('reconstrução: apagar o dim_card e projetar de novo refaz o primeiro toque sem API; o evento antigo continua valendo', async () => {
    const card = await novoCard();
    const c = await novaColeta(dono, S.bm);
    await gravarLeitura(coletor, S, c, new Date(), leitura(card, { eventos: [{ eventoId: 'r2', ocorridoEm: ms('2026-11-02T09:00:00Z'), contaComoToque: true }] }));
    await projetarToque(coletor, S, [card]);
    await dono.query(`DELETE FROM ${S.bm}.dim_card WHERE card_id = $1`, [card]);
    await dono.query(`INSERT INTO ${S.bm}.dim_card (card_id, criado_em, tipo, granularidade, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, 'Melhoria', 'story', now(), $3)`, [card, CRIADO, coleta]);
    expect(await situacao(card)).toEqual({ toque_situacao: null, primeiro_toque_em: null });
    await projetarToque(coletor, S, [card]);
    expect(await situacao(card)).toEqual({ toque_situacao: 'com_toque', primeiro_toque_em: new Date('2026-11-02T09:00:00Z') });
    // reler o mesmo card não duplica o evento nem altera o instante (ON CONFLICT DO NOTHING)
    const outra = await novaColeta(dono, S.bm);
    const novos = await gravarLeitura(coletor, S, outra, new Date(), leitura(card, { eventos: [{ eventoId: 'r2', ocorridoEm: ms('2026-11-09T09:00:00Z'), contaComoToque: false }] }));
    expect(novos).toBe(0);
    await projetarToque(coletor, S, [card]);
    expect((await situacao(card)).primeiro_toque_em).toEqual(new Date('2026-11-02T09:00:00Z'));
  });
});

// A coleta inteira (fila de verdade no banco, API falsa): as consultas de candidatos rodam no PostgreSQL e o resultado volta ao dim_card.
d('toque: coleta contra o banco (R6-8 e R6-9)', () => {
  let dono: pg.Pool, coletor: pg.Pool;
  let coletaBase: number;
  beforeAll(async () => { dono = poolDe(); coletor = poolDe('dspd_coletor'); coletaBase = await novaColeta(dono, S.bm); });
  afterAll(async () => { await Promise.all([dono.end(), coletor.end()]); });

  const AGORA = new Date();
  const dias = (n: number): Date => new Date(AGORA.getTime() - n * 86_400_000);
  const card = async (id: string, o: { criado: Date; tipo?: string; arquivado?: boolean; concluido?: Date | null; situacao?: string | null; granularidade?: string }): Promise<void> => {
    await dono.query(
      `INSERT INTO ${S.bm}.dim_card (card_id, criado_em, tipo, granularidade, arquivado_em, concluido_em, toque_situacao, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, $3, $4, $5, $6, $7, now(), $8)`,
      [id, o.criado, o.tipo ?? 'Melhoria', o.granularidade ?? 'story', o.arquivado === true ? dias(2) : null, o.concluido ?? null, o.situacao ?? null, coletaBase]);
  };
  // Cards de outros testes também estão no `dim_card` compartilhado: a API falsa os responde com `revision = 1` (só os do teste têm revisões).
  const apiFalsa = (revisoes: Record<string, number>, arquivados: string[] = []) => ({
    get: ((caminho: string, o?: { consulta?: Record<string, string | number> }) => {
      const q = o?.consulta ?? {};
      if (caminho === '/cards') {
        const estado = String(q.state ?? 'active');
        return Promise.resolve({ data: String(q.card_ids).split(',').filter((i) => arquivados.includes(i) === (estado === 'archived')).map((i) => ({ card_id: Number(i), revision: revisoes[i] ?? 1 })) });
      }
      if (caminho === '/cards/comments') return Promise.resolve({ data: [] });
      const m = /^\/cards\/(\d+)\/revisions$/.exec(caminho)!;
      return Promise.resolve({ data: Array.from({ length: (revisoes[m[1]!] ?? 1) - 1 }, (_, i) => ({ revision: i + 1, replaced_at: new Date(dias(5).getTime() + i * 60_000).toISOString(), user_id: 7 })) });
    }) as never,
  });

  it('a carga lê o conjunto do O22 (story, sem "Bug interno", 12 semanas, qualquer estado), grava e projeta; relançar não relê o que ficou lido', async () => {
    const sufixo = String(Math.floor(Math.random() * 1e5)).padStart(5, '0');
    const id = (n: number): string => `7${sufixo}${n}`;
    await card(id(1), { criado: dias(10) });
    await card(id(2), { criado: dias(20), arquivado: true });
    await card(id(3), { criado: dias(10), tipo: 'Bug interno' });
    await card(id(4), { criado: dias(100) });
    await card(id(5), { criado: dias(10), granularidade: 'frente' });
    const revisoes = { [id(1)]: 3, [id(2)]: 2 };
    const deps = { cliente: apiFalsa(revisoes, [id(2)]), pool: coletor, S, hostBase: 'bm.exemplo.test', agora: () => new Date() };
    const r = await coletarToque(deps, { tipo: 'carga' });
    const meus = (await dono.query<{ card_id: string; toque_situacao: string | null; primeiro_toque_em: Date | null }>(
      `SELECT card_id, toque_situacao, primeiro_toque_em FROM ${S.bm}.dim_card WHERE card_id = ANY($1) ORDER BY card_id`, [[1, 2, 3, 4, 5].map(id)])).rows;
    expect(meus.map((x) => [x.card_id, x.toque_situacao])).toEqual([[id(1), 'com_toque'], [id(2), 'autor_pendente'], [id(3), null], [id(4), null], [id(5), null]]);
    expect(meus[0]!.primeiro_toque_em).not.toBeNull();
    expect(r.lidos).toBeGreaterThanOrEqual(2);
    expect(r).toMatchObject({ estado: 'sucesso', parada: 'fim', falhas: 0, arquivadosLidos: 1 });
    const de = await dono.query(`SELECT 1 FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1 AND tarefa = 'carga_toque' AND status = 'sucesso'`, [r.coletaId]);
    expect(de.rowCount).toBe(1);
    const segunda = await coletarToque(deps, { tipo: 'carga' });
    expect(segunda.lidos).toBe(0);
    expect(segunda.candidatos).toBe(0);
  });

  it('o incremental (R6-9) traz o card sem controle, o autor_pendente cuja revision subiu e o aberto sem toque; card com_toque nunca', async () => {
    const sufixo = String(Math.floor(Math.random() * 1e5)).padStart(5, '0');
    const id = (n: number): string => `8${sufixo}${n}`;
    await card(id(1), { criado: dias(3) });
    await card(id(2), { criado: dias(4), situacao: 'com_toque' });
    await card(id(3), { criado: dias(5), situacao: 'autor_pendente' });
    await card(id(4), { criado: dias(6), situacao: 'sem_toque', concluido: dias(1) });
    for (const n of [2, 3, 4]) {
      const c = await novaColeta(dono, S.bm);
      await dono.query(
        `INSERT INTO ${S.bm}.ctl_toque_leitura (card_id, coleta_id, revisao_lida, lido_em, estado) VALUES ($1, $2, 2, now(), $3)`,
        [id(n), c, n === 3 ? 'autor_pendente' : 'lido']);
      await dono.query(
        `INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id) VALUES ($1, NULL, $2, $3::jsonb, 'q', false, false, now(), $4)`,
        [id(n), hash(id(n)), JSON.stringify({ revision: n === 4 ? 2 : 5 }), c]);
    }
    const chamadas: string[] = [];
    const base = apiFalsa({ [id(1)]: 2, [id(3)]: 5 });
    const cliente = { get: ((c: string, o?: never) => { chamadas.push(c); return (base.get as (c: string, o?: never) => Promise<unknown>)(c, o); }) as never };
    const r = await coletarToque({ cliente, pool: coletor, S, hostBase: 'bm.exemplo.test', agora: () => new Date() }, { tipo: 'incremental' });
    expect(chamadas).toContain(`/cards/${id(1)}/revisions`);
    expect(chamadas).toContain(`/cards/${id(3)}/revisions`);
    expect(chamadas).not.toContain(`/cards/${id(2)}/revisions`);
    expect(chamadas).not.toContain(`/cards/${id(4)}/revisions`);
    expect(r).toMatchObject({ modo: 'incremental', falhas: 0 });
  });

  it('o portão sorteia da base de verdade e responde; a consulta de amostra roda sem erro', async () => {
    const r = await coletarToque({ cliente: apiFalsa({}), pool: coletor, S, hostBase: 'bm.exemplo.test', agora: () => new Date() }, { tipo: 'portao', amostra: 2 });
    expect(r.portao).not.toBeNull();
    expect(r.modo).toBe('portao');
  });
});

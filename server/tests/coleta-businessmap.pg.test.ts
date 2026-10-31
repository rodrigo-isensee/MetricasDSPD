import type pg from 'pg';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { coletarCards, type DepsColeta } from '../src/modulos/businessmap/coleta.js';
import { etapaReferencia, executarColeta, type DepsComando } from '../src/modulos/businessmap/coleta-comando.js';
import { lerConferencia } from '../src/modulos/businessmap/conferencia.js';
import { resolverResponsaveis } from '../src/modulos/businessmap/usuarios.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { cenarioVazio, subirServidorBm, type Cartao, type Cenario, type ServidorBm } from './businessmap-coleta-duble.js';
import { novaColeta, poolDe, S, url } from './pg/ctx.js';

// F3 do plano 052 contra o PostgreSQL local: gravadores (staging, ctl_coleta, dim_responsavel), carga da referência em transação
// do papel de referência, rollback e os 42501 dos papéis. O BusinessMap é o servidor falso; nenhuma chamada real.
const d = describe.skipIf(!url);
const Q = 9027; // quadro de teste: nenhum outro teste nem seed usa; a referência nunca é confirmada (as tabelas de vigência não aceitam DELETE)
const AGORA = new Date('2026-11-02T12:00:00Z');
const base = 900_000_000 + Math.floor(Math.random() * 90_000_000);
let proximo = 0;
const card = (extra: Cartao = {}): Cartao => ({
  card_id: base + ++proximo, title: 'Card de teste', type_id: 3, last_modified: '2026-10-30T10:00:00Z', owner_user_id: 5, co_owner_ids: [6],
  email: 'pessoa@exemplo.com', description: 'DESCRICAO-MARCADOR', custom_fields: [{ field_id: 36, value: 'ACELERATO-MARCADOR' }, { field_id: 42, value: 'RESPONSAVEL-CR-MARCADOR' }], ...extra,
});
const corposRef = {
  [`/boards/${Q}/currentStructure`]: {
    data: {
      columns: {
        '90271': { name: 'Fazendo', section: 3, flow_type: 1, parent_column_id: 0, workflow_id: 90270, limit: 0 },
        '90272': { name: 'Feito', section: 4, flow_type: 1, parent_column_id: 0, workflow_id: 90270, limit: 0 },
      },
      child_columns: {}, workflows: { '90270': { name: 'WF', top_columns: [90271, 90272], bottom_columns: [90271, 90272] } },
    },
  },
  [`/boards/${Q}/workflows`]: { data: [{ workflow_id: 90270, name: 'Projetos', type: 0 }] },
  '/cardTypes': { data: [{ type_id: 90271, name: 'Tipo de teste' }] },
};

d('F3 do plano 052: coleta contra PostgreSQL (papéis, CHECKs, staging, dim_responsavel, transação da referência)', () => {
  let dono: pg.Pool, coletor: pg.Pool, ref: pg.Pool, api: pg.Pool;
  const servidores: ServidorBm[] = [];
  const idsDeUsuario: string[] = [];
  beforeAll(() => { dono = poolDe(); coletor = poolDe('dspd_coletor'); ref = poolDe('dspd_ref'); api = poolDe('dspd_api'); });
  afterEach(async () => { for (const s of servidores.splice(0)) await s.fechar(); });
  afterAll(async () => {
    // as coletas deste arquivo não podem aparecer no estado de coleta dos outros testes (tarefa coleta_incremental); o staging fica (append-only)
    await dono.query(`DELETE FROM ${S.core}.outbox WHERE payload ->> 'coletaId' IN (SELECT coleta_id::text FROM ${S.bm}.ctl_coleta WHERE versao_coletor = 'bm-f3/1')`);
    await dono.query(`UPDATE ${S.bm}.ctl_coleta SET tarefa = 'reconciliacao' WHERE versao_coletor = 'bm-f3/1'`);
    if (idsDeUsuario.length > 0) await dono.query(`DELETE FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[])`, [idsDeUsuario]);
    await Promise.all([dono, coletor, ref, api].map((p) => p.end()));
  });

  async function montar(cenario: Cenario): Promise<{ servidor: ServidorBm; deps: DepsColeta }> {
    const servidor = await subirServidorBm(cenario);
    servidores.push(servidor);
    const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-f3-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
    return { servidor, deps: { cliente, pool: coletor, S, quadros: [Q], hostBase: 'bm.exemplo.test', agora: () => AGORA } };
  }
  const n = async (sql: string, params: unknown[] = []): Promise<number> => Number((await dono.query<{ n: string }>(sql, params)).rows[0]!.n);
  const falhaDoBanco = async (p: pg.Pool, sql: string, params: unknown[] = []): Promise<{ code?: string }> => {
    try {
      await p.query(sql, params);
    } catch (e) {
      return e as { code?: string };
    }
    throw new Error(`esperava falha do banco: ${sql}`);
  };

  it('carga inicial no PostgreSQL: staging pela allow-list, contagens, marca d\'água e retomada sem duplicar (parametros guarda a página)', async () => {
    const ativos = [card(), card(), card()];
    const arquivado = card({ archived_at: '2026-03-01T00:00:00Z' });
    const m = await montar({ ...cenarioVazio(), porPagina: 2, cards: { [`${Q}|active`]: ativos, [`${Q}|archived`]: [arquivado] }, status: { [`${Q}|discarded`]: 404 } });
    const r1 = await coletarCards(m.deps, { tipo: 'carga_inicial' });
    expect(r1).toMatchObject({ estado: 'parcial', retomada: false, falhas: { http: 1 } });
    const c1 = await dono.query<{ status: string; marca_dagua_ate: Date | null; parametros: Record<string, unknown>; erro_resumo: string }>(
      `SELECT status, marca_dagua_ate, parametros, erro_resumo FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [r1.coletaId]);
    expect(c1.rows[0]).toMatchObject({ status: 'parcial', marca_dagua_ate: null });
    expect(c1.rows[0]!.erro_resumo).toBe('desconhecido: 1 falha(s) (http)');
    expect(c1.rows[0]!.parametros).toMatchObject({ tipo: 'carga_inicial', paginas: { [`${Q}|active`]: { ultima: 2, total: 2 }, [`${Q}|archived`]: { ultima: 1, total: 1 } } });
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1 AND entidade = $2 AND erro = 'http' AND id_origem IS NULL`, [r1.coletaId, `card_${Q}_discarded`])).toBe(1);
    const conts = await dono.query<{ entidade: string; lidos: number; inseridos: number }>(`SELECT entidade, lidos, inseridos FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1 AND entidade LIKE 'card\\_%' ORDER BY entidade`, [r1.coletaId]);
    expect(conts.rows).toEqual([
      { entidade: `card_${Q}_active`, lidos: 3, inseridos: 3 }, { entidade: `card_${Q}_archived`, lidos: 1, inseridos: 1 }, { entidade: `card_${Q}_discarded`, lidos: 0, inseridos: 0 },
    ]);

    // o quadro volta: a segunda execução retoma (não relê o que terminou) e fecha em sucesso com a marca da PRIMEIRA tentativa
    delete m.servidor.cenario.status[`${Q}|discarded`];
    m.servidor.cenario.cards[`${Q}|discarded`] = [card({ discarded_at: '2026-04-01T00:00:00Z' })];
    const antes = m.servidor.pedidos.length;
    const r2 = await coletarCards(m.deps, { tipo: 'carga_inicial' });
    expect(r2).toMatchObject({ estado: 'sucesso', retomada: true, inicioCarga: '2025-11-02' });
    expect(m.servidor.pedidos.slice(antes).filter((p) => p.caminho === '/cards').map((p) => p.consulta.get('state'))).toEqual(['discarded']);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE quadro_id = $1`, [String(Q)])).toBe(5);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE quadro_id = $1 AND arquivado`, [String(Q)])).toBe(1);
    const c2 = await dono.query<{ status: string; marca_dagua_ate: Date }>(`SELECT status, marca_dagua_ate FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [r2.coletaId]);
    expect(c2.rows[0]).toMatchObject({ status: 'sucesso' });
    expect(c2.rows[0]!.marca_dagua_ate).toEqual(AGORA);

    // nenhum dado fora da allow-list chegou ao staging, nem pessoa, nem os fields 36 e 42
    const payloads = await dono.query<{ payload: string }>(`SELECT payload::text AS payload FROM ${S.bm}.stg_card WHERE quadro_id = $1`, [String(Q)]);
    expect(payloads.rows).toHaveLength(5);
    for (const marca of ['pessoa@exemplo.com', 'DESCRICAO-MARCADOR', 'ACELERATO-MARCADOR', 'RESPONSAVEL-CR-MARCADOR', 'owner_user_id', 'co_owner_ids']) {
      for (const l of payloads.rows) expect(l.payload).not.toContain(marca);
    }

    // incremental: lê a partir da marca menos a sobreposição e é idempotente
    const r3 = await coletarCards(m.deps, { tipo: 'incremental' });
    expect(r3.estado).toBe('sucesso');
    expect(m.servidor.pedidos.filter((p) => p.consulta.get('last_modified_from') !== null).map((p) => p.consulta.get('last_modified_from'))).toEqual(Array(3).fill('2026-11-02T11:00:00Z'));
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE quadro_id = $1`, [String(Q)])).toBe(5);
  });

  it('execução que morreu sem fechar é fechada como falha; falha de card só com código e id nulo', async () => {
    const aberta = await dono.query<{ coleta_id: string }>(
      `INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('coleta_incremental', now(), 'em_andamento', 'bm-f3/1') RETURNING coleta_id`);
    const m = await montar({ ...cenarioVazio(), cards: { [`${Q}|active`]: [card({ card_id: null, title: 'TITULO-MARCADOR' })] } });
    const r = await coletarCards(m.deps, { tipo: 'carga_inicial', inicio: '2025-01-01' });
    expect(r).toMatchObject({ estado: 'parcial', falhas: { 'card-sem-id': 1 } });
    const velha = await dono.query<{ status: string; erro_resumo: string }>(`SELECT status, erro_resumo FROM ${S.bm}.ctl_coleta WHERE coleta_id = $1`, [aberta.rows[0]!.coleta_id]);
    expect(velha.rows[0]).toEqual({ status: 'falha', erro_resumo: 'desconhecido: execução anterior interrompida' });
    const f = await dono.query<{ id_origem: string | null; erro: string }>(`SELECT id_origem, erro FROM ${S.bm}.ctl_coleta_falha WHERE coleta_id = $1`, [r.coletaId]);
    expect(f.rows).toEqual([{ id_origem: null, erro: 'card-sem-id' }]);
  });

  it('dim_responsavel como dspd_coletor: UPSERT, releitura só passados 30 dias, id não devolvido mantém a linha, nome só nesta tabela', async () => {
    const [a, b, c] = [String(base + 1_000_001), String(base + 1_000_002), String(base + 1_000_003)];
    idsDeUsuario.push(a, b, c);
    const pedidos: string[] = [];
    const cliente = {
      get: (_c: string, o?: { consulta?: Record<string, string | number> }) => {
        pedidos.push(String(o?.consulta?.user_ids));
        return Promise.resolve({ data: [{ user_id: Number(a), realname: 'NOME-MARCADOR-A', email: 'x@exemplo.com', attributes: { y: 1 } }, { user_id: Number(b), realname: 'NOME-MARCADOR-B' }] });
      },
    } as never;
    const r1 = await resolverResponsaveis(coletor, cliente, [a, b, c], AGORA, S);
    expect(r1).toEqual({ pedidos: 3, resolvidos: 2, naoResolvidos: 1, falha: null });
    const linhas = async () => (await dono.query<{ responsavel_id: string; responsavel_nome: string; atualizado_em: Date }>(
      `SELECT responsavel_id, responsavel_nome, atualizado_em FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[]) ORDER BY responsavel_id`, [[a, b, c]])).rows;
    expect((await linhas()).map((l) => [l.responsavel_id, l.responsavel_nome])).toEqual([[a, 'NOME-MARCADOR-A'], [b, 'NOME-MARCADOR-B']]);
    // 10 dias depois: linha fresca, ninguém é pedido de novo, exceto o que não tem linha
    pedidos.length = 0;
    await resolverResponsaveis(coletor, cliente, [a, b], new Date(AGORA.getTime() + 10 * 86_400_000), S);
    expect(pedidos).toEqual([]);
    // 31 dias depois: pedido de novo, nome e data atualizam; o id que a API não devolve mantém a linha como estava
    await dono.query(`UPDATE ${S.bm}.dim_responsavel SET responsavel_nome = 'NOME-ANTIGO' WHERE responsavel_id = $1`, [a]);
    const depois = new Date(AGORA.getTime() + 31 * 86_400_000);
    const cliente2 = { get: () => Promise.resolve({ data: [{ user_id: Number(a), realname: 'NOME-MARCADOR-NOVO' }] }) } as never;
    const r2 = await resolverResponsaveis(coletor, cliente2, [a, b], depois, S);
    expect(r2).toEqual({ pedidos: 2, resolvidos: 1, naoResolvidos: 1, falha: null });
    const l = await linhas();
    expect(l.find((x) => x.responsavel_id === a)).toMatchObject({ responsavel_nome: 'NOME-MARCADOR-NOVO', atualizado_em: depois });
    expect(l.find((x) => x.responsavel_id === b)).toMatchObject({ responsavel_nome: 'NOME-MARCADOR-B', atualizado_em: AGORA });
    // o nome não vai a nenhuma outra tabela de dados nem ao staging
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE payload::text LIKE '%NOME-MARCADOR%'`)).toBe(0);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.ctl_coleta_falha WHERE erro LIKE '%NOME-MARCADOR%'`)).toBe(0);
  });

  it('CHECKs de dim_responsavel: id só com dígitos, nome não vazio e até 200 caracteres', async () => {
    const id = String(base + 2_000_001);
    idsDeUsuario.push(id);
    const ins = (i: string, nome: string) => dono.query(`INSERT INTO ${S.bm}.dim_responsavel (responsavel_id, responsavel_nome, atualizado_em) VALUES ($1, $2, now())`, [i, nome]);
    expect((await falhaDoBanco(dono, `INSERT INTO ${S.bm}.dim_responsavel (responsavel_id, responsavel_nome, atualizado_em) VALUES ('abc', 'x', now())`)).code).toBe('23514');
    await expect(ins(id, '')).rejects.toMatchObject({ code: '23514' });
    await expect(ins(id, 'x'.repeat(201))).rejects.toMatchObject({ code: '23514' });
    await ins(id, 'x'.repeat(200));
    await expect(ins(id, 'outro')).rejects.toMatchObject({ code: '23505' });
  });

  it('42501: o dspd_api não lê dim_responsavel (tabela nem coluna); o coletor não apaga nem escreve a referência; staging segue só INSERT', async () => {
    for (const sql of [
      `SELECT * FROM ${S.bm}.dim_responsavel`, `SELECT responsavel_id FROM ${S.bm}.dim_responsavel`, `SELECT responsavel_nome FROM ${S.bm}.dim_responsavel`,
      `SELECT atualizado_em FROM ${S.bm}.dim_responsavel`, `SELECT count(*) FROM ${S.bm}.dim_responsavel`,
      `INSERT INTO ${S.bm}.dim_responsavel (responsavel_id, responsavel_nome, atualizado_em) VALUES ('1', 'x', now())`,
    ]) expect((await falhaDoBanco(api, sql)).code, sql).toBe('42501');
    const priv = await dono.query(
      `SELECT 1 FROM information_schema.table_privileges WHERE grantee = 'dspd_api' AND table_schema = $1 AND table_name = 'dim_responsavel'
       UNION ALL SELECT 1 FROM information_schema.column_privileges WHERE grantee = 'dspd_api' AND table_schema = $1 AND table_name = 'dim_responsavel'`, [S.bm]);
    expect(priv.rows).toEqual([]);
    expect((await falhaDoBanco(coletor, `DELETE FROM ${S.bm}.dim_responsavel WHERE responsavel_id = '1'`)).code).toBe('42501');
    expect((await falhaDoBanco(coletor, `INSERT INTO ${S.bm}.ref_coluna (quadro_id, coluna_id, nome, tipo_coluna, ordem, vigente_de) VALUES ('${Q}', '1', 'x', 'fila', 1, '2026-11-02')`)).code).toBe('42501');
    expect((await falhaDoBanco(coletor, `UPDATE ${S.bm}.ref_coluna SET vigente_ate = '2026-11-02' WHERE quadro_id = '${Q}'`)).code).toBe('42501');
    expect((await falhaDoBanco(coletor, `UPDATE ${S.bm}.stg_card SET quadro_id = 'x' WHERE id_origem = '0'`)).code).toBe('42501');
    expect((await falhaDoBanco(coletor, `DELETE FROM ${S.bm}.stg_card WHERE id_origem = '0'`)).code).toBe('42501');
    // a coluna parametros de ctl_coleta é do coletor só no BusinessMap (carga retomável); as outras colunas de identidade da coleta não
    expect((await falhaDoBanco(coletor, `UPDATE ${S.bm}.ctl_coleta SET versao_coletor = 'x' WHERE coleta_id = 0`)).code).toBe('42501');
    expect((await falhaDoBanco(coletor, `UPDATE ${S.ac}.ctl_coleta SET parametros = '{}' WHERE coleta_id = 0`)).code).toBe('42501');
  });

  /** Transação do papel de referência com o efeito real no banco, mas sem confirmar (as tabelas de vigência não aceitam DELETE). */
  function poolRefDeTeste(modo: 'desfazer' | 'falhar', visto: { quadros?: number; comandos: string[] }): PoolLike {
    return {
      query: ref.query.bind(ref) as never,
      end: () => Promise.resolve(),
      connect: async () => {
        const c = await ref.connect();
        const q = c.query.bind(c) as unknown as (t: string, v?: unknown[]) => Promise<{ rows: { n: string }[]; rowCount: number | null }>;
        const query = async (t: string, v?: unknown[]) => {
          if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(t)) visto.comandos.push(t);
          if (modo === 'falhar' && t.startsWith(`INSERT INTO ${S.bm}.ref_coluna`)) throw new Error('falha simulada no INSERT da coluna');
          if (t === 'COMMIT') {
            visto.quadros = Number((await q(`SELECT count(*) AS n FROM ${S.bm}.ref_coluna WHERE quadro_id = '${Q}'`)).rows[0]!.n);
            return q('ROLLBACK');
          }
          return q(t, v);
        };
        return { query: query as never, release: (x) => c.release(x as boolean) };
      },
    };
  }
  const depsComando = (servidor: ServidorBm, poolRef: PoolLike): DepsComando => ({
    cliente: criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-f3-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() }),
    poolColetor: coletor, poolRef, conf: lerConferencia(), quadros: [Q], hostBase: 'bm.exemplo.test', agora: () => AGORA, S,
  });

  it('referência da F2 pelo comando: uma transação do dspd_ref (as linhas existem até o fim), o dspd_coletor só escreve a contagem', async () => {
    const servidor = await subirServidorBm({ ...cenarioVazio(), corpos: corposRef });
    servidores.push(servidor);
    const visto: { quadros?: number; comandos: string[] } = { comandos: [] };
    const coleta = await novaColeta(dono, S.bm);
    const r = await etapaReferencia(depsComando(servidor, poolRefDeTeste('desfazer', visto)), '2026-11-02', '2025-11-02', undefined)(coleta);
    expect(visto.comandos).toEqual(['BEGIN', 'COMMIT']);
    expect(visto.quadros).toBe(2);
    expect(r).toMatchObject({ fechadas: 0, marca: false, semConferencia: 0, folhasSemPapel: 0 });
    // desfeito no fim (o teste não confirma): nada ficou para os outros testes
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.ref_coluna WHERE quadro_id = '${Q}'`)).toBe(0);
    const c = await dono.query(`SELECT lidos FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1 AND entidade = 'folha_sem_conferencia'`, [coleta]);
    expect(c.rows).toEqual([{ lidos: 0 }]);
    expect(servidor.pedidos.every((p) => p.metodo === 'GET')).toBe(true);
  });

  it('A2: INSERT que falha no meio da carga da referência desfaz tudo (ROLLBACK): nenhuma linha nova nem vigência fechada', async () => {
    const servidor = await subirServidorBm({ ...cenarioVazio(), corpos: corposRef });
    servidores.push(servidor);
    const visto: { quadros?: number; comandos: string[] } = { comandos: [] };
    const coleta = await novaColeta(dono, S.bm);
    await expect(etapaReferencia(depsComando(servidor, poolRefDeTeste('falhar', visto)), '2026-11-02', '2025-11-02', undefined)(coleta)).rejects.toThrow('falha simulada');
    expect(visto.comandos).toEqual(['BEGIN', 'ROLLBACK']);
    for (const t of ['ref_quadro', 'ref_workflow', 'ref_coluna']) expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.${t} WHERE quadro_id = '${Q}'`), t).toBe(0);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.ctl_coleta_contagem WHERE coleta_id = $1 AND entidade = 'folha_sem_conferencia'`, [coleta])).toBe(0);
  });

  it('comando inteiro com a referência e os cards; trava da fonte ocupada recusa sem tocar no BusinessMap', async () => {
    const servidor = await subirServidorBm({ ...cenarioVazio(), corpos: corposRef, cards: { [`${Q}|active`]: [card()] } });
    servidores.push(servidor);
    const visto: { quadros?: number; comandos: string[] } = { comandos: [] };
    const r = await executarColeta(depsComando(servidor, poolRefDeTeste('desfazer', visto)), { modo: 'carga-inicial', inicio: '2025-02-02' });
    expect(r).toMatchObject({ estado: 'sucesso', inicioCarga: '2025-02-02' });
    expect(visto.comandos).toEqual(['BEGIN', 'COMMIT']);
    const quando = servidor.pedidos.length;
    const segura = await dono.connect();
    try {
      await segura.query(`SELECT pg_advisory_lock(hashtext('dspd:fonte:businessmap'))`);
      await expect(executarColeta(depsComando(servidor, poolRefDeTeste('desfazer', visto)), { modo: 'incremental' })).rejects.toMatchObject({ codigo: 'trava' });
      expect(servidor.pedidos).toHaveLength(quando);
    } finally {
      await segura.query(`SELECT pg_advisory_unlock(hashtext('dspd:fonte:businessmap'))`);
      segura.release();
    }
  });

  it('o nome do responsável da carga inteira só chega a dim_responsavel (ids vistos nos cards, resolvidos por /users)', async () => {
    const dono1 = String(base + 3_000_001);
    idsDeUsuario.push(dono1);
    const m = await montar({
      ...cenarioVazio(), cards: { [`${Q}|active`]: [card({ owner_user_id: Number(dono1), co_owner_ids: [] })] },
      users: { [dono1]: { user_id: Number(dono1), realname: 'NOME-MARCADOR-CARGA', email: 'z@exemplo.com', attributes: { a: 1 } } },
    });
    const r = await coletarCards(m.deps, { tipo: 'carga_inicial', inicio: '2025-03-03' });
    expect(r.usuarios).toEqual({ pedidos: 1, resolvidos: 1, naoResolvidos: 0, falha: null });
    expect((await dono.query(`SELECT responsavel_nome FROM ${S.bm}.dim_responsavel WHERE responsavel_id = $1`, [dono1])).rows).toEqual([{ responsavel_nome: 'NOME-MARCADOR-CARGA' }]);
    expect(await n(`SELECT count(*)::int AS n FROM ${S.bm}.stg_card WHERE payload::text LIKE '%NOME-MARCADOR-CARGA%' OR payload::text LIKE '%z@exemplo.com%'`)).toBe(0);
  });
});

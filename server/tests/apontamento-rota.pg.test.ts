import { respostaApontamentoSchema } from '@metricas-dspd/contratos';
import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { lerCriterios } from '../src/modulos/apontamento/repositorio.js';
import { analisarCalendario, sincronizarCalendario } from '../src/modulos/referencia/calendario.js';
import { registrarCriteriosApontamento } from '../src/modulos/referencia/criterios-apontamento.js';
import { colunasDePessoa, provarSemPessoa } from './pg/colunas-pessoa.js';
import { novaColeta, poolDe, S, url } from './pg/ctx.js';

// Pedido 059, B4 contra o PostgreSQL local: o privilégio do papel `dspd_api_apontamento` (CA-AP-1, R4-5) e a rota ponta a ponta com esse papel
// (se faltar uma coluna no GRANT, a consulta falha aqui). Dados só em ids e datas de faixa própria (2031), sem colidir com os outros testes.
const d = describe.skipIf(!url);
const MARCADOR_NOME = 'PESSOA-FICTICIA-MARCADOR-059';
const FAIXA = 9_710_000_000;
const RAIZ = String(FAIXA + 1);
const FILHO = String(FAIXA + 2);
const SOLTO = String(FAIXA + 3); // card sem hierarquia na referência
const ANTIGO = String(FAIXA + 5); // card do escopo cujo responsavel saiu antes dos 12 meses
const OUTRO = String(FAIXA + 6); // card de outra categoria (Defeito), para provar que o filtro por tipo separa categorias
const FORA = String(FAIXA + 4); // card fora do escopo do DSPD (raiz fora dos quadros coletados)
const AGORA = new Date('2031-02-10T15:00:00Z');
const SHA = (c: string): string => c.repeat(64).slice(0, 64);

d('059: papel dspd_api_apontamento e rota da aba no PostgreSQL', () => {
  let dono: pg.Pool, aba: pg.Pool, api: pg.Pool;
  const ids = { a: '', b: '', c: '', d: '', e: '' };
  const refs = { a: '', b: '', c: '', d: '', e: '' };
  const logged: string[] = [];

  const falha = async (p: pg.Pool, sql: string): Promise<{ code?: string }> => {
    try {
      await p.query(sql);
    } catch (e) {
      return e as { code?: string };
    }
    throw new Error(`esperava falha do banco: ${sql.slice(0, 90)}`);
  };

  beforeAll(async () => {
    dono = poolDe();
    aba = poolDe('dspd_api_apontamento');
    api = poolDe('dspd_api');
    const coleta = await novaColeta(dono, S.bm);
    const card = (id: string, pai: string | null, granularidade: string | null, titulo: string, tipo: string | null) =>
      dono.query(`INSERT INTO ${S.bm}.dim_card (card_id, card_pai, granularidade, titulo, tipo, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, $3, $4, $5, now(), $6)`, [id, pai, granularidade, titulo, tipo, coleta]);
    await card(RAIZ, null, 'projeto', 'Projeto Raiz Teste 059', null);
    await card(FILHO, RAIZ, null, 'Card filho', 'Melhoria');
    await card(SOLTO, null, null, 'Card solto', null);
    await card(OUTRO, RAIZ, null, 'Card outro tipo', 'Defeito');
    const raiz = (c: string, r: string, prof: number, ini: boolean) =>
      dono.query(`INSERT INTO ${S.bm}.dim_card_raiz (card_id, raiz_card_id, profundidade, raiz_eh_iniciativa, raiz_fora_do_escopo, coletado_em, atualizado_por_coleta_id) VALUES ($1, $2, $3, $4, false, now(), $5)`, [c, r, prof, ini, coleta]);
    await raiz(RAIZ, RAIZ, 0, true);
    await raiz(FILHO, RAIZ, 1, true);
    await raiz(OUTRO, RAIZ, 1, true);
    await dono.query(`UPDATE ${S.bm}.dim_card SET equipe = $2 WHERE card_id = $1`, [FILHO, 'Time Alfa Teste 097']); // 097 L2: time do card; OUTRO e SOLTO ficam em outros times / sem time
    await dono.query(`UPDATE ${S.bm}.dim_card SET equipe = $2 WHERE card_id = $1`, [OUTRO, 'Time Beta Teste 097']);
    await card(FORA, null, null, 'Card fora do escopo', null);
    await card(ANTIGO, null, null, 'Card antigo', null);
    await dono.query(`INSERT INTO ${S.bm}.dim_card_raiz (card_id, raiz_card_id, profundidade, raiz_eh_iniciativa, raiz_fora_do_escopo, coletado_em, atualizado_por_coleta_id) VALUES ($1, $1, 0, false, false, now(), $2)`, [ANTIGO, coleta]);
    await dono.query(`INSERT INTO ${S.bm}.dim_card_raiz (card_id, raiz_card_id, profundidade, raiz_eh_iniciativa, raiz_fora_do_escopo, coletado_em, atualizado_por_coleta_id) VALUES ($1, $1, 0, false, true, now(), $2)`, [FORA, coleta]);
    ids.a = String(FAIXA + 101);
    ids.b = String(FAIXA + 102);
    const pessoa = async (id: string, nome: string): Promise<string> =>
      (await dono.query<{ pessoa_ref: string }>(`INSERT INTO ${S.bm}.dim_responsavel (responsavel_id, responsavel_nome, atualizado_em) VALUES ($1, $2, now()) RETURNING pessoa_ref`, [id, nome])).rows[0]!.pessoa_ref;
    refs.a = await pessoa(ids.a, MARCADOR_NOME);
    refs.b = await pessoa(ids.b, 'Outra Pessoa Ficticia');
    ids.c = String(FAIXA + 103);
    ids.d = String(FAIXA + 104);
    ids.e = String(FAIXA + 105);
    refs.c = await pessoa(ids.c, 'Pessoa C Ficticia'); // responsável só antes dos 12 meses
    refs.d = await pessoa(ids.d, 'Pessoa D Ficticia'); // nunca responsável
    refs.e = await pessoa(ids.e, 'Pessoa E Ficticia'); // responsável só de card fora do escopo
    // versões dos cards (SCD2, só para o dono: o papel da aba nunca lê `responsaveis`); o corte dos 12 meses é 2030-02-10 (AGORA - 12 meses)
    const anterior = new Map<string, string | null>();
    let v = 0;
    const versao = async (cardId: string, vigenteDe: string, responsaveis: string[]) => {
      const sk = (await dono.query<{ stg_sk: string }>(
        `INSERT INTO ${S.bm}.stg_card (id_origem, anterior_sk, payload_sha256, payload, quadro_id, arquivado, excluido_detectado, coletado_em, coleta_id)
         VALUES ($1, $2, decode($3, 'hex'), $4::jsonb, '1', false, false, now(), $5) RETURNING stg_sk`,
        [cardId, anterior.get(cardId) ?? null, SHA(`a${++v}`), JSON.stringify({ card_id: cardId }), coleta])).rows[0]!.stg_sk;
      anterior.set(cardId, sk);
      await dono.query(
        `INSERT INTO ${S.bm}.dim_card_versao (card_id, vigente_de, stg_card_sk, responsaveis, coletado_em, coleta_id) VALUES ($1, $2, $3, $4::text[], now(), $5)`,
        [cardId, vigenteDe, sk, responsaveis, coleta]);
    };
    await versao(FILHO, '2029-01-01T00:00:00Z', [ids.a]);
    await versao(FILHO, '2030-12-01T00:00:00Z', [ids.b]); // A deixa o card em 2030-12-01 (dentro dos 12 meses: segue do time); B e o responsavel atual
    await versao(ANTIGO, '2029-01-01T00:00:00Z', [ids.c]);
    await versao(ANTIGO, '2029-06-01T00:00:00Z', []); // C deixou o card em 2029-06-01, antes do corte: fora do time
    await versao(FORA, '2030-12-01T00:00:00Z', [ids.e]);

    let n = 0;
    const fato = async (data: string, segundos: number, pessoaRef: string | null, card: string, extra: { excluido?: boolean; flags?: number; subgrupo?: string; subtask?: string | null; tipo?: string } = {}) => {
      const id = String(FAIXA + 1000 + ++n);
      logged.push(id);
      await dono.query(
        `INSERT INTO ${S.bm}.fato_apontamento (logged_time_id, card_id, subtask_id, data_apontamento, segundos, subgrupo_codigo, flags_qualidade, qtd_palavras, versao_dicionario,
           registro_sha256, iniciativa_card_id, pessoa_ref, type_id, versoes, excluido_em, atualizado_em, atualizado_por_coleta_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 5, 'dic-teste', decode($8, 'hex'), $9, $10, $13, 1, $11, now(), $12)`,
        [id, card, extra.subtask ?? null, data, segundos, extra.subgrupo ?? 'desenvolvimento', extra.flags ?? 0, SHA('d'), card === SOLTO ? null : RAIZ, pessoaRef, extra.excluido === true ? new Date() : null, coleta, card === SOLTO ? null : (extra.tipo ?? '12')]);
    };
    const dias = ['06', '07', '08', '09', '10', '13', '14', '15', '16', '17', '20', '21', '22', '23', '24', '27', '28', '29', '30', '31'];
    for (const dia of dias) await fato(`2031-01-${dia}`, 7200, refs.a, FILHO);
    await fato('2031-02-03', 7200, refs.a, FILHO, { subtask: String(FAIXA + 7) }); // 21º apontamento da pessoa A
    await fato('2031-01-06', 3600, refs.b, SOLTO, { flags: 1 | 2 | 4 | 8, subgrupo: 'nao-classificado' });
    await fato('2031-01-07', 3600, refs.b, FILHO);
    await fato('2031-01-08', 3600, refs.b, FILHO, { excluido: true }); // excluído: fora das somas
    await fato('2031-01-09', 5400, null, FILHO); // sem pessoa (eliminada a pedido): só no agregado do time
    await fato('2031-04-01', 3600, refs.a, FILHO); // fora da janela da consulta
    // maio de 2031: janela propria do filtro por tipo (type_id 12 e 34 na mesma categoria, Melhoria; 56 em outra, Defeito; e uma linha sem tipo)
    await fato('2031-05-03', 3600, refs.a, FILHO);
    await fato('2031-05-04', 7200, refs.a, FILHO, { tipo: '34' });
    await fato('2031-05-05', 1800, refs.a, SOLTO);
    await fato('2031-05-06', 900, refs.a, OUTRO, { tipo: '56' }); // categoria distinta (Defeito)
    // marco de 2031 (janela propria do teste de Outra area): C, D e E nao sao do time; A e
    await fato('2031-03-03', 3600, refs.c, FILHO);
    await fato('2031-03-04', 7200, refs.d, FILHO);
    await fato('2031-03-05', 1800, refs.e, FILHO);
    await fato('2031-03-06', 3600, refs.a, FILHO);
    await dono.query(`INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor) VALUES ('apontamento', now() - interval '1 minute', now(), 'sucesso', 'rota-teste')`);
  });

  afterAll(async () => {
    await dono.query(`DELETE FROM ${S.bm}.fato_apontamento WHERE logged_time_id = ANY($1::text[])`, [logged]);
    await dono.query(`DELETE FROM ${S.bm}.dim_card_raiz WHERE card_id = ANY($1::text[])`, [[RAIZ, FILHO, SOLTO, FORA, ANTIGO, OUTRO]]);
    await dono.query(`DELETE FROM ${S.bm}.dim_card WHERE card_id = ANY($1::text[])`, [[RAIZ, FILHO, SOLTO, FORA, ANTIGO, OUTRO]]);
    await dono.query(`DELETE FROM ${S.bm}.dim_responsavel WHERE responsavel_id = ANY($1::text[])`, [[ids.a, ids.b, ids.c, ids.d, ids.e]]);
    await dono.query(`UPDATE ${S.bm}.ctl_coleta SET tarefa = 'reconciliacao' WHERE versao_coletor = 'rota-teste'`);
    await Promise.all([dono, aba, api].map((p) => p.end()));
  });

  it('privilégio (CA-AP-1): o papel da aba lê só as colunas da lista e nada além', async () => {
    for (const sql of [
      `SELECT card_id, parent_card_id, subtask_id, data_apontamento, segundos, subgrupo_codigo, flags_qualidade, iniciativa_card_id, pessoa_ref, excluido_em FROM ${S.bm}.fato_apontamento LIMIT 1`,
      `SELECT card_id, raiz_card_id, raiz_fora_do_escopo FROM ${S.bm}.dim_card_raiz LIMIT 1`,
      `SELECT card_id, titulo, tipo, equipe FROM ${S.bm}.dim_card LIMIT 1`,
      `SELECT pessoa_ref, responsavel_nome FROM ${S.bm}.dim_responsavel LIMIT 1`,
      `SELECT codigo, rotulo, incluido_por_versao_id FROM ${S.bm}.ref_apontamento_subgrupo LIMIT 1`,
      `SELECT incluido_por_versao_id FROM ${S.bm}.ref_apontamento_termo LIMIT 1`,
      `SELECT incluido_por_versao_id FROM ${S.bm}.ref_apontamento_regra_tipo LIMIT 1`,
      `SELECT coleta_id, tarefa, status, iniciado_em, finalizado_em FROM ${S.bm}.ctl_coleta LIMIT 1`,
      `SELECT calendario_id, offset_minutos FROM ${S.core}.ref_calendario LIMIT 1`,
      `SELECT dominio, classe, calendario_id, vigente_ate FROM ${S.core}.ref_calendario_aplicacao LIMIT 1`,
      `SELECT calendario_id, data, incluido_por_versao_id FROM ${S.core}.ref_feriado LIMIT 1`,
      `SELECT versao_id, vigente_desde, dominio, descricao FROM ${S.core}.ref_versao_criterio LIMIT 1`,
      `SELECT versao_id, metrica_id FROM ${S.core}.ref_versao_criterio_metrica LIMIT 1`,
    ]) await expect(aba.query(sql), sql.slice(0, 60)).resolves.toBeDefined();

    const negados = [
      `SELECT responsavel_id FROM ${S.bm}.dim_responsavel`,
      `SELECT * FROM ${S.bm}.dim_responsavel`,
      `SELECT logged_time_id FROM ${S.bm}.fato_apontamento`,
      `SELECT registro_sha256 FROM ${S.bm}.fato_apontamento`,
      `SELECT category_id FROM ${S.bm}.fato_apontamento`,
      ...colunasDePessoa('dspd_bm.dim_card').map((c) => `SELECT ${c} FROM ${S.bm}.dim_card`),
      `SELECT count(*) FROM ${S.bm}.stg_apontamento`,
      `SELECT count(*) FROM ${S.bm}.evt_apontamento`,
      `SELECT count(*) FROM ${S.bm}.stg_card`,
      `SELECT count(*) FROM ${S.bm}.cfg_pessoa_eliminada`,
      `SELECT count(*) FROM ${S.bm}.ctl_coleta_falha`,
      `SELECT erro_resumo FROM ${S.bm}.ctl_coleta`,
      `SELECT count(*) FROM ${S.bm}.ref_time`,
      `SELECT count(*) FROM ${S.ac}.dim_chamado`,
      `SELECT count(*) FROM ${S.ac}.ctl_coleta`,
      `SELECT motivo FROM ${S.core}.ref_versao_criterio`,
    ];
    for (const sql of negados) expect((await falha(aba, sql)).code, sql).toBe('42501');
    for (const sql of [
      `INSERT INTO ${S.bm}.dim_responsavel (responsavel_id, responsavel_nome, atualizado_em) VALUES ('1', 'x', now())`,
      `UPDATE ${S.bm}.fato_apontamento SET segundos = 1`,
      `DELETE FROM ${S.bm}.fato_apontamento`,
      `UPDATE ${S.bm}.dim_responsavel SET responsavel_nome = 'x'`,
      `TRUNCATE ${S.bm}.fato_apontamento`,
    ]) expect((await falha(aba, sql)).code, sql).toBe('42501');
  });

  it('o dspd_api continua sem nenhuma tabela da aba nem pessoa_ref (K-085 inalterado)', async () => {
    for (const t of ['fato_apontamento', 'dim_card_raiz', 'dim_responsavel', 'stg_apontamento', 'evt_apontamento', 'cfg_pessoa_eliminada', 'ref_apontamento_subgrupo'])
      expect((await falha(api, `SELECT count(*) FROM ${S.bm}.${t}`)).code, t).toBe('42501');
    await provarSemPessoa(api, dono, 'dspd_bm.fato_apontamento', S.bm);
  });

  async function consultar(nomesReais: boolean, query: string) {
    const app = await buildApp({ db: api, S, agora: () => AGORA, nivelLog: 'silent', apontamento: { pool: aba, nomesReais } });
    try {
      return await app.inject({ method: 'GET', url: `/api/apontamento?${query}`, headers: { host: 'localhost:3000' } });
    } finally {
      await app.close();
    }
  }
  const JANELA = 'de=2031-01-01&ate=2031-02-28&diarioDe=2031-01-01&diarioAte=2031-01-31';

  it('rota ponta a ponta com o papel da aba: soma sem o excluído nem a data fora da janela, "Pessoa n", sem nome nem identificador no corpo', async () => {
    const r = await consultar(false, JANELA);
    expect(r.statusCode, r.body.slice(0, 300)).toBe(200);
    expect(r.headers['cache-control']).toBe('no-store');
    const c = respostaApontamentoSchema.parse(r.json());
    // 21 x 2 h (pessoa A) + 2 x 1 h (pessoa B, o terceiro está excluído) + 1 x 1,5 h (sem pessoa)
    expect(c.kpis).toMatchObject({ segundos: 21 * 7200 + 2 * 3600 + 5400, apontamentos: 24, pessoasAtivas: 2 });
    expect(c.nomesReais).toBe(false);
    expect(c.opcoes.pessoas.map((p) => p.rotulo).sort()).toEqual([`Pessoa ${refs.a}`, `Pessoa ${refs.b}`].sort());
    expect(c.opcoes.projetos).toEqual([{ id: RAIZ, rotulo: 'Projeto Raiz Teste 059', foraDoEscopo: false }, { id: 'sem-projeto', rotulo: 'Sem iniciativa', foraDoEscopo: true }].sort((x, y) => c.opcoes.projetos.findIndex((p) => p.id === x.id) - c.opcoes.projetos.findIndex((p) => p.id === y.id)));
    expect(c.opcoes.tipos.map((t) => t.id).sort()).toEqual(['12']); // type_id em digitos; linha sem tipo soma, mas nao e opcao de filtro
    expect(c.opcoes.subtarefas.map((s) => s.id).sort()).toEqual(['direto-no-card', 'em-subtarefa']);
    // pessoa A: 21 apontamentos = piso de 20 atingido; pessoa B: 2, só contagem
    expect(c.capacidade.porPessoa.find((p) => p.pessoaRef === `p${refs.a}`)!.utilizacao.status).toBe('ok');
    expect(c.capacidade.porPessoa.find((p) => p.pessoaRef === `p${refs.b}`)!.utilizacao.status).toBe('insuficiente');
    expect(c.frescor.ultimaColetaOk).not.toBeNull();
    // nada de nome, id de usuário, id de apontamento ou título de card fora do rótulo de projeto no corpo
    for (const proibido of [MARCADOR_NOME, 'Outra Pessoa', ids.a, ids.b, 'Card filho', 'Card solto', ...logged]) expect(r.body, proibido).not.toContain(proibido);
  });

  it('filtro por tipo ponta a ponta com o papel da aba: uma opcao por categoria (menor type_id) e o filtro por qualquer type_id cobre a categoria inteira (K-272)', async () => {
    const MAIO = 'de=2031-05-01&ate=2031-05-31&diarioDe=2031-05-01&diarioAte=2031-05-31';
    const ler = async (filtro: string) => {
      const r = await consultar(false, `${MAIO}${filtro}`);
      expect(r.statusCode, r.body.slice(0, 300)).toBe(200);
      return respostaApontamentoSchema.parse(r.json());
    };
    const MELHORIA = 3600 + 7200; // type_id 12 e 34 sao a mesma categoria
    const todos = await ler('');
    // 12 e 34 colapsam na opcao '12' (menor type_id); 56 e outra categoria
    expect(todos.opcoes.tipos.map((t) => t.id).sort()).toEqual(['12', '56']);
    expect(todos.kpis.segundos).toBe(MELHORIA + 900 + 1800);
    for (const id of todos.opcoes.tipos.map((t) => t.id)) expect(id).toMatch(/^\d+$/);
    expect((await ler('&tipo=12')).kpis).toMatchObject({ segundos: MELHORIA, apontamentos: 2 });
    expect((await ler('&tipo=34')).kpis).toMatchObject({ segundos: MELHORIA, apontamentos: 2 }); // qualquer type_id da categoria cobre todos
    expect((await ler('&tipo=12&tipo=34')).kpis.segundos).toBe(MELHORIA);
    expect((await ler('&tipo=56')).kpis).toMatchObject({ segundos: 900, apontamentos: 1 }); // o filtro separa categorias
    expect((await ler('&tipo=12&tipo=56')).kpis.segundos).toBe(MELHORIA + 900);
    expect((await ler('&tipo=999')).kpis.segundos).toBe(0);
  });

  it('filtro por equipe ponta a ponta com o papel da aba: o time do card, "Sem time", varios times como um conjunto, e o GRANT de dim_card.equipe sem coluna de pessoa (097 L2)', async () => {
    const MAIO = 'de=2031-05-01&ate=2031-05-31&diarioDe=2031-05-01&diarioAte=2031-05-31';
    const ler = async (filtro: string) => {
      const r = await consultar(false, `${MAIO}${filtro}`);
      expect(r.statusCode, r.body.slice(0, 300)).toBe(200);
      return respostaApontamentoSchema.parse(r.json());
    };
    const ALFA = 3600 + 7200; // FILHO, type_id 12 e 34
    const todos = await ler('');
    expect(todos.opcoes.equipes?.map((e) => e.id).sort()).toEqual(['sem-time', 'time-alfa-teste-097', 'time-beta-teste-097']);
    expect(todos.kpis.segundos).toBe(ALFA + 900 + 1800);
    expect((await ler('&equipe=time-alfa-teste-097')).kpis).toMatchObject({ segundos: ALFA, apontamentos: 2 });
    expect((await ler('&equipe=time-beta-teste-097')).kpis).toMatchObject({ segundos: 900, apontamentos: 1 });
    expect((await ler('&equipe=sem-time')).kpis).toMatchObject({ segundos: 1800, apontamentos: 1 });
    expect((await ler('&equipe=time-alfa-teste-097,time-beta-teste-097')).kpis.segundos).toBe(ALFA + 900);
    expect((await ler('&equipe=nao-existe')).kpis.segundos).toBe(0);
    expect((await ler('&equipe=time-beta-teste-097&tipo=56')).kpis.segundos).toBe(900);
    // o papel da aba le `equipe` de dim_card, mas nada de pessoa a mais
    await expect(aba.query(`SELECT equipe FROM ${S.bm}.dim_card LIMIT 1`)).resolves.toBeDefined();
    // colunas de pessoa de dim_card vêm de COLUNAS_PESSOA (K-282); card_pai não é de pessoa, é guarda de hierarquia fora do GRANT da aba
    await provarSemPessoa(aba, dono, 'dspd_bm.dim_card', S.bm);
    expect((await falha(aba, `SELECT card_pai FROM ${S.bm}.dim_card`)).code, 'card_pai').toBe('42501');
  });

  it('cards incompletos filtrados por equipe ponta a ponta: o time do card, "Sem time" e slug inexistente com resultado vazio (097 L2, A1)', async () => {
    const MAIO = 'de=2031-05-01&ate=2031-05-31&diarioDe=2031-05-01&diarioAte=2031-05-31';
    const cobertura = await novaColeta(dono, S.bm);
    const marcar = (estado: 'incompleto' | 'completo') =>
      dono.query(
        `INSERT INTO ${S.bm}.ctl_apontamento_cobertura (card_id, estado, coleta_id, detectado_em) SELECT c, $2::text, $3::bigint, now() FROM unnest($1::text[]) AS c`,
        [[FILHO, OUTRO, SOLTO], estado, cobertura]);
    const incompletos = async (filtro: string): Promise<string[]> => {
      const r = await consultar(false, `${MAIO}${filtro}`);
      expect(r.statusCode, r.body.slice(0, 300)).toBe(200);
      return (respostaApontamentoSchema.parse(r.json()).registroIncompleto?.cards ?? []).map((c) => c.cardId).sort();
    };
    await marcar('incompleto');
    try {
      expect(await incompletos('')).toEqual([FILHO, OUTRO, SOLTO].sort());
      expect(await incompletos('&equipe=time-alfa-teste-097')).toEqual([FILHO]); // Alfa
      expect(await incompletos('&equipe=time-beta-teste-097')).toEqual([OUTRO]); // Beta
      expect(await incompletos('&equipe=sem-time')).toEqual([SOLTO]); // sem time
      expect(await incompletos('&equipe=nao-existe')).toEqual([]); // slug inexistente: vazio, nunca "todos"
    } finally {
      await marcar('completo'); // append-only: o estado atual volta a completo para não vazar para os outros casos
    }
  });

  it('com o interruptor ligado o nome só aparece em opcoes.pessoas[].rotulo, uma vez', async () => {
    const r = await consultar(true, JANELA);
    expect(r.statusCode).toBe(200);
    const c = respostaApontamentoSchema.parse(r.json());
    expect(c.nomesReais).toBe(true);
    expect(c.opcoes.pessoas.find((p) => p.pessoaRef === `p${refs.a}`)).toEqual({ pessoaRef: `p${refs.a}`, rotulo: MARCADOR_NOME, identificada: true });
    expect(r.body.split(MARCADOR_NOME)).toHaveLength(2);
    expect(r.body).not.toContain(ids.a);
  });

  it('Outra area: quem nao foi responsavel por card do escopo nos ultimos 12 meses entra somado, sem nome nem chave, com o interruptor ligado ou nao', async () => {
    const MARCO = 'de=2031-03-01&ate=2031-03-31&diarioDe=2031-03-01&diarioAte=2031-03-31';
    for (const nomesReais of [false, true]) {
      const r = await consultar(nomesReais, MARCO);
      expect(r.statusCode, r.body.slice(0, 300)).toBe(200);
      const c = respostaApontamentoSchema.parse(r.json());
      expect(c.opcoes.pessoas.map((p) => p.pessoaRef).sort()).toEqual([`p${refs.a}`, 'outra-area'].sort());
      expect(c.opcoes.pessoas.find((p) => p.pessoaRef === 'outra-area')).toEqual({ pessoaRef: 'outra-area', rotulo: 'Outra área', identificada: true });
      expect(c.capacidade.porPessoa.map((p) => p.pessoaRef)).toEqual([`p${refs.a}`]); // Outra area fora dos blocos por pessoa
      expect(c.kpis).toMatchObject({ segundos: 3600 + 7200 + 1800 + 3600, apontamentos: 4, pessoasAtivas: 1 });
      for (const proibido of ['Pessoa C Ficticia', 'Pessoa D Ficticia', 'Pessoa E Ficticia', `p${refs.c}"`, `p${refs.d}"`, `p${refs.e}"`, ids.c, ids.d, ids.e])
        expect(r.body, proibido).not.toContain(proibido);
    }
  });

  it('a view do time entrega so pessoa_ref e a data de saida ao papel da aba; o responsaveis do card segue negado', async () => {
    const r = await aba.query<{ pessoa_ref: string; vigencia_ate: Date | null }>(`SELECT pessoa_ref, vigencia_ate FROM ${S.bm}.apt_pessoa_time`);
    const por = new Map(r.rows.map((l) => [l.pessoa_ref, l.vigencia_ate]));
    expect(por.get(refs.a)?.toISOString()).toBe('2030-12-01T00:00:00.000Z');
    expect(por.get(refs.b)).toBeNull(); // versao vigente: ainda e responsavel
    expect(por.get(refs.c)?.toISOString()).toBe('2029-06-01T00:00:00.000Z');
    expect(por.has(refs.d)).toBe(false);
    expect(por.has(refs.e)).toBe(false); // card fora do escopo nao conta
    await provarSemPessoa(aba, dono, 'dspd_bm.dim_card_versao', S.bm);
    await provarSemPessoa(api, dono, 'dspd_bm.apt_pessoa_time', S.bm);
  });

  it('limiares dos achados (T2.6): registrados com data como versao de criterio, uma vez so, e listados em criterios para a aba', async () => {
    // dentro de uma transacao desfeita: a referencia de versao de criterio e append-only e nao pode sobrar para os outros testes
    const c = await dono.connect();
    try {
      await c.query('BEGIN');
      expect(await registrarCriteriosApontamento(c, S, '2031-02-10', AGORA)).toEqual(['059:limiares-achados', '067:limite-dia-atipico', '089:sem-vinculo-so-sem-comentario']);
      expect(await registrarCriteriosApontamento(c, S, '2031-02-11', AGORA)).toEqual([]);
      const criterios = await lerCriterios(c, S);
      const achado = criterios.find((x) => x.data === '2031-02-10');
      expect(achado?.descricao).toContain('não classificado 20%');
      // pedido 089 (A): o id leva o prefixo da família, que o front usa para a marca; o critério de sem-vinculo é da família do dicionário
      expect(achado?.id).toMatch(/^achados-\d+$/);
      const semVinculo = criterios.find((x) => x.data === '2031-02-10' && x.descricao.includes('Execução técnica deixa de contar'));
      expect(semVinculo?.id).toMatch(/^dicionario-\d+$/);
      expect(achado?.descricao).toContain('variação de utilização 10 pontos');
      expect(criterios.find((x) => x.data === '2031-02-10' && x.descricao.includes('10 h'))?.descricao).toContain('antes: 16 h');
      expect(criterios.filter((x) => x.data === '2031-02-11')).toEqual([]);
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  });

  it('069/L7-a: com o calendário carregado, o feriado deixa de contar como dia útil na capacidade e a versão aparece em criterios', async () => {
    // A pessoa A apontou de 2031-01-06 a 2031-02-03; 2031-01-20 é segunda-feira. A carga e a leitura ficam numa transação desfeita do dono (a
    // referência é append-only e não pode sobrar para os outros testes); o papel `dspd_ref` tem o teste próprio em calendario-referencia.pg.test.ts.
    const c = await dono.connect();
    const consultarCom = async (): Promise<ReturnType<typeof respostaApontamentoSchema.parse>> => {
      const app = await buildApp({ db: api, S, agora: () => AGORA, nivelLog: 'silent', apontamento: { pool: c, nomesReais: false } });
      try {
        const r = await app.inject({ method: 'GET', url: `/api/apontamento?${JANELA}`, headers: { host: 'localhost:3000' } });
        expect(r.statusCode, r.body.slice(0, 300)).toBe(200);
        return respostaApontamentoSchema.parse(r.json());
      } finally {
        await app.close();
      }
    };
    const diasDaA = (r: ReturnType<typeof respostaApontamentoSchema.parse>): number => r.capacidade.porPessoa.find((p) => p.pessoaRef === `p${refs.a}`)!.diasUteis;
    try {
      await c.query('BEGIN');
      const antes = await consultarCom();
      const texto = JSON.stringify({
        versao: 1, regra: 'teste', versao_criterio: { descricao: 'Feriados do teste 069', motivo: 'Teste da rota' },
        calendarios: [{ nome: 'rota-bm', dominio: 'businessmap', offset_minutos: -180, feriados: [{ data: '2031-01-20', escopo: 'nacional', descricao: 'Feriado de teste' }] }],
        aplicacoes: [{ dominio: 'businessmap', classe: 'apontamento', calendario: 'rota-bm' }],
      });
      const pool = { query: (t: string, v?: unknown[]) => c.query(t, v), connect: () => Promise.resolve({ query: (t: string, v?: unknown[]) => (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(t) ? Promise.resolve({ rows: [], rowCount: 0 }) : c.query(t, v)), release: () => undefined }), end: () => Promise.resolve() };
      await sincronizarCalendario(pool, S, analisarCalendario(texto), '2031-02-10', AGORA);
      const depois = await consultarCom();
      expect(diasDaA(depois)).toBe(diasDaA(antes) - 1);
      expect(antes.criterios.some((x) => x.descricao === 'Feriados do teste 069')).toBe(false);
      expect(depois.criterios.find((x) => x.descricao === 'Feriados do teste 069')?.data).toBe('2031-02-10');
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  });

  it('filtro por pessoa e janela sem dados', async () => {
    const um = respostaApontamentoSchema.parse((await consultar(false, `${JANELA}&pessoa=p${refs.b}`)).json());
    expect(um.kpis).toMatchObject({ apontamentos: 2, pessoasAtivas: 1 });
    const vazio = respostaApontamentoSchema.parse((await consultar(false, 'de=2032-01-01&ate=2032-01-31&diarioDe=2032-01-01&diarioAte=2032-01-31')).json());
    expect(vazio.kpis).toMatchObject({ segundos: 0, apontamentos: 0, pessoasAtivas: 0 });
    expect(vazio.opcoes.pessoas).toEqual([]);
  });

  it('SQL malicioso na consulta não chega ao banco: 400 e a tabela segue lá', async () => {
    const r = await consultar(false, `pessoa=${encodeURIComponent("p1'; DROP TABLE x; --")}`);
    expect(r.statusCode).toBe(400);
    await expect(dono.query(`SELECT count(*) FROM ${S.bm}.fato_apontamento`)).resolves.toBeDefined();
  });
});

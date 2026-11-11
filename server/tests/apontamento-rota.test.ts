import { respostaApontamentoSchema } from '@metricas-dspd/contratos';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { montarEsquemas, S_PADRAO } from '../src/plataforma/db/esquemas.js';
import { nomeDoOrigin, nomesAceitos, origemPermitida } from '../src/modulos/apontamento/hosts.js';
import { abrirPoolApontamento } from '../src/modulos/apontamento/index.js';
import { serializadorDaAba } from '../src/modulos/apontamento/rotas.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Pedido 059 (K-193), trilha B4: rota única `GET /api/apontamento` contra banco falso (o SQL de verdade é provado em `apontamento-rota.pg.test.ts`).
// Casos do plano de testes: CA-AP-3 (log e erro), CA-AP-4 (interruptor), CA-AP-5 (nenhuma outra rota), CA-AP-6 (consulta estrita), CA-AP-7 (cabeçalhos),
// CA-AP-12 (piso de 20), CT-30 (a rota só repassa o que a biblioteca devolve) e CT-84 (Host e Origin, 421).

const MARCADOR_NOME = 'PESSOA-FICTICIA-MARCADOR-059';
const AGORA = new Date('2026-11-02T15:00:00Z'); // 2026-11-02 12:00 em America/Sao_Paulo
const HOJE = '2026-11-02';

type Linha = { data: string; segundos: number; subgrupo: string; flags: number; em_subtarefa: boolean; pessoa_ref: string | null; projeto_id: string | null; projeto_titulo: string | null; fora: boolean; tipo: string | null; type_id: string | null; equipe: string | null };
const linha = (o: Partial<Linha> = {}): Linha => ({
  data: '2026-10-20', segundos: 3600, subgrupo: 'desenvolvimento', flags: 0, em_subtarefa: false, pessoa_ref: '1', projeto_id: '900', projeto_titulo: 'Projeto Alfa', fora: false, tipo: 'Melhoria', type_id: '12', equipe: null, ...o,
});
/** 25 apontamentos da pessoa 1 (passa do piso de 20), 3 da pessoa 2 e 1 sem pessoa (eliminada a pedido), em subtarefa. */
const fixture = (): Linha[] => [
  ...Array.from({ length: 25 }, (_, i) => linha({ data: `2026-10-${String(1 + (i % 28)).padStart(2, '0')}`, segundos: 7200 })),
  ...Array.from({ length: 3 }, (_, i) => linha({ data: `2026-10-0${i + 1}`, pessoa_ref: '2', flags: 1, subgrupo: 'nao-classificado' })),
  linha({ data: '2026-10-05', pessoa_ref: null, em_subtarefa: true, segundos: 1800 }),
];

interface Opcoes {
  linhas?: Linha[]; falharEm?: string; nomes?: Record<string, string>; coletas?: { ultima?: boolean; ok?: boolean; ultimaFalhou?: boolean; ultimaParcial?: boolean };
  incompletos?: { card_id: string; titulo: string | null; projeto_id: string | null; projeto_titulo: string | null; fora: boolean }[];
  /** Pares do histórico inteiro (padrão: os das próprias linhas). */
  /** Nomes distintos de `dim_card.equipe` (padrão: os das próprias linhas). */
  nomesDeEquipe?: string[];
  historicoTipos?: { tipo: string | null; type_id: string | null }[];
  feriados?: string[]; semHistorico?: boolean; S?: typeof S_PADRAO; doTime?: string[];
}
function banco(op: Opcoes = {}) {
  const responder = (c: Chamada): Resposta => {
    const t = c.texto;
    if (op.falharEm !== undefined && t.includes(op.falharEm)) return new Error(`falha do banco com ${MARCADOR_NOME}`);
    if (t.includes('apt_pessoa_time')) return (op.doTime ?? ['1', '2', '3', '4']).map((pessoa_ref) => ({ pessoa_ref }));
    if (t.includes('ref_versao_criterio')) return [{ versao_id: '5', vigente_desde: '2026-11-01', descricao: 'Dicionário de subgrupo v1', familia: 'dicionario' }];
    if (t.includes('ctl_apontamento_cobertura')) return op.incompletos ?? [];
    if (t.includes('SELECT DISTINCT equipe FROM dspd_bm.dim_card')) return (op.nomesDeEquipe ?? [...new Set((op.linhas ?? fixture()).flatMap((l) => (l.equipe === null ? [] : [l.equipe])))]).map((equipe) => ({ equipe }));
    if (t.includes('fato_apontamento h')) return op.historicoTipos ?? (op.linhas ?? fixture()).map(({ tipo, type_id }) => ({ tipo, type_id }));
    if (t.includes('FROM dspd_bm.fato_apontamento f')) return op.linhas ?? fixture();
    if (t.includes('min(data_apontamento)')) return [op.semHistorico === true ? { inicio: null, fim: null } : { inicio: '2026-01-05', fim: '2026-10-30' }];
    if (t.includes('responsavel_nome')) return Object.entries(op.nomes ?? {}).map(([pessoa_ref, responsavel_nome]) => ({ pessoa_ref, responsavel_nome }));
    if (t.includes('FROM dspd_bm.ref_apontamento_subgrupo')) return [{ codigo: 'desenvolvimento', rotulo: 'Desenvolvimento' }];
    if (t.includes('ref_calendario_aplicacao')) return op.feriados === undefined ? [] : [{ calendario_id: '1', offset_minutos: -180 }];
    if (t.includes('FROM dspd_core.ref_feriado WHERE')) return (op.feriados ?? []).map((data) => ({ data }));
    if (t.includes('FROM dspd_bm.ctl_coleta')) {
      const dado = { coleta_id: '7', status: t.includes("status = 'sucesso'") ? 'sucesso' : op.coletas?.ultimaFalhou === true ? 'falha' : op.coletas?.ultimaParcial === true ? 'parcial' : 'sucesso', iniciado_em: new Date('2026-11-02T09:00:00Z'), finalizado_em: new Date('2026-11-02T09:10:00Z') };
      return (t.includes("status = 'sucesso'") ? op.coletas?.ok === false : op.coletas?.ultima === false) ? [] : [dado];
    }
    return [];
  };
  return criarDublePg(responder);
}

async function montar(op: Opcoes & { nomesReais?: boolean; redeLocal?: string } = {}) {
  const db = banco(op);
  const logs: string[] = [];
  const app = await buildApp({
    db: db.pool, agora: () => AGORA, nivelLog: 'info', destinoLog: { write: (m) => { logs.push(m); } },
    S: op.S, apontamento: { pool: db.pool, nomesReais: op.nomesReais ?? false, redeLocal: op.redeLocal },
  });
  return { app, db, logs };
}
const get = (app: Awaited<ReturnType<typeof montar>>['app'], url: string, headers: Record<string, string> = {}) =>
  app.inject({ method: 'GET', url, headers: { host: 'localhost:3000', ...headers } });

describe('GET /api/apontamento: resposta', () => {
  it('devolve o contrato, só BusinessMap, calculado pela biblioteca, com no-store e sem CORS (CA-AP-7, CT-30)', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/apontamento');
    expect(r.statusCode).toBe(200);
    expect(r.headers['cache-control']).toBe('no-store');
    expect(Object.keys(r.headers).filter((h) => h.startsWith('access-control-'))).toEqual([]);
    const corpo = respostaApontamentoSchema.parse(r.json());
    expect(corpo.dominio).toBe('businessmap');
    expect(corpo.nomesReais).toBe(false);
    // período padrão: 12 semanas terminando hoje (America/Sao_Paulo)
    expect(corpo.periodo).toEqual({ de: '2026-08-11', ate: HOJE });
    // a rota só repassa o que a biblioteca soma: 25 x 2 h + 3 x 1 h + 0,5 h sem pessoa (só no agregado do time)
    expect(corpo.kpis.segundos).toBe(25 * 7200 + 3 * 3600 + 1800);
    expect(corpo.kpis.apontamentos).toBe(29);
    expect(corpo.kpis.pessoasAtivas).toBe(2);
    expect(corpo.frescor).toEqual({ selo: 'atual', ultimaColetaOk: '2026-11-02T06:10:00-03:00', ultimaTentativa: { resultado: 'ok', fim: '2026-11-02T06:10:00-03:00' } });
    expect(corpo.criterios).toEqual([{ id: 'dicionario-5', data: '2026-11-01', descricao: 'Dicionário de subgrupo v1' }]); // prefixo da família: é por ele que o front desenha a marca (pedido 089, A)
    expect(corpo.opcoes.historico).toEqual({ inicio: '2026-01-05', fim: '2026-10-30' });
    expect(corpo.opcoes.subgrupos.map((s) => s.rotulo)).toEqual(['Desenvolvimento', 'Sem comentário']);
    await app.close();
  });
  it('sem coleta do worklog: selo "sem-coleta" e `ultimaColetaOk` nulo', async () => {
    const { app } = await montar({ coletas: { ultima: false, ok: false } });
    const corpo = respostaApontamentoSchema.parse((await get(app, '/api/apontamento')).json());
    expect(corpo.frescor).toEqual({ selo: 'sem-coleta', ultimaColetaOk: null, ultimaTentativa: null });
    await app.close();
  });
  it('pessoa com 19 e com 20 apontamentos: percentual só a partir de 20 (CA-AP-12, o3)', async () => {
    const { app } = await montar({ linhas: [...Array.from({ length: 19 }, (_, i) => linha({ data: `2026-10-${String(1 + i).padStart(2, '0')}`, pessoa_ref: '3' })), ...Array.from({ length: 20 }, (_, i) => linha({ data: `2026-10-${String(1 + i).padStart(2, '0')}`, pessoa_ref: '4' }))] });
    const corpo = respostaApontamentoSchema.parse((await get(app, '/api/apontamento')).json());
    const por = (ref: string) => corpo.capacidade.porPessoa.find((p) => p.pessoaRef === ref)!;
    expect(por('p3').utilizacao.status).toBe('insuficiente');
    expect(por('p4').utilizacao.status).toBe('ok');
    await app.close();
  });
  it('repassa período e filtros à consulta e à biblioteca (janela pedida, filtro por pessoa)', async () => {
    const { app, db } = await montar();
    const corpo = respostaApontamentoSchema.parse((await get(app, '/api/apontamento?de=2026-10-01&ate=2026-10-31&pessoa=p2&nivelMatriz=subgrupo')).json());
    expect(corpo.periodo).toEqual({ de: '2026-10-01', ate: '2026-10-31' });
    expect(corpo.kpis.pessoasAtivas).toBe(1);
    expect(corpo.kpis.apontamentos).toBe(3);
    expect(corpo.matriz.nivel).toBe('subgrupo');
    const lidas = db.chamadas.find((c) => c.texto.includes('FROM dspd_bm.fato_apontamento f') && !c.texto.includes('ctl_apontamento_cobertura'))!;
    expect(lidas.valores).toEqual(['2026-10-01', '2026-10-31']); // parâmetros, nunca concatenados
    expect(lidas.texto).not.toContain('2026-10-01');
    await app.close();
  });
  it('quem não é do time entra somado em "Outra área" (`outra-area`), sem nome nem chave; pessoa sem de-para segue sem pessoa', async () => {
    const { app, db } = await montar({
      doTime: ['1'],
      linhas: [...fixture(), linha({ data: '2026-10-06', pessoa_ref: '9', segundos: 3600 }), linha({ data: '2026-10-07', pessoa_ref: '10', segundos: 1800 })],
    });
    const r = await get(app, '/api/apontamento');
    const corpo = respostaApontamentoSchema.parse(r.json());
    expect(corpo.opcoes.pessoas).toEqual([
      { pessoaRef: 'p1', rotulo: 'Pessoa 1', identificada: true },
      { pessoaRef: 'outra-area', rotulo: 'Outra área', identificada: true },
    ]);
    // as pessoas 2, 9 e 10 viram uma só entrada; a chave delas nunca aparece
    expect(corpo.kpis.pessoasAtivas).toBe(1); // so o time (decisao de 09:20): Outra area nao e pessoa
    expect(corpo.capacidade.porPessoa.map((p) => p.pessoaRef)).toEqual(['p1']); // Outra area fora dos blocos por pessoa
    expect(corpo.kpis.segundos).toBeGreaterThan(0);
    for (const chave of ['p2', 'p9', 'p10']) expect(r.body).not.toContain(`"${chave}"`);
    const corte = db.chamadas.find((c) => c.texto.includes('apt_pessoa_time'))!;
    expect(corte.valores).toEqual(['2025-11-02T15:00:00.000Z']); // 12 meses antes de agora, por parâmetro
    await app.close();
  });
  it('"Outra área" vale também com o interruptor de nome ligado: sem nome, e o nome só é buscado para o time', async () => {
    const { app, db } = await montar({ nomesReais: true, doTime: ['1'], nomes: { '1': 'Ana Fictícia', '2': MARCADOR_NOME } });
    const r = await get(app, '/api/apontamento');
    expect(r.body).not.toContain(MARCADOR_NOME);
    const corpo = respostaApontamentoSchema.parse(r.json());
    expect(corpo.opcoes.pessoas.map((p) => [p.pessoaRef, p.rotulo])).toEqual([['p1', 'Ana Fictícia'], ['outra-area', 'Outra área']]);
    const consultaNomes = db.chamadas.find((c) => c.texto.includes('responsavel_nome'))!;
    expect(consultaNomes.valores).toEqual([['1']]);
    await app.close();
  });
  it('todos do time: nenhuma entrada "Outra área"', async () => {
    const { app } = await montar();
    const corpo = respostaApontamentoSchema.parse((await get(app, '/api/apontamento')).json());
    expect(corpo.opcoes.pessoas.map((p) => p.pessoaRef)).toEqual(['p1', 'p2']);
    await app.close();
  });
  it('o filtro por tipo recebe type_id em dígitos, o mesmo id de opcoes.tipos, e recorta o cálculo (E2.28)', async () => {
    const { app } = await montar({ linhas: [
      linha({ type_id: '12', tipo: 'Melhoria', segundos: 3600 }),
      linha({ type_id: '12', tipo: 'Melhoria', segundos: 3600, data: '2026-10-21' }),
      linha({ type_id: '34', tipo: 'Incidente', segundos: 7200, data: '2026-10-22' }),
      linha({ type_id: null, tipo: 'Melhoria', segundos: 1800, data: '2026-10-23' }),
    ] });
    const base = '/api/apontamento?de=2026-10-01&ate=2026-10-31';
    const todos = respostaApontamentoSchema.parse((await get(app, base)).json());
    expect(todos.opcoes.tipos.map((t) => [t.id, t.rotulo])).toEqual([['34', 'Incidente'], ['12', 'Melhoria']]);
    expect(todos.kpis.segundos).toBe(3600 + 3600 + 7200 + 1800);
    const idDaOpcao = todos.opcoes.tipos.find((t) => t.rotulo === 'Melhoria')!.id;
    const r = await get(app, `${base}&tipo=${idDaOpcao}`);
    expect(r.statusCode).toBe(200);
    const so12 = respostaApontamentoSchema.parse(r.json());
    expect(so12.kpis.segundos).toBe(7200);
    expect(so12.kpis.apontamentos).toBe(2);
    const dois = respostaApontamentoSchema.parse((await get(app, `${base}&tipo=12&tipo=34`)).json());
    expect(dois.kpis.segundos).toBe(14_400);
    const nenhum = respostaApontamentoSchema.parse((await get(app, `${base}&tipo=99`)).json());
    expect(nenhum.kpis.segundos).toBe(0);
    await app.close();
  });
  it('K-272: dois type_id da mesma categoria viram uma linha no AP-TIPO e uma opção; filtrar por qualquer um cobre os dois e o banco recebe os dois', async () => {
    const { app, db } = await montar({ linhas: [
      linha({ type_id: '12', tipo: 'Trabalho de produto', segundos: 3600 }),
      linha({ type_id: '9', tipo: 'Trabalho de produto', segundos: 7200, data: '2026-10-21' }),
      linha({ type_id: '34', tipo: 'Incidente', segundos: 1800, data: '2026-10-22' }),
      linha({ type_id: '77', tipo: null, segundos: 900, data: '2026-10-23' }),
    ] });
    const base = '/api/apontamento?de=2026-10-01&ate=2026-10-31';
    const todos = respostaApontamentoSchema.parse((await get(app, base)).json());
    expect(todos.opcoes.tipos.map((t) => [t.id, t.rotulo])).toEqual([['34', 'Incidente'], ['9', 'Trabalho de produto']]);
    const produto = todos.distribuicao.porTipo.filter((l) => l.rotulo === 'Trabalho de produto');
    expect(produto).toHaveLength(1);
    expect(produto[0]!.segundos).toBe(3600 + 7200);
    expect(produto[0]!.apontamentos).toBe(2);
    for (const v of ['9', '12']) {
      const r = respostaApontamentoSchema.parse((await get(app, `${base}&tipo=${v}`)).json());
      expect(r.kpis.segundos, v).toBe(10_800);
      expect(r.kpis.apontamentos, v).toBe(2);
    }
    await get(app, `${base}&tipo=12`);
    const c = db.chamadas.filter((x) => x.texto.includes('ctl_apontamento_cobertura')).at(-1)!;
    expect(c.valores[3]).toEqual(['9', '12']);
    await app.close();
  });
  it('K-272 (A1): o id da categoria vem do histórico; link com o menor type_id numa janela sem ele não zera a categoria', async () => {
    const { app, db } = await montar({
      linhas: [linha({ type_id: '12', tipo: 'Trabalho de produto', segundos: 3600 }), linha({ type_id: '34', tipo: 'Incidente', segundos: 1800, data: '2026-10-22' })],
      historicoTipos: [{ tipo: 'Trabalho de produto', type_id: '9' }, { tipo: 'Trabalho de produto', type_id: '12' }, { tipo: 'Incidente', type_id: '34' }],
    });
    const base = '/api/apontamento?de=2026-10-01&ate=2026-10-31';
    const todos = respostaApontamentoSchema.parse((await get(app, base)).json());
    expect(todos.opcoes.tipos.map((t) => [t.id, t.rotulo])).toEqual([['34', 'Incidente'], ['9', 'Trabalho de produto']]);
    const r = respostaApontamentoSchema.parse((await get(app, `${base}&tipo=9`)).json());
    expect(r.kpis.segundos).toBe(3600);
    expect(r.kpis.apontamentos).toBe(1);
    await get(app, `${base}&tipo=9`);
    expect(db.chamadas.filter((x) => x.texto.includes('ctl_apontamento_cobertura')).at(-1)!.valores[3]).toEqual(['9', '12']);
    const hist = db.chamadas.find((x) => x.texto.includes('fato_apontamento h'))!;
    expect(hist.texto).not.toContain('data_apontamento');
    await app.close();
  });
  it('K-272 (A2): a linha "Sem tipo" fica à parte em porTipo, sem opção', async () => {
    const { app } = await montar({ linhas: [
      linha({ type_id: '12', tipo: 'Melhoria', segundos: 3600 }),
      linha({ type_id: null, tipo: null, segundos: 900, data: '2026-10-23' }),
    ] });
    const r = respostaApontamentoSchema.parse((await get(app, '/api/apontamento?de=2026-10-01&ate=2026-10-31')).json());
    const sem = r.distribuicao.porTipo.filter((l) => l.rotulo === 'Sem tipo');
    expect(sem).toHaveLength(1);
    expect(sem[0]!.segundos).toBe(900);
    expect(r.opcoes.tipos.map((t) => t.rotulo)).toEqual(['Melhoria']);
    await app.close();
  });
  it('type_id fora de dígitos no filtro: 400 do contrato, sem consulta ao banco', async () => {
    const { app, db } = await montar();
    for (const v of ['melhoria', '1%3B2', '12a']) {
      const r = await get(app, `/api/apontamento?tipo=${v}`);
      expect(r.statusCode, v).toBe(400);
      expect(r.headers['cache-control']).toBe('no-store');
    }
    expect(db.chamadas).toHaveLength(0);
    await app.close();
  });
  it('a consulta lê type_id do fato (coluna concedida ao papel da aba) e o valor do filtro não entra no SQL', async () => {
    const { app, db } = await montar();
    await get(app, '/api/apontamento?tipo=12');
    const c = db.chamadas.find((x) => x.texto.includes('FROM dspd_bm.fato_apontamento f') && !x.texto.includes('ctl_apontamento_cobertura'))!;
    expect(c.texto).toContain('f.type_id');
    expect(c.texto).not.toContain('12');
    await app.close();
  });
  it('nomes desligados: só rótulos fixos de pessoa (Pessoa n e Outra área), nunca o nome', async () => {
    const { app } = await montar({
      doTime: ['1', '2'],
      linhas: [linha({ pessoa_ref: '1' }), linha({ pessoa_ref: '2' }), linha({ pessoa_ref: '9' }), linha({ pessoa_ref: null })],
      nomes: { '1': MARCADOR_NOME, '2': MARCADOR_NOME },
    });
    const r = await get(app, '/api/apontamento?de=2026-10-01&ate=2026-10-31');
    const corpo = respostaApontamentoSchema.parse(r.json());
    expect(corpo.nomesReais).toBe(false);
    expect(corpo.opcoes.pessoas.map((p) => p.rotulo).sort()).toEqual(['Outra área', 'Pessoa 1', 'Pessoa 2']);
    expect(r.body).not.toContain(MARCADOR_NOME);
    await app.close();
  });
  it('sem `apontamento` nas dependências a rota não existe', async () => {
    const db = banco();
    const app = await buildApp({ db: db.pool, agora: () => AGORA, nivelLog: 'silent' });
    expect((await get(app, '/api/apontamento')).statusCode).toBe(404);
    await app.close();
  });
});

describe('interruptor APONTAMENTO_NOMES (CA-AP-4, CA-AP-3)', () => {
  it('desligado (padrão): "Pessoa n", e o banco nem recebe consulta ao nome nem ao identificador', async () => {
    const { app, db } = await montar({ nomes: { '1': MARCADOR_NOME } });
    const r = await get(app, '/api/apontamento');
    expect(r.body).not.toContain(MARCADOR_NOME);
    const corpo = respostaApontamentoSchema.parse(r.json());
    expect(corpo.opcoes.pessoas.map((p) => p.rotulo)).toEqual(['Pessoa 1', 'Pessoa 2']);
    const sql = db.chamadas.map((c) => c.texto).join('\n');
    expect(sql).not.toMatch(/responsavel_nome|responsavel_id|logged_time_id|stg_|evt_|SELECT\s+\*/i);
    await app.close();
  });
  it('ligado: o nome só aparece em `opcoes.pessoas[].rotulo`; pessoa sem nome vira "Pessoa não identificada"', async () => {
    const { app, logs } = await montar({ nomesReais: true, nomes: { '1': MARCADOR_NOME } });
    const r = await get(app, '/api/apontamento');
    const corpo = respostaApontamentoSchema.parse(r.json());
    expect(corpo.nomesReais).toBe(true);
    expect(corpo.opcoes.pessoas).toEqual([
      { pessoaRef: 'p2', rotulo: 'Pessoa não identificada', identificada: false },
      { pessoaRef: 'p1', rotulo: MARCADOR_NOME, identificada: true },
    ].sort((a, b) => corpo.opcoes.pessoas.findIndex((p) => p.pessoaRef === a.pessoaRef) - corpo.opcoes.pessoas.findIndex((p) => p.pessoaRef === b.pessoaRef)));
    expect(r.body.split(MARCADOR_NOME)).toHaveLength(2); // exatamente uma ocorrência
    expect(logs.join('')).not.toContain(MARCADOR_NOME);
    await app.close();
  });
});

describe('consulta estrita (CA-AP-6)', () => {
  const casos: [string, string][] = [
    ['parâmetro desconhecido', '/api/apontamento?extra=1'],
    ['nome no lugar de pessoaRef', '/api/apontamento?pessoa=Maria'],
    ['pessoaRef zero', '/api/apontamento?pessoa=p0'],
    ['pessoaRef repetido', '/api/apontamento?pessoa=p1,p1'],
    ['só um limite do período', '/api/apontamento?de=2026-10-01'],
    ['fim antes do início', '/api/apontamento?de=2026-10-31&ate=2026-10-01'],
    ['janela acima de 366 dias', '/api/apontamento?de=2025-01-01&ate=2026-10-01'],
    ['data impossível', '/api/apontamento?de=2026-02-30&ate=2026-03-30'],
    ['mapa diário acima de 62 dias', '/api/apontamento?diarioDe=2026-08-01&diarioAte=2026-10-30'],
    ['injeção', `/api/apontamento?subgrupo=${encodeURIComponent("'; DROP TABLE x;--")}`],
    ['valor de 10 000 caracteres', `/api/apontamento?subgrupo=${'a'.repeat(10_000)}`],
    ['lista com 201 itens', `/api/apontamento?pessoa=${Array.from({ length: 201 }, (_, i) => `p${i + 1}`).join(',')}`],
    ['qualidade fora da lista', '/api/apontamento?qualidade=semaforo'],
    ['nível da matriz fora da lista', '/api/apontamento?nivelMatriz=pessoa'],
  ];
  for (const [nome, url] of casos) {
    it(`400 só com caminho e código, sem consulta ao banco e sem eco: ${nome}`, async () => {
      const { app, db, logs } = await montar();
      const r = await get(app, url);
      expect(r.statusCode).toBe(400);
      expect(r.headers['cache-control']).toBe('no-store');
      expect(db.chamadas).toHaveLength(0);
      const erro = r.json().error as { code: string; message: string; details: Record<string, unknown>[] };
      expect(erro.code).toBe('VALIDATION_ERROR');
      expect(erro.details.length).toBeGreaterThan(0);
      for (const d of erro.details) expect(Object.keys(d).sort()).toEqual(['code', 'path']);
      const valor = decodeURIComponent(url.split('=').slice(1).join('='));
      if (valor.length > 4) { expect(r.body).not.toContain(valor.slice(0, 12)); expect(logs.join('')).not.toContain(valor.slice(0, 12)); }
      await app.close();
    });
  }
  it('limites exatos aceitos: 200 pessoas, janela de 366 dias, mapa de 62 dias', async () => {
    const { app } = await montar({ linhas: [] });
    const pessoas = Array.from({ length: 200 }, (_, i) => `p${i + 1}`).join(',');
    expect((await get(app, `/api/apontamento?pessoa=${pessoas}`)).statusCode).toBe(200);
    expect((await get(app, '/api/apontamento?de=2025-10-02&ate=2026-10-02')).statusCode).toBe(200);
    expect((await get(app, '/api/apontamento?diarioDe=2026-08-01&diarioAte=2026-10-01')).statusCode).toBe(200);
    await app.close();
  });
});

describe('Host e Origin (R4-5, CT-84)', () => {
  for (const nomesReais of [false, true]) {
    describe(`com o interruptor ${nomesReais ? 'ligado' : 'desligado'}`, () => {
      const recusados: [string, Record<string, string>][] = [
        ['Host de atacante', { host: 'atacante.exemplo' }],
        ['sufixo do nome local', { host: 'localhost.exemplo.invalido' }],
        ['prefixo do nome local', { host: 'xlocalhost' }],
        ['endereço público', { host: '8.8.8.8:3000' }],
        ['IPv4 privado não declarado', { host: '192.168.1.20:3000' }],
        ['Host com forma inválida', { host: 'localhost:3000:evil' }],
        ['Origin de atacante com Host local', { origin: 'http://atacante.exemplo' }],
        ['Origin com sufixo', { origin: 'http://localhost.exemplo.invalido' }],
        ['Origin "null"', { origin: 'null' }],
        ['Origin com outro esquema', { origin: 'file://localhost' }],
      ];
      for (const [nome, cab] of recusados) {
        it(`421 sem corpo e sem eco: ${nome}`, async () => {
          const { app, db, logs } = await montar({ nomesReais });
          const r = await app.inject({ method: 'GET', url: '/api/apontamento', headers: { host: 'localhost:3000', ...cab } });
          expect(r.statusCode).toBe(421);
          expect(r.body).toBe('');
          expect(r.headers['cache-control']).toBe('no-store');
          expect(db.chamadas).toHaveLength(0);
          const enviado = cab.host ?? cab.origin!;
          expect(logs.join('')).not.toContain(enviado);
          await app.close();
        });
      }
    });
  }
  it('aceita localhost, 127.0.0.1 e ::1, com porta, em maiúsculas e sem Origin; Origin local aceito', async () => {
    const { app } = await montar({ linhas: [] });
    for (const host of ['localhost', 'LOCALHOST:3000', '127.0.0.1:13000', '[::1]:3000'])
      expect((await app.inject({ method: 'GET', url: '/api/apontamento', headers: { host } })).statusCode, host).toBe(200);
    for (const origin of ['http://localhost:5173', 'https://127.0.0.1', 'http://[::1]:8080'])
      expect((await get(app, '/api/apontamento', { origin })).statusCode, origin).toBe(200);
    await app.close();
  });
  it('o endereço de APONTAMENTO_REDE_LOCAL só vale quando declarado', async () => {
    const com = await montar({ linhas: [], redeLocal: '192.168.1.20' });
    expect((await get(com.app, '/api/apontamento', { host: '192.168.1.20:3000', origin: 'http://192.168.1.20:3000' })).statusCode).toBe(200);
    expect((await get(com.app, '/api/apontamento', { host: '192.168.1.21' })).statusCode).toBe(421);
    await com.app.close();
  });
});

describe('falha do banco (CA-AP-3)', () => {
  it('500 genérico, no-store, e nem a mensagem do driver nem o marcador vão à resposta ou ao log', async () => {
    const { app, logs } = await montar({ falharEm: 'ref_apontamento_subgrupo' });
    const r = await get(app, '/api/apontamento');
    expect(r.statusCode).toBe(500);
    expect(r.headers['cache-control']).toBe('no-store');
    expect(r.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } });
    expect(r.body).not.toContain(MARCADOR_NOME);
    expect(logs.join('')).not.toContain(MARCADOR_NOME);
    expect(logs.join('')).toContain('falha na consulta da aba Apontamento');
    await app.close();
  });
});

describe('moldura da resposta: calendário, dimensões, frescor e janelas', () => {
  it('feriado da referência sai da capacidade (dias úteis do intervalo da pessoa, calculado pela biblioteca)', async () => {
    const dias = ['2026-10-09', '2026-10-13']; // sexta e terça; segunda 12/10 é feriado
    const com = await montar({ feriados: ['2026-10-12'], linhas: dias.map((data) => linha({ data })) });
    const sem = await montar({ linhas: dias.map((data) => linha({ data })) });
    const dias_ = async (m: typeof com) => respostaApontamentoSchema.parse((await get(m.app, '/api/apontamento?de=2026-10-01&ate=2026-10-31')).json()).capacidade.porPessoa[0]!.diasUteis;
    expect(await dias_(com)).toBe(2);
    expect(await dias_(sem)).toBe(3);
    await com.app.close();
    await sem.app.close();
  });
  it('sem apontamento algum, o histórico cai no período pedido', async () => {
    const { app } = await montar({ semHistorico: true, linhas: [] });
    const c = respostaApontamentoSchema.parse((await get(app, '/api/apontamento?de=2026-10-01&ate=2026-10-31')).json());
    expect(c.opcoes.historico).toEqual({ inicio: '2026-10-01', fim: '2026-10-31' });
    await app.close();
  });
  it('rótulos: tipo fora da lista, card sem título, card sem iniciativa, subgrupo residual e desconhecido; sem-iniciativa pela máscara', async () => {
    const { app } = await montar({
      linhas: [
        linha({ tipo: 'Tipo Novo', projeto_titulo: null, subgrupo: 'execucao-tecnica', flags: 8 }),
        linha({ tipo: null, type_id: null, projeto_id: null, projeto_titulo: null, fora: true, subgrupo: 'codigo-sem-rotulo' }),
        linha({ tipo: null, type_id: '56', projeto_titulo: null, subgrupo: 'execucao-tecnica', flags: 8, data: '2026-10-21' }),
      ],
    });
    const c = respostaApontamentoSchema.parse((await get(app, '/api/apontamento?de=2026-10-01&ate=2026-10-31')).json());
    expect(c.opcoes.tipos.map((t) => [t.id, t.rotulo]).sort()).toEqual([['12', 'Tipo Novo']]); // K-272: "Sem tipo" (categoria nula) soma, mas não é opção
    expect(c.opcoes.projetos.map((p) => p.rotulo).sort()).toEqual(['Card 900', 'Sem iniciativa']);
    expect(c.opcoes.subgrupos.map((g) => g.rotulo).sort()).toEqual(['Execução técnica', 'codigo-sem-rotulo']);
    expect(c.qualidade.geral.porFlag.find((f) => f.flag === 'sem-iniciativa')!.apontamentos).toBe(3);
    await app.close();
  });
  it('com o nome real ligado e nenhum apontamento, nenhuma consulta de nome é feita', async () => {
    const { app, db } = await montar({ nomesReais: true, linhas: [] });
    expect((await get(app, '/api/apontamento')).statusCode).toBe(200);
    expect(db.chamadas.some((c) => c.texto.includes('responsavel_nome'))).toBe(false);
    await app.close();
  });

  it('última coleta parcial sem sucesso anterior: selo segue "sem-coleta" e ultimaTentativa diz "parcial" (069 M1-a)', async () => {
    const { app } = await montar({ coletas: { ultimaParcial: true, ok: false } });
    const c = respostaApontamentoSchema.parse((await get(app, '/api/apontamento')).json());
    expect(c.frescor.selo).toBe('sem-coleta');
    expect(c.frescor.ultimaColetaOk).toBeNull();
    expect(c.frescor.ultimaTentativa).toEqual({ resultado: 'parcial', fim: '2026-11-02T06:10:00-03:00' });
    await app.close();
  });

  it('coleta ok depois de uma parcial: ultimaTentativa diz "ok" e o selo vem da coleta ok (069 M1-a)', async () => {
    const { app } = await montar({ coletas: { ultimaParcial: false } });
    const c = respostaApontamentoSchema.parse((await get(app, '/api/apontamento')).json());
    expect(c.frescor.ultimaTentativa).toEqual({ resultado: 'ok', fim: '2026-11-02T06:10:00-03:00' });
    expect(c.frescor.ultimaColetaOk).not.toBeNull();
    expect(c.frescor.selo).not.toBe('sem-coleta');
    expect(c.frescor.selo).not.toBe('falha');
    await app.close();
  });

  it('última tentativa com falha: selo "falha", mantida a última coleta ok', async () => {
    const { app } = await montar({ coletas: { ultimaFalhou: true } });
    const c = respostaApontamentoSchema.parse((await get(app, '/api/apontamento')).json());
    expect(c.frescor.selo).toBe('falha');
    expect(c.frescor.ultimaColetaOk).not.toBeNull();
    await app.close();
  });
  it('janela do mapa diário pedida e esquemas explícitos (prefixo de teste)', async () => {
    const { app, db } = await montar({ S: montarEsquemas('t_') });
    const r = await get(app, '/api/apontamento?de=2026-10-01&ate=2026-10-31&diarioDe=2026-10-05&diarioAte=2026-10-11');
    expect(r.statusCode).toBe(200);
    expect(respostaApontamentoSchema.parse(r.json()).diario).toMatchObject({ de: '2026-10-05', ate: '2026-10-11' });
    expect(db.chamadas.length).toBeGreaterThan(0);
    expect(db.chamadas.every((c) => !c.texto.includes('FROM dspd_'))).toBe(true);
    await app.close();
  });
});

describe('módulo: peças puras e pool', () => {
  it('Host e Origin: ausente, de tipo estranho ou malformado nunca passa', () => {
    const aceitos = nomesAceitos();
    expect(origemPermitida(undefined, undefined, aceitos)).toBe(false);
    expect(origemPermitida('localhost', ['http://localhost'], aceitos)).toBe(false);
    expect(origemPermitida('localhost', undefined, aceitos)).toBe(true);
    expect(nomeDoOrigin('não é url')).toBeNull();
  });
  it('registro de requisição só com método e caminho', () => {
    expect(serializadorDaAba.req({ method: 'GET', url: '/api/apontamento?pessoa=Maria' })).toBe('GET /api/apontamento');
    expect(serializadorDaAba.req({})).toBe('? ');
  });
  it('o pool do papel dedicado abre sem conectar e fecha', async () => {
    const pool = abrirPoolApontamento('postgres://dspd_api_apontamento:x@127.0.0.1:1/metricas', () => undefined);
    await pool.end();
  });
});

describe('nenhuma outra rota expõe pessoa (CA-AP-5)', () => {
  it('o OpenAPI fora de /api/apontamento não cita pessoaRef, nome, responsavel_id nem user_id', async () => {
    const { app } = await montar();
    await app.ready();
    const doc = app.swagger() as { paths: Record<string, unknown> };
    const caminhos = Object.keys(doc.paths);
    expect(caminhos.length).toBeGreaterThanOrEqual(10); // guarda de suíte vazia
    expect(caminhos).toContain('/api/apontamento');
    for (const c of caminhos.filter((x) => x !== '/api/apontamento'))
      expect(JSON.stringify(doc.paths[c]), c).not.toMatch(/pessoaRef|responsavel|user_?id|realname/i);
    await app.close();
  });
  it('a consulta da aba usa só colunas e tabelas do papel dedicado (esquema do BusinessMap e referência)', async () => {
    const { app, db } = await montar();
    await get(app, '/api/apontamento');
    const sql = db.chamadas.map((c) => c.texto).join('\n');
    expect(sql).not.toContain(S_PADRAO.ac);
    expect(sql).not.toMatch(/\bFROM dspd_bm\.(stg_|evt_|cfg_)/);
    await app.close();
  });
});

describe('registroIncompleto: sinal de card com horas incompletas (063, K-200)', () => {
  const card = (id: string, o: Partial<NonNullable<Opcoes['incompletos']>[number]> = {}) => ({ card_id: id, titulo: `Card ${id} titulo`, projeto_id: '900', projeto_titulo: 'Projeto Alfa', fora: false, ...o });
  const ler = async (op: Opcoes, url = '/api/apontamento') => {
    const { app, db } = await montar(op);
    const r = await get(app, url);
    expect(r.statusCode).toBe(200);
    const corpo = respostaApontamentoSchema.parse(r.json());
    await app.close();
    return { corpo, db, bruto: r.body };
  };
  it('sem card incompleto: total 0, listas vazias, campo presente (a ausencia nunca vira garantia)', async () => {
    const { corpo } = await ler({});
    expect(corpo.registroIncompleto).toEqual({ total: 0, cards: [], projetoIds: [] });
  });
  it('lista cards com id, titulo e projeto, os ids de projeto sem repeticao, e total = quantidade de cards', async () => {
    const { corpo } = await ler({ incompletos: [card('9100000001'), card('9100000002'), card('9100000003', { projeto_id: null, projeto_titulo: null, fora: true })] });
    expect(corpo.registroIncompleto).toEqual({
      total: 3,
      cards: [
        { cardId: '9100000001', titulo: 'Card 9100000001 titulo', projeto: { id: '900', rotulo: 'Projeto Alfa', foraDoEscopo: false } },
        { cardId: '9100000002', titulo: 'Card 9100000002 titulo', projeto: { id: '900', rotulo: 'Projeto Alfa', foraDoEscopo: false } },
        { cardId: '9100000003', titulo: 'Card 9100000003 titulo', projeto: { id: 'sem-projeto', rotulo: 'Sem iniciativa', foraDoEscopo: true } },
      ],
      projetoIds: ['900', 'sem-projeto'],
    });
  });
  it('card sem titulo e projeto sem titulo ganham rotulo neutro; titulo acima de 200 caracteres e cortado (nunca 500)', async () => {
    const { corpo } = await ler({ incompletos: [card('9100000001', { titulo: null, projeto_titulo: null }), card('9100000002', { titulo: 'x'.repeat(500) })] });
    expect(corpo.registroIncompleto!.cards[0]).toMatchObject({ titulo: 'Card 9100000001', projeto: { rotulo: 'Card 900' } });
    expect(corpo.registroIncompleto!.cards[1]!.titulo).toHaveLength(200);
  });
  it('o recorte e o periodo e os filtros de projeto e tipo, por parametro; o filtro de pessoa nao entra e nenhuma pessoa, hora ou contagem de registros sai', async () => {
    const { db, bruto } = await ler({ incompletos: [card('9100000001')] }, '/api/apontamento?de=2026-10-01&ate=2026-10-31&projeto=900&tipo=12&pessoa=p1');
    const c = db.chamadas.find((x) => x.texto.includes('ctl_apontamento_cobertura'))!;
    expect(c.valores).toEqual(['2026-10-01', '2026-10-31', ['900'], ['12'], null, false]);
    expect(c.texto).not.toMatch(/pessoa|segundos|user_id|responsavel|comentario/i);
    const sinal = JSON.stringify((JSON.parse(bruto) as { registroIncompleto: unknown }).registroIncompleto);
    expect(sinal).not.toMatch(/pessoa|segundos|horas|registros|p1/i);
  });
  it('sem filtros de projeto e tipo, a consulta recebe null (sem filtro)', async () => {
    const { db } = await ler({});
    expect(db.chamadas.find((x) => x.texto.includes('ctl_apontamento_cobertura'))!.valores.slice(2)).toEqual([null, null, null, false]);
  });
  it('097 L2: o filtro equipe chega por parametro (nomes de dim_card.equipe e a marca sem-time) e nunca vira SQL', async () => {
    const { db } = await ler({ incompletos: [card('9100000001')], nomesDeEquipe: ['Time Alfa', 'Time Beta'] }, '/api/apontamento?de=2026-10-01&ate=2026-10-31&equipe=time-alfa,sem-time,inexistente');
    const c = db.chamadas.find((x) => x.texto.includes('ctl_apontamento_cobertura'))!;
    expect(c.valores).toEqual(['2026-10-01', '2026-10-31', null, null, ['Time Alfa'], true]);
    expect(c.texto).not.toMatch(/time-alfa|inexistente/);
    expect(c.texto).toMatch(/COALESCE\(ec\.equipe, ep\.equipe\)/);
  });
  it('erro do banco na leitura do sinal: 500 generico, sem a mensagem do banco', async () => {
    const { app } = await montar({ falharEm: 'ctl_apontamento_cobertura' });
    const r = await get(app, '/api/apontamento');
    expect(r.statusCode).toBe(500);
    expect(r.body).not.toContain(MARCADOR_NOME);
    await app.close();
  });
});

describe('equipe no apontamento: filtro por time do card, so recorte (097 L2)', () => {
  const doTime = (equipe: string | null, o: Partial<Linha> = {}) => linha({ equipe, ...o });
  const cenario = () => [
    doTime('Time Alfa', { segundos: 3600 }), doTime('Time Alfa', { segundos: 3600, data: '2026-10-21' }),
    doTime('Time Beta', { segundos: 7200, data: '2026-10-22' }), doTime(null, { segundos: 1800, data: '2026-10-23' }),
  ];
  const ler = async (consulta = '', op: Opcoes = {}) => {
    const { app, db } = await montar({ linhas: cenario(), ...op });
    const r = await get(app, `/api/apontamento?de=2026-10-01&ate=2026-10-31${consulta}`);
    expect(r.statusCode, r.body.slice(0, 200)).toBe(200);
    const corpo = respostaApontamentoSchema.parse(r.json());
    await app.close();
    return { corpo, db, bruto: r.body };
  };
  it('opcoes.equipes lista os times do recorte (id = slug do nome, "Sem time" para card sem time), em ordem neutra', async () => {
    const { corpo } = await ler();
    expect(corpo.opcoes.equipes).toEqual([{ id: 'sem-time', rotulo: 'Sem time' }, { id: 'time-alfa', rotulo: 'Time Alfa' }, { id: 'time-beta', rotulo: 'Time Beta' }]);
    expect(corpo.kpis.segundos).toBe(3600 + 3600 + 7200 + 1800);
  });
  it('o filtro equipe restringe o calculo; varios times = um conjunto; sem-time e um recorte valido; time desconhecido zera', async () => {
    expect((await ler('&equipe=time-alfa')).corpo.kpis).toMatchObject({ segundos: 7200, apontamentos: 2 });
    expect((await ler('&equipe=time-alfa,time-beta')).corpo.kpis.segundos).toBe(14_400);
    expect((await ler('&equipe=sem-time')).corpo.kpis.segundos).toBe(1800);
    expect((await ler('&equipe=outro-time')).corpo.kpis.segundos).toBe(0);
  });
  it('entrada invalida ou repetida: 400 so com caminho e codigo; o parametro pessoa continua aceito', async () => {
    const { app } = await montar({ linhas: cenario() });
    for (const q of ['equipe=Time%20Alfa', 'equipe=a%27%3B--', 'equipe=time-alfa,time-alfa', `equipe=${'a'.repeat(61)}`]) {
      const r = await get(app, `/api/apontamento?${q}`);
      expect(r.statusCode, q).toBe(400);
      expect(r.body).not.toMatch(/Alfa|--|aaaa/);
    }
    expect((await get(app, '/api/apontamento?pessoa=p1')).statusCode).toBe(200);
    await app.close();
  });
  it('a resposta nao ganha bloco por time: so opcoes.equipes e o recorte; nenhuma contagem, soma ou serie por time', async () => {
    const { corpo, bruto } = await ler('&equipe=time-alfa');
    expect(Object.keys(corpo).sort()).toEqual(Object.keys((await ler()).corpo).sort());
    expect(bruto).not.toMatch(/porEquipe|porTime/);
    expect(JSON.stringify(corpo.distribuicao)).not.toMatch(/time-alfa|Time Alfa/);
  });
  it('a consulta de linhas usa a equipe do card (ou do pai) e nenhuma coluna de pessoa a mais', async () => {
    const { db } = await ler();
    const sql = db.chamadas.find((x) => x.texto.includes('FROM dspd_bm.fato_apontamento f') && !x.texto.includes('ctl_apontamento_cobertura'))!.texto;
    expect(sql).toContain('COALESCE(c.equipe, p.equipe) AS equipe');
  });
});

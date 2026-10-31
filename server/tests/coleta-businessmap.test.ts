import { afterEach, describe, expect, it } from 'vitest';
import {
  CAMPOS_CUSTOMIZADOS_FORA, CAMPOS_PEDIDO_CARDS, EXPAND_COLETA, ErroColetaBm, coletarCards, codigoDe, dominiosDaColeta, inicioDaCarga,
  type DepsColeta, type ModoColeta,
} from '../src/modulos/businessmap/coleta.js';
import { ErroReferencia } from '../src/modulos/businessmap/referencia.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { ErroBusinessMap, criarClienteHttp, type EventoHttp } from '../src/plataforma/http.js';
import { bancoFalso, subirServidorBm, type Cartao, type OpcoesBanco, type ServidorBm } from './businessmap-coleta-duble.js';

// F3 do plano 052: coleta dos cards contra o servidor falso (nada vai ao BusinessMap real) e o banco falso com estado.
const CHAVE = 'chave-f3-de-teste-0123456789';
const AGORA = new Date('2026-11-02T12:00:00Z');
const S = montarEsquemas('');
const MARCADORES = ['pessoa@exemplo.com', 'ACELERATO-MARCADOR', 'RESPONSAVEL-CR-MARCADOR', 'DESCRICAO-MARCADOR', 'owner_user_id', 'co_owner_ids', 'NOME-MARCADOR', 'ATTR-MARCADOR', 'usuario-marcador'];

const abertos: ServidorBm[] = [];
afterEach(async () => {
  for (const s of abertos.splice(0)) await s.fechar();
});

/** Card como a API devolve: com pessoa, descrição e os campos customizados 36 e 42, que nunca podem chegar ao staging. */
const card = (id: number | string | null, extra: Cartao = {}): Cartao => ({
  card_id: id, title: `Card ${String(id)}`, type_id: 3, created_at: '2024-01-01T10:00:00Z', last_modified: '2026-10-30T10:00:00Z', column_id: 2530,
  owner_user_id: 5, co_owner_ids: [6, 7], email: 'pessoa@exemplo.com', description: 'DESCRICAO-MARCADOR',
  custom_fields: [{ field_id: 36, value: 'ACELERATO-MARCADOR' }, { field_id: 42, value: 'RESPONSAVEL-CR-MARCADOR' }],
  linked_cards: [{ card_id: 99, link_type: 'parent', title: 'TITULO-DO-VINCULO' }], ...extra,
});
const USUARIOS = {
  '5': { user_id: 5, realname: 'NOME-MARCADOR-5', email: 'pessoa@exemplo.com', username: 'usuario-marcador', attributes: { x: 'ATTR-MARCADOR' } },
  '6': { user_id: 6, realname: 'NOME-MARCADOR-6', attributes: { x: 'ATTR-MARCADOR' } },
};

interface Montagem { servidor: ServidorBm; banco: ReturnType<typeof bancoFalso>; logs: EventoHttp[]; deps: DepsColeta }
async function montar(cenario: Parameters<typeof subirServidorBm>[0], banco: OpcoesBanco = {}, quadros: number[] = [35], extra: Partial<DepsColeta> = {}): Promise<Montagem> {
  const servidor = await subirServidorBm(cenario);
  abertos.push(servidor);
  const bd = bancoFalso(banco);
  const logs: EventoHttp[] = [];
  const cliente = criarClienteHttp(
    { urlBase: servidor.url, apikey: CHAVE, limitePorMinuto: 1000, timeoutMs: 2000 },
    { dormir: () => Promise.resolve(), log: (e) => logs.push(e) },
  );
  return { servidor, banco: bd, logs, deps: { cliente, pool: bd.pool, S, quadros, hostBase: 'bm.exemplo.test', agora: () => AGORA, ...extra } };
}
const carga: ModoColeta = { tipo: 'carga_inicial' };
const cards = (m: Montagem): URLSearchParams[] => m.servidor.pedidos.filter((p) => p.caminho === '/cards').map((p) => p.consulta);
const textoDoBanco = (m: Montagem): string => JSON.stringify(m.banco.chamadas.map((c) => [c.texto, c.valores]));

describe('F3: carga inicial de 12 meses (Q-2, Q-2b, Q-2c)', () => {
  it('ativos sem filtro de data (card antigo entra); arquivados e descartados só pela data de arquivamento ou descarte, a partir de hoje menos 12 meses', async () => {
    const m = await montar({
      cards: {
        '35|active': [card(1, { created_at: '2023-01-01T00:00:00Z' })],
        '35|archived': [card(2, { archived_at: '2025-10-01T00:00:00Z' }), card(3, { archived_at: '2026-03-01T00:00:00Z' })],
        '35|discarded': [card(4, { discarded_at: '2025-06-01T00:00:00Z' }), card(5, { discarded_at: '2026-01-01T00:00:00Z' })],
      },
      porPagina: 100, users: USUARIOS, status: {}, corpos: {},
    });
    const r = await coletarCards(m.deps, carga);
    expect(m.banco.estado.stg.map((s) => [s.idOrigem, s.arquivado])).toEqual([['1', false], ['3', true], ['5', false]]);
    const q = cards(m);
    expect(q.map((x) => x.get('state'))).toEqual(['active', 'archived', 'discarded']);
    expect(q[0]!.has('archived_from') || q[0]!.has('discarded_from') || q[0]!.has('last_modified_from')).toBe(false);
    expect(q[1]!.get('archived_from')).toBe('2025-11-02');
    expect(q[2]!.get('discarded_from')).toBe('2025-11-02');
    expect(q[1]!.has('last_modified_from') || q[1]!.has('discarded_from')).toBe(false);
    for (const x of q) {
      expect(x.get('fields')).toBe(CAMPOS_PEDIDO_CARDS);
      expect(x.get('expand')).toBe(EXPAND_COLETA);
      expect(x.get('board_ids')).toBe('35');
    }
    expect(r).toMatchObject({ estado: 'sucesso', modo: 'carga_inicial', inicioCarga: '2025-11-02', retomada: false, falhas: {} });
    expect(r.streams.map((s) => [s.estado, s.lidos, s.inseridos, s.jaExistentes, s.falhas])).toEqual([['active', 1, 1, 0, 0], ['archived', 1, 1, 0, 0], ['discarded', 1, 1, 0, 0]]);
    expect(m.banco.estado.contagens.filter((c) => c.entidade.startsWith('card_')).map((c) => [c.entidade, c.lidos, c.inseridos])).toEqual([['card_35_active', 1, 1], ['card_35_archived', 1, 1], ['card_35_discarded', 1, 1]]);
  });

  it('só GET, só /cards e /users; fields e expand fixos; host e quadros só em hash; chave fora de log, banco e resultado', async () => {
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: USUARIOS, status: {}, corpos: {} });
    const r = await coletarCards(m.deps, carga);
    expect(m.servidor.pedidos.every((p) => p.metodo === 'GET')).toBe(true);
    expect([...new Set(m.servidor.pedidos.map((p) => p.caminho))]).toEqual(['/cards', '/users']);
    const aberta = m.banco.estado.aberta!;
    expect(aberta.parametros).toMatchObject({ tipo: 'carga_inicial', inicio_carga: '2025-11-02', iniciada_em: '2026-11-02T12:00:00Z', paginas: {} });
    expect(String(aberta.parametros.host_sha256)).toMatch(/^[0-9a-f]{64}$/);
    expect(String(aberta.parametros.quadros_sha256)).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(aberta.params)).not.toContain('bm.exemplo.test');
    expect(aberta.params.slice(0, 4)).toEqual([AGORA, null, 0, 'bm-f3/1']);
    const tudo = `${JSON.stringify(m.logs)}${textoDoBanco(m)}${JSON.stringify(r)}`;
    expect(tudo).not.toContain(CHAVE);
    expect(tudo).not.toContain('127.0.0.1');
  });

  it('staging só pela allow-list: nenhum e-mail, descrição, id de pessoa nem os fields 36 e 42 chegam ao payload, ao log ou à falha', async () => {
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: USUARIOS, status: {}, corpos: {} });
    await coletarCards(m.deps, carga);
    expect(m.banco.estado.stg).toHaveLength(1);
    const payload = JSON.parse(m.banco.estado.stg[0]!.payload) as Record<string, unknown>;
    expect(payload).toMatchObject({ card_id: 1, title: 'Card 1', linked_cards: [{ card_id: 99, link_type: 'parent' }], custom_fields: [] });
    expect(Object.keys(payload)).not.toEqual(expect.arrayContaining(['owner_user_id', 'co_owner_ids', 'email', 'description']));
    for (const marca of MARCADORES.filter((x) => !x.startsWith('NOME-') && x !== 'usuario-marcador')) expect(m.banco.estado.stg[0]!.payload).not.toContain(marca);
    expect(JSON.stringify(m.banco.estado.falhas)).not.toMatch(/MARCADOR/);
    expect(CAMPOS_PEDIDO_CARDS).not.toMatch(/custom_fields|linked_cards|description|email/);
  });

  it('fields 36 (ID Acelerato) e 42 (Responsável CR) estão fora do mapa de domínios, mesmo se alguém os puser lá', () => {
    expect(CAMPOS_CUSTOMIZADOS_FORA).toEqual(['36', '42']);
    const m = dominiosDaColeta();
    for (const f of CAMPOS_CUSTOMIZADOS_FORA) expect(m.has(f)).toBe(false);
  });

  it('página por página: cada página guarda a última concluída e o total (retomável)', async () => {
    const m = await montar({ cards: { '35|active': [1, 2, 3, 4, 5].map((i) => card(i)) }, porPagina: 2, users: {}, status: {}, corpos: {} });
    await coletarCards(m.deps, carga);
    expect(m.banco.estado.checkpoints.filter((c) => c.chave === '35|active')).toEqual([{ chave: '35|active', ultima: 1, total: 3 }, { chave: '35|active', ultima: 2, total: 3 }, { chave: '35|active', ultima: 3, total: 3 }]);
    expect(cards(m).filter((x) => x.get('state') === 'active').map((x) => x.get('page'))).toEqual(['1', '2', '3']);
    expect(m.banco.estado.stg).toHaveLength(5);
  });

  it('vários quadros: três leituras por quadro, cada uma com a sua contagem', async () => {
    const m = await montar({ cards: { '35|active': [card(1)], '23|active': [card(2)] }, porPagina: 100, users: {}, status: {}, corpos: {} }, {}, [35, 23]);
    const r = await coletarCards(m.deps, carga);
    expect(r.streams.map((s) => `${s.quadro}|${s.estado}`)).toEqual(['35|active', '35|archived', '35|discarded', '23|active', '23|archived', '23|discarded']);
    expect(m.banco.estado.stg.map((s) => [s.idOrigem, s.quadro])).toEqual([['1', '35'], ['2', '23']]);
  });

  it('marca d\'água só em sucesso: a carga fecha com a hora do início', async () => {
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: {}, status: {}, corpos: {} });
    const r = await coletarCards(m.deps, carga);
    expect(m.banco.estado.marca).toEqual({ coletaId: 77, ate: AGORA });
    expect(m.banco.estado.fechamentos).toEqual([{ coletaId: 77, status: 'sucesso', erro: null }]);
    expect(r.coletaId).toBe(77);
  });
});

describe('F3: carga retomada e execução interrompida', () => {
  const anterior = (status: string, extra: Record<string, unknown> = {}) => ({
    status,
    parametros: {
      tipo: 'carga_inicial', inicio_carga: '2025-10-15', iniciada_em: '2026-11-01T08:00:00Z',
      paginas: { '35|active': { ultima: 2, total: 3 }, '35|archived': { ultima: 1, total: 1 } }, ...extra,
    },
  });
  const ativos = { '35|active': [1, 2, 3, 4, 5].map((i) => card(i)), '35|discarded': [card(9, { discarded_at: '2026-01-01T00:00:00Z' })] };

  it('retoma da última página concluída (relê essa), pula o que já terminou e mantém o início e a marca da primeira tentativa', async () => {
    const m = await montar({ cards: ativos, porPagina: 2, users: {}, status: {}, corpos: {} }, { ultimaCarga: anterior('falha') });
    const r = await coletarCards(m.deps, carga);
    const q = cards(m);
    expect(q.filter((x) => x.get('state') === 'active').map((x) => x.get('page'))).toEqual(['2', '3']);
    expect(q.some((x) => x.get('state') === 'archived')).toBe(false);
    expect(q.find((x) => x.get('state') === 'discarded')!.get('discarded_from')).toBe('2025-10-15');
    expect(r).toMatchObject({ retomada: true, inicioCarga: '2025-10-15', estado: 'sucesso' });
    expect(m.banco.estado.aberta!.parametros).toMatchObject({ inicio_carga: '2025-10-15', iniciada_em: '2026-11-01T08:00:00Z', paginas: { '35|archived': { ultima: 1, total: 1 } } });
    expect(m.banco.estado.marca!.ate).toEqual(new Date('2026-11-01T08:00:00Z'));
    expect(m.banco.estado.stg.map((s) => s.idOrigem)).toEqual(['3', '4', '5', '9']);
  });

  it('a mesma carga relida não duplica: o que já está no staging vira "já existente"', async () => {
    const m = await montar({ cards: { '35|active': [card(1), card(2)] }, porPagina: 100, users: {}, status: {}, corpos: {} });
    await coletarCards(m.deps, carga);
    const r2 = await coletarCards(m.deps, carga);
    expect(m.banco.estado.stg).toHaveLength(2);
    expect(r2.streams[0]).toMatchObject({ lidos: 2, inseridos: 0, jaExistentes: 2 });
  });

  it('carga anterior concluída, ou com outro início, ou com parâmetros ilegíveis: começa do zero', async () => {
    const hoje = '2025-11-02';
    const sucesso = await montar({ cards: ativos, porPagina: 2, users: {}, status: {}, corpos: {} }, { ultimaCarga: anterior('sucesso') });
    expect(await coletarCards(sucesso.deps, carga)).toMatchObject({ retomada: false, inicioCarga: hoje });
    const outro = await montar({ cards: ativos, porPagina: 2, users: {}, status: {}, corpos: {} }, { ultimaCarga: anterior('parcial') });
    expect(await coletarCards(outro.deps, { tipo: 'carga_inicial', inicio: '2024-11-02' })).toMatchObject({ retomada: false, inicioCarga: '2024-11-02' });
    expect(cards(outro).find((x) => x.get('state') === 'archived')!.get('archived_from')).toBe('2024-11-02');
    const igual = await montar({ cards: ativos, porPagina: 2, users: {}, status: {}, corpos: {} }, { ultimaCarga: anterior('parcial') });
    expect(await coletarCards(igual.deps, { tipo: 'carga_inicial', inicio: '2025-10-15' })).toMatchObject({ retomada: true, inicioCarga: '2025-10-15' });
    const ilegivel = await montar({ cards: ativos, porPagina: 2, users: {}, status: {}, corpos: {} }, { ultimaCarga: { status: 'falha', parametros: { tipo: 'carga_inicial' } } });
    expect(await coletarCards(ilegivel.deps, carga)).toMatchObject({ retomada: false, inicioCarga: hoje });
  });

  it('coleta que morreu sem fechar é fechada como falha antes da nova (nada é apagado)', async () => {
    const m = await montar({ cards: {}, porPagina: 100, users: {}, status: {}, corpos: {} }, { interrompidas: ['55', '56'] });
    await coletarCards(m.deps, carga);
    expect(m.banco.estado.fechamentos.slice(0, 2)).toEqual([
      { coletaId: '55', status: 'falha', erro: 'desconhecido: execução anterior interrompida' },
      { coletaId: '56', status: 'falha', erro: 'desconhecido: execução anterior interrompida' },
    ]);
    expect(textoDoBanco(m)).not.toMatch(/DELETE|TRUNCATE/);
  });

  it('inicioDaCarga: hoje menos 12 meses em UTC', () => {
    expect(inicioDaCarga(AGORA)).toBe('2025-11-02');
    expect(inicioDaCarga(AGORA, 6)).toBe('2026-05-02');
  });
});

describe('F3: coleta incremental', () => {
  it('sem marca d\'água (carga inicial não concluída) recusa antes de abrir a coleta', async () => {
    const m = await montar({ cards: {}, porPagina: 100, users: {}, status: {}, corpos: {} }, { marca: null });
    await expect(coletarCards(m.deps, { tipo: 'incremental' })).rejects.toMatchObject({ name: 'ErroColetaBm', codigo: 'sem-marca' });
    expect(m.banco.estado.aberta).toBeUndefined();
    expect(m.servidor.pedidos).toEqual([]);
  });

  it('lê os três estados com last_modified_from = marca menos a sobreposição e grava a marca nova só em sucesso', async () => {
    const marca = new Date('2026-11-01T06:00:00Z');
    const m = await montar({
      cards: {
        '35|active': [card(1, { last_modified: '2026-11-01T05:30:00Z' }), card(2, { last_modified: '2026-11-01T04:00:00Z' })],
        '35|archived': [card(3, { last_modified: '2026-11-01T07:00:00Z' })],
      },
      porPagina: 100, users: {}, status: {}, corpos: {},
    }, { marca });
    const r = await coletarCards(m.deps, { tipo: 'incremental' });
    const q = cards(m);
    expect(q.map((x) => [x.get('state'), x.get('last_modified_from')])).toEqual([['active', '2026-11-01T05:00:00Z'], ['archived', '2026-11-01T05:00:00Z'], ['discarded', '2026-11-01T05:00:00Z']]);
    expect(q.some((x) => x.has('archived_from') || x.has('discarded_from'))).toBe(false);
    expect(m.banco.estado.stg.map((s) => s.idOrigem)).toEqual(['1', '3']);
    expect(m.banco.estado.aberta!.params.slice(0, 4)).toEqual([AGORA, marca, 3600, 'bm-f3/1']);
    expect(m.banco.estado.aberta!.parametros).toMatchObject({ tipo: 'incremental', paginas: {} });
    expect(m.banco.estado.aberta!.parametros).not.toHaveProperty('inicio_carga');
    expect(r).toMatchObject({ estado: 'sucesso', modo: 'incremental', inicioCarga: null });
    expect(m.banco.estado.marca!.ate).toEqual(AGORA);
  });
});

describe('F3: falhas (só código e id, nunca texto)', () => {
  it('card sem id: falha só com o código e id nulo, coleta parcial e sem marca d\'água', async () => {
    const m = await montar({ cards: { '35|active': [card(1), card(null, { title: 'TITULO-MARCADOR' }), card('x')] }, porPagina: 100, users: {}, status: {}, corpos: {} });
    const r = await coletarCards(m.deps, carga);
    expect(r).toMatchObject({ estado: 'parcial', falhas: { 'card-sem-id': 2 } });
    expect(r.streams[0]).toMatchObject({ lidos: 3, inseridos: 1, falhas: 2 });
    expect(m.banco.estado.falhas).toEqual([
      { entidade: 'card_35_active', idOrigem: null, erro: 'card-sem-id' }, { entidade: 'card_35_active', idOrigem: null, erro: 'card-sem-id' },
    ]);
    expect(m.banco.estado.marca).toBeUndefined();
    expect(m.banco.estado.fechamentos).toEqual([{ coletaId: 77, status: 'parcial', erro: 'dados-invalidos: 2 falha(s) (card-sem-id)' }]);
    expect(JSON.stringify(m.banco.estado)).not.toContain('TITULO-MARCADOR');
  });

  it('item da lista que nem objeto é conta como card sem id; resposta sem bloco de paginação vale como página única', async () => {
    const m = await montar({ cards: { '35|active': [card(1), null as never, 'texto' as never] }, porPagina: 100, users: {}, status: {}, corpos: {}, semPaginacao: true });
    const r = await coletarCards(m.deps, carga);
    expect(r).toMatchObject({ estado: 'parcial', falhas: { 'card-sem-id': 2 } });
    expect(r.streams[0]).toMatchObject({ lidos: 3, inseridos: 1, falhas: 2 });
    expect(cards(m).filter((x) => x.get('state') === 'active')).toHaveLength(1);
  });

  it('erro de leitura que não é fatal (HTTP 404) só perde aquela leitura; as outras seguem', async () => {
    const m = await montar({ cards: { '35|active': [card(1)], '35|discarded': [card(9, { discarded_at: '2026-01-01T00:00:00Z' })] }, porPagina: 100, users: {}, status: { '35|archived': 404 }, corpos: {} });
    const r = await coletarCards(m.deps, carga);
    expect(r).toMatchObject({ estado: 'parcial', falhas: { http: 1 } });
    expect(r.streams.map((s) => [s.estado, s.lidos, s.falhas])).toEqual([['active', 1, 0], ['archived', 0, 1], ['discarded', 1, 0]]);
    expect(m.banco.estado.falhas).toEqual([{ entidade: 'card_35_archived', idOrigem: null, erro: 'http' }]);
    expect(m.banco.estado.fechamentos[0]!.erro).toBe('desconhecido: 1 falha(s) (http)');
    expect(m.banco.estado.marca).toBeUndefined();
  });

  it('autenticação (401) é fatal: para a execução, não pede nomes e fecha como falha com a categoria', async () => {
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: USUARIOS, status: { '35|active': 401 }, corpos: {} }, {}, [35, 23]);
    const r = await coletarCards(m.deps, carga);
    expect(r).toMatchObject({ estado: 'falha', falhas: { autenticacao: 1 }, usuarios: null });
    expect(m.servidor.pedidos.map((p) => p.caminho)).toEqual(['/cards']);
    expect(m.banco.estado.fechamentos).toEqual([{ coletaId: 77, status: 'falha', erro: 'autenticacao: 1 falha(s) (autenticacao)' }]);
  });

  it('erro de banco: fecha como falha sem a mensagem e repassa o erro; falha ao fechar não esconde o erro original', async () => {
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: {}, status: {}, corpos: {} }, { falharAoGravar: true });
    await expect(coletarCards(m.deps, carga)).rejects.toThrow('falha simulada do banco');
    expect(m.banco.estado.fechamentos).toEqual([{ coletaId: 77, status: 'falha', erro: 'desconhecido: erro-interno' }]);
    const m2 = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: {}, status: {}, corpos: {} }, { falharAoGravar: true });
    const cli = m2.banco.cliente;
    const q = cli.query.bind(cli);
    let fechou = false;
    m2.deps.pool = {
      query: q, end: m2.banco.pool.end,
      connect: () => Promise.resolve({ ...cli, query: (t: string, v?: unknown[]) => { if (t.includes('SET status = $2')) { fechou = true; return Promise.reject(new Error('sem conexão')); } return q(t, v); } }),
    };
    await expect(coletarCards(m2.deps, carga)).rejects.toThrow('falha simulada do banco');
    expect(fechou).toBe(true);
  });

  it('a falha só de /users não derruba a coleta: sucesso, com o código em ctl_coleta_falha e sem id nem nome', async () => {
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: USUARIOS, status: { users: 404 }, corpos: {} });
    const r = await coletarCards(m.deps, carga);
    expect(r).toMatchObject({ estado: 'sucesso', usuarios: { falha: 'http', resolvidos: 0 }, falhas: {} });
    expect(m.banco.estado.falhas).toEqual([{ entidade: 'usuario', idOrigem: null, erro: 'http' }]);
    expect(m.banco.estado.marca!.ate).toEqual(AGORA);
    expect(m.banco.estado.usuarios).toEqual([]);
  });

  it('codigoDe: só o código do erro, nunca a mensagem', () => {
    expect(codigoDe(new ErroBusinessMap('autenticacao', 'GET /x respondeu 401'))).toBe('autenticacao');
    expect(codigoDe(new ErroReferencia('motivo', 'ref_coluna 25|1'))).toBe('referencia-motivo');
    expect(codigoDe(new Error('senha=123'))).toBe('erro-interno');
  });
});

describe('F3: nomes dos responsáveis (Q-8 = B) pela coleta', () => {
  it('ids dos cards vão a /users só com fields=user_id,realname e user_ids; o nome só chega a dim_responsavel; e-mail, usuário e attributes em lugar nenhum', async () => {
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: USUARIOS, status: {}, corpos: {} });
    const r = await coletarCards(m.deps, carga);
    const u = m.servidor.pedidos.filter((p) => p.caminho === '/users');
    expect(u).toHaveLength(1);
    expect([...u[0]!.consulta.keys()].sort()).toEqual(['fields', 'user_ids']);
    expect(u[0]!.consulta.get('fields')).toBe('user_id,realname');
    expect(u[0]!.consulta.get('user_ids')).toBe('5,6,7');
    expect(m.banco.estado.usuarios).toEqual([{ ids: ['5', '6'], nomes: ['NOME-MARCADOR-5', 'NOME-MARCADOR-6'], agora: AGORA }]);
    expect(r.usuarios).toEqual({ pedidos: 3, resolvidos: 2, naoResolvidos: 1, falha: null });
    expect(m.banco.estado.contagens.find((c) => c.entidade === 'usuario_nao_resolvido')).toMatchObject({ lidos: 0, inseridos: 0, jaExistentes: 0, falhas: 1 });
    const fora = JSON.stringify([m.banco.estado.stg, m.banco.estado.falhas, m.banco.estado.contagens, m.logs, m.banco.estado.aberta, r]);
    for (const marca of ['NOME-MARCADOR', 'pessoa@exemplo.com', 'usuario-marcador', 'ATTR-MARCADOR']) expect(fora).not.toContain(marca);
    const sql = m.banco.chamadas.filter((c) => !/^(INSERT INTO|UPDATE) dspd_bm\.dim_responsavel/.test(c.texto));
    expect(JSON.stringify(sql)).not.toMatch(/NOME-MARCADOR|usuario-marcador|ATTR-MARCADOR/);
  });

  it('card sem responsável não chama /users', async () => {
    const m = await montar({ cards: { '35|active': [card(1, { owner_user_id: undefined, co_owner_ids: undefined })] }, porPagina: 100, users: USUARIOS, status: {}, corpos: {} });
    const r = await coletarCards(m.deps, carga);
    expect(m.servidor.pedidos.some((p) => p.caminho === '/users')).toBe(false);
    expect(r.usuarios).toEqual({ pedidos: 0, resolvidos: 0, naoResolvidos: 0, falha: null });
  });
});

describe('F3: referência da F2 chamada pelo comando', () => {
  it('a etapa roda depois de abrir a coleta e antes dos cards; o resultado vai ao relatório', async () => {
    const ordem: string[] = [];
    let pedidosNaEtapa = -1;
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: {}, status: {}, corpos: {} }, {}, [35], {
      etapaReferencia: (id) => { ordem.push(`ref:${id}`); pedidosNaEtapa = abertos[0]!.pedidos.length; return Promise.resolve({ inseridas: 3 }); },
    });
    const r = await coletarCards(m.deps, carga);
    expect(ordem).toEqual(['ref:77']);
    expect(pedidosNaEtapa).toBe(0);
    expect(r.referencia).toEqual({ inseridas: 3 });
    expect(r.estado).toBe('sucesso');
  });

  it('falha da referência (mudança sem motivo) não impede a coleta dos cards: parcial, só com o código', async () => {
    const m = await montar({ cards: { '35|active': [card(1)] }, porPagina: 100, users: {}, status: {}, corpos: {} }, {}, [35], {
      etapaReferencia: () => Promise.reject(new ErroReferencia('motivo', '1 mudança(s) de significado sem motivo: ref_coluna 25|2532', ['ref_coluna:25|2532'])),
    });
    const r = await coletarCards(m.deps, carga);
    expect(r).toMatchObject({ estado: 'parcial', referencia: null, motivosPendentes: ['ref_coluna:25|2532'], falhas: { 'referencia-motivo': 1 } });
    expect(m.banco.estado.falhas).toEqual([{ entidade: 'referencia', idOrigem: null, erro: 'referencia-motivo' }]);
    expect(m.banco.estado.stg).toHaveLength(1);
    expect(JSON.stringify(m.banco.estado)).not.toContain('2532'); // as chaves vão só ao resultado, nunca ao banco
  });

  it('ErroColetaBm carrega o código', () => {
    expect(new ErroColetaBm('uso', 'x')).toMatchObject({ name: 'ErroColetaBm', codigo: 'uso' });
  });
});

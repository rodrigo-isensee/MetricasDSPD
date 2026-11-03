import { afterEach, describe, expect, it } from 'vitest';
import { coletarApontamentos, type DepsApontamento, type ModoApontamento } from '../src/modulos/businessmap/apontamento/coleta.js';
import { lerLote, paginasDoWorklog, type Folha } from '../src/modulos/businessmap/apontamento/lotes.js';
import type { EntradaClassificacao, SaidaClassificacao } from '../src/modulos/businessmap/apontamento/registro.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarClienteHttp, ErroBusinessMap } from '../src/plataforma/http.js';
import { cenarioWorklogVazio, registroWorklog, subirServidorWorklog, type CenarioWorklog, type Registro, type ServidorWorklog } from './apontamento-duble.js';
import { bancoApontamento, type FatoFalso, type OpcoesBancoAp } from './apontamento-banco-falso.js';

// Pedido 063 (K-200, E2.1): leitura de todas as paginas do `/loggedTime` (`page=1..all_pages`), completude por consulta, `paginacao_instavel`,
// falha transitoria sem marcar o card incompleto e cobertura por card. Cliente falso para o leitor; servidor falso (127.0.0.1) e banco falso
// para a coleta. Nenhuma chamada real.

const S = montarEsquemas('');
const SAL = 'sal-de-teste-com-pelo-menos-32-bytes!!';
const QUARTA = new Date('2026-11-04T15:00:00Z');
const MARCA = new Date('2026-11-03T10:00:00Z');
const servidores: ServidorWorklog[] = [];
afterEach(async () => { for (const s of servidores.splice(0)) await s.fechar(); });

const pagina = (n: number, todas: number | undefined, aninhado = true): unknown => {
  const itens = Array.from({ length: n }, (_, i) => ({ i }));
  if (todas === undefined) return { data: itens };
  return aninhado ? { data: { data: itens, pagination: { all_pages: todas } } } : { data: itens, pagination: { all_pages: todas } };
};
/** Cliente falso: a n-esima chamada (1 = primeira) devolve `respostas[n-1]` ou lanca, e guarda a consulta pedida. */
const falso = (respostas: (unknown | Error)[]) => {
  const consultas: Record<string, string | number>[] = [];
  return {
    consultas,
    get: (_c: string, o?: { consulta?: Record<string, string | number> }) => {
      consultas.push({ ...o!.consulta! });
      const r = respostas[consultas.length - 1];
      return r instanceof Error ? Promise.reject(r) : Promise.resolve(r);
    },
  } as never as Parameters<typeof lerLote>[0] & { consultas: Record<string, string | number>[] };
};
const ler = async (c: Parameters<typeof lerLote>[0], cards = ['9100000000']): Promise<Folha[]> => {
  const folhas: Folha[] = [];
  await lerLote(c, cards, { from_date: '2026-10-01' }, (f) => { folhas.push(f); return Promise.resolve(); });
  return folhas;
};

describe('paginasDoWorklog', () => {
  it('le all_pages nas duas formas do envelope; sem paginacao e null; valor invalido e erro de formato', () => {
    expect(paginasDoWorklog(pagina(1, 3))).toBe(3);
    expect(paginasDoWorklog(pagina(1, 3, false))).toBe(3);
    expect(paginasDoWorklog(pagina(1, undefined))).toBeNull();
    expect(paginasDoWorklog([1])).toBeNull();
    for (const ruim of [-1, 1.5, '3', null, 10_000]) expect(() => paginasDoWorklog({ data: { data: [], pagination: { all_pages: ruim } } }), String(ruim)).toThrow(ErroBusinessMap);
    expect(() => paginasDoWorklog({ data: { data: [], pagination: 'x' } })).toThrow(ErroBusinessMap);
  });
});

describe('lerLote: segue as paginas (063, ADR 0025 revisada)', () => {
  it('3 paginas: pede page=1, 2 e 3 com os mesmos parametros; so a ultima folha e completa', async () => {
    const c = falso([pagina(1000, 3), pagina(1000, 3), pagina(500, 3)]);
    const fs = await ler(c);
    expect(c.consultas.map((q) => q.page)).toEqual([1, 2, 3]);
    for (const q of c.consultas) expect({ ...q, page: 0 }).toEqual({ ...c.consultas[0], page: 0 });
    expect(c.consultas[0]).toMatchObject({ per_page: 1000, card_ids: '9100000000', from_date: '2026-10-01', include_logged_time_for_subtasks: 1 });
    expect(fs.map((f) => [f.itens.length, f.completo, f.falha])).toEqual([[1000, false, null], [1000, false, null], [500, true, null]]);
  });
  it('uma pagina so (all_pages 1) e all_pages 0 (nenhum registro): completo, uma chamada', async () => {
    for (const todas of [1, 0]) {
      const c = falso([pagina(todas === 0 ? 0 : 1000, todas)]);
      const fs = await ler(c);
      expect(c.consultas).toHaveLength(1);
      expect(fs).toHaveLength(1);
      expect(fs[0]).toMatchObject({ completo: true, falha: null });
    }
  });
  it('pagina cheia com pagination nao e teto: nao divide e nao vira lote_no_teto, mesmo com varios cards', async () => {
    const c = falso([pagina(1000, 2), pagina(10, 2)]);
    const fs = await ler(c, ['1', '2', '3']);
    expect(c.consultas.map((q) => q.card_ids)).toEqual(['1,2,3', '1,2,3']);
    expect(fs.map((f) => f.falha)).toEqual([null, null]);
    expect(fs.at(-1)!.completo).toBe(true);
  });
  it('falha de pagina no meio: as paginas lidas ficam, a consulta fica incompleta com o codigo do erro e nada e lido depois', async () => {
    for (const tipo of ['http', 'indisponivel', 'tempo-esgotado', 'formato']) {
      const c = falso([pagina(1000, 3), new ErroBusinessMap(tipo as 'http', 'x')]);
      const fs = await ler(c);
      expect(c.consultas, tipo).toHaveLength(2);
      expect(fs.map((f) => [f.itens.length, f.completo, f.falha]), tipo).toEqual([[1000, false, null], [0, false, tipo]]);
    }
  });
  it('erro fatal (autenticacao, limite) em pagina qualquer sobe', async () => {
    const c = falso([pagina(1000, 3), new ErroBusinessMap('autenticacao', 'x')]);
    await expect(ler(c)).rejects.toBeInstanceOf(ErroBusinessMap);
  });
  it('all_pages que muda no meio: consulta incompleta (paginacao_instavel), a pagina lida e entregue e nada e lido depois', async () => {
    const c = falso([pagina(1000, 3), pagina(1000, 4), pagina(10, 4)]);
    const fs = await ler(c);
    expect(c.consultas).toHaveLength(2);
    expect(fs.map((f) => [f.completo, f.falha])).toEqual([[false, null], [false, 'paginacao_instavel']]);
  });
  it('all_pages cai na ultima pagina: tambem e instavel (nunca completo)', async () => {
    const c = falso([pagina(1000, 2), pagina(5, 1)]);
    const fs = await ler(c);
    expect(fs.at(-1)).toMatchObject({ completo: false, falha: 'paginacao_instavel' });
  });
  it('limite-bytes na pagina 2 de varios cards divide por cards e rele; com um card so, fica incompleto', async () => {
    const c = falso([pagina(1000, 2), new ErroBusinessMap('limite-bytes', 'x'), pagina(1, 1), pagina(1, 1)]);
    const fs = await ler(c, ['1', '2']);
    expect(c.consultas.map((q) => q.card_ids)).toEqual(['1,2', '1,2', '1', '2']);
    expect(fs.filter((f) => f.completo).map((f) => [...f.cards])).toEqual([['1'], ['2']]);
    const um = await ler(falso([pagina(1000, 2), new ErroBusinessMap('limite-bytes', 'x')]));
    expect(um.at(-1)).toMatchObject({ completo: false, falha: 'limite-bytes' });
  });
  it('contingencia: sem pagination e pagina cheia continua lote_no_teto (um card) ou divide (varios)', async () => {
    const um = await ler(falso([pagina(1000, undefined)]));
    expect(um).toHaveLength(1);
    expect(um[0]).toMatchObject({ completo: false, falha: 'lote_no_teto' });
    const c = falso([pagina(1000, undefined), pagina(3, undefined), pagina(3, undefined)]);
    const fs = await ler(c, ['1', '2']);
    expect(fs.every((f) => f.completo)).toBe(true);
    expect(c.consultas.map((q) => q.card_ids)).toEqual(['1,2', '1', '2']);
  });
});

describe('cliente: `page` na lista fechada CONSULTA_WORKLOG (ADR 0015)', () => {
  const novo = async (): Promise<{ s: ServidorWorklog; c: ReturnType<typeof criarClienteHttp> }> => {
    const s = await subirServidorWorklog(cenarioWorklogVazio());
    servidores.push(s);
    return { s, c: criarClienteHttp({ urlBase: s.url, apikey: 'chave-do-teste-0123456789', limitePorMinuto: 10_000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() }) };
  };
  const base = { card_ids: '9100000000', fields: 'logged_time_id,card_id,parent_card_id,subtask_id,lane_id,column_id,user_id,category_id,date,time,comment,logged_at' };
  it('aceita page inteiro positivo de ate 4 digitos e envia so ele', async () => {
    const { s, c } = await novo();
    await c.get('/loggedTime', { consulta: { ...base, page: 9999 } });
    expect(s.pedidos.at(-1)!.consulta.get('page')).toBe('9999');
  });
  it('recusa page 0, negativo, decimal, texto e 5 digitos, sem chamar a API', async () => {
    const { s, c } = await novo();
    for (const ruim of [0, -1, '1.5', 'abc', '10000', '1;2', '']) {
      await expect(c.get('/loggedTime', { consulta: { ...base, page: ruim } }), String(ruim)).rejects.toMatchObject({ tipo: 'consulta' });
    }
    expect(s.pedidos).toHaveLength(0);
  });
  it('outros parametros continuam fora da lista (user_ids, sort)', async () => {
    const { c } = await novo();
    for (const nome of ['user_ids', 'sort', 'offset']) await expect(c.get('/loggedTime', { consulta: { ...base, [nome]: '1' } }), nome).rejects.toMatchObject({ tipo: 'consulta' });
  });
});

// ---------- coleta ----------
const cards = (n: number): { card_id: string; type_id: string | null }[] => Array.from({ length: n }, (_, i) => ({ card_id: String(9_100_000_000 + i), type_id: '7' }));
const classificadorFalso = (e: EntradaClassificacao): SaidaClassificacao => ({ subgrupo: 'reuniao', flags: e.comentario === null ? 1 : 0, qtdPalavras: 2, versaoDicionario: 'dic-1' });
async function montar(opcoes: OpcoesBancoAp = {}, cenario: Partial<CenarioWorklog> = {}, agora = QUARTA) {
  const servidor = await subirServidorWorklog({ ...cenarioWorklogVazio(), ...cenario });
  servidores.push(servidor);
  const banco = bancoApontamento({ escopo: cards(1), ...opcoes });
  const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-do-teste-0123456789', limitePorMinuto: 100_000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
  const deps: DepsApontamento = { cliente, pool: banco.pool, S, classificar: classificadorFalso, sal: SAL, hostBase: 'bm.exemplo.test', agora: () => agora };
  return { servidor, deps, e: banco.estado };
}
const carga: ModoApontamento = { tipo: 'carga_inicial' };
const incremental: ModoApontamento = { tipo: 'incremental' };
const regs = (n: number, extra: Registro = {}): Registro[] => Array.from({ length: n }, () => registroWorklog(extra));
const loggedTime = (s: ServidorWorklog) => s.pedidos.filter((p) => p.caminho === '/loggedTime');
const incompleto = (card: string, coleta = 1) => ({ card_id: card, estado: 'incompleto' as const, coleta_id: coleta });

describe('coleta: card acima de 1000 registros lido por todas as paginas (K-200)', () => {
  it('card com 2500 registros em 3 paginas: carga fecha sucesso, grava os 2500, nenhuma falha, marca dagua avanca', async () => {
    const m = await montar({}, { registros: regs(2500), paginar: 1000 });
    const r = await coletarApontamentos(m.deps, carga);
    expect(r).toMatchObject({ estado: 'sucesso', lidos: 2500, inseridos: 2500, falhas: {} });
    expect(loggedTime(m.servidor).map((p) => p.consulta.get('page'))).toEqual(['1', '2', '3']);
    expect(m.e.stg.size).toBe(2500);
    expect(m.e.falhas).toEqual([]);
    expect(m.e.marca).toBeDefined();
    expect(m.e.cobertura).toEqual([]);
  });
  it('a retomada que le o card inteiro grava `completo` (o aviso some); os 1000 ja gravados voltam sem duplicar', async () => {
    const m = await montar({ cobertura: [incompleto('9100000000')] }, { registros: regs(2500), paginar: 1000 });
    const r = await coletarApontamentos(m.deps, carga);
    expect(r.estado).toBe('sucesso');
    expect(m.e.cobertura.map((c) => [c.card_id, c.estado])).toEqual([['9100000000', 'incompleto'], ['9100000000', 'completo']]);
  });
  it('incompleto antes e pagina 2 com 5xx: a coleta fecha parcial, nada de `completo`, e a pagina 1 fica gravada', async () => {
    const m = await montar({ cobertura: [incompleto('9100000000')] }, { registros: regs(2500), paginar: 1000, falharNaPagina: 2 });
    const r = await coletarApontamentos(m.deps, carga);
    expect(r.estado).toBe('parcial');
    expect(r.lidos).toBe(1000);
    expect(m.e.cobertura).toEqual([incompleto('9100000000')]);
    expect(m.e.marca).toBeUndefined();
  });
  it('falha transitoria de pagina NAO marca o card incompleto (sem aviso por erro de rede)', async () => {
    const m = await montar({}, { registros: regs(2500), paginar: 1000, falharNaPagina: 2 });
    await coletarApontamentos(m.deps, carga);
    expect(m.e.cobertura).toEqual([]);
    expect(m.e.falhas.map((f) => f.erro)).toEqual(['indisponivel']);
  });
  it('all_pages que muda no meio: parcial com paginacao_instavel, sem `completo` e sem marcar incompleto', async () => {
    const m = await montar({ cobertura: [incompleto('9100000000')] }, { registros: regs(2500), paginar: 1000, paginasInformadas: (p, reais) => (p === 2 ? reais + 1 : undefined) });
    const r = await coletarApontamentos(m.deps, carga);
    expect(r).toMatchObject({ estado: 'parcial', falhas: { paginacao_instavel: 1 } });
    expect(m.e.cobertura).toEqual([incompleto('9100000000')]);
  });
  it('sem pagination e com 1000 itens (contingencia): lote_no_teto e o card entra como incompleto (uma vez so)', async () => {
    const m = await montar({}, { registros: regs(1000) });
    const r = await coletarApontamentos(m.deps, carga);
    expect(r).toMatchObject({ estado: 'parcial', falhas: { lote_no_teto: 1 } });
    expect(m.e.cobertura.map((c) => [c.card_id, c.estado])).toEqual([['9100000000', 'incompleto']]);
    const outra = await montar({ cobertura: [incompleto('9100000000')] }, { registros: regs(1000) });
    await coletarApontamentos(outra.deps, carga);
    expect(outra.e.cobertura).toEqual([incompleto('9100000000')]);
  });
});

describe('coleta incremental com paginas: exclusao so com a consulta inteira', () => {
  const fs = (n: number): FatoFalso[] => Array.from({ length: n }, (_, i) => ({
    logged_time_id: String(9_500_000_000 + i), card_id: '9100000000', parent_card_id: null, data_apontamento: '2026-10-20', registro_sha256: 'antigo', pessoa_ref: null,
    versoes: 1, excluido_em: null, flags_qualidade: 0, subgrupo_codigo: 'reuniao', iniciativa_card_id: null,
  }));
  const doServidor = (f: FatoFalso[]): Registro[] => f.map((x) => registroWorklog({ logged_time_id: Number(x.logged_time_id), card_id: Number(x.card_id) }));
  it('controle: com as paginas estaveis, o ausente e excluido (1 de 5)', async () => {
    const f = fs(5);
    const m = await montar({ marca: MARCA, fatos: f }, { registros: doServidor(f.slice(1)), paginar: 2 });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r).toMatchObject({ estado: 'sucesso', excluidos: 1 });
  });
  it('all_pages mudou: nenhuma exclusao, coleta parcial', async () => {
    const f = fs(5);
    const m = await montar({ marca: MARCA, fatos: f }, { registros: doServidor(f.slice(1)), paginar: 2, paginasInformadas: (p, reais) => (p === 2 ? reais + 1 : undefined) });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r.excluidos).toBe(0);
    expect(r.estado).toBe('parcial');
    expect(m.e.eventos.size).toBe(0);
  });
  it('pagina 2 com 5xx: nenhuma exclusao, nem do que estava na pagina 1', async () => {
    const f = fs(5);
    const m = await montar({ marca: MARCA, fatos: f }, { registros: doServidor(f.slice(1)), paginar: 2, falharNaPagina: 2 });
    const r = await coletarApontamentos(m.deps, incremental);
    expect(r.excluidos).toBe(0);
    expect(m.e.eventos.size).toBe(0);
  });
  it('so a varredura longa de domingo prova completude: a de 90 dias nao grava `completo`', async () => {
    const f = fs(2);
    const quarta = await montar({ marca: MARCA, fatos: f, cobertura: [incompleto('9100000000')] }, { registros: doServidor(f), paginar: 1 });
    await coletarApontamentos(quarta.deps, incremental);
    expect(quarta.e.cobertura).toEqual([incompleto('9100000000')]);
    const domingo = await montar({ marca: MARCA, fatos: f, cobertura: [incompleto('9100000000')] }, { registros: doServidor(f), paginar: 1 }, new Date('2026-11-02T01:30:00Z'));
    await coletarApontamentos(domingo.deps, incremental);
    expect(domingo.e.cobertura.map((c) => c.estado)).toEqual(['incompleto', 'completo']);
  });
});

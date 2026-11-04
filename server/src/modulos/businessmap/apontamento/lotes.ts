import { CAMPOS_WORKLOG, ErroBusinessMap, TETO_WORKLOG, type ClienteHttp } from '../../../plataforma/http.js';

// Pedido 059 (K-193), A2 e A3, e pedido 063 (K-200, ADR 0025 revisada): leitura do `/loggedTime` por lote de cards. A API PAGINA: cada
// consulta pede `page=1`, lê `pagination.all_pages` e pede `page=2..all_pages`, com os mesmos parâmetros. Cada página é entregue a `aoLer`
// ao chegar (sem juntar milhares de registros em memória); só a ÚLTIMA página de uma consulta lida inteira, com `all_pages` estável e
// todas as páginas 2xx na forma esperada, vem com `completo: true`. Só consulta completa pode gerar exclusão detectada. Falha no meio
// (rede, 5xx, forma) ou `all_pages` que muda no meio (`paginacao_instavel`) deixa a consulta incompleta (os registros já lidos ficam).
// Contingência (resposta SEM `pagination` e com 1000 registros ou mais): não se sabe se há mais; divide ao meio por `card_ids` e, com um
// card só, vai a `lote_no_teto` (INCOMPLETO). `limite-bytes` divide por cards. 401, 403 e limites de execução interrompem tudo (sobem).

/** Cards por pedido (o limite de `LISTA_IDS` do cliente). */
export const LOTE_CARDS = 200;
/** Erros de leitura que não impedem o próximo lote (o lote fica incompleto); os outros (autenticação, limites) param a execução. */
const NAO_FATAIS = new Set(['indisponivel', 'tempo-esgotado', 'http', 'formato']);

/**
 * Uma leitura entregue a `aoLer` (folha): os cards pedidos, os registros recebidos (uma página) e se a consulta ficou completa (nunca fonte
 * de exclusão se não ficou). `completo: true` só na folha que fecha a consulta; página intermediária vem `completo: false` e `falha: null`.
 */
export interface Folha {
  cards: readonly string[];
  itens: readonly unknown[];
  completo: boolean;
  /** Código da falha (`lote_no_teto`, `paginacao_instavel`, `limite-bytes` ou o tipo do erro de leitura); `null` sem falha (página intermediária ou completa). */
  falha: string | null;
}

/** Filtros do `/loggedTime`: `from_date` (data do apontamento) ou `logged_from` (quando foi registrado), conforme a passagem. */
export type FiltroWorklog = Readonly<Record<string, string>>;

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Registros do corpo: lista direta, `{ data: [...] }` ou `{ data: { data: [...] } }`; qualquer outra forma é erro (nunca "lote vazio"). */
export function itensDoWorklog(corpo: unknown): unknown[] {
  const d = Array.isArray(corpo) ? corpo : ehObjeto(corpo) ? corpo.data : undefined;
  const itens = Array.isArray(d) ? d : ehObjeto(d) ? d.data : undefined;
  if (!Array.isArray(itens)) throw new ErroBusinessMap('formato', 'GET /loggedTime: resposta fora do formato esperado');
  return itens;
}

/** Máximo de páginas por consulta que o cliente aceita em `page` (`CONSULTA_WORKLOG`). */
export const MAX_PAGINAS_CONSULTA = 9999;

/** `pagination.all_pages` do corpo (`{ data: { data, pagination } }` ou `{ data, pagination }`); `null` se a resposta não traz paginação. */
export function paginasDoWorklog(corpo: unknown): number | null {
  const d = ehObjeto(corpo) ? corpo : undefined;
  const aninhado = d !== undefined && ehObjeto(d.data) ? d.data : undefined;
  const pag = aninhado?.pagination ?? d?.pagination;
  if (pag === undefined || pag === null) return null;
  const todas = ehObjeto(pag) ? pag.all_pages : undefined;
  if (typeof todas !== 'number' || !Number.isInteger(todas) || todas < 0 || todas > MAX_PAGINAS_CONSULTA) {
    throw new ErroBusinessMap('formato', 'GET /loggedTime: paginação fora do formato esperado');
  }
  return todas;
}

/**
 * Lê um lote de cards, página a página, e entrega cada folha (na ordem dos cards) a `aoLer`. Erro fatal sobe; erro de leitura vira folha
 * incompleta (nunca "completo" por engano).
 */
export async function lerLote(
  cliente: Pick<ClienteHttp, 'get'>, cards: readonly string[], filtro: FiltroWorklog, aoLer: (f: Folha) => Promise<void>,
): Promise<void> {
  const base = { card_ids: cards.join(','), include_logged_time_for_subtasks: 1, fields: CAMPOS_WORKLOG, per_page: TETO_WORKLOG, ...filtro };
  const dividir = async (): Promise<void> => {
    const meio = Math.ceil(cards.length / 2);
    await lerLote(cliente, cards.slice(0, meio), filtro, aoLer);
    await lerLote(cliente, cards.slice(meio), filtro, aoLer);
  };
  let todas = 1;
  for (let pagina = 1; pagina <= todas; pagina += 1) {
    let itens: unknown[];
    let paginas: number | null;
    try {
      const corpo = await cliente.get('/loggedTime', { consulta: { ...base, page: pagina } });
      itens = itensDoWorklog(corpo);
      paginas = paginasDoWorklog(corpo);
    } catch (e) {
      if (!(e instanceof ErroBusinessMap) || !(NAO_FATAIS.has(e.tipo) || e.tipo === 'limite-bytes')) throw e;
      // resposta grande demais: divide por cards (relê; a staging não duplica); erro de rede ou de forma não divide
      if (e.tipo === 'limite-bytes' && cards.length > 1) return dividir();
      return aoLer({ cards, itens: [], completo: false, falha: e.tipo });
    }
    if (paginas === null) {
      // contingência: sem `pagination` não há como saber se há mais registros; página cheia é tratada como possivelmente truncada
      if (pagina > 1) return aoLer({ cards, itens, completo: false, falha: 'paginacao_instavel' });
      if (itens.length < TETO_WORKLOG) return aoLer({ cards, itens, completo: true, falha: null });
      if (cards.length > 1) return dividir();
      return aoLer({ cards, itens, completo: false, falha: 'lote_no_teto' });
    }
    if (pagina === 1) todas = Math.max(paginas, 1);
    // `all_pages` mudou no meio: a ordem pode ter deslocado registros entre páginas; a consulta fica incompleta (sem exclusão)
    if (paginas !== todas && !(pagina === 1 && paginas === 0)) return aoLer({ cards, itens, completo: false, falha: 'paginacao_instavel' });
    await aoLer({ cards, itens, completo: pagina === todas, falha: null });
  }
}

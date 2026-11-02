import { CAMPOS_WORKLOG, ErroBusinessMap, TETO_WORKLOG, type ClienteHttp } from '../../../plataforma/http.js';

// Pedido 059 (K-193), A2 e A3: leitura do `/loggedTime` por lote de cards (ADR 0025 itens 2 e 4). A API NÃO pagina: o lote vem inteiro,
// até `per_page` (1000). Lote que volta com 1000 registros ou mais é tratado como possivelmente truncado: é dividido ao meio por
// `card_ids` e repedido, até ficar abaixo do teto. Lote de UM card ainda no teto vai a falha `lote_no_teto` e fica INCOMPLETO. Só lote
// completo (2xx, abaixo do teto, forma esperada) pode gerar exclusão detectada. 401, 403 e limites de execução interrompem tudo (sobem).

/** Cards por pedido (o limite de `LISTA_IDS` do cliente). */
export const LOTE_CARDS = 200;
/** Erros de leitura que não impedem o próximo lote (o lote fica incompleto); os outros (autenticação, limites) param a execução. */
const NAO_FATAIS = new Set(['indisponivel', 'tempo-esgotado', 'http', 'formato']);

/** Uma leitura final (folha): os cards pedidos, os registros recebidos e se o lote é completo (nunca fonte de exclusão se não for). */
export interface Folha {
  cards: readonly string[];
  itens: readonly unknown[];
  completo: boolean;
  /** Código da falha (`lote_no_teto`, `limite-bytes` ou o tipo do erro de leitura); `null` se o lote é completo. */
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

/**
 * Lê um lote de cards e entrega cada folha (na ordem dos cards) a `aoLer`. Erro fatal sobe; erro de leitura vira folha incompleta.
 */
export async function lerLote(
  cliente: Pick<ClienteHttp, 'get'>, cards: readonly string[], filtro: FiltroWorklog, aoLer: (f: Folha) => Promise<void>,
): Promise<void> {
  let itens: unknown[] = [];
  let falha: string | null = null;
  try {
    const corpo = await cliente.get('/loggedTime', {
      consulta: { card_ids: cards.join(','), include_logged_time_for_subtasks: 1, fields: CAMPOS_WORKLOG, per_page: TETO_WORKLOG, ...filtro },
    });
    itens = itensDoWorklog(corpo);
    if (itens.length >= TETO_WORKLOG) falha = 'lote_no_teto';
  } catch (e) {
    if (!(e instanceof ErroBusinessMap) || !(NAO_FATAIS.has(e.tipo) || e.tipo === 'limite-bytes')) throw e;
    falha = e.tipo;
  }
  if (falha === null) return aoLer({ cards, itens, completo: true, falha: null });
  // resposta grande demais ou no teto: divide ao meio e repede (um card só não divide mais); erro de rede ou de forma não divide
  const divisivel = (falha === 'lote_no_teto' || falha === 'limite-bytes') && cards.length > 1;
  if (!divisivel) return aoLer({ cards, itens: falha === 'lote_no_teto' ? itens : [], completo: false, falha });
  const meio = Math.ceil(cards.length / 2);
  await lerLote(cliente, cards.slice(0, meio), filtro, aoLer);
  await lerLote(cliente, cards.slice(meio), filtro, aoLer);
}

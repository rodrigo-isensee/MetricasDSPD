import { ErroBusinessMap, type ClienteHttp } from '../../plataforma/http.js';
import { cortarComentarioDoToque, type ComentarioCortado } from './allow-list.js';
import { normalizarToque, type ResultadoToque } from './toque.js';

/**
 * Leitura do primeiro toque do O22 (pedido 105, B7a; ADR 0020 revisão 6, R6-2 e R6-4): lista de revisões por card e comentários em lote, ambos só GET pelo
 * cliente de lista fechada. Tudo o que chega passa por `CAMPOS_TOQUE` antes de qualquer outra coisa; `text`, anexos e o resto do comentário morrem em
 * `cortarComentarioDoToque`. Nada é gravado aqui (gravação, migração e carga são do B7b) e nenhuma mensagem de erro leva valor lido.
 */

/** Erros que param a execução inteira (não são do card nem do lote): sobem para quem chama. */
const FATAIS = new Set(['autenticacao', 'limite-requisicoes', 'limite-paginas', 'configuracao', 'host', 'caminho', 'consulta']);
export const MAX_CARDS_POR_LOTE = 200;
const MAX_PAGINAS = 50;
const ID_DE_CARD = /^[1-9]\d{0,11}$/;

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Itens e total de páginas de `{data:[...]}` ou `{data:{data:[...],pagination:{all_pages}}}`; qualquer outra forma é erro de formato (sem eco do corpo). */
function itensDoEnvelope(corpo: unknown, caminho: string): { itens: unknown[]; paginas: number } {
  const d = ehObjeto(corpo) ? corpo.data : undefined;
  if (Array.isArray(d)) return { itens: d, paginas: 1 };
  if (ehObjeto(d) && Array.isArray(d.data)) {
    const todas = ehObjeto(d.pagination) ? d.pagination.all_pages : undefined;
    return { itens: d.data, paginas: typeof todas === 'number' && Number.isSafeInteger(todas) && todas > 1 ? todas : 1 };
  }
  throw new ErroBusinessMap('formato', `GET ${caminho}: envelope fora do formato esperado`);
}

async function lerTodasAsPaginas(cliente: ClienteHttp, caminho: string, base: Readonly<Record<string, string>>): Promise<unknown[]> {
  const itens: unknown[] = [];
  let paginas = 1;
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    if (pagina > MAX_PAGINAS) throw new ErroBusinessMap('limite-paginas', `GET ${caminho}: acima de ${MAX_PAGINAS} páginas`);
    const lido = itensDoEnvelope(await cliente.get(caminho, { consulta: { ...base, page: pagina } }), caminho);
    itens.push(...lido.itens);
    paginas = lido.paginas;
  }
  return itens;
}

/** `GET /cards/{id}/revisions`, todas as páginas, itens crus (o corte por `CAMPOS_TOQUE` é do normalizador). Card com `revision = 1` não gasta chamada (lista vazia por construção). */
export async function lerRevisoesDoCard(cliente: ClienteHttp, cardId: string): Promise<unknown[]> {
  if (!ID_DE_CARD.test(cardId)) throw new ErroBusinessMap('caminho', 'id de card inválido');
  return lerTodasAsPaginas(cliente, `/cards/${cardId}/revisions`, {});
}

export interface OcorrenciaToque {
  /** `toque_forma`: o código do ADR 0020 R6-7. Nunca leva valor. */
  codigo: 'toque_forma';
  /** Só o caminho do campo. */
  caminho: string;
  quantidade: number;
}

export type ComentariosDoCard = { ok: true; comentarios: ComentarioCortado[] } | { ok: false; codigo: string };

export interface ResultadoLoteComentarios {
  porCard: Map<string, ComentariosDoCard>;
  ocorrencias: OcorrenciaToque[];
}

/** Código de falha do lote por tipo do erro do cliente (R6-7): `toque_comentarios_http_<status>` ou `toque_comentarios_<tipo>`. Nunca a mensagem. */
const codigoDaFalha = (e: ErroBusinessMap): string => (e.tipo === 'http' ? `toque_comentarios_http_${String(e.status)}` : `toque_comentarios_${e.tipo}`);

async function lerLote(cliente: ClienteHttp, ids: readonly string[], saida: ResultadoLoteComentarios, contar: (caminho: string) => void): Promise<void> {
  let itens: unknown[];
  try {
    itens = await lerTodasAsPaginas(cliente, '/cards/comments', { card_ids: ids.join(',') });
  } catch (e) {
    if (!(e instanceof ErroBusinessMap) || FATAIS.has(e.tipo)) throw e;
    // R-T8 (A5 do parecer): resposta acima do teto de bytes divide o lote ao meio, até um card; os sublotes que passam ficam lidos.
    if (e.tipo === 'limite-bytes' && ids.length > 1) {
      const meio = Math.ceil(ids.length / 2);
      await lerLote(cliente, ids.slice(0, meio), saida, contar);
      await lerLote(cliente, ids.slice(meio), saida, contar);
      return;
    }
    for (const id of ids) saida.porCard.set(id, { ok: false, codigo: codigoDaFalha(e) });
    return;
  }
  const doLote = new Set(ids);
  const comentarios = new Map<string, ComentarioCortado[]>(ids.map((id) => [id, []]));
  for (const bruto of itens) {
    const c = cortarComentarioDoToque(bruto);
    if (c === null) {
      contar('comments[]');
      continue;
    }
    const id = typeof c.card_id === 'number' ? String(c.card_id) : c.card_id;
    // R-T2 (A2 do parecer): comentário de card que não está no lote pedido é descartado sem gravar e contado por código, sem valor
    if (typeof id !== 'string' || !doLote.has(id)) {
      contar('comments[].card_id');
      continue;
    }
    comentarios.get(id)!.push(c);
  }
  for (const [id, lista] of comentarios) saida.porCard.set(id, { ok: true, comentarios: lista });
}

/**
 * `GET /cards/comments` em lote (R6-2), até 200 cards, todas as páginas, cortado por `CAMPOS_TOQUE` e agrupado por card. Falha HTTP, de tempo ou de forma do
 * lote marca todos os cards dele com o código (nenhum fica "sem comentário"); falha de bytes divide o lote. Erro fatal (autenticação, limite de requisições
 * ou de páginas) sobe. Lote vazio, com mais de 200 ou com id fora da forma é erro de consulta antes da rede.
 */
export async function lerComentariosDoLote(cliente: ClienteHttp, cardIds: readonly string[]): Promise<ResultadoLoteComentarios> {
  if (cardIds.length === 0 || cardIds.length > MAX_CARDS_POR_LOTE || new Set(cardIds).size !== cardIds.length || !cardIds.every((id) => ID_DE_CARD.test(id))) {
    throw new ErroBusinessMap('consulta', 'lote de comentários exige de 1 a 200 ids de card distintos');
  }
  const contagens = new Map<string, number>();
  const saida: ResultadoLoteComentarios = { porCard: new Map(), ocorrencias: [] };
  await lerLote(cliente, cardIds, saida, (caminho) => contagens.set(caminho, (contagens.get(caminho) ?? 0) + 1));
  saida.ocorrencias = [...contagens].map(([caminho, quantidade]) => ({ codigo: 'toque_forma', caminho, quantidade }));
  return saida;
}

export interface DepsToqueDoCard {
  cliente: ClienteHttp;
  cardId: string;
  /** `revision` da listagem. */
  revisao: number;
  /** `created_at` do card em epoch ms. */
  criadoEm: number;
  /** Comentários do card já lidos no lote (`ok: true`). */
  comentarios: readonly ComentarioCortado[];
  /** Relê o `revision` do card na listagem (uma chamada); `null` se não veio. Usada no máximo uma vez, só quando a lista não bate (R6-4). */
  relerRevisao: () => Promise<number | null>;
}

/**
 * Lê e normaliza um card. Lista que não termina em `revision - 1` (curta ou longa): o card pode ter andado entre as duas leituras, então relê o `revision` uma vez e
 * confere de novo. Falha de chamada propaga (o card fica não lido: nenhuma linha de controle nem evento, falha com `id_origem = card_id`, tudo do chamador, R6-4).
 */
export async function lerToqueDoCard(d: DepsToqueDoCard): Promise<ResultadoToque> {
  const itensRevisao = d.revisao === 1 ? [] : await lerRevisoesDoCard(d.cliente, d.cardId);
  const entrada = { cardId: d.cardId, revisao: d.revisao, criadoEm: d.criadoEm, itensRevisao, comentarios: d.comentarios };
  const primeira = normalizarToque(entrada);
  if (primeira.motivo !== 'lista_curta' && primeira.motivo !== 'lista_longa') return primeira;
  const nova = await d.relerRevisao();
  return nova === null || nova === d.revisao ? primeira : normalizarToque({ ...entrada, revisao: nova });
}

/**
 * Allow-list do BusinessMap na fronteira (ADR 0020, itens 4a, 4c, 4d, 4f). Cada entidade tem UMA constante de campos
 * permitidos; o registro gravado é montado só a partir dela. Campo fora da lista é descartado, nunca gravado.
 * Nada daqui lê nome, e-mail, autor, texto livre, `discard_comment` nem id de pessoa: esses campos não têm entrada.
 * Campo novo exige alterar a ADR 0020 (e a lista de proibidos no teste, que não deriva destas constantes).
 */

type Objeto = Record<string, unknown>;
const ehObjeto = (v: unknown): v is Objeto => v !== null && typeof v === 'object' && !Array.isArray(v);
const ehEscalar = (v: unknown): v is string | number | boolean | null =>
  v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

/** 4a: campos escalares do card. `block_reason` e `linked_cards`/`custom_fields` têm tratamento próprio (reduzidos). */
export const CAMPOS_CARD = [
  'card_id', 'custom_id', 'title', 'type_id', 'size', 'priority', 'deadline', 'created_at', 'revision', 'last_modified',
  'board_id', 'workflow_id', 'column_id', 'lane_id', 'section', 'last_column_id', 'last_lane_id', 'archived_at',
  'reason_id', 'discarded_at', 'is_blocked', 'current_block_time', 'current_cycle_time', 'first_request_time',
  'first_start_time', 'first_end_time', 'last_request_time', 'last_start_time', 'last_end_time',
] as const;

/** 4c: campos escalares da revisão (`troca_responsavel`, `linked_cards` e `custom_fields` são tratados à parte). */
export const CAMPOS_REVISAO = ['card_id', 'revision', 'created_at', 'replaced_at', 'board_id', 'column_id', 'lane_id'] as const;

/** 4f: tipos de evento do webhook que o receptor grava. Outro tipo recebe 2xx e não é gravado. */
export const TIPOS_WEBHOOK_BM_GRAVADOS = ['card_moved'] as const;
/** 4f: campos do registro do webhook (o corpo bruto nunca é gravado). */
export const CAMPOS_WEBHOOK = ['card_id', 'board_id', 'workflow_id', 'column_id', 'lane_id', 'column_id_anterior', 'lane_id_anterior'] as const;

export const VALOR_DESCONHECIDO = 'desconhecido';

const copiarEscalares = (origem: Objeto, campos: readonly string[], destino: Objeto): void => {
  for (const c of campos) if (ehEscalar(origem[c])) destino[c] = origem[c];
};

/** `(card_id, link_type)` por vínculo; o resto do vínculo (títulos, responsáveis) fica fora. */
function reduzirVinculos(v: unknown): { card_id: unknown; link_type: unknown }[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.filter(ehObjeto).map((l) => ({ card_id: ehEscalar(l.card_id) ? l.card_id : null, link_type: ehEscalar(l.link_type) ? l.link_type : null }));
}

/**
 * 4d: domínios fechados de campos customizados: `field_id` -> (valor recebido -> código de `ref_dominio`).
 * Sem entrada para o `field_id`, o campo não entra. Valor fora do domínio vira `desconhecido`, nunca o texto recebido.
 * Campo de tipo usuário ou texto livre não deve constar aqui (ADR 0020, 4d): o cartão para e a decisão volta ao usuário.
 */
export type DominiosCamposCustomizados = ReadonlyMap<string, ReadonlyMap<string, string>>;

export function reduzirCamposCustomizados(
  campos: unknown, dominios: DominiosCamposCustomizados,
): { field_id: string; valor: string }[] | undefined {
  if (!Array.isArray(campos)) return undefined;
  const saida: { field_id: string; valor: string }[] = [];
  for (const c of campos) {
    if (!ehObjeto(c) || (typeof c.field_id !== 'string' && typeof c.field_id !== 'number')) continue;
    const id = String(c.field_id);
    const dominio = dominios.get(id);
    if (dominio === undefined) continue;
    const bruto = c.value;
    const chave = typeof bruto === 'string' || typeof bruto === 'number' ? String(bruto) : undefined;
    saida.push({ field_id: id, valor: (chave !== undefined ? dominio.get(chave) : undefined) ?? VALOR_DESCONHECIDO });
  }
  return saida;
}

/** 4a: registro do card para a `stg_card`. Ordem das chaves = ordem da constante (hash estável). */
export function registroCard(card: unknown, dominios: DominiosCamposCustomizados = new Map()): Objeto {
  const entrada = ehObjeto(card) ? card : {};
  const r: Objeto = {};
  copiarEscalares(entrada, CAMPOS_CARD, r);
  const bloqueio = entrada.block_reason;
  if (ehObjeto(bloqueio) && ehEscalar(bloqueio.reason_id)) r.block_reason_id = bloqueio.reason_id;
  const stats = entrada.child_card_stats;
  if (ehObjeto(stats)) {
    const s: Objeto = {};
    for (const k of Object.keys(stats).sort()) { const v = stats[k]; if (typeof v === 'number' || typeof v === 'boolean') s[k] = v; }
    r.child_card_stats = s;
  }
  const vinculos = reduzirVinculos(entrada.linked_cards);
  if (vinculos) r.linked_cards = vinculos;
  const campos = reduzirCamposCustomizados(entrada.custom_fields, dominios);
  if (campos) r.custom_fields = campos;
  return r;
}

/** 4c: registro da revisão. `trocaResponsavel` vem calculado em memória pelo chamador; owner/co_owner/user_id nunca entram. */
export function registroRevisao(
  revisao: unknown, trocaResponsavel: boolean | undefined, dominios: DominiosCamposCustomizados = new Map(),
): Objeto {
  const entrada = ehObjeto(revisao) ? revisao : {};
  const r: Objeto = {};
  copiarEscalares(entrada, CAMPOS_REVISAO, r);
  if (trocaResponsavel !== undefined) r.troca_responsavel = trocaResponsavel;
  const vinculos = reduzirVinculos(entrada.linked_cards);
  if (vinculos) r.linked_cards = vinculos;
  const campos = reduzirCamposCustomizados(entrada.custom_fields, dominios);
  if (campos) r.custom_fields = campos;
  return r;
}

/** Serialização canônica (chaves em ordem, em todos os níveis): o hash de dedupe não depende da ordem da resposta da API. */
export function serializar(v: unknown): string {
  const ordenar = (x: unknown): unknown => Array.isArray(x) ? x.map(ordenar)
    : ehObjeto(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, ordenar(x[k])])) : x;
  return JSON.stringify(ordenar(v));
}

const TIPO_SEGURO = /^[a-z0-9_.]{1,40}$/;

/**
 * 4f: registro do webhook, ou `null` se o tipo do evento estiver fora da lista. O formato do payload do BusinessMap
 * ainda não foi lido (`businessmap-api-configuracao.md` §4.8): lê o tipo em `evento` e os ids no topo ou em `card`
 * (posição atual) e em `anterior` (posição anterior). Revisar quando o artigo de webhooks for anexado.
 */
export function registroWebhook(payload: unknown): Objeto | null {
  const p = ehObjeto(payload) ? payload : {};
  const tipo = p.evento;
  if (typeof tipo !== 'string' || !(TIPOS_WEBHOOK_BM_GRAVADOS as readonly string[]).includes(tipo)) return null;
  const card = ehObjeto(p.card) ? p.card : {};
  const anterior = ehObjeto(p.anterior) ? p.anterior : {};
  const r: Objeto = { evento: tipo };
  const lido: Objeto = {
    card_id: card.id ?? card.card_id ?? p.card_id, board_id: card.board_id ?? p.board_id, workflow_id: card.workflow_id ?? p.workflow_id,
    column_id: card.column_id ?? p.column_id, lane_id: card.lane_id ?? p.lane_id,
    column_id_anterior: anterior.column_id ?? p.column_id_anterior, lane_id_anterior: anterior.lane_id ?? p.lane_id_anterior,
  };
  for (const c of CAMPOS_WEBHOOK) if (typeof lido[c] === 'string' || typeof lido[c] === 'number') r[c] = lido[c];
  const instante = p.timestamp ?? p.occurred_at;
  if (typeof instante === 'string' && instante.length <= 40) r.instante = instante;
  return r;
}

/** Para log: só o tipo, e só se tiver a forma de um identificador (nunca texto arbitrário do corpo). */
export function tipoParaLog(payload: unknown): string {
  const t = ehObjeto(payload) ? payload.evento : undefined;
  return typeof t === 'string' && TIPO_SEGURO.test(t) ? t : 'invalido';
}

/**
 * 4b: responsáveis do card (`owner_user_id` e `co_owner_ids`), só em memória, como ids em texto, sem repetição e em ordem.
 * `null` = o card não trouxe nenhum dos dois campos (desconhecido): quem projeta não sobrescreve o valor já gravado.
 */
export function extrairResponsaveis(card: unknown): string[] | null {
  if (!ehObjeto(card)) return null;
  const dono = card.owner_user_id;
  const co = card.co_owner_ids;
  if (dono === undefined && co === undefined) return null;
  const ids = new Set<string>();
  const add = (v: unknown): void => { if (typeof v === 'string' || typeof v === 'number') ids.add(String(v)); };
  add(dono);
  if (Array.isArray(co)) co.forEach(add);
  return [...ids].sort();
}

import { createHash } from 'node:crypto';
import { CLASSES_SERVICO, type ClasseServico } from '@metricas-dspd/contratos';

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

/**
 * 4c (E2.46): campos escalares de cada transição de coluna da listagem de `/cards` (`expand=transitions`). Sem autor nem outro id de
 * pessoa; `start` e `end` são texto de data e hora (`end` nulo = ainda na coluna). `card_id` vem do card, não da transição.
 */
export const CAMPOS_TRANSICAO = ['board_id', 'workflow_id', 'lane_id', 'column_id', 'section', 'start', 'end'] as const;

/** 4f: tipos de evento do webhook que o receptor grava. Outro tipo recebe 2xx e não é gravado. */
export const TIPOS_WEBHOOK_BM_GRAVADOS = ['card_moved'] as const;
/** 4f: campos do registro do webhook (o corpo bruto nunca é gravado). */
export const CAMPOS_WEBHOOK = ['card_id', 'board_id', 'workflow_id', 'column_id', 'lane_id', 'column_id_anterior', 'lane_id_anterior'] as const;

/**
 * 4h (ADR 0020, revisão 4, R4-2; pedido 059): campos do apontamento (worklog, `GET /loggedTime`) que vão à staging, com o nome da API.
 * `date` e `time` (segundos) viram `data_apontamento` e `segundos`; `logged_at` vira `registrado_em`. NUNCA: `comment` (nem hash, nem
 * trecho: só a saída da classificação, abaixo), `user_id` (só em memória até o projetor), título, `reporter`, e-mail, campo fora da lista.
 */
export const CAMPOS_APONTAMENTO = [
  'logged_time_id', 'card_id', 'parent_card_id', 'subtask_id', 'lane_id', 'column_id', 'category_id', 'date', 'time', 'logged_at',
] as const;
/** 4h: saída da classificação do comentário (lista fechada e inteiros) que acompanha o registro; nunca o texto. */
export const CAMPOS_CLASSIFICACAO = ['subgrupo_codigo', 'flags_qualidade', 'qtd_palavras', 'versao_dicionario'] as const;

export const VALOR_DESCONHECIDO = 'desconhecido';

const copiarEscalares = (origem: Objeto, campos: readonly string[], destino: Objeto): void => {
  for (const c of campos) if (ehEscalar(origem[c])) destino[c] = origem[c];
};

/** `(card_id, link_type)` por vínculo; o resto do vínculo (títulos, responsáveis) fica fora. */
function reduzirVinculos(v: unknown): { card_id: unknown; link_type: unknown }[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.filter(ehObjeto).map((l) => ({ card_id: ehEscalar(l.card_id) ? l.card_id : null, link_type: ehEscalar(l.link_type) ? l.link_type : null }));
}

/** Fields do quadro que nunca entram no mapa, nem pelo arquivo nem pelo `ref_dominio`: 36 (ID Acelerato, H-16) e 42 (Responsável CR, pessoa). */
export const CAMPOS_CUSTOMIZADOS_FORA = ['36', '42'] as const;

/**
 * Colunas de lista de `dim_card` que um campo customizado pode alimentar (enum fechado, pedido 069 L2-a). `causa_raiz` (pedido 105, E7.86): causa raiz do bug do fluxo, campo 48 "Causa Raiz" (dropdown) do BusinessMap; a coluna já existe em `dim_card` e `dim_card_versao`.
 * Pedido 105 (E7.3): `classe_servico` saiu daqui; a classe vem só das etiquetas do card (ADR 0020 4i), uma fonte por coluna.
 * `fase_deteccao` saiu em 105 (E7.5): vem só da projeção pela coluna do pai do bug, para não haver duas fontes.
 * `tamanho_declarado` saiu em 105 (E7.102): vem só do `size` nativo do card pela régua do time (`tamanho_regua` de `ref_dominio`); a allow-list aperta, não afrouxa.
 */
export const COLUNAS_LISTA = [
  'sistema', 'area_solicitante', 'fornecedor', 'objetivo_estrategico',
  'responsabilidade_atraso', 'origem_demanda', 'severidade', 'causa_raiz',
] as const;

/**
 * 4d: domínios fechados de campos customizados: `field_id` -> (valor recebido -> código de `ref_dominio`).
 * Sem entrada para o `field_id`, o campo não entra. Valor fora do domínio vira `desconhecido`, nunca o texto recebido.
 * Campo de tipo usuário ou texto livre não deve constar aqui (ADR 0020, 4d): o cartão para e a decisão volta ao usuário.
 */
export type DominiosCamposCustomizados = ReadonlyMap<string, ReadonlyMap<string, string>>;

const ehChave = (v: unknown): v is string | number => typeof v === 'string' || typeof v === 'number';
/** Chaves candidatas da seleção de um campo: `value` e, na forma de lista, o `value_id` e o `value` de cada item de `values[]` (nunca outra chave). */
function chavesDoValor(c: Objeto): string[] {
  const chaves: string[] = [];
  if (ehChave(c.value)) chaves.push(String(c.value));
  if (Array.isArray(c.values)) {
    for (const v of c.values) {
      if (ehObjeto(v)) {
        if (ehChave(v.value_id)) chaves.push(String(v.value_id));
        if (ehChave(v.value)) chaves.push(String(v.value));
      } else if (ehChave(v)) chaves.push(String(v));
    }
  }
  return chaves;
}

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
    // E7.86: a seleção vem em `value` (escalar) ou em `values[]` (dropdown, `value_id`). Só entra o código do domínio fechado; o resto do objeto
    // (texto da opção, descrição de "Outros", qualquer chave extra) nunca é lido para a saída.
    const valor = chavesDoValor(c).map((k) => dominio.get(k)).find((v) => v !== undefined);
    saida.push({ field_id: id, valor: valor ?? VALOR_DESCONHECIDO });
  }
  return saida;
}

/**
 * 4i (ADR 0020, pedido 105 E7.3): etiquetas do card só como CLASSE de serviço. `tag_ids` e o catálogo `GET /tags` (id e rótulo) existem só
 * em memória da coleta; ao staging vai apenas `classes_tag` (códigos de `CLASSES_SERVICO`). Rótulo, id de etiqueta, contagem e cor nunca entram.
 */
export type MapaTagsDeClasse = ReadonlyMap<string, ClasseServico>;

/** Forma comparável do rótulo: sem acento, sem caixa e sem espaço, hífen ou sublinhado ("Prazo fixo", "PrazoFixo" e "prazo-fixo" são a mesma). */
const formaDoRotulo = (r: string): string => r.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const CLASSE_PELA_FORMA = new Map<string, ClasseServico>(CLASSES_SERVICO.map((c) => [formaDoRotulo(c), c]));

/** Classe de um rótulo de etiqueta (decisão do dono de 2026-11-15: Urgente, Prioritario, PrazoFixo, Padrao e variações de grafia); `undefined` = não é etiqueta de classe. */
export const classeDoRotuloDeTag = (rotulo: unknown): ClasseServico | undefined =>
  typeof rotulo === 'string' && rotulo.length <= 120 ? CLASSE_PELA_FORMA.get(formaDoRotulo(rotulo)) : undefined;

const idDeTag = (v: unknown): string | null =>
  typeof v === 'number' && Number.isInteger(v) && v > 0 ? String(v) : typeof v === 'string' && /^\d{1,10}$/.test(v) ? String(Number(v)) : null;

/** `tag_id` -> classe, a partir da lista de `GET /tags` (cada item com `tag_id` e `label`). Etiqueta que não é de classe é descartada na hora (nem id, nem rótulo ficam). */
export function mapaDeTagsDeClasse(tags: readonly unknown[]): MapaTagsDeClasse {
  const mapa = new Map<string, ClasseServico>();
  for (const t of tags) {
    if (!ehObjeto(t)) continue;
    const id = idDeTag(t.tag_id);
    const classe = classeDoRotuloDeTag(t.label);
    if (id !== null && classe !== undefined) mapa.set(id, classe);
  }
  return mapa;
}

/** O24: o card veio com ao menos uma etiqueta em `tag_ids` (só decide uma contagem; nada do conteúdo é guardado). */
export const cardTemEtiqueta = (card: unknown): boolean => ehObjeto(card) && Array.isArray(card.tag_ids) && card.tag_ids.length > 0;

/**
 * 4i: classes das etiquetas do card, sem repetição e na ordem de `CLASSES_SERVICO` (hash estável). `tagIds` que não é lista = `undefined`
 * ("não lido": a chave não entra). Elemento que não é id (número ou texto de dígitos) ou objeto com `tag_id` é descartado; id fora do mapa
 * é descartado sem guardar id, rótulo nem quantidade. Lista vazia = lido, sem etiqueta de classe.
 */
export function reduzirTagsDeClasse(tagIds: unknown, mapa: MapaTagsDeClasse): ClasseServico[] | undefined {
  if (!Array.isArray(tagIds)) return undefined;
  const achadas = new Set<ClasseServico>();
  for (const t of tagIds) {
    const id = idDeTag(ehObjeto(t) ? t.tag_id : t);
    const classe = id === null ? undefined : mapa.get(id);
    if (classe !== undefined) achadas.add(classe);
  }
  return CLASSES_SERVICO.filter((c) => achadas.has(c));
}

/** 4a: registro do card para a `stg_card`. Ordem das chaves = ordem da constante (hash estável). */
export function registroCard(card: unknown, dominios: DominiosCamposCustomizados = new Map(), mapaTags?: MapaTagsDeClasse): Objeto {
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
  // 4i: sem mapa (catálogo não lido) a chave não entra e o hash do card não muda
  const classes = mapaTags === undefined ? undefined : reduzirTagsDeClasse(entrada.tag_ids, mapaTags);
  if (classes) r.classes_tag = classes;
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

/** 4c (E2.46): registro de uma transição de coluna; `cardId` é o do card lido (ordem das chaves fixa: `card_id` e depois a constante). */
export function registroTransicao(transicao: unknown, cardId: string): Objeto {
  const entrada = ehObjeto(transicao) ? transicao : {};
  const r: Objeto = { card_id: cardId };
  copiarEscalares(entrada, CAMPOS_TRANSICAO, r);
  return r;
}

/** Transições do card, na ordem recebida; só objetos (o resto é descartado). `undefined` = o card não trouxe `transitions`. */
export function transicoesDoCard(card: unknown): unknown[] | undefined {
  if (!ehObjeto(card) || !Array.isArray(card.transitions)) return undefined;
  return card.transitions.filter(ehObjeto);
}

/**
 * `revision_id` determinístico da transição (E2.46): 32 caracteres hexadecimais (limite de `stg_revision.revision_id`) do hash de
 * coluna, entrada e saída. A entrada identifica a transição; a saída entra porque uma transição aberta que fecha depois é fato novo
 * e o staging é append-only (a aberta fica, a fechada é outra linha; a recoleta igual não duplica). `null` = sem coluna ou sem entrada.
 */
export function revisionIdDaTransicao(transicao: unknown): string | null {
  if (!ehObjeto(transicao)) return null;
  const { column_id: coluna, start, end } = transicao;
  if ((typeof coluna !== 'number' && typeof coluna !== 'string') || typeof start !== 'string' || start === '') return null;
  const fim = typeof end === 'string' ? end : '';
  return createHash('sha256').update(`${String(coluna)}\u0000${start}\u0000${fim}`).digest('hex').slice(0, 32);
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

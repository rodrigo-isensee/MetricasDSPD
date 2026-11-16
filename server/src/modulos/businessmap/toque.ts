import { contaComoToque } from '@metricas-dspd/metricas/coletor';
import { cortarRevisaoDoToque, type ComentarioCortado } from './allow-list.js';
import { instanteDoBm } from './normalizador.js';

/**
 * Normalizador do primeiro toque do O22 (pedido 105, B7a; ADR 0020 revisão 6, R6-3 a R6-5). Função pura: recebe a lista de revisões como veio da API e os
 * comentários já cortados por `CAMPOS_TOQUE`, e devolve eventos (instante e booleano), o estado da leitura e o motivo em código. `user_id` e autor só existem
 * em memória até `contaComoToque` e NÃO saem daqui; nenhum erro ou resultado carrega valor lido (A3 do parecer de segurança: só código e caminho do campo).
 * Nada é gravado neste arquivo (a gravação é de `toque-gravacao.ts`).
 */

/**
 * Leitura literal da OpenAPI de `getCardRevisions` ("the user who made the revision"): o `user_id` do item `n` é de quem fez a revisão `n`, e o instante da
 * atualização que criou a revisão `n` é o `replaced_at` do item `n - 1`. Se o experimento P1 do plano do O22 mostrar o contrário, troca-se só esta constante
 * (critério de reversão (iv) da R6). Único lugar que decide de que item vem o autor.
 */
export const AUTOR_DO_TOQUE = { deslocamento: 0 } as const;

export type EstadoLeitura = 'lido' | 'autor_pendente' | 'leitura_incompleta';
export type MotivoLeitura = 'lista_com_buraco' | 'lista_curta' | 'lista_longa' | 'instante_invalido' | 'revisao_invalida' | 'comentario_invalido';

export interface EventoToque {
  /** `r<n>` (a atualização que criou a revisão `n >= 2`) ou `c<comment_id>`. */
  eventoId: string;
  /** Instante em epoch ms. */
  ocorridoEm: number;
  contaComoToque: boolean;
}

export interface ResultadoToque {
  cardId: string;
  /** `revision` conferido (o da listagem), `null` se não era um inteiro positivo. */
  revisaoLida: number | null;
  estado: EstadoLeitura;
  /** Só em `leitura_incompleta`. */
  motivo: MotivoLeitura | null;
  /** Vazio em `leitura_incompleta`: nenhum evento do card é gravado (R6-4). */
  eventos: EventoToque[];
  /** Revisões da lista cujo autor não conta (ausente, nulo, 0 ou fora da forma), para o resumo da carga. */
  revisoesSemAutor: number;
  /** Comentários externos (não contam, 07:07), para o resumo da carga. */
  comentariosExternos: number;
}

export interface EntradaToque {
  cardId: string;
  /** `revision` da listagem do card. */
  revisao: unknown;
  /** `created_at` do card em epoch ms: o toque é estritamente depois dele. */
  criadoEm: number;
  /** Itens de `GET /cards/{id}/revisions`, como vieram (o corte é feito aqui, por `CAMPOS_TOQUE`). */
  itensRevisao: readonly unknown[];
  /** Comentários do card, já cortados por `CAMPOS_TOQUE` e já filtrados ao card. */
  comentarios: readonly ComentarioCortado[];
}

const inteiroPositivo = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0;
const ID_DE_COMENTARIO = /^[1-9]\d{0,14}$/;

function incompleta(cardId: string, revisaoLida: number | null, motivo: MotivoLeitura): ResultadoToque {
  return { cardId, revisaoLida, estado: 'leitura_incompleta', motivo, eventos: [], revisoesSemAutor: 0, comentariosExternos: 0 };
}

/** Conferência da lista (R6-4): começa em 1, sem buraco nem repetição, termina em `revisao - 1`, cada item com `replaced_at` válido. */
function conferirLista(entrada: EntradaToque, revisao: number): { ordenadas: { revision: number; replaced: number; userId: unknown }[] } | MotivoLeitura {
  const itens: { revision: number; replaced: unknown; userId: unknown }[] = [];
  for (const bruto of entrada.itensRevisao) {
    const item = cortarRevisaoDoToque(bruto);
    if (item === null || !inteiroPositivo(item.revision)) return 'revisao_invalida';
    itens.push({ revision: item.revision, replaced: item.replaced_at, userId: item.user_id });
  }
  itens.sort((a, b) => a.revision - b.revision);
  if (itens.length === 0) return revisao === 1 ? { ordenadas: [] } : 'lista_curta';
  if (revisao === 1) return 'lista_longa';
  // primeiro item 1, sem buraco nem repetição: o item i (de 0) tem de ser `i + 1`
  if (itens.some((it, i) => it.revision !== i + 1)) return 'lista_com_buraco';
  const ultima = itens.length;
  if (ultima < revisao - 1) return 'lista_curta';
  if (ultima > revisao - 1) return 'lista_longa';
  const ordenadas: { revision: number; replaced: number; userId: unknown }[] = [];
  for (const it of itens) {
    const ms = instanteDoBm(it.replaced);
    if (ms === null) return 'instante_invalido';
    ordenadas.push({ revision: it.revision, replaced: ms, userId: it.userId });
  }
  return { ordenadas };
}

/**
 * Estado, motivo e eventos de um card (R6-3 a R6-5). Eventos `r2` a `r<revisao - 1>` e todos os comentários, inclusive os que não contam (para a nota e para
 * reprojetar sem reler a API). O evento `r<revisao>` (autor não listado) nunca é gravado: se ele pode ser o primeiro toque, o estado é `autor_pendente`.
 * Falha de leitura NUNCA vira "sem toque": o que não passa na conferência é `leitura_incompleta`, sem evento algum e sem descarte silencioso.
 */
export function normalizarToque(entrada: EntradaToque): ResultadoToque {
  const { cardId } = entrada;
  if (!inteiroPositivo(entrada.revisao)) return incompleta(cardId, null, 'revisao_invalida');
  const revisao = entrada.revisao;
  const lista = conferirLista(entrada, revisao);
  if (typeof lista === 'string') return incompleta(cardId, revisao, lista);

  const eventos: EventoToque[] = [];
  let revisoesSemAutor = 0;
  const { ordenadas } = lista;
  for (let n = 2; n <= revisao - 1; n += 1) {
    const autor = ordenadas[n - 1 + AUTOR_DO_TOQUE.deslocamento]!;
    const conta = contaComoToque({ origem: 'revisao', userId: autor.userId });
    if (!conta) revisoesSemAutor += 1;
    eventos.push({ eventoId: `r${n}`, ocorridoEm: ordenadas[n - 2]!.replaced, contaComoToque: conta });
  }

  let comentariosExternos = 0;
  const vistos = new Set<string>();
  for (const c of entrada.comentarios) {
    const id = typeof c.comment_id === 'number' ? String(c.comment_id) : c.comment_id;
    const ms = instanteDoBm(c.created_at);
    // comentário sem identidade ou sem instante válido não se descarta em silêncio: o card inteiro fica com leitura incompleta. O motivo diz qual dos dois
    // (A2 do review do B7a): `comentario_invalido` é o `comment_id` fora da forma, `instante_invalido` é o `created_at`.
    if (typeof id !== 'string' || !ID_DE_COMENTARIO.test(id)) return incompleta(cardId, revisao, 'comentario_invalido');
    if (ms === null) return incompleta(cardId, revisao, 'instante_invalido');
    if (vistos.has(id)) continue;
    vistos.add(id);
    if (c.author_type === 'external') comentariosExternos += 1;
    eventos.push({ eventoId: `c${id}`, ocorridoEm: ms, contaComoToque: contaComoToque({ origem: 'comentario', tipo: c.author_type, valor: c.author_value }) });
  }

  // `r<revisao>`: instante conhecido (o `replaced_at` do último item), autor não listado. Pode ser o primeiro toque se vier antes de todo toque já conhecido.
  let estado: EstadoLeitura = 'lido';
  if (revisao >= 2) {
    const pendente = ordenadas[revisao - 2]!.replaced;
    const primeiro = Math.min(...eventos.filter((e) => e.contaComoToque && e.ocorridoEm > entrada.criadoEm).map((e) => e.ocorridoEm), Infinity);
    if (pendente > entrada.criadoEm && pendente < primeiro) estado = 'autor_pendente';
  }
  return { cardId, revisaoLida: revisao, estado, motivo: null, eventos, revisoesSemAutor, comentariosExternos };
}

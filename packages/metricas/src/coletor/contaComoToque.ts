/**
 * Regra de autor do primeiro toque do O22 (pedido 105, ADR 0020 revisão 6, R6-5; função `autorEhPessoa` do plano do O22). Parte do coletor que
 * lida com identidade: recebe o autor como veio da API (em memória) e devolve só um booleano. NÃO é exportada pelo `index.ts` público nem por
 * `./businessmap`. Pura: sem log, sem efeito colateral, nunca devolve nem guarda o autor.
 *
 * Não há lista de contas (decisão do dono de 07:05 do dia 16/11): toda atualização com autor de pessoa conta, inclusive a de regra automática
 * que roda sob conta de pessoa. Comentário externo não conta (07:07).
 */

export type AutorDoEvento =
  | { origem: 'revisao'; userId: unknown }
  | { origem: 'comentario'; tipo: unknown; valor: unknown };

const TEXTO_DE_ID = /^[1-9]\d{0,11}$/;

/** Inteiro positivo, em número (seguro) ou em texto sem zero à esquerda, sinal, ponto, espaço ou letra (até 12 dígitos, como `LISTA_IDS`). */
const idPositivo = (v: unknown): boolean => (typeof v === 'number' ? Number.isSafeInteger(v) && v > 0 : typeof v === 'string' && TEXTO_DE_ID.test(v));

/**
 * `true` só se: revisão com `user_id` inteiro positivo; comentário com `author.type === 'internal'` e `author.value` inteiro positivo.
 * Qualquer outra coisa (ausente, nulo, 0, negativo, decimal, texto com letra, `external`, forma inesperada) é `false`.
 */
export function contaComoToque(autor: AutorDoEvento): boolean {
  if (autor.origem === 'revisao') return idPositivo(autor.userId);
  return autor.tipo === 'internal' && idPositivo(autor.valor);
}

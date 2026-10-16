/**
 * Contagem de passagens de mão (O26, D-5' = B), a parte que lida com identidade. ADR 0020: roda só no coletor e no
 * projetor, recebe ids opacos de usuário e devolve só um booleano ou um inteiro. NÃO é exportada pelo `index.ts` público
 * nem por `./businessmap`: nenhum consumidor da API nem o bundle da interface a vê. Nada aqui é pessoa: os ids entram
 * como `string` opaca e nunca são devolvidos, logados nem guardados.
 */

/**
 * Troca de responsável entre duas revisões (D-5' = B, CA-38): verdadeiro se e só se alguém saiu E outro entrou.
 * Incluir co-responsável sem ninguém sair, ou só remover, não conta. Trocar quem é dono entre os mesmos responsáveis
 * não muda o conjunto e não conta. A substituição do conjunto inteiro é um caso de troca.
 */
export function houveTroca(anterior: ReadonlySet<string>, atual: ReadonlySet<string>): boolean {
  let saiu = false
  for (const id of anterior)
    if (!atual.has(id)) {
      saiu = true
      break
    }
  if (!saiu) return false
  for (const id of atual) if (!anterior.has(id)) return true
  return false
}

/**
 * Passagens de um card: soma de `houveTroca` entre revisões consecutivas, na ordem das revisões.
 * - Q-a = 1 passagem: `{A, B} -> {C, D}` numa única revisão conta 1 (uma por revisão).
 * - Q-b = conta: com o card sem responsável no meio (`{A} -> {} -> {B}`), compara com o último conjunto NÃO vazio e
 *   conta 1. Conjunto vazio nunca vira referência e nunca conta.
 * Devolve um inteiro; os conjuntos não saem desta função.
 */
export function contarPassagens(revisoes: readonly ReadonlySet<string>[]): number {
  let referencia: ReadonlySet<string> | null = null
  let passagens = 0
  for (const r of revisoes) {
    if (r.size === 0) continue
    if (referencia !== null && houveTroca(referencia, r)) passagens++
    referencia = r
  }
  return passagens
}

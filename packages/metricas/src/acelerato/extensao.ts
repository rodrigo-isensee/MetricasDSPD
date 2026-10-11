/**
 * Extensão do modelo do Acelerato para as métricas complementares (plano
 * `metricas-complementares.md` §2): mapas por id fora de `Chamado`/`BaseAC`, para não alterar o
 * núcleo nem o hash da base mock. Fonte real futura: tabelas próprias (T4.2). Sem dado de pessoa.
 */
export interface ExtensaoAC {
  /** chamado_id (reabertura) -> chamado_id do incidente original encerrado. */
  reabertoDe: Record<string, string>
  /** chamado_id -> sintoma (rótulo curto, lista fechada por categoria). */
  sintomas: Record<string, string>
  /** chamado_id -> a avaliação de Problema resultou em Registro de Problema. */
  registroProblema: Record<string, boolean>
}

export const EXTENSAO_AC_VAZIA: ExtensaoAC = { reabertoDe: {}, sintomas: {}, registroProblema: {} }

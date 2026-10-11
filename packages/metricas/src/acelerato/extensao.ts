/**
 * Extensão do modelo do Acelerato para as métricas complementares (plano
 * `metricas-complementares.md` §2): mapas por id fora de `Chamado`/`BaseAC`, para não alterar o
 * núcleo nem o hash da base mock. Fonte real futura: tabelas próprias (T4.2). Sem dado de pessoa.
 */
import type { CausaRaiz } from '@metricas-dspd/contratos'

export interface ExtensaoAC {
  /** chamado_id (incidente) -> causa raiz (campo do Metabase na coleta real). */
  causasRaiz: Record<string, CausaRaiz>
  /** chamado_id (campo `reincidente` preenchido) -> chamado_id do ticket anterior indicado nele. */
  reabertoDe: Record<string, string>
  /** chamado_id -> a avaliação de Problema resultou em Registro de Problema. */
  registroProblema: Record<string, boolean>
}

export const EXTENSAO_AC_VAZIA: ExtensaoAC = {
  causasRaiz: {},
  reabertoDe: {},
  registroProblema: {},
}

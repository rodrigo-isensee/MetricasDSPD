import type { ExtensaoAC } from './acelerato/extensao'
import type { ExtensaoBM } from './businessmap/extensao'

/** Extensões das métricas complementares; um bloco por domínio (BM e AC nunca se misturam). */
export interface ExtensoesMetricas {
  bm: ExtensaoBM
  ac: ExtensaoAC
}

export const CONTEXTO_PORTAO = 'homolog-portao'
export const CONTEXTO_NOTURNA = 'homolog-noturna'

/** Consultas ao GitHub (implementadas em main.ts; aqui só o contrato). */
export interface Api {
  /** SHA da ponta da branch, ou `undefined` se ela não existir. */
  shaDaBranch: (branch: string) => Promise<string | undefined>
  /** Estado mais recente do contexto no commit (`success`, `failure`, `pending`) ou `undefined`. */
  estadoDoContexto: (sha: string, contexto: string) => Promise<string | undefined>
}

export interface Pedido {
  shaCandidato: string
  branchOrigem: string
}

export interface Decisao {
  aprovada: boolean
  motivo: string
}

/** Regra do check `homolog-aprovada` (PR para a main). A decisão final continua sendo do usuário. */
export async function decidirAprovacao(api: Api, pedido: Pedido): Promise<Decisao> {
  if (pedido.branchOrigem.startsWith('hotfix/'))
    return { aprovada: true, motivo: 'hotfix: sem soak em homolog; vale a aprovação do usuário' }
  if (pedido.branchOrigem !== 'homolog')
    return {
      aprovada: false,
      motivo: `a main só recebe de homolog (origem: ${pedido.branchOrigem})`,
    }

  const ponta = await api.shaDaBranch('homolog')
  if (ponta === undefined) return { aprovada: false, motivo: 'a branch homolog não existe' }
  if (ponta !== pedido.shaCandidato)
    return {
      aprovada: false,
      motivo: `o candidato ${curto(pedido.shaCandidato)} não é a ponta de homolog (${curto(ponta)})`,
    }

  for (const [contexto, descricao] of [
    [CONTEXTO_PORTAO, 'portão de homolog'],
    [CONTEXTO_NOTURNA, 'rodada noturna'],
  ] as const) {
    const estado = await api.estadoDoContexto(ponta, contexto)
    if (estado !== 'success')
      return {
        aprovada: false,
        motivo: `${descricao} sem sucesso em ${curto(ponta)} (estado: ${estado ?? 'ausente'})`,
      }
  }
  return {
    aprovada: true,
    motivo: `${curto(ponta)} é a ponta de homolog, com portão e noturna verdes`,
  }
}

function curto(sha: string): string {
  return sha.slice(0, 7)
}

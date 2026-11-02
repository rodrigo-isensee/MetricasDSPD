import { FLAGS_QUALIDADE, type RespostaApontamento } from '@metricas-dspd/contratos'
import { taxa } from '../../core/estatistica'
import { ordenarNeutro } from '../../core/ordenar'
import { agrupar, doTime, numeroDe, pctComPiso } from './comum'
import { flagsEfetivas } from './filtros'
import type { LinhaApontamento } from './tipos'

type Qualidade = RespostaApontamento['qualidade']
type PorFlag = Qualidade['geral']['porFlag']

/**
 * Qualidade de um conjunto de apontamentos: "completos" é o apontamento sem nenhuma flag (k de n, percentual só com
 * n >= 20) e cada flag vem com a contagem e o percentual sobre o conjunto (piso de 20, o3). Flags não excludentes
 * (M-11): os percentuais somam mais de 100%. Sempre as cinco flags, na ordem do contrato.
 */
function qualidadeDe(
  linhas: readonly LinhaApontamento[],
  atipicos: ReadonlySet<string>,
): { apontamentos: number; completos: Qualidade['geral']['completos']; porFlag: PorFlag } {
  const n = linhas.length
  const flags = linhas.map((l) => flagsEfetivas(l, atipicos))
  return {
    apontamentos: n,
    completos: taxa(flags.filter((f) => f.length === 0).length, n),
    porFlag: FLAGS_QUALIDADE.map((flag) => {
      const k = flags.filter((f) => f.includes(flag)).length
      return { flag, apontamentos: k, pct: pctComPiso(k, n, n) }
    }),
  }
}

/** A qualidade geral conta todas as linhas; por pessoa, só o time (`outra-area` soma várias pessoas e fica de fora). */
export function calcularQualidade(
  linhas: readonly LinhaApontamento[],
  atipicos: ReadonlySet<string>,
): Qualidade {
  const { completos, porFlag } = qualidadeDe(linhas, atipicos)
  const porPessoa = [...agrupar(doTime(linhas), (l) => l.pessoaRef)].map(([ref, ls]) => ({
    pessoaRef: ref,
    ...qualidadeDe(ls, atipicos),
  }))
  return {
    geral: { completos, porFlag },
    porPessoa: ordenarNeutro(porPessoa, (p) => [numeroDe(p.pessoaRef)]),
    flagsNaoExcludentes: true,
  }
}

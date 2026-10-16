import type { Intervalo } from '@metricas-dspd/contratos'
import {
  civilDeDias,
  diaDeIso,
  diasDesdeCivil,
  mesDeDia,
  primeiroDiaDoMes,
  ultimoDiaDoMes,
} from '../core/calendario'

/**
 * Uma vigência do custo total do DSPD (D-1' = A): `valor` por `periodicidade`, de `vigente_de` até `vigente_ate`
 * (inclusive; `null` = em aberto). É dado externo, informado por pessoa (P:561), e versionado (T2.6): na coleta real vem
 * de `ref_custo_dspd`; no mock não existe (CA-13) e só os testes o informam, por fixture. Um valor só, do DSPD inteiro:
 * nunca por área, equipe ou pessoa. Horas apontadas não entram (briefing 7.1).
 */
export interface VigenciaCustoDspd {
  valor: number
  periodicidade: 'mensal' | 'anual'
  /** AAAA-MM-DD. */
  vigente_de: string
  /** AAAA-MM-DD ou `null`. */
  vigente_ate: string | null
}
export type ConfigCustoDspd = readonly VigenciaCustoDspd[]

/**
 * Custo do período por pró-rata em dias corridos (Q-E7-1, decidida pelo usuário em 2026-10-16): para cada vigência, e
 * dentro de cada mês (ou ano, na periodicidade anual) que ela cobre no período, vale `valor` x dias cobertos / dias do
 * mês (ou do ano). Soma as vigências. `null` quando nenhuma vigência cobre nenhum dia do período (custo não
 * configurado para o período: o E7 mostra só participação, CA-13), nunca 0.
 */
export function custoDoPeriodo(config: ConfigCustoDspd, periodo: Intervalo): number | null {
  const ini = diaDeIso(periodo.inicio)
  const fim = diaDeIso(periodo.fim)
  let total = 0
  let cobriu = false
  for (const v of config) {
    const de = Math.max(diaDeIso(v.vigente_de), ini)
    const ate = Math.min(v.vigente_ate === null ? fim : diaDeIso(v.vigente_ate), fim)
    if (ate < de) continue
    cobriu = true
    for (let d = de; d <= ate;) {
      const { ano } = civilDeDias(d)
      const mes = mesDeDia(d)
      const blocoIni =
        v.periodicidade === 'mensal' ? primeiroDiaDoMes(mes) : diasDesdeCivil(ano, 1, 1)
      const blocoFim =
        v.periodicidade === 'mensal' ? ultimoDiaDoMes(mes) : diasDesdeCivil(ano + 1, 1, 1) - 1
      const ate2 = Math.min(ate, blocoFim)
      total += (v.valor * (ate2 - d + 1)) / (blocoFim - blocoIni + 1)
      d = ate2 + 1
    }
  }
  return cobriu ? total : null
}

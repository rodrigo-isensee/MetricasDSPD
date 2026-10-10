import type { EquipeSustentacaoId } from '@/contracts/filtros'
import {
  diaLocal,
  horasUteisEntre,
  instanteDeIso,
  isoDeDia,
  type Calendario,
} from '../core/calendario'
import type { VersaoCriterio } from '../core/criterios'
import { TOTALIZADORES, ETAPAS_PAUSA, totalizadorDaEtapa, type Totalizador } from './totalizadores'
import type { BaseAC, Chamado, EtapaChamado } from './modelo'

const SLUG_EQUIPE: Record<Chamado['equipe'], EquipeSustentacaoId> = {
  'SSSC TOTVS': 'totvs',
  'SSSC SENIOR': 'senior',
  'SSSC FLUIG': 'fluig',
}

export interface ChamadoCalc {
  c: Chamado
  equipeId: EquipeSustentacaoId
  /** Concluído, com data de finalização, não excluído. */
  fechado: boolean
  /** Fechado e fora da exceção de SLA por registro posterior: entra em tempos e aderência. */
  apuravel: boolean
  etapas: EtapaChamado[]
  /** Horas úteis até o primeiro atendimento. */
  primeiroAtendimentoHU: number | null
  /** Horas úteis até a restauração validada, descontadas as pendências (relógio de resolução). */
  restauracaoHU: number | null
  porTotalizador: Record<Totalizador, number>
  /** Horas úteis de cada etapa (soma por nome). */
  porEtapa: Map<string, number>
  vidaHU: number
}

export interface IndiceAC {
  base: BaseAC
  cal: Calendario
  chamados: ChamadoCalc[]
}

export interface ContextoAC {
  idx: IndiceAC
  hoje: number
  hojeDia: number
  hojeIso: string
  cal: Calendario
  criterios: readonly VersaoCriterio[]
}

const cache = new WeakMap<BaseAC, Map<string, IndiceAC>>()

function construir(base: BaseAC, cal: Calendario, hoje: number): IndiceAC {
  const porChamado = new Map<string, EtapaChamado[]>()
  for (const e of base.etapas) {
    const l = porChamado.get(e.chamado_id)
    if (l) l.push(e)
    else porChamado.set(e.chamado_id, [e])
  }
  const chamados = base.chamados.map((c): ChamadoCalc => {
    const etapas = (porChamado.get(c.chamado_id) ?? []).sort((a, b) => a.entrada - b.entrada)
    const fechado = c.status === 'Concluído' && c.data_finalizado !== null && !c.excluido
    const porTotalizador = Object.fromEntries(TOTALIZADORES.map((t) => [t, 0])) as Record<
      Totalizador,
      number
    >
    const porEtapa = new Map<string, number>()
    let pausa = 0
    const fimRest = c.restaurado_em ?? hoje
    for (const e of etapas) {
      const fim = e.saida ?? (e.etapa === 'Encerrado' ? e.entrada : hoje)
      const h = fim > e.entrada ? horasUteisEntre(e.entrada, fim, cal) : 0
      const t = totalizadorDaEtapa(e.etapa, e.motivo_pendencia)
      if (t) porTotalizador[t] += h
      porEtapa.set(e.etapa, (porEtapa.get(e.etapa) ?? 0) + h)
      if (ETAPAS_PAUSA.includes(e.etapa)) {
        const a = Math.max(e.entrada, c.aberto_em)
        const z = Math.min(fim, fimRest)
        if (z > a) pausa += horasUteisEntre(a, z, cal)
      }
    }
    return {
      c,
      equipeId: SLUG_EQUIPE[c.equipe],
      fechado,
      apuravel: fechado && !c.excecao_sla_registro_posterior,
      etapas,
      primeiroAtendimentoHU:
        c.primeiro_atendimento_em === null
          ? null
          : horasUteisEntre(c.aberto_em, c.primeiro_atendimento_em, cal),
      restauracaoHU:
        c.restaurado_em === null
          ? null
          : horasUteisEntre(c.aberto_em, c.restaurado_em, cal) - pausa,
      porTotalizador,
      porEtapa,
      vidaHU: TOTALIZADORES.reduce((s, t) => s + porTotalizador[t], 0),
    }
  })
  return { base, cal, chamados }
}

export function criarContextoAC(base: BaseAC, hoje: string, cal: Calendario): ContextoAC {
  const ms = instanteDeIso(hoje, cal)
  const chave = `${cal.modo}|${cal.offsetMinutos}|${cal.horasPorDia}|${JSON.stringify(cal.turnos)}|${[...cal.feriados].sort().join(',')}|${ms}`
  let m = cache.get(base)
  if (!m) {
    m = new Map()
    cache.set(base, m)
  }
  let idx = m.get(chave)
  if (!idx) {
    idx = construir(base, cal, ms)
    m.set(chave, idx)
  }
  const dia = diaLocal(ms, cal)
  return {
    idx,
    hoje: ms,
    hojeDia: dia,
    hojeIso: isoDeDia(dia),
    cal,
    criterios: base.config.criterios,
  }
}

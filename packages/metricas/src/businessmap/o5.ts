import type { ResultadoO5, FiltrosFluxo } from '@metricas-dspd/contratos'
import { TIPOS_CARD } from '@metricas-dspd/contratos'
import { estatistica, medianaDe } from '../core/estatistica'
import { amostraBM } from './amostra'
import { baseAmostral, criterios, janelaPercentis, periodoDe, r2, selecionar } from './comum'
import { faixasBloqueio } from './estado'
import type { ContextoBM, MarcosCard } from './indice'
import type { FatoTransicao } from './modelo'
import { diaDeIso, diaLocal, horasUteisEntre } from '../core/calendario'

interface Horas {
  exec: number
  fila: number
  bloqueio: number
}

/**
 * Horas úteis do ciclo (início→entrega) separadas em execução, fila e bloqueio. Decisão do usuário:
 * o bloqueio dentro de coluna de execução sai do tempo de execução (não-execução = fila + bloqueio).
 */
function horasDoCiclo(ctx: ContextoBM, m: MarcosCard): Horas {
  // Card entregue sempre tem transições (a entrega vem delas).
  const trs = ctx.idx.transicoesPorCard.get(m.card.card_id) as readonly FatoTransicao[]
  const blq = faixasBloqueio(ctx, m)
  const h: Horas = { exec: 0, fila: 0, bloqueio: 0 }
  for (const seg of m.segmentos) {
    const fimSeg = seg.fim as number
    trs.forEach((t, i) => {
      const a = Math.max(t.timestamp, seg.ini)
      const b = Math.min(trs[i + 1]?.timestamp ?? Infinity, fimSeg)
      if (a >= b) return
      const total = horasUteisEntre(a, b, ctx.cal)
      let bloqueado = 0
      for (const [x, y] of blq) {
        const lo = Math.max(a, x)
        const hi = Math.min(b, y)
        if (lo < hi) bloqueado += horasUteisEntre(lo, hi, ctx.cal)
      }
      h.bloqueio += bloqueado
      h[t.tipo_coluna === 'execucao' ? 'exec' : 'fila'] += total - bloqueado
    })
  }
  return h
}

/** O5: eficiência de fluxo = horas em execução (sem bloqueio) ÷ ciclo, por tipo. Mediana das razões e razão agregada. */
export function calcularO5(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO5 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story')
  const ini = diaDeIso(janela.inicio)
  const fim = diaDeIso(janela.fim)
  let total = 0
  const tipos = TIPOS_CARD.map((tipo) => {
    const itens = cards
      .filter((m) => m.card.tipo === tipo && m.entrega !== null && m.cicloHU !== null)
      .filter((m) => {
        const d = diaLocal(m.entrega as number, ctx.cal)
        return d >= ini && d <= fim
      })
      .map((m) => horasDoCiclo(ctx, m))
      .filter((h) => h.exec + h.fila + h.bloqueio > 0)
    total += itens.length
    const razoes = itens.map((h) => (h.exec / (h.exec + h.fila + h.bloqueio)) * 100)
    const soma = (k: keyof Horas) => itens.reduce((s, h) => s + h[k], 0)
    const estat = estatistica(itens.length, janela, () => ({
      medianaPct: r2(medianaDe(amostraBM('story', razoes, janela))),
      agregadaPct: r2((soma('exec') / (soma('exec') + soma('fila') + soma('bloqueio'))) * 100),
      horasExecucao: r2(soma('exec')),
      horasFila: r2(soma('fila')),
      horasBloqueio: r2(soma('bloqueio')),
    }))
    return { tipo, n: itens.length, estatistica: estat }
  }).filter((c) => c.n > 0)
  return {
    base: baseAmostral(total, 'itens concluídos', janela),
    criterios: criterios('O5', periodo, janela, ctx),
    janelaPercentis: janela,
    tipos,
  }
}

import type { ResultadoO7 } from '@/contracts/metricas'
import { TIPOS_CARD } from '@/contracts/comum'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { diaDeIso, diaLocal, isoDeDia, somarMeses } from '../core/calendario'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, selecionar } from './comum'
import type { ContextoBM } from './indice'
import { ordenarNeutro } from '../core/ordenar'

/** Tolerância (fração da entrada) abaixo da qual o saldo é considerado estável. Provisória. */
const TOLERANCIA_ESTAVEL = 0.1
const MESES_MINIMOS = 6

/** O7: entrada x saída por tipo e mês, saldo do período e acumulado. Contagens, sem mínimo de 20. */
export function calcularO7(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO7 {
  const periodoEscolhido = periodoDe(ctx, f)
  // o cartão usa o maior entre o período e 6 meses
  const inicioMin = somarMeses(diaDeIso(periodoEscolhido.fim), -MESES_MINIMOS) + 1
  const inicioDia = Math.min(diaDeIso(periodoEscolhido.inicio), inicioMin)
  const periodo = { inicio: isoDeDia(inicioDia), fim: periodoEscolhido.fim }
  const meses = mesesEntre(inicioDia, diaDeIso(periodo.fim), ctx.hojeDia)
  const cards = selecionar(ctx, f, 'story', { incluirInativos: true }).filter(
    (m) => !m.card.eh_subtarefa && m.card.excluido_em === null,
  )
  const ultimos3 = new Set(meses.slice(-3).map((m) => m.chave))

  let entrou = 0
  let saiu = 0
  const porTipoBruto = TIPOS_CARD.map((tipo) => {
    const dele = cards.filter((m) => m.card.tipo === tipo)
    let acum = 0
    let acumTri = 0
    const linhas = meses.map((b) => {
      const entrada = dele.filter((m) => {
        const d = diaLocal(m.entrada, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      }).length
      const saida = dele.filter((m) => {
        if (m.entrega === null) return false
        const d = diaLocal(m.entrega, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      }).length
      acum += entrada - saida
      if (ultimos3.has(b.chave)) acumTri += entrada - saida
      return { mes: b.chave, emAndamento: b.emAndamento, entrada, saida, saldoAcumulado: acum }
    })
    const e = linhas.reduce((s, l) => s + l.entrada, 0)
    const s = linhas.reduce((x, l) => x + l.saida, 0)
    entrou += e
    saiu += s
    const saldo = e - s
    const situacao: 'cresce' | 'estavel' | 'diminui' =
      saldo > Math.max(1, e * TOLERANCIA_ESTAVEL)
        ? 'cresce'
        : saldo < -Math.max(1, e * TOLERANCIA_ESTAVEL)
          ? 'diminui'
          : 'estavel'
    return {
      tipo,
      entrou: e,
      saiu: s,
      saldoPeriodo: saldo,
      saldoAcumulado: saldo,
      situacao,
      entradaAcimaDaSaidaNoTrimestre: acumTri > 0,
      meses: linhas,
    }
  }).filter((t) => t.entrou > 0 || t.saiu > 0)
  const porTipo = ordenarNeutro(porTipoBruto, (t) => [-t.saldoAcumulado, t.tipo])

  return {
    base: baseAmostral(entrou, 'cards que entraram', periodo, {
      n: saiu,
      unidade: 'cards que saíram',
    }),
    criterios: criterios('O7', periodo, periodo, ctx),
    mesesExibidos: meses.length,
    totais: { entrou, saiu },
    porTipo,
  }
}

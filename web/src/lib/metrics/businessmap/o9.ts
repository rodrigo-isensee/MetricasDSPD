import type { ResultadoO9 } from '@/contracts/metricas'
import { TIPOS_CARD, type Intervalo } from '@/contracts/comum'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { diaDeIso, diaLocal } from '../core/calendario'
import { percentisDe, estatistica, publicavel } from '../core/estatistica'
import { contarFaixas, FAIXAS } from '../core/histograma'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, janelaPercentis, periodoDe, r2, selecionar } from './comum'
import { amostraBM } from './amostra'
import type { ContextoBM } from './indice'
import { relogiosDe, type Relogios } from './relogios'

const LENTOS = new Set(['Melhoria', 'Dívida técnica', 'Iniciativa'])
const doisP = (vs: readonly number[], j: Intervalo) => {
  const p = percentisDe(amostraBM('story', vs, j))
  return { p50: r2(p.p50), p85: r2(p.p85) }
}
const arred = (p: { p50: number; p85: number; p95: number }) => ({
  p50: r2(p.p50),
  p85: r2(p.p85),
  p95: r2(p.p95),
})

/** O9: os três relógios por tipo (uma distribuição por vez). */
export function calcularO9(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO9 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const cards = selecionar(ctx, f, 'story')
  const espec = JANELA_POR_GRANULARIDADE.story
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  let total = 0

  const classes = TIPOS_CARD.map((tipo) => {
    const itens = cards
      .filter((m) => m.card.tipo === tipo)
      .map((m) => ({
        dia: m.entrega === null ? 0 : diaLocal(m.entrega, ctx.cal),
        r: relogiosDe(ctx, m),
      }))
      .filter((x): x is { dia: number; r: Relogios } => x.r !== null)
    const noInt = (j: Intervalo) =>
      itens.filter((x) => x.dia >= diaDeIso(j.inicio) && x.dia <= diaDeIso(j.fim)).map((x) => x.r)
    const rs = noInt(janela)
    total += rs.length
    const faixas = LENTOS.has(tipo) ? FAIXAS.lenta : FAIXAS.rapida
    const relogios = estatistica(rs.length, janela, () => {
      const cliente = percentisDe(
        amostraBM(
          'story',
          rs.map((r) => r.cliente),
          janela,
        ),
      )
      const ciclo = percentisDe(
        amostraBM(
          'story',
          rs.map((r) => r.ciclo),
          janela,
        ),
      )
      return {
        cliente: arred(cliente),
        equipe: arred(
          percentisDe(
            amostraBM(
              'story',
              rs.map((r) => r.equipe),
              janela,
            ),
          ),
        ),
        ciclo: arred(ciclo),
        distanciaClienteCicloP50: r2(cliente.p50 - ciclo.p50),
      }
    })
    const histogramas = estatistica(rs.length, janela, () => ({
      cliente: contarFaixas(
        rs.map((r) => r.cliente),
        faixas,
      ),
      equipe: contarFaixas(
        rs.map((r) => r.equipe),
        faixas,
      ),
      ciclo: contarFaixas(
        rs.map((r) => r.ciclo),
        faixas,
      ),
    }))
    const serieMensal = meses.map((b) => {
      const j = janelaMovelDia(Math.min(b.fimDia, ctx.hojeDia), espec)
      const w = noInt(j)
      const ok = publicavel(w.length)
      return {
        mes: b.chave,
        n: w.length,
        cliente: ok
          ? doisP(
              w.map((r) => r.cliente),
              j,
            )
          : null,
        equipe: ok
          ? doisP(
              w.map((r) => r.equipe),
              j,
            )
          : null,
        ciclo: ok
          ? doisP(
              w.map((r) => r.ciclo),
              j,
            )
          : null,
      }
    })
    return { tipo, n: rs.length, relogios, histogramas, serieMensal }
  }).filter((c) => cards.some((m) => m.card.tipo === c.tipo))

  return {
    base: baseAmostral(total, 'itens entregues', janela),
    criterios: criterios('O9', periodo, janela, ctx),
    janelaPercentis: janela,
    classes,
  }
}

import type { ResultadoO15 } from '@metricas-dspd/contratos'
import { FASES_DETECCAO } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { baseAmostral, criterios, periodoDe, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

const GRUPO = {
  Desenvolvimento: 'contido',
  'Revisão de código': 'contido',
  'Teste interno': 'contido',
  'Homologação do negócio': 'negocio',
  Produção: 'producao',
} as const

/** Bugs: Bug interno e Defeito em produção com fase de detecção. Não há meta sobre volume. */
export const ehBug = (m: MarcosCard): boolean =>
  (m.card.tipo === 'Bug interno' || m.card.tipo === 'Defeito em produção') &&
  m.card.fase_deteccao !== null

/** O15: contenção e escape pela fase de detecção. Filtro de tipo não atua (é sobre bugs). */
export function calcularO15(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO15 {
  const periodo = periodoDe(ctx, f)
  const bugs = selecionar(ctx, f, 'story', { semTipo: true })
    .filter(ehBug)
    .filter((m) => {
      const d = diaLocal(m.card.criado_em, ctx.cal)
      return d >= diaDeIso(periodo.inicio) && d <= diaDeIso(periodo.fim)
    })
  const cont = (xs: readonly MarcosCard[]) =>
    taxa(
      xs.filter((m) => m.card.fase_deteccao !== null && GRUPO[m.card.fase_deteccao] === 'contido')
        .length,
      xs.length,
    )
  const esc = (xs: readonly MarcosCard[]) =>
    taxa(xs.filter((m) => m.card.fase_deteccao === 'Produção').length, xs.length)
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  return {
    base: baseAmostral(bugs.length, 'bugs registrados', periodo),
    criterios: criterios('O15', periodo, periodo, ctx),
    fases: FASES_DETECCAO.map((fase) => ({
      fase,
      grupo: GRUPO[fase],
      contagem: bugs.filter((m) => m.card.fase_deteccao === fase).length,
    })),
    contencao: cont(bugs),
    escape: esc(bugs),
    serieMensal: meses.map((b) => {
      const doMes = bugs.filter((m) => {
        const d = diaLocal(m.card.criado_em, ctx.cal)
        return d >= b.inicioDia && d <= b.fimDia
      })
      return {
        mes: b.chave,
        emAndamento: b.emAndamento,
        n: doMes.length,
        contencao: cont(doMes),
        escape: esc(doMes),
      }
    }),
  }
}

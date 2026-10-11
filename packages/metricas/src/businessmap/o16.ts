import type { ResultadoO16, FiltrosFluxo } from '@metricas-dspd/contratos'
import { SEVERIDADES } from '@metricas-dspd/contratos'
import { diaDeIso, fimDoExpediente, horasUteisEntre, isoDeDia } from '../core/calendario'
import { publicavel } from '../core/estatistica'
import { mesesEntre } from '../core/series'
import { ordenarNeutro } from '../core/ordenar'
import { ehBugCard } from './apoio'
import { baseAmostral, criterios, dentro, du, ehDemanda, periodoDe, r2, selecionar } from './comum'
import { arquivadoAte } from './descartado'
import type { ContextoBM, MarcosCard } from './indice'

const SEM_SEVERIDADE = 'Sem severidade' as const

/** O16: estoque e idade de bugs (Bug interno + Defeito em produção). Idade só por id do card. */
export function calcularO16(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO16 {
  const periodo = periodoDe(ctx, f)
  const todos = selecionar(ctx, f, 'story', { semTipo: true })
  const bugs = todos.filter(ehBugCard)
  const entregas = todos.filter(ehDemanda).filter((m) => m.card.tipo !== 'Defeito em produção')
  const aberto = (m: MarcosCard, t: number) =>
    m.card.criado_em <= t && (m.entrega === null || m.entrega > t) && !arquivadoAte(m.card, t)

  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const linhas = meses.map((b) => {
    const j = { inicio: isoDeDia(b.inicioDia), fim: isoDeDia(b.fimDia) }
    const t = Math.min(ctx.hoje, fimDoExpediente(b.fimDia, ctx.cal))
    const entrada = bugs.filter((m) => dentro(ctx, m.card.criado_em, j))
    const nEntregas = entregas.filter((m) => dentro(ctx, m.entrega, j)).length
    const comOrigem = entrada.filter((m) => m.card.origem_bug !== null).length
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      entrada: entrada.length,
      correcao: bugs.filter((m) => dentro(ctx, m.entrega, j)).length,
      estoqueFim: bugs.filter((m) => aberto(m, t)).length,
      densidade: publicavel(nEntregas) ? r2(comOrigem / nEntregas) : null,
    }
  })

  const ref = Math.min(ctx.hoje, fimDoExpediente(diaDeIso(periodo.fim), ctx.cal))
  const abertos = bugs.filter((m) => aberto(m, ref))
  const antigos = ordenarNeutro(abertos, (m) => [m.card.criado_em, m.card.card_id]).slice(0, 10)
  const sev = (m: MarcosCard) => m.card.severidade ?? SEM_SEVERIDADE
  return {
    base: baseAmostral(abertos.length, 'bugs abertos', null),
    criterios: criterios('O16', periodo, periodo, ctx),
    meses: linhas,
    abertosPorSeveridade: [...SEVERIDADES, SEM_SEVERIDADE].map((severidade) => ({
      severidade,
      n: abertos.filter((m) => sev(m) === severidade).length,
    })),
    maisAntigos: antigos.map((m) => ({
      cardId: m.card.card_id,
      tipo: m.card.tipo,
      severidade: sev(m),
      idadeDiasUteis: r2(du(ctx, horasUteisEntre(m.card.criado_em, ref, ctx.cal))),
    })),
  }
}

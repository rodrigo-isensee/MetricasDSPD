import type { ResultadoO1 } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, diasUteisNoIntervalo, fimDoExpediente, isoDeDia } from '../core/calendario'
import { taxa } from '../core/estatistica'
import { slug } from '../slug'
import { baseAmostral, criterios, periodoDe, selecionar } from './comum'
import { estadoEm, serieWip } from './estado'
import type { ContextoBM } from './indice'
import { ordenarNeutro } from '../core/ordenar'

/** O1: WIP e aderência ao limite. Fila e bloqueados contam como WIP. */
export function calcularO1(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO1 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story', { incluirInativos: true }).filter(
    (m) => !m.card.eh_subtarefa && m.card.excluido_em === null,
  )
  const equipesSel =
    f.equipe.length === 0
      ? ctx.idx.base.config.equipes
      : ctx.idx.base.config.equipes.filter((e) => f.equipe.includes(slug(e.nome)))
  const limite = equipesSel.reduce(
    (s, e) => s + (ctx.idx.base.config.limite_wip_fluxo[e.nome] ?? 0),
    0,
  )

  const dias = diasUteisNoIntervalo(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.cal)
  const { wip, bloqueados: bloq } = serieWip(
    ctx,
    cards,
    dias.map((d) => Math.min(ctx.hoje, fimDoExpediente(d, ctx.cal))),
  )
  const out = dias.map((d, i) => ({
    data: isoDeDia(d),
    wip: wip[i] ?? 0,
    bloqueados: bloq[i] ?? 0,
    limite,
    acimaDoLimite: (wip[i] ?? 0) > limite,
  }))

  // retrato de hoje (referência = fim do período)
  const tRef = Math.min(ctx.hoje, fimDoExpediente(diaDeIso(periodo.fim), ctx.cal))
  const naRef = cards.map((m) => ({ m, e: estadoEm(ctx, m, tRef) })).filter((x) => x.e.emWip)
  const total = naRef.length
  const bloqueados = naRef.filter((x) => x.e.bloqueioAberto).length

  let porColuna: ResultadoO1['porColuna'] = null
  if (f.equipe.length === 1) {
    const eq = equipesSel[0]
    if (eq) {
      const quadro = `quadro-${slug(eq.nome)}`
      porColuna = ordenarNeutro(
        ctx.idx.base.colunas.filter(
          (c) => c.quadro_id === quadro && (c.papel === 'trabalho' || c.papel === 'homologacao'),
        ),
        (c) => [c.ordem, c.coluna],
      ).map((c) => {
        const aqui = naRef.filter((x) => x.e.coluna === c.coluna)
        return {
          coluna: c.coluna,
          tipoColuna: c.tipo_coluna,
          itens: aqui.length,
          bloqueados: aqui.filter((x) => x.e.bloqueioAberto).length,
          limite: c.limite_wip,
        }
      })
    }
  }
  const porTipoColuna = (['fila', 'execucao'] as const).map((tc) => {
    const aqui = naRef.filter((x) => x.e.tipoColuna === tc)
    return {
      tipoColuna: tc,
      itens: aqui.length,
      bloqueados: aqui.filter((x) => x.e.bloqueioAberto).length,
    }
  })

  const dentro = out.filter((s) => !s.acimaDoLimite).length
  const diasDentroDoLimite = taxa(dentro, out.length)
  return {
    // Base = dias úteis do período (denominador da taxa); complemento = itens em progresso hoje (spec 4.O1).
    base: baseAmostral(out.length, 'dias úteis', periodo, {
      n: total,
      unidade: 'itens em progresso hoje',
    }),
    criterios: criterios('O1', periodo, periodo, ctx),
    hoje: { total, limite, bloqueados, acimaDoLimite: Math.max(0, total - limite) },
    porColuna,
    porTipoColuna,
    equipesConsideradas: equipesSel.length,
    serie: out,
    diasDentroDoLimite,
    statusMeta:
      diasDentroDoLimite.status === 'ok'
        ? diasDentroDoLimite.pct >= 90
          ? 'dentro'
          : 'fora'
        : 'sem-referencia',
  }
}

import type { ResultadoE4, FiltrosFluxo } from '@metricas-dspd/contratos'
import { NATUREZAS_PROJETO } from '@metricas-dspd/contratos'
import { diaDeIso, diaLocal, isoDeDia } from '../core/calendario'
import { trimestresEntre } from '../core/series'
import { baseAmostral, criterios, dentro, periodoDe, selecionar } from './comum'
import type { ExtensaoBM } from './extensao'
import type { ContextoBM } from './indice'

/** E4: projetos iniciados × concluídos por trimestre, acumulado em aberto e manter × evoluir (natureza fictícia). */
export function calcularE4(ctx: ContextoBM, f: FiltrosFluxo, ext?: ExtensaoBM): ResultadoE4 {
  const periodo = periodoDe(ctx, f)
  const projetos = selecionar(ctx, f, 'projeto', { semEquipe: true, semTipo: true })
  const trimestres = trimestresEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const linhas = trimestres.map((b) => {
    const j = { inicio: isoDeDia(b.inicioDia), fim: isoDeDia(b.fimDia) }
    const iniciados = projetos.filter((m) => dentro(ctx, m.inicio, j))
    return {
      trimestre: b.chave,
      emAndamento: b.emAndamento,
      iniciados: iniciados.length,
      concluidos: projetos.filter((m) => dentro(ctx, m.entrega, j)).length,
      emAbertoAcumulado: projetos.filter(
        (m) =>
          m.inicio !== null &&
          diaLocal(m.inicio, ctx.cal) <= b.fimDia &&
          (m.entrega === null || diaLocal(m.entrega, ctx.cal) > b.fimDia),
      ).length,
      // Sem extensão, a natureza não é publicada (lista vazia), nunca zeros.
      iniciadosPorNatureza:
        ext === undefined
          ? []
          : NATUREZAS_PROJETO.map((natureza) => ({
              natureza,
              n: iniciados.filter((m) => ext.naturezaProjeto[m.card.card_id] === natureza).length,
            })),
    }
  })
  return {
    base: baseAmostral(
      linhas.reduce((t, l) => t + l.iniciados, 0),
      'projetos iniciados',
      periodo,
    ),
    criterios: criterios('E4', periodo, periodo, ctx),
    campoDisponivel: ext !== undefined,
    trimestres: linhas,
  }
}

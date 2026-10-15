import type { ResultadoO11, FiltrosFluxo } from '@metricas-dspd/contratos'
import { TIPOS_CARD } from '@metricas-dspd/contratos'
import { diaDeIso, fimDoExpediente } from '../core/calendario'
import { medianaDe, publicavel } from '../core/estatistica'
import { JANELA_POR_GRANULARIDADE, janelaMovelDia } from '../core/janela'
import { mesesEntre } from '../core/series'
import { amostraBM } from './amostra'
import { baseAmostral, criterios, ehDemanda, periodoDe, r2, selecionar } from './comum'
import { arquivadoAte } from './descartado'
import type { ContextoBM } from './indice'
import type { FatoTransicao } from './modelo'
import { vazaoSemanal } from './apoio'

/**
 * O11: composição do backlog (intervalo Requested -> In Progress). Retrato no fim de cada mês: em
 * definição = seção Requested (papel de coluna `backlog`) × prontos = In Progress comprometido
 * (papel `compromisso`, antes de iniciar o trabalho). Decisão do usuário: sem sexto papel de
 * coluna; a correspondência está em `docs/architecture/regras-metricas.md`. Só retrato.
 */
export function calcularO11(ctx: ContextoBM, f: FiltrosFluxo): ResultadoO11 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story')
  const meses = mesesEntre(diaDeIso(periodo.inicio), diaDeIso(periodo.fim), ctx.hojeDia)
  const instantes = meses.map((b) => Math.min(ctx.hoje, fimDoExpediente(b.fimDia, ctx.cal)))
  // Papel de cada card em cada retrato, numa única passada pelas transições (instantes crescentes).
  const papeis = cards
    .filter((m) => !m.excluido)
    .map((m) => {
      const trs = ctx.idx.transicoesPorCard.get(m.card.card_id) ?? []
      let i = 0
      return instantes.map((t) => {
        while (i < trs.length && (trs[i] as FatoTransicao).timestamp <= t) i++
        const ultima = trs[i - 1]
        const papel =
          ultima && m.card.criado_em <= t
            ? ctx.idx.papelDe(m.card.quadro_id, ultima.coluna_destino)?.papel
            : undefined
        return arquivadoAte(m.card, t) ? undefined : papel
      })
    })
  const linhas = meses.map((b, k) => {
    const noRetrato = cards
      .filter((m) => !m.excluido)
      .map((m, j) => ({ tipo: m.card.tipo, papel: (papeis[j] as (string | undefined)[])[k] }))
    const conta = (papel: string, tipo?: string) =>
      noRetrato.filter((x) => x.papel === papel && (tipo === undefined || x.tipo === tipo)).length
    return {
      mes: b.chave,
      emAndamento: b.emAndamento,
      definicao: conta('backlog'),
      prontos: conta('compromisso'),
      porTipo: TIPOS_CARD.map((tipo) => ({
        tipo,
        definicao: conta('backlog', tipo),
        prontos: conta('compromisso', tipo),
      })).filter((x) => x.definicao + x.prontos > 0),
    }
  })

  const janela = janelaMovelDia(diaDeIso(periodo.fim), JANELA_POR_GRANULARIDADE.story)
  const v = vazaoSemanal(ctx, cards.filter(ehDemanda), janela)
  const mediana = publicavel(v.total) ? medianaDe(amostraBM('story', v.contagens, janela)) : 0
  const ultimo = linhas[linhas.length - 1]
  return {
    base: baseAmostral(ultimo ? ultimo.definicao + ultimo.prontos : 0, 'itens no backlog', null),
    criterios: criterios('O11', periodo, periodo, ctx),
    meses: linhas,
    semanasDeBacklogPronto: ultimo && mediana > 0 ? r2(ultimo.prontos / mediana) : null,
  }
}

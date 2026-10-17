import {
  FAIXAS_PRIMEIRO_TOQUE,
  TIPOS_CARD,
  type FiltrosFluxo,
  type ResultadoO22,
} from '@metricas-dspd/contratos'
import { horasUteisEntre } from '../core/calendario'
import { estatistica, percentisDe } from '../core/estatistica'
import { histograma, type DefFaixa } from '../core/histograma'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  du,
  ehDemanda,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import type { ExtensaoTambemBM } from './extensao'
import type { ContextoBM } from './indice'

/**
 * Faixas do histograma em MEIOS dias úteis (o histograma da biblioteca conta sobre `floor(valor)`): cada valor entra
 * multiplicado por 2, e a ordem acompanha `FAIXAS_PRIMEIRO_TOQUE` (0–0,5; 0,5–1; 1–2; 2–5; 5–10; 10+).
 */
const FAIXAS_EM_MEIOS_DIAS: readonly DefFaixa[] = [
  { min: 0, max: 0 },
  { min: 1, max: 1 },
  { min: 2, max: 3 },
  { min: 4, max: 9 },
  { min: 10, max: 19 },
  { min: 20, max: null },
]

/**
 * O22: primeiro toque (D-9', CA-43). Tempo, em dias úteis, da criação do pedido até o primeiro comentário humano
 * (`primeiro_toque_em`); mudança de coluna e atribuição não contam, e o autor e o texto nunca chegam aqui (ADR 0020). Um bloco por
 * tipo de demanda (regra 7): P50/P85/P95 e histograma só com 20 ou mais pedidos tocados do tipo na janela móvel de 12
 * semanas (o instante do toque define a janela); abaixo disso, "k de n" e histograma nulo. "Sem toque" é retrato de
 * hoje: pedidos abertos cujo primeiro toque ainda não existe, com a idade do mais antigo. Sem a extensão (ou sem o
 * campo do card, que é "sem dado" e não "sem toque"), o card não entra em nenhuma das duas contas.
 */
export function calcularO22(
  ctx: ContextoBM,
  f: FiltrosFluxo,
  ext?: ExtensaoTambemBM,
): ResultadoO22 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'story')
  const toques = ext?.primeiroToque ?? {}
  const cards = selecionar(ctx, f, 'story')
    .filter(ehDemanda)
    .filter((m) => toques[m.card.card_id] !== undefined)
  let total = 0
  const porTipo = TIPOS_CARD.flatMap((tipo) => {
    const doTipo = cards.filter((m) => m.card.tipo === tipo)
    const tocados = doTipo.flatMap((m) => {
      const t = toques[m.card.card_id]
      if (t === null || t === undefined) return []
      if (t < m.card.criado_em || t > ctx.hoje || !dentro(ctx, t, janela)) return []
      return [r2(du(ctx, horasUteisEntre(m.card.criado_em, t, ctx.cal)))]
    })
    const semToque = doTipo
      .filter(
        (m) =>
          toques[m.card.card_id] === null &&
          m.entrega === null &&
          !m.arquivadoSemDesfecho &&
          m.card.criado_em <= ctx.hoje,
      )
      .map((m) => r2(du(ctx, horasUteisEntre(m.card.criado_em, ctx.hoje, ctx.cal))))
    if (tocados.length === 0 && semToque.length === 0) return []
    total += tocados.length
    const faixas = histograma(
      amostraBM(
        'story',
        tocados.map((v) => v * 2),
        janela,
      ),
      FAIXAS_EM_MEIOS_DIAS,
    )
    return [
      {
        tipo,
        distribuicao: estatistica(tocados.length, janela, () => {
          const p = percentisDe(amostraBM('story', tocados, janela))
          return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
        }),
        histograma:
          faixas === null
            ? null
            : faixas.map((x, i) => ({
                faixa: FAIXAS_PRIMEIRO_TOQUE[i] as string,
                itens: x.contagem,
              })),
        semToque: {
          itens: semToque.length,
          maisAntigoDiasUteis:
            semToque.length === 0 ? null : semToque.reduce((a, b) => Math.max(a, b), 0),
        },
      },
    ]
  })
  return {
    base: baseAmostral(total, 'pedidos com primeiro toque', janela),
    criterios: criterios('O22', periodo, janela, ctx),
    segmentoPor: 'tipo',
    porTipo,
  }
}

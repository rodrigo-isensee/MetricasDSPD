import type { FiltrosFluxo, ResultadoE9 } from '@metricas-dspd/contratos'
import { diaLocal, horasUteisEntre, isoDeDia } from '../core/calendario'
import { estatistica, percentisDe } from '../core/estatistica'
import { JANELA_POR_GRANULARIDADE, janelaMovel } from '../core/janela'
import { ordenarNeutro } from '../core/ordenar'
import { amostraBM } from './amostra'
import { baseAmostral, criterios, du, r2, selecionar } from './comum'
import { concluidosDeProjeto } from './e1'
import type { ContextoBM } from './indice'

/** Faixas fixas da especificação (dias úteis desde a criação do card): limite superior inclusivo de cada uma. */
export const FAIXAS_E9 = [
  { ate: 30, rotulo: '0–30' },
  { ate: 90, rotulo: '31–90' },
  { ate: 180, rotulo: '91–180' },
] as const
export const FAIXA_E9_ACIMA = 'mais de 180'

export const faixaE9 = (idadeDiasUteis: number): string =>
  FAIXAS_E9.find((x) => idadeDiasUteis <= x.ate)?.rotulo ?? FAIXA_E9_ACIMA

/**
 * E9: projetos aprovados e ainda não iniciados. Retrato de hoje (o período não atua): card de projeto sem início
 * e sem entrega, fora de descartados e de arquivados sem desfecho. A idade é em dias úteis desde `criado_em`, que
 * nasce logo após a aprovação (R-6). A referência é o P85 do "antes do início" dos projetos concluídos, importado
 * do E1 (`concluidosDeProjeto`, nunca recalculado aqui), na janela de 12 semanas que termina hoje; só com 20 ou mais.
 */
export function calcularE9(ctx: ContextoBM, f: FiltrosFluxo): ResultadoE9 {
  const janela = janelaMovel(ctx.hojeIso, JANELA_POR_GRANULARIDADE.projeto)
  const projetos = selecionar(ctx, f, 'projeto', { semEquipe: true, semTipo: true })
    .filter((m) => m.inicio === null && m.entrega === null && !m.arquivadoSemDesfecho)
    .map((m) => {
      const idadeDiasUteis = r2(du(ctx, horasUteisEntre(m.entrada, ctx.hoje, ctx.cal)))
      return {
        cardId: m.card.card_id,
        codigo: m.card.card_id,
        titulo: m.card.titulo,
        criadoEm: isoDeDia(diaLocal(m.entrada, ctx.cal)),
        idadeDiasUteis,
        faixa: faixaE9(idadeDiasUteis),
      }
    })
  const concluidos = concluidosDeProjeto(ctx, f).filter((i) => {
    const d = diaLocal(i.entrega, ctx.cal)
    return isoDeDia(d) >= janela.inicio && isoDeDia(d) <= janela.fim
  })
  return {
    base: baseAmostral(projetos.length, 'projetos aguardando início', null, {
      n: concluidos.length,
      unidade: 'projetos concluídos na janela (referência)',
    }),
    criterios: criterios('E9', janela, janela, ctx),
    projetos: ordenarNeutro(projetos, (p) => [-p.idadeDiasUteis, p.cardId]),
    referenciaP85: estatistica(concluidos.length, janela, () => ({
      p85: r2(
        percentisDe(
          amostraBM(
            'projeto',
            concluidos.map((i) => i.antes),
            janela,
          ),
        ).p85,
      ),
    })),
  }
}

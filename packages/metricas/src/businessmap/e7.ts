import {
  MINIMO_AMOSTRA,
  NATUREZAS_ENTREGA,
  type FiltrosFluxo,
  type ResultadoE7,
} from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { baseAmostral, criterios, dentro, ehDemanda, periodoDe, selecionar } from './comum'
import type { ContextoBM } from './indice'
import { naturezaDe } from './t3'

/**
 * E7: capacidade por sistema, sem R$ (CA-13). Peso = contagem de demandas entregues no período (D-2); subtarefa,
 * frente e projeto ficam fora. A natureza vem de `naturezaDe` do T3 (CA-23): este módulo não tem mapeamento próprio.
 * A participação é k de n com o total de entregas, só para sistema com 20 ou mais entregas; abaixo disso ela é `null` (um "k de k"
 * seria tautológico) e a interface monta o "k de n" com `entregas` e `total`; o sistema vai para o fim da lista.
 * Sistema é dimensão permitida; nunca equipe nem pessoa. Ordem por participação, sem "pior" ou "melhor" (CA-11).
 * O custo (D-1' = A) só entra quando houver configuração de custo do DSPD: até lá `custoConfigurado` é falso e os
 * dois valores em R$ são nulos.
 */
export function calcularE7(ctx: ContextoBM, f: FiltrosFluxo): ResultadoE7 {
  const periodo = periodoDe(ctx, f)
  const entregues = selecionar(ctx, f, 'story', { semEquipe: true, semTipo: true })
    .filter(ehDemanda)
    .filter((m) => dentro(ctx, m.entrega, periodo))
  const total = entregues.length
  const porSistema = new Map<string, (typeof entregues)[number][]>()
  for (const m of entregues) {
    const lista = porSistema.get(m.card.sistema)
    if (lista) lista.push(m)
    else porSistema.set(m.card.sistema, [m])
  }
  const sistemas = [...porSistema].map(([sistema, itens]) => {
    const e = itens.length
    return {
      sistema,
      entregas: e,
      participacao: e >= MINIMO_AMOSTRA ? taxa(e, total) : null,
      porNatureza: NATUREZAS_ENTREGA.map((natureza) => ({
        natureza,
        taxa: taxa(itens.filter((m) => naturezaDe(m) === natureza).length, e),
      })),
      custoRateado: null,
      custoPorDemanda: null,
    }
  })
  return {
    base: baseAmostral(total, 'demandas entregues', periodo),
    criterios: criterios('E7', periodo, periodo, ctx),
    total,
    sistemas: ordenarNeutro(sistemas, (s) => [
      s.entregas >= MINIMO_AMOSTRA ? 0 : 1,
      -s.entregas,
      s.sistema,
    ]),
    custoConfigurado: false,
  }
}

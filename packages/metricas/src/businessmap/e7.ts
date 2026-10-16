import {
  MINIMO_AMOSTRA,
  NATUREZAS_ENTREGA,
  type FiltrosFluxo,
  type ResultadoE7,
} from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { baseAmostral, criterios, dentro, ehDemanda, periodoDe, r2, selecionar } from './comum'
import { custoDoPeriodo, type ConfigCustoDspd } from './custo'
import type { ContextoBM } from './indice'
import { naturezaDe } from './t3'

/**
 * E7: capacidade por sistema, sem R$ (CA-13). Peso = contagem de demandas entregues no período (D-2); subtarefa,
 * frente e projeto ficam fora. A natureza vem de `naturezaDe` do T3 (CA-23): este módulo não tem mapeamento próprio.
 * A participação é k de n com o total de entregas, só para sistema com 20 ou mais entregas; abaixo disso ela é `null` (um "k de k"
 * seria tautológico) e a interface monta o "k de n" com `entregas` e `total`; o sistema vai para o fim da lista.
 * Sistema é dimensão permitida; nunca equipe nem pessoa. Ordem por participação, sem "pior" ou "melhor" (CA-11).
 * O custo (D-1' = A) só entra quando houver configuração de custo do DSPD que cubra o período: até lá `custoConfigurado`
 * é falso e os dois valores em R$ são nulos (CA-13). Com ela, o custo do período (pró-rata por dias corridos, Q-E7-1, em
 * `custo.ts`) é rateado pela participação de cada sistema nas entregas (`custoRateado` = custo x entregas do sistema /
 * total) e `custoPorDemanda` = `custoRateado` / entregas do sistema. É o rateio do custo TOTAL do DSPD, nunca esforço
 * medido (horas apontadas não entram) nem custo por equipe ou pessoa. Como a participação, os dois só saem para o
 * sistema com 20 ou mais entregas (abaixo, só "k de n"; o rateio de um sistema pequeno é estatística de amostra miúda).
 * No mock não há custo: a configuração só chega por fixture de teste (`custo`), nunca pela fonte de dados.
 */
export function calcularE7(ctx: ContextoBM, f: FiltrosFluxo, custo?: ConfigCustoDspd): ResultadoE7 {
  const periodo = periodoDe(ctx, f)
  const custoTotal = custo === undefined ? null : custoDoPeriodo(custo, periodo)
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
    // `rateado` já arredondado (centavos); o por demanda sai do valor publicado, para os dois conferirem na tela.
    const rateado = custoTotal !== null && e >= MINIMO_AMOSTRA ? r2((custoTotal * e) / total) : null
    return {
      sistema,
      entregas: e,
      participacao: e >= MINIMO_AMOSTRA ? taxa(e, total) : null,
      porNatureza: NATUREZAS_ENTREGA.map((natureza) => ({
        natureza,
        taxa: taxa(itens.filter((m) => naturezaDe(m) === natureza).length, e),
      })),
      custoRateado: rateado,
      custoPorDemanda: rateado === null ? null : r2(rateado / e),
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
    custoConfigurado: custoTotal !== null,
  }
}

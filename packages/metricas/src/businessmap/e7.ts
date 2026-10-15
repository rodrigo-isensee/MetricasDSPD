import { NATUREZAS_ENTREGA, type FiltrosFluxo, type ResultadoE7 } from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { baseAmostral, criterios, dentro, ehDemanda, periodoDe, selecionar } from './comum'
import type { ContextoBM } from './indice'
import { naturezaDe } from './t3'

/** Menor número de entregas de um sistema para o percentual dele ser publicado (regra dos 20 itens). */
const MINIMO_SISTEMA = 20

/**
 * E7: capacidade por sistema, sem R$ (CA-13). Peso = contagem de demandas entregues no período (D-2); subtarefa,
 * frente e projeto ficam fora. A natureza vem de `naturezaDe` do T3 (CA-23): este módulo não tem mapeamento próprio.
 * A participação é k de n com o total de entregas; sistema com menos de 20 entregas mostra "k de n" e vai para o fim.
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
  const porSistema = new Map<string, typeof entregues>()
  for (const m of entregues)
    porSistema.set(m.card.sistema, [...(porSistema.get(m.card.sistema) ?? []), m])
  const sistemas = [...porSistema].map(([sistema, itens]) => {
    const e = itens.length
    return {
      sistema,
      entregas: e,
      // Com o total já abaixo de 20 o "k de n" é sobre o total; com o total publicável, sobre as entregas do sistema.
      participacao:
        e >= MINIMO_SISTEMA ? taxa(e, total) : taxa(e, total < MINIMO_SISTEMA ? total : e),
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
      s.entregas >= MINIMO_SISTEMA ? 0 : 1,
      -s.entregas,
      s.sistema,
    ]),
    custoConfigurado: false,
  }
}

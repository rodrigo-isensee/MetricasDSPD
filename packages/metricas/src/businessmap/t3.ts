import type { ResultadoT3 } from '@metricas-dspd/contratos'
import { FATIAS_T3, type FatiaT3, type TipoCard } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { publicavel } from '../core/estatistica'
import { baseAmostral, criterios, dentro, du, ehDemanda, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM, MarcosCard } from './indice'

type Natureza = 'Sustentação' | 'Evolução' | 'Projetos' | 'Dívida técnica'

/**
 * T3 (pedido 105, E7.496, T3 = A do dono de 2026-11-17): a fatia sai só do tipo do card, sem olhar projeto nem frente acima. Tipo sem categoria
 * especial (Trabalho de produto, Iniciativa) = Produto; Bug interno não é demanda (`ehDemanda`) e nunca chega aqui.
 */
const FATIA_DO_TIPO: Record<TipoCard, FatiaT3> = {
  'Trabalho de produto': 'Produto',
  Iniciativa: 'Produto',
  Habilitador: 'Habilitador',
  'Defeito em produção': 'Correção em produção',
  Incidente: 'Correção em produção',
  Requisição: 'Correção em produção',
  'Dívida técnica': 'Saúde técnica e de processo',
  Melhoria: 'Saúde técnica e de processo',
  'Bug interno': 'Produto',
}
export const fatiaT3De = (m: MarcosCard): FatiaT3 => FATIA_DO_TIPO[m.card.tipo]

/** Mapeamento tipo → natureza do E7 (P8 provisório; o T3 deixou de usá-lo): item com projeto acima = Projetos; senão pelo tipo. */
export function naturezaDe(m: MarcosCard): Natureza {
  if (m.projetoId !== null) return 'Projetos'
  switch (m.card.tipo) {
    case 'Incidente':
    case 'Requisição':
    case 'Defeito em produção':
      return 'Sustentação'
    case 'Dívida técnica':
      return 'Dívida técnica'
    default:
      return 'Evolução'
  }
}

/** T3: como as entregas se dividiram entre as quatro fatias, por itens e por tempo em execução. Sem acordado, sem desvio, sem selo de meta (D-T3b). */
export function calcularT3(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT3 {
  const periodo = periodoDe(ctx, f)
  const xs = selecionar(ctx, f, 'story', { semTipo: true })
    .filter(ehDemanda)
    .filter((m) => m.cicloHU !== null && dentro(ctx, m.entrega, periodo))
  const totalItens = xs.length
  const totalHoras = xs.reduce((s, m) => s + (m.cicloHU as number), 0)
  const ok = publicavel(totalItens)
  return {
    base: baseAmostral(totalItens, 'itens entregues', periodo),
    criterios: criterios('T3', periodo, periodo, ctx),
    status: ok ? 'ok' : 'insuficiente',
    naturezas: FATIAS_T3.map((natureza) => {
      const dele = xs.filter((m) => fatiaT3De(m) === natureza)
      // Fatia com menos de 20 entregas mostra só a contagem: sem percentual de itens nem de tempo, e nunca se junta a outra.
      const fatiaOk = ok && publicavel(dele.length)
      const horas = dele.reduce((s, m) => s + (m.cicloHU as number), 0)
      const pct = (q: number, total: number) =>
        fatiaOk && total > 0 ? r2((q / total) * 100) : null
      return {
        natureza,
        abaixoDe20: !publicavel(dele.length),
        itens: { quantidade: r2(dele.length), pct: pct(dele.length, totalItens) },
        tempo: { quantidade: r2(du(ctx, horas)), pct: pct(du(ctx, horas), du(ctx, totalHoras)) },
      }
    }),
  }
}

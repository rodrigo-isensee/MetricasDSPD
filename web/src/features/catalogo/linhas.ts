import {
  CATALOGO_CARTOES,
  ROTULO_PAINEL,
  origemDaMetrica,
  type CartaoCatalogo,
} from '@metricas-dspd/contratos'
import { destinoDoCartao } from '@/lib/destinoCartao'
import type { FonteDoCartao } from '@/components/ui'
import { CATALOGO, type PainelDaMetrica } from '@/content/catalogo-metricas'

export interface LinhaCatalogo {
  codigo: string
  nome: string
  painel: PainelDaMetrica
  painelRotulo: string
  grupo: 'Núcleo' | 'Complementar'
  fonte: FonteDoCartao
  granularidade: string
  /** Situação do dado da métrica no mapa de origem: lida da coleta ou ainda sem dado real. */
  dados: 'Real' | 'Sem dado real'
  /** Anotação de métrica parcial (dado real só em parte); não é um terceiro valor de `dados`. */
  anotacao?: string
  /** Destino no app: o painel e, para complementares, o cartão (abre a seção "Mais métricas"). */
  destino: string
}

/** Métricas reais só em parte: a anotação diz o que ainda está sem fonte. */
const ANOTACAO_PARCIAL: Record<string, string> = {
  S12: 'Parcial: volume por sistema; reincidência sem fonte',
}

/** BLOQUEADOS é lista, não métrica do briefing. */
const FORA = new Set(['BLOQUEADOS'])

/** O catálogo das métricas do briefing, das complementares e da percepção, com a espera invisível em uma linha por nível. A PV1 (pesquisa de percepção) é a terceira fonte: a coluna Fonte a distingue do BusinessMap e do Acelerato. Derivado dos dois catálogos estáticos. */
export function linhasDoCatalogo(): LinhaCatalogo[] {
  return CATALOGO.filter((m) => !FORA.has(m.id)).map((m) => {
    const cartoes = CATALOGO_CARTOES.filter((c) => c.metricas.includes(m.id))
    const cartao = cartoes.find((c) => c.grupo === 'complementar')
    /** Toda linha aponta para o cartão que a mostra (IS-005); a EI tem um por nível e leva ao primeiro. */
    const alvo: CartaoCatalogo | undefined = cartao ?? cartoes[0]
    if (!alvo) throw new Error(`Catálogo inconsistente: a métrica ${m.id} não tem cartão`)
    return {
      codigo: m.codigo,
      nome: m.nome,
      painel: m.painel,
      painelRotulo: ROTULO_PAINEL[m.painel],
      grupo: cartao ? 'Complementar' : 'Núcleo',
      fonte: m.fonte,
      granularidade: m.granularidade,
      dados: origemDaMetrica(m.id) === 'real' ? 'Real' : 'Sem dado real',
      ...(ANOTACAO_PARCIAL[m.codigo] ? { anotacao: ANOTACAO_PARCIAL[m.codigo] } : {}),
      destino: destinoDoCartao(alvo),
    }
  })
}

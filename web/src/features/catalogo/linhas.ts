import { CATALOGO_CARTOES, ROTULO_PAINEL } from '@metricas-dspd/contratos'
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
  /** Decisão 20: o app inteiro roda com dados fictícios até a coleta real existir. */
  dados: 'Fictícios'
  /** Destino no app: o painel e, para complementares, o cartão (abre a seção "Mais métricas"). */
  destino: string
}

/** Espera invisível aparece uma vez (os quatro níveis são a mesma métrica); BLOQUEADOS é lista, não métrica do briefing. */
const FORA = new Set(['BLOQUEADOS', 'EI_FL2', 'EI_FL3', 'EI_SUST'])

const ROTULO: Record<PainelDaMetrica, string> = {
  ...ROTULO_PAINEL,
  'espera-invisivel': 'Espera invisível',
}

/** As 45 métricas do briefing (28 do núcleo e 17 complementares) mais a PV1 (pesquisa de percepção, grupo Núcleo), derivadas dos dois catálogos estáticos. */
export function linhasDoCatalogo(): LinhaCatalogo[] {
  return CATALOGO.filter((m) => !FORA.has(m.id)).map((m) => {
    const cartao = CATALOGO_CARTOES.filter((c) => c.metricas.includes(m.id)).find(
      (c) => c.grupo === 'complementar',
    )
    return {
      codigo: m.codigo,
      nome: m.id === 'EI_FL1' ? 'Espera invisível' : m.nome,
      painel: m.painel,
      painelRotulo: ROTULO[m.painel],
      grupo: cartao ? 'Complementar' : 'Núcleo',
      fonte: m.fonte,
      granularidade: m.granularidade,
      dados: 'Fictícios',
      destino: cartao ? destinoDoCartao(cartao) : `/${m.painel}`,
    }
  })
}

import type { RecorteSustentacao } from '@metricas-dspd/contratos'

/** Limites de itens por extenso na frase (UX K-215, seção 3): constantes de apresentação, não regra de negócio. */
export const LIMITE_ORGANIZACOES = 3
export const LIMITE_TIPOS = 3
export const LIMITE_EQUIPES = 4

/** Parte fixa do parágrafo: regra de cálculo, não lista de domínio. */
const RESTO_FIXO =
  'Tempos e aderência usam somente chamados fechados. Chamados com exceção de SLA por registro posterior ficam fora destas apurações.'

/** Texto de reserva (sem `recorte`, carregando ou em erro): o texto de antes do K-215, caractere por caractere. */
export const RECORTE_RESERVA = `Chamados da organização DSPD Sustentação, tipo DSPD - SSSC, equipes SSSC TOTVS, SENIOR e FLUIG, excluídos os removidos. ${RESTO_FIXO}`

/** "a", "a e b", "a, b e c". */
export function juntar(itens: readonly string[]): string {
  if (itens.length <= 1) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`
}

export interface ListaExpansivel {
  /** Texto do resumo recolhido ("Ver as 38 equipes") e do aberto ("Ocultar as 38 equipes"). */
  fechado: string
  aberto: string
  itens: readonly string[]
}

export interface TextoRecorte {
  frase: string
  listas: ListaExpansivel[]
}

/** Uma lista de domínio: por extenso até o limite; acima dele, contagem na frase e lista completa no `<details>`. */
function segmento(
  itens: readonly string[],
  limite: number,
  p: {
    um: string
    varios: string
    contagem: string
    ver: string
    ocultar: string
  },
  listas: ListaExpansivel[],
): string {
  const n = itens.length
  if (n > limite) {
    const rotulo = `${n} ${p.contagem}`
    listas.push({ fechado: `${p.ver} ${rotulo}`, aberto: `${p.ocultar} ${rotulo}`, itens })
    return `de ${rotulo}`
  }
  return `${n === 1 ? p.um : p.varios} ${juntar(itens)}`
}

/** Monta a frase e as listas expansíveis do recorte vigente; `null` se alguma lista vier vazia (cai na reserva). */
export function montarRecorte(recorte: RecorteSustentacao): TextoRecorte | null {
  if (
    recorte.organizacoes.length === 0 ||
    recorte.tipos.length === 0 ||
    recorte.equipes.length === 0
  )
    return null
  const listas: ListaExpansivel[] = []
  const org = segmento(
    recorte.organizacoes,
    LIMITE_ORGANIZACOES,
    {
      um: 'da organização',
      varios: 'das organizações',
      contagem: 'organizações',
      ver: 'Ver as',
      ocultar: 'Ocultar as',
    },
    listas,
  )
  const tipo = segmento(
    recorte.tipos,
    LIMITE_TIPOS,
    {
      um: 'tipo',
      varios: 'tipos',
      contagem: 'tipos de chamado',
      ver: 'Ver os',
      ocultar: 'Ocultar os',
    },
    listas,
  )
  const equipe = segmento(
    recorte.equipes,
    LIMITE_EQUIPES,
    {
      um: 'equipe',
      varios: 'equipes',
      contagem: 'equipes',
      ver: 'Ver as',
      ocultar: 'Ocultar as',
    },
    listas,
  )
  return {
    frase: `Chamados ${org}, ${tipo}, ${equipe}, excluídos os removidos. ${RESTO_FIXO}`,
    listas,
  }
}

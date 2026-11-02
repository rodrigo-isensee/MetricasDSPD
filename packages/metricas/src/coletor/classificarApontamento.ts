/**
 * Classificação do apontamento de horas na fronteira do coletor (pedido 059, plano §3.4, ADR 0020 revisão 4). Pura,
 * sem efeito colateral e sem log: o coletor passa o comentário aqui e o DESCARTA logo depois; o comentário só existe
 * em memória durante esta chamada, e o resultado (subgrupo, máscara de flags e contagem de palavras) é tudo o que
 * sobrevive. Nada do texto sai, nem trecho nem hash. Fica FORA dos pontos de entrada públicos do pacote, como o resto
 * de `coletor/`: só o coletor importa.
 */
import { FLAGS_QUALIDADE, type FlagQualidade } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../core/ordenar'

/** Subgrupos residuais (prioridades 11 e 12 da especificação): avaliados pelo código, não pela tabela. */
export const SUBGRUPO_EXECUCAO_TECNICA = 'execucao-tecnica'
export const SUBGRUPO_NAO_CLASSIFICADO = 'nao-classificado'

/** Regra por termo: casa se algum termo (já normalizado) aparece no início de uma palavra do comentário. */
export interface RegraPorTermo {
  prioridade: number
  subgrupo: string
  termos: readonly string[]
}

/**
 * Regra por tipo de card: `sempre` (qualquer comentário, inclusive vazio) ou `sem-comentario`. `typeId` é o `type_id`
 * do BusinessMap (a carga do dicionário resolve o rótulo do tipo para o id e falha se não achar).
 */
export interface RegraPorTipo {
  prioridade: number
  subgrupo: string
  typeId: string
  condicao: 'sempre' | 'sem-comentario'
}

/** Dicionário vigente (`ref_apontamento_*`). Menor `prioridade` avalia primeiro; a primeira regra que casa vence. */
export interface DicionarioApontamento {
  versao: string
  termos: readonly RegraPorTermo[]
  regrasPorTipo: readonly RegraPorTipo[]
}

export interface EntradaApontamento {
  /** Comentário do apontamento; vive só nesta chamada. `null`, vazio ou só espaços = sem comentário. */
  comentario: string | null
  typeId: string | null
  /**
   * Categoria de tempo nativa do BusinessMap. RESERVADO: ainda não é fonte do subgrupo (M-1 e Q-A3 ficaram fora do
   * prazo, decisão em bloco do dono); entra aqui para a assinatura do plano não mudar quando a categoria valer.
   */
  categoriaId?: string | null
}

export interface ResultadoApontamento {
  /** Código do subgrupo (lista fechada do dicionário, mais os dois residuais). */
  subgrupo: string
  /** Máscara de bits das flags de qualidade que a classificação decide (ver `MASCARA_FLAG`). 0 = completo. */
  flags: number
  qtdPalavras: number
  versaoDicionario: string
}

/** Máximo de `qtd_palavras smallint` na base. */
export const MAX_QTD_PALAVRAS = 32767
/** Comentário genérico: até 3 palavras (seção 5 da especificação). */
export const LIMITE_GENERICO_PALAVRAS = 3

/**
 * Bit de cada flag na coluna `flags_qualidade smallint`: a ordem é a de `FLAGS_QUALIDADE` do contrato (tradução num só
 * lugar). A classificação só decide as três primeiras; `sem-iniciativa` e `valor-atipico` vêm da projeção.
 */
export const MASCARA_FLAG: Readonly<Record<FlagQualidade, number>> = Object.freeze(
  Object.fromEntries(FLAGS_QUALIDADE.map((f, i) => [f, 1 << i])) as Record<FlagQualidade, number>,
)

export function mascaraDeFlags(flags: readonly FlagQualidade[]): number {
  return flags.reduce((m, f) => m | MASCARA_FLAG[f], 0)
}

/** Flags ligadas na máscara, na ordem do contrato. */
export function flagsDaMascara(mascara: number): FlagQualidade[] {
  return FLAGS_QUALIDADE.filter((f) => (mascara & MASCARA_FLAG[f]) !== 0)
}

/** Minúsculas, sem acento (NFD sem diacríticos), espaços colapsados e aparados. */
export function normalizarTexto(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ').trim()
}

const escapar = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Início de palavra (C-6): nada de letra ou dígito logo antes do termo; nada é exigido depois. */
function casaInicioDePalavra(normalizado: string, termo: string): boolean {
  return new RegExp(`(?<![a-z0-9])${escapar(termo)}`).test(normalizado)
}

type Regra = ({ tipo: 'termo' } & RegraPorTermo) | ({ tipo: 'tipo' } & RegraPorTipo)

export function classificarApontamento(
  entrada: EntradaApontamento,
  dicionario: DicionarioApontamento,
): ResultadoApontamento {
  const normalizado = normalizarTexto(entrada.comentario ?? '')
  const semComentario = normalizado === ''
  const qtdPalavras = semComentario ? 0 : normalizado.split(' ').length

  const regras: Regra[] = [
    ...dicionario.termos.map((r) => ({ tipo: 'termo' as const, ...r })),
    ...dicionario.regrasPorTipo.map((r) => ({ tipo: 'tipo' as const, ...r })),
  ]
  const casou = ordenarNeutro(regras, (r) => [r.prioridade, r.subgrupo]).find((r) =>
    r.tipo === 'termo'
      ? r.termos.some((t) => casaInicioDePalavra(normalizado, t))
      : r.typeId === entrada.typeId && (r.condicao === 'sempre' || semComentario),
  )
  const subgrupo =
    casou?.subgrupo ?? (semComentario ? SUBGRUPO_NAO_CLASSIFICADO : SUBGRUPO_EXECUCAO_TECNICA)

  const flags: FlagQualidade[] = []
  if (semComentario) flags.push('sem-comentario')
  if (qtdPalavras <= LIMITE_GENERICO_PALAVRAS) flags.push('generico')
  if (subgrupo === SUBGRUPO_EXECUCAO_TECNICA || subgrupo === SUBGRUPO_NAO_CLASSIFICADO)
    flags.push('sem-vinculo')

  return {
    subgrupo,
    flags: mascaraDeFlags(flags),
    qtdPalavras: Math.min(qtdPalavras, MAX_QTD_PALAVRAS),
    versaoDicionario: dicionario.versao,
  }
}

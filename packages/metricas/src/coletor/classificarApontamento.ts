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
/** Comentário genérico: comentário escrito com até 3 palavras (seção 5 da especificação; vazio não conta). */
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

/** Entrada limitada (plano §3.4, A4 do parecer): comentário truncado em pontos de código antes de qualquer outro passo. */
export const MAX_PONTOS_DE_CODIGO = 2000

/** Surrogate isolado: metade de par sem a outra. Sem a flag `u` de propósito, para enxergar as metades. */
const SURROGATE_ISOLADO = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g

/** Primeiros `MAX_PONTOS_DE_CODIGO` pontos de código, sem copiar o texto inteiro quando ele é enorme. */
function truncar(texto: string): string {
  let pontos = 0
  let fim = 0
  for (const ponto of texto) {
    if (pontos === MAX_PONTOS_DE_CODIGO) break
    pontos += 1
    fim += ponto.length
  }
  return texto.slice(0, fim)
}

/**
 * Minúsculas sem localidade, NFD, sem marcas combinantes (`\p{M}`), sem os de formato e direção (`\p{Cf}`) e sem
 * surrogate isolado; o espaço em branco (inclusive quebra de linha e tabulação) vira um espaço colapsado; só então saem
 * os controles restantes (`\p{Cc}`); aparado.
 * Controle e direção somem sem deixar espaço: `re` + U+200B + `uniao` continua `reuniao`.
 */
export function normalizarTexto(texto: string): string {
  return texto
    .replace(SURROGATE_ISOLADO, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\p{M}\p{Cf}]/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/\p{Cc}/gu, '')
    .trim()
}

/** Palavras: sequências de letra e dígito; todo o resto separa. */
export function palavrasDe(normalizado: string): string[] {
  return normalizado.match(/[\p{L}\p{N}]+/gu) ?? []
}

/** Palavras únicas em ordem de unidade de código: as que começam com um termo ficam juntas, a partir do primeiro >= termo. */
function ordenarPalavras(palavras: readonly string[]): string[] {
  return [...new Set(palavras)].sort()
}

/**
 * Início de palavra (C-6): `startsWith` entre palavra e termo, sem expressão regular do dicionário (ADR 0020 R4-2). As
 * palavras que começam com um termo são contíguas na ordem, então basta olhar a primeira palavra >= termo. Com os
 * termos também ordenados (uma vez por dicionário), um só caminhar duplo de custo O(palavras + termos) acha todos os
 * termos que casam; o teto de 2000 pontos de código e 500 termos cabe folgado no orçamento.
 */
function termosQueCasam(
  palavrasOrdenadas: readonly string[],
  termosOrdenados: readonly string[],
): Set<string> {
  const casados = new Set<string>()
  let i = 0
  for (const termo of termosOrdenados) {
    while (i < palavrasOrdenadas.length && (palavrasOrdenadas[i] as string) < termo) i += 1
    if (i === palavrasOrdenadas.length) break
    if ((palavrasOrdenadas[i] as string).startsWith(termo)) casados.add(termo)
  }
  return casados
}

type Regra = ({ tipo: 'termo' } & RegraPorTermo) | ({ tipo: 'tipo' } & RegraPorTipo)

interface Preparado {
  readonly regras: readonly Regra[]
  readonly termosOrdenados: readonly string[]
}

/** Regras ordenadas por prioridade e subgrupo e termos únicos ordenados: preparados uma vez por dicionário (objeto). */
const preparados = new WeakMap<DicionarioApontamento, Preparado>()

function preparar(dicionario: DicionarioApontamento): Preparado {
  const pronto = preparados.get(dicionario)
  if (pronto) return pronto
  const regras: Regra[] = [
    ...dicionario.termos.map((r) => ({ tipo: 'termo' as const, ...r })),
    ...dicionario.regrasPorTipo.map((r) => ({ tipo: 'tipo' as const, ...r })),
  ]
  const novo: Preparado = {
    regras: ordenarNeutro(regras, (r) => [r.prioridade, r.subgrupo]),
    termosOrdenados: ordenarPalavras(dicionario.termos.flatMap((r) => r.termos)),
  }
  preparados.set(dicionario, novo)
  return novo
}

export function classificarApontamento(
  entrada: EntradaApontamento,
  dicionario: DicionarioApontamento,
): ResultadoApontamento {
  const normalizado = normalizarTexto(truncar(entrada.comentario ?? ''))
  const semComentario = normalizado === ''
  const palavras = palavrasDe(normalizado)
  const qtdPalavras = palavras.length
  const ordenadas = ordenarPalavras(palavras)

  const { regras, termosOrdenados } = preparar(dicionario)
  const casados = termosQueCasam(ordenadas, termosOrdenados)
  const casou = regras.find((r) =>
    r.tipo === 'termo'
      ? r.termos.some((t) => casados.has(t))
      : r.typeId === entrada.typeId && (r.condicao === 'sempre' || semComentario),
  )
  const subgrupo =
    casou?.subgrupo ?? (semComentario ? SUBGRUPO_NAO_CLASSIFICADO : SUBGRUPO_EXECUCAO_TECNICA)

  const flags: FlagQualidade[] = []
  if (semComentario) flags.push('sem-comentario')
  // genérico vale só para comentário escrito (decisão do dono, 2026-11-02): vazio fica só com sem-comentario
  if (!semComentario && qtdPalavras <= LIMITE_GENERICO_PALAVRAS) flags.push('generico')
  if (subgrupo === SUBGRUPO_EXECUCAO_TECNICA || subgrupo === SUBGRUPO_NAO_CLASSIFICADO)
    flags.push('sem-vinculo')

  return {
    subgrupo,
    flags: mascaraDeFlags(flags),
    qtdPalavras: Math.min(qtdPalavras, MAX_QTD_PALAVRAS),
    versaoDicionario: dicionario.versao,
  }
}

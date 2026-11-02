import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { FiltroAtivo } from '@/components/ui'
import { fmtData } from '@/lib/formatar'
import { ROTULO_FILTRO_PESSOA } from './textos'
import type { Ordem } from './ordem'
import {
  NIVEIS_MATRIZ,
  consultaApontamentoSchema,
  type ConsultaApontamento,
  type FiltroQualidade,
  type NivelMatriz,
  type OpcoesApontamento,
} from './types'

/**
 * Filtros da aba na URL (AP-8): só `pessoaRef` (nunca nome), ids e códigos de lista fechada. Nada de texto livre,
 * nada em `localStorage`. Valor fora do formato é descartado sem eco (o nome que alguém digitar na URL não volta à tela).
 */

const CHAVES_LISTA = ['pessoa', 'projeto', 'tipo', 'subtarefa', 'subgrupo', 'qualidade'] as const
export type ChaveLista = (typeof CHAVES_LISTA)[number]

/**
 * Formato de cada valor e teto de itens vêm do schema da consulta do contrato (`consultaApontamentoSchema`), o mesmo
 * que a rota aplica: a tela não repete regex nem limite. Aceitar na URL o que a rota recusaria só geraria erro 400.
 */
const itemValido = (chave: ChaveLista, v: string): boolean =>
  consultaApontamentoSchema.safeParse({ [chave]: [v] }).success
const cabeNoTeto = (chave: ChaveLista, itens: string[]): boolean =>
  consultaApontamentoSchema.safeParse({ [chave]: itens }).success

const ROTULOS: Record<ChaveLista | 'periodo' | 'anomalos', string> = {
  pessoa: ROTULO_FILTRO_PESSOA,
  projeto: 'Projeto',
  tipo: 'Tipo',
  subtarefa: 'Subtarefa',
  subgrupo: 'Subgrupo',
  qualidade: 'Qualidade',
  periodo: 'Período',
  anomalos: 'Possíveis erros',
}

/** `de` e `ate` juntos ou nenhum, `de <= ate` e dentro da janela máxima: quem decide é o schema do contrato. */
function lerPar(
  params: URLSearchParams,
  a: 'de' | 'diarioDe',
  b: 'ate' | 'diarioAte',
): [string, string] | 'invalido' | null {
  const de = params.get(a)
  const ate = params.get(b)
  if (de === null && ate === null) return null
  const candidato = {
    ...(de !== null && { [a]: de }),
    ...(ate !== null && { [b]: ate }),
  }
  return de !== null && ate !== null && consultaApontamentoSchema.safeParse(candidato).success
    ? [de, ate]
    : 'invalido'
}

export interface FiltrosLidos {
  consulta: ConsultaApontamento
  ordem: Ordem
  /** Nomes de rótulo dos filtros descartados (sem o valor recebido). */
  invalidos: string[]
}

export function lerFiltros(params: URLSearchParams): FiltrosLidos {
  const invalidos: string[] = []
  const consulta: ConsultaApontamento = { nivelMatriz: 'tipo', anomalos: 'incluir' }
  for (const chave of CHAVES_LISTA) {
    const bruto = params.get(chave)
    if (bruto === null || bruto === '') continue
    const itens = bruto.split(',')
    const validos = [...new Set(itens.filter((v) => itemValido(chave, v)))]
    const cabe = validos.length === 0 || cabeNoTeto(chave, validos)
    if (validos.length !== itens.length || !cabe) invalidos.push(ROTULOS[chave])
    if (validos.length > 0 && cabe)
      (consulta as unknown as Record<string, string[]>)[chave] = validos
  }
  const periodo = lerPar(params, 'de', 'ate')
  if (periodo === 'invalido') invalidos.push(ROTULOS.periodo)
  else if (periodo) [consulta.de, consulta.ate] = periodo
  const diario = lerPar(params, 'diarioDe', 'diarioAte')
  if (diario === 'invalido') invalidos.push('Período do mapa diário')
  else if (diario) [consulta.diarioDe, consulta.diarioAte] = diario
  const nivel = params.get('nivelMatriz')
  if (nivel !== null && (NIVEIS_MATRIZ as readonly string[]).includes(nivel))
    consulta.nivelMatriz = nivel as NivelMatriz
  else if (nivel !== null) invalidos.push('Agrupar por')
  if (params.get('anomalos') === 'ocultar') consulta.anomalos = 'ocultar'
  const ordem: Ordem = params.get('ordem') === 'total' ? 'total' : 'alfabetica'
  return { consulta, ordem, invalidos }
}

const LISTA_DE_OPCOES = {
  projeto: 'projetos',
  tipo: 'tipos',
  subtarefa: 'subtarefas',
  subgrupo: 'subgrupos',
} as const

/** Rótulo do valor escolhido, vindo das opções da resposta; sem elas (ou fora delas) vale o próprio id. */
function nomeDoValor(
  chave: Exclude<ChaveLista, 'qualidade'>,
  id: string,
  opcoes: OpcoesApontamento | undefined,
): string {
  if (!opcoes) return id
  const lista: readonly { id: string; nome: string }[] =
    chave === 'pessoa'
      ? opcoes.pessoas.map((p) => ({ id: p.pessoaRef, nome: p.rotulo }))
      : opcoes[LISTA_DE_OPCOES[chave]].map((o) => ({ id: o.id, nome: o.rotulo }))
  return lista.find((o) => o.id === id)?.nome ?? id
}

export interface UsoFiltrosApontamento extends FiltrosLidos {
  definirLista: (chave: ChaveLista, ids: string[], replace?: boolean) => void
  definirPeriodo: (de: string | null, ate: string | null) => void
  definirDiario: (de: string | null, ate: string | null) => void
  definirNivel: (n: NivelMatriz) => void
  definirOrdem: (o: Ordem) => void
  definirAnomalos: (ocultar: boolean) => void
  remover: (chave: string, valorId?: string) => void
  limpar: () => void
}

const ROTULOS_QUALIDADE: Record<FiltroQualidade, string> = {
  'sem-comentario': 'Sem comentário',
  generico: 'Comentário genérico',
  'sem-vinculo': 'Sem vínculo claro',
  'sem-iniciativa': 'Card sem iniciativa',
  'valor-atipico': 'Possível erro de apontamento',
  completo: 'Completo',
}

/** Filtros ativos para os chips e para "Remover filtro X"; os rótulos dos valores vêm das opções da resposta. */
export type AtivoApontamento = FiltroAtivo & { valorId: string | null }

export function filtrosAtivos(
  c: ConsultaApontamento,
  opcoes: OpcoesApontamento | undefined,
): AtivoApontamento[] {
  const lista: AtivoApontamento[] = []
  for (const chave of CHAVES_LISTA) {
    for (const id of c[chave] ?? [])
      lista.push({
        chave,
        rotulo: ROTULOS[chave],
        valor:
          chave === 'qualidade'
            ? ROTULOS_QUALIDADE[id as FiltroQualidade]
            : nomeDoValor(chave, id, opcoes),
        valorId: id,
      })
  }
  if (c.de && c.ate)
    lista.push({
      chave: 'periodo',
      rotulo: ROTULOS.periodo,
      valor: `${fmtData(c.de)} a ${fmtData(c.ate)}`,
      valorId: null,
    })
  if (c.anomalos === 'ocultar')
    lista.push({ chave: 'anomalos', rotulo: ROTULOS.anomalos, valor: 'ocultos', valorId: null })
  return lista
}

/** Chaves de filtro (não de visão) na URL; `nivelMatriz` e a janela do mapa são de visão e não contam (a `ordem` sai junto em "Limpar filtros"). */
const CHAVES_FILTRO = [...CHAVES_LISTA, 'de', 'ate', 'anomalos'] as const

export function useFiltrosApontamento(): UsoFiltrosApontamento {
  const [params, setParams] = useSearchParams()
  const textoParams = params.toString()
  const lidos = useMemo(() => lerFiltros(new URLSearchParams(textoParams)), [textoParams])

  const alterar = useCallback(
    (fn: (p: URLSearchParams) => void, replace = false) =>
      setParams(
        (atual) => {
          const p = new URLSearchParams(atual)
          fn(p)
          return p
        },
        { replace, preventScrollReset: true },
      ),
    [setParams],
  )

  const definirLista = useCallback(
    (chave: ChaveLista, ids: string[], replace = false) =>
      alterar((p) => (ids.length ? p.set(chave, ids.join(',')) : p.delete(chave)), replace),
    [alterar],
  )
  const definirPeriodo = useCallback(
    (de: string | null, ate: string | null) =>
      alterar((p) => {
        if (de && ate) {
          p.set('de', de)
          p.set('ate', ate)
        } else {
          p.delete('de')
          p.delete('ate')
        }
      }),
    [alterar],
  )
  const definirDiario = useCallback(
    (de: string | null, ate: string | null) =>
      alterar((p) => {
        if (de && ate) {
          p.set('diarioDe', de)
          p.set('diarioAte', ate)
        } else {
          p.delete('diarioDe')
          p.delete('diarioAte')
        }
      }),
    [alterar],
  )
  const definirNivel = useCallback(
    (n: NivelMatriz) =>
      alterar((p) => (n === 'tipo' ? p.delete('nivelMatriz') : p.set('nivelMatriz', n))),
    [alterar],
  )
  const definirOrdem = useCallback(
    (o: Ordem) => alterar((p) => (o === 'total' ? p.set('ordem', 'total') : p.delete('ordem'))),
    [alterar],
  )
  const definirAnomalos = useCallback(
    (ocultar: boolean) =>
      alterar((p) => (ocultar ? p.set('anomalos', 'ocultar') : p.delete('anomalos'))),
    [alterar],
  )
  const remover = useCallback(
    (chave: string, valorId?: string) =>
      alterar((p) => {
        if (chave === 'periodo') {
          p.delete('de')
          p.delete('ate')
          return
        }
        const atual = p.get(chave)
        if (valorId !== undefined && atual !== null) {
          const resto = atual.split(',').filter((v) => v !== valorId)
          if (resto.length) p.set(chave, resto.join(','))
          else p.delete(chave)
        } else p.delete(chave)
      }),
    [alterar],
  )
  const limpar = useCallback(
    () =>
      alterar((p) => {
        for (const c of CHAVES_FILTRO) p.delete(c)
        p.delete('ordem')
      }),
    [alterar],
  )

  return {
    ...lidos,
    definirLista,
    definirPeriodo,
    definirDiario,
    definirNivel,
    definirOrdem,
    definirAnomalos,
    remover,
    limpar,
  }
}

import type { QueryClient } from '@tanstack/react-query'
import {
  METRICAS_SUSTENTACAO,
  type Dominio,
  type FiltrosFluxo,
  type FiltrosSustentacao,
  type MetricaId,
  type OpcoesFiltro,
  type ResultadoVisaoGeral,
} from '@metricas-dspd/contratos'
import type { FonteMetricas } from '@/data'
import type { Memoria } from '@/features/filtros/memoria'
import { carregarPdf } from './carregarPdf'
import type { ArquivoGerado, BaseExportacao } from './DialogoExportar'
import {
  blocosVisaoGeral,
  construirBloco,
  montarConteudo,
  nomeArquivo,
  type BlocoExportacao,
} from './modelo'
import { notaDaMetrica } from './notas'
import { escopoDoArquivo, filtrosDoItem, rotuloDoEscopo, type ItemExportavel } from './selecao'

const dominioDe = (id: MetricaId): Dominio =>
  METRICAS_SUSTENTACAO.includes(id) ? 'acelerato' : 'businessmap'

export interface ParametrosGeracao {
  base: BaseExportacao
  itens: readonly ItemExportavel[]
  fonte: FonteMetricas
  clienteQuery: QueryClient
  pathname: string
  params: URLSearchParams
  memoria: Memoria
  agora: Date
}

/**
 * Lê os DTOs pela MESMA fonte e cache dos cartões (nada é recalculado nem consultado à parte),
 * monta o conteúdo e só então carrega o chunk do PDF. Nada é registrado (decisão D-5).
 */
export async function gerarArquivo(p: ParametrosGeracao): Promise<ArquivoGerado> {
  const { fonte, clienteQuery: qc } = p
  const dataReferencia = await qc.query({
    queryKey: ['data-referencia'],
    queryFn: () => fonte.dataReferencia(),
    staleTime: Infinity,
  })
  const obter = (id: MetricaId, filtros: unknown): Promise<unknown> =>
    qc.query<unknown>({
      queryKey: ['metrica', id, filtros, null],
      queryFn: () => fonte.obter(id as 'O3', filtros as FiltrosFluxo),
      staleTime: 60_000,
    })
  let blocos: BlocoExportacao[]
  if (p.base === 'visao-geral') {
    const dto = (await obter('VISAO_GERAL', {})) as ResultadoVisaoGeral
    blocos = blocosVisaoGeral(
      dto,
      await qc.query({
        queryKey: ['criterios'],
        queryFn: () => fonte.criterios(),
        staleTime: Infinity,
      }),
    )
  } else {
    const opcoes: Record<Dominio, OpcoesFiltro | undefined> = {
      businessmap: await qc.query({
        queryKey: ['opcoes-filtro', 'businessmap'],
        queryFn: () => fonte.opcoesFiltro('businessmap'),
        staleTime: Infinity,
      }),
      acelerato: await qc.query({
        queryKey: ['opcoes-filtro', 'acelerato'],
        queryFn: () => fonte.opcoesFiltro('acelerato'),
        staleTime: Infinity,
      }),
    }
    blocos = []
    const vistos = new Set<string>()
    for (const item of p.itens) {
      const filtros: FiltrosFluxo | FiltrosSustentacao = filtrosDoItem(
        item,
        p.pathname,
        p.params,
        p.memoria,
        opcoes[dominioDe(item.metrica)],
      )
      const chave = `${item.metrica}|${JSON.stringify(filtros)}`
      if (vistos.has(chave)) continue
      vistos.add(chave)
      blocos.push(
        construirBloco({
          id: item.metrica,
          dto: await obter(item.metrica, filtros),
          filtros,
          opcoes: opcoes[dominioDe(item.metrica)],
          nota: notaDaMetrica(item.metrica),
          codigo: item.codigo,
        }),
      )
    }
  }
  const mock = fonte.tipo === 'mock'
  const conteudo = montarConteudo({
    escopo: rotuloDoEscopo(p.base),
    blocos,
    mock,
    dataReferencia,
    agora: p.agora,
  })
  const { gerarPdf } = await carregarPdf()
  return {
    nome: nomeArquivo(escopoDoArquivo(p.base, p.itens), p.agora, mock),
    blob: await gerarPdf(conteudo),
  }
}

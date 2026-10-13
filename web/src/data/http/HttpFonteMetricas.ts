import type { z } from 'zod'
import {
  estadoColetaSchema,
  opcoesFiltroSchema,
  paginaColetasSchema,
  referenciaSchema,
  versaoCriterioSchema,
  type ContratoMetricas,
  type Dominio,
  type EstadoColeta,
  type MetricaId,
  type OpcoesFiltro,
  type PaginaColetas,
  type ResultadoDe,
  type VersaoCriterio,
} from '@metricas-dspd/contratos'
import type { FonteMetricas, OpcoesObter } from '../FonteMetricas'
import { ErroApi } from './ErroApi'
import { filtrosParaQuery } from './filtrosParaQuery'

/** Itens do O2 pedidos por página (máximo da API): a tela usa só o total de `itensMeta` e uma amostra. */
export const PAGINA_O2 = 200
const TEMPO_LIMITE_MS = 15_000

export interface OpcoesHttp {
  /** Base da API, relativa à origem (mesma origem, sem CORS). */
  base?: string
  /** Implementação de `fetch` (testes). */
  fetchImpl?: typeof fetch
}

/**
 * Fonte de dados pela API (GET /api/v1/...). Cada resposta é validada pelo Zod do contrato: formato
 * errado vira `ErroApi`, nunca dado na tela (os schemas de resultado descartam campo desconhecido).
 * Cache e deduplicação: React Query (chave) e navegador (`Cache-Control`/`ETag`); nada próprio aqui.
 */
export class HttpFonteMetricas implements FonteMetricas {
  readonly tipo = 'api' as const
  private readonly base: string
  private readonly fetchImpl: typeof fetch

  constructor({ base = '/api/v1', fetchImpl }: OpcoesHttp = {}) {
    this.base = base.replace(/\/+$/, '')
    this.fetchImpl = fetchImpl ?? ((...a) => fetch(...a))
  }

  private async buscar<T>(caminho: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> {
    const limite = AbortSignal.timeout(TEMPO_LIMITE_MS)
    let resp: Response
    try {
      resp = await this.fetchImpl(`${this.base}${caminho}`, {
        headers: { Accept: 'application/json' },
        signal: signal ? AbortSignal.any([signal, limite]) : limite,
      })
    } catch (e) {
      // Cancelamento pelo Query (filtro trocou, cartão saiu): propaga como está, sem virar erro de tela.
      if (signal?.aborted) throw e
      throw new ErroApi(0, 'REDE_INDISPONIVEL')
    }
    const requestId = resp.headers.get('X-Request-Id')
    if (!resp.ok) {
      const corpo: unknown = await resp.json().catch(() => null)
      const code = (corpo as { error?: { code?: unknown } } | null)?.error?.code
      throw new ErroApi(
        resp.status,
        typeof code === 'string' ? code : `HTTP_${resp.status}`,
        requestId,
      )
    }
    const json: unknown = await resp.json().catch(() => null)
    const r = schema.safeParse(json)
    if (!r.success) {
      // Sem o corpo: pode conter dado do servidor; só o código e o request id.
      console.error('Resposta fora do contrato', caminho, requestId)
      throw new ErroApi(resp.status, 'RESPOSTA_INVALIDA', requestId)
    }
    return r.data
  }

  async obter<K extends MetricaId>(
    id: K,
    filtros: ContratoMetricas[K]['filtros'],
    opcoes?: OpcoesObter,
  ): Promise<ResultadoDe<K>> {
    // Os 46 schemas de resultado ficam fora do chunk inicial: só a fonte `api` os baixa, na 1a métrica.
    const { SCHEMAS_RESULTADO, resultadoO2PaginadoSchema } =
      await import('@metricas-dspd/contratos/validacao')
    const o2 = id === 'O2'
    const q = filtrosParaQuery(filtros, o2 ? { pageSize: String(PAGINA_O2) } : {})
    const schema = (o2 ? resultadoO2PaginadoSchema : SCHEMAS_RESULTADO[id]) as z.ZodType<
      ResultadoDe<K>
    >
    return this.buscar(`/metricas/${id}${q ? `?${q}` : ''}`, schema, opcoes?.signal)
  }

  opcoesFiltro<D extends Dominio>(dominio: D): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    return this.buscar(`/filtros/${dominio}`, opcoesFiltroSchema) as Promise<
      Extract<OpcoesFiltro, { dominio: D }>
    >
  }

  criterios(): Promise<VersaoCriterio[]> {
    return this.buscar('/criterios', versaoCriterioSchema.array())
  }

  async dataReferencia(): Promise<string> {
    return (await this.buscar('/referencia', referenciaSchema)).dataReferencia
  }

  estadoColeta(dominio: Dominio): Promise<EstadoColeta> {
    return this.buscar(`/fontes/${dominio}/estado`, estadoColetaSchema)
  }

  historicoColetas(dominio: Dominio, pagina: number): Promise<PaginaColetas> {
    return this.buscar(`/fontes/${dominio}/coletas?pagina=${pagina}`, paginaColetasSchema)
  }
}

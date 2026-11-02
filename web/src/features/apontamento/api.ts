import { ErroApi } from '@/data/http/ErroApi'
import {
  respostaApontamentoSchema,
  type ConsultaApontamento,
  type FonteApontamento,
  type RespostaApontamento,
} from './types'

export const TEMPO_LIMITE_MS = 15_000
const CAMINHO = '/api/apontamento'

/**
 * Query da rota `GET /api/apontamento` (docs/api/apontamento.md). A rota é estrita (chave desconhecida é 400):
 * só saem as chaves do contrato, listas em CSV, e lista vazia some. A pessoa vai só como `pessoaRef`, nunca nome.
 */
export function consultaParaQuery(c: ConsultaApontamento): string {
  const q = new URLSearchParams()
  for (const chave of [
    'pessoa',
    'projeto',
    'tipo',
    'subtarefa',
    'subgrupo',
    'qualidade',
  ] as const) {
    const valores = c[chave]
    if (valores && valores.length > 0) q.set(chave, valores.join(','))
  }
  if (c.de && c.ate) {
    q.set('de', c.de)
    q.set('ate', c.ate)
  }
  if (c.diarioDe && c.diarioAte) {
    q.set('diarioDe', c.diarioDe)
    q.set('diarioAte', c.diarioAte)
  }
  q.set('nivelMatriz', c.nivelMatriz)
  q.set('anomalos', c.anomalos)
  return q.toString()
}

export interface OpcoesHttpApontamento {
  /** Caminho da rota (padrão `/api/apontamento`, mesma origem, sem CORS). */
  caminho?: string
  /** Implementação de `fetch` (testes). */
  fetchImpl?: typeof fetch
  tempoLimiteMs?: number
}

/**
 * Fonte da aba pela rota real. A resposta é validada pelo contrato zod da trilha B: forma errada vira
 * `ErroApi('RESPOSTA_INVALIDA')`, nunca dado na tela. `no-store` porque a resposta pode trazer nome de pessoa;
 * nada é guardado fora da memória do cache da consulta.
 */
export function criarFonteHttpApontamento({
  caminho = CAMINHO,
  fetchImpl,
  tempoLimiteMs = TEMPO_LIMITE_MS,
}: OpcoesHttpApontamento = {}): FonteApontamento {
  const chamar = async (query: string, signal?: AbortSignal): Promise<Response> => {
    const limite = AbortSignal.timeout(tempoLimiteMs)
    try {
      return await (fetchImpl ?? ((...a) => fetch(...a)))(`${caminho}?${query}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: signal ? AbortSignal.any([signal, limite]) : limite,
      })
    } catch (e) {
      if (signal?.aborted) throw e
      throw new ErroApi(0, limite.aborted ? 'TEMPO_ESGOTADO' : 'REDE_INDISPONIVEL')
    }
  }
  const codigoDoErro = async (resp: Response): Promise<string> => {
    try {
      const corpo = (await resp.json()) as { error?: { code?: unknown } } | null
      const code = corpo?.error?.code
      return typeof code === 'string' ? code : `HTTP_${resp.status}`
    } catch {
      return `HTTP_${resp.status}`
    }
  }
  return {
    async buscar(consulta, signal): Promise<RespostaApontamento> {
      const resp = await chamar(consultaParaQuery(consulta), signal)
      if (!resp.ok) throw new ErroApi(resp.status, await codigoDoErro(resp))
      let json: unknown = null
      try {
        json = await resp.json()
      } catch {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      }
      const r = respostaApontamentoSchema.safeParse(json)
      // Sem o corpo no log: ele pode conter nome de pessoa. Só o código.
      if (!r.success) throw new ErroApi(resp.status, 'RESPOSTA_INVALIDA')
      return r.data
    },
    /** O filtro por tipo só vale quando a rota o aceita: 422 `FILTRO_INDISPONIVEL` (ou qualquer falha) o esconde. */
    async filtroTipoDisponivel(signal) {
      try {
        const resp = await chamar('tipo=1&nivelMatriz=tipo&anomalos=incluir', signal)
        return resp.ok
      } catch {
        return false
      }
    },
  }
}

export const fonteHttpApontamento: FonteApontamento = criarFonteHttpApontamento()

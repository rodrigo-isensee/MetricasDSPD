import { vi } from 'vitest'
import { respostaFicticia } from './fixture'
import type { NivelMatriz } from './types'

/** Só para testes: faz o papel da rota `GET /api/apontamento` sobre a fixture tipada. */
export interface OpcoesFetchFalso {
  /** Corpo do 200 (padrão: a fixture filtrada pela consulta da URL, como faz o servidor). */
  resposta?: (url: URL) => unknown
  /** `tipo=...` na consulta: o que a rota responde (padrão 422, como hoje). */
  tipo?: 'aceita' | '422'
  /** Falha da rede em toda chamada. */
  rede?: boolean
  /** Quantas primeiras chamadas com `tipo=...` respondem 503 antes de a rota responder como em `tipo`. */
  falhasDaSonda?: number
}

/** `fetch` de teste que faz o papel da rota `GET /api/apontamento`. Registra cada URL chamada em `chamadas`. */
export function criarFetchFalso(opcoes: OpcoesFetchFalso = {}) {
  const chamadas: string[] = []
  let falhasRestantes = opcoes.falhasDaSonda ?? 0
  const fetchFalso = vi.fn((entrada: string | URL): Promise<Response> => {
    const url = new URL(String(entrada), 'http://localhost')
    chamadas.push(`${url.pathname}${url.search}`)
    if (opcoes.rede) return Promise.reject(new TypeError('falha de rede'))
    if (url.searchParams.has('tipo') && falhasRestantes > 0) {
      falhasRestantes -= 1
      return Promise.resolve(
        Response.json({ error: { code: 'INDISPONIVEL', message: 'Fora do ar.' } }, { status: 503 }),
      )
    }
    if (url.searchParams.has('tipo') && (opcoes.tipo ?? '422') === '422')
      return Promise.resolve(
        Response.json(
          { error: { code: 'FILTRO_INDISPONIVEL', message: 'Filtro indisponível.' } },
          { status: 422 },
        ),
      )
    const nivel = url.searchParams.get('nivelMatriz')
    const corpo = opcoes.resposta
      ? opcoes.resposta(url)
      : respostaFicticia({ nivelMatriz: nivel as NivelMatriz, anomalos: 'incluir' })
    return Promise.resolve(Response.json(corpo))
  })
  return { fetchFalso: fetchFalso as unknown as typeof fetch, chamadas }
}

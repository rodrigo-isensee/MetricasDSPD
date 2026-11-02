import { describe, expect, it, vi } from 'vitest'
import { ErroApi } from '@/data/http/ErroApi'
import { consultaParaQuery, criarFonteHttpApontamento } from './api'
import { RESPOSTA_FICTICIA, respostaComNomesReais, respostaComOutraArea } from './fixture'
import { criarFetchFalso } from './rota-falsa'
import { respostaApontamentoSchema, type ConsultaApontamento } from './types'

const PADRAO: ConsultaApontamento = { nivelMatriz: 'tipo', anomalos: 'incluir' }

describe('contrato: as fixtures passam pelo schema da rota', () => {
  it.each([
    ['fixture base', RESPOSTA_FICTICIA],
    ['com nomes reais', respostaComNomesReais()],
    ['com Outra área', respostaComOutraArea()],
  ])('%s', (_nome, resposta) => {
    expect(respostaApontamentoSchema.safeParse(resposta).success).toBe(true)
  })
})

describe('consultaParaQuery', () => {
  it('só as chaves do contrato; listas em CSV; lista vazia e período incompleto somem', () => {
    const q = consultaParaQuery({
      ...PADRAO,
      pessoa: ['p1', 'outra-area'],
      projeto: [],
      subgrupo: ['reuniao'],
      qualidade: ['completo'],
      de: '2026-08-03',
      ate: '2026-10-30',
      diarioDe: '2026-10-05',
      diarioAte: '2026-10-30',
      nivelMatriz: 'subgrupo',
      anomalos: 'ocultar',
    })
    const p = new URLSearchParams(q)
    expect(Object.fromEntries(p)).toEqual({
      pessoa: 'p1,outra-area',
      subgrupo: 'reuniao',
      qualidade: 'completo',
      de: '2026-08-03',
      ate: '2026-10-30',
      diarioDe: '2026-10-05',
      diarioAte: '2026-10-30',
      nivelMatriz: 'subgrupo',
      anomalos: 'ocultar',
    })
  })

  it('consulta padrão manda só o nível da matriz e o tratamento de anomalias', () => {
    expect(consultaParaQuery(PADRAO)).toBe('nivelMatriz=tipo&anomalos=incluir')
  })
})

describe('fonte HTTP da aba', () => {
  it('chama GET /api/apontamento sem cache e devolve a resposta validada', async () => {
    const { fetchFalso, chamadas } = criarFetchFalso()
    const fonte = criarFonteHttpApontamento({ fetchImpl: fetchFalso })
    const r = await fonte.buscar({ ...PADRAO, pessoa: ['p1'] })
    expect(r.dominio).toBe('businessmap')
    expect(chamadas).toEqual(['/api/apontamento?pessoa=p1&nivelMatriz=tipo&anomalos=incluir'])
    const init = vi.mocked(fetchFalso).mock.calls[0]![1]!
    expect(init.cache).toBe('no-store')
    expect(init.headers).toEqual({ Accept: 'application/json' })
  })

  it('resposta fora do contrato vira RESPOSTA_INVALIDA, sem eco do corpo', async () => {
    const { fetchFalso } = criarFetchFalso({ resposta: () => ({ ...RESPOSTA_FICTICIA, extra: 1 }) })
    const fonte = criarFonteHttpApontamento({ fetchImpl: fetchFalso })
    const erro = await fonte.buscar(PADRAO).catch((e: unknown) => e)
    expect(erro).toBeInstanceOf(ErroApi)
    expect((erro as ErroApi).code).toBe('RESPOSTA_INVALIDA')
    expect((erro as ErroApi).message).not.toMatch(/Pessoa|extra/)
  })

  it('corpo que não é JSON também vira RESPOSTA_INVALIDA', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve(new Response('<html>', { status: 200 })))
    const fonte = criarFonteHttpApontamento({ fetchImpl: fetchImpl as unknown as typeof fetch })
    await expect(fonte.buscar(PADRAO)).rejects.toMatchObject({ code: 'RESPOSTA_INVALIDA' })
  })

  it('erro HTTP carrega o status e o código do corpo padrão; sem corpo, HTTP_<status>', async () => {
    const respostas = [
      Response.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 }),
      new Response(null, { status: 421 }),
      Response.json({ error: { code: 7 } }, { status: 500 }),
    ]
    const fetchImpl = vi.fn(() => Promise.resolve(respostas.shift()!))
    const fonte = criarFonteHttpApontamento({ fetchImpl: fetchImpl as unknown as typeof fetch })
    await expect(fonte.buscar(PADRAO)).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
    })
    await expect(fonte.buscar(PADRAO)).rejects.toMatchObject({ status: 421, code: 'HTTP_421' })
    await expect(fonte.buscar(PADRAO)).rejects.toMatchObject({ status: 500, code: 'HTTP_500' })
  })

  it('falha de rede vira REDE_INDISPONIVEL e tempo esgotado vira TEMPO_ESGOTADO', async () => {
    const { fetchFalso } = criarFetchFalso({ rede: true })
    await expect(
      criarFonteHttpApontamento({ fetchImpl: fetchFalso }).buscar(PADRAO),
    ).rejects.toMatchObject({ status: 0, code: 'REDE_INDISPONIVEL' })
    const lento = vi.fn(
      (_u: unknown, init: RequestInit) =>
        new Promise<Response>((_ok, falha) =>
          init.signal?.addEventListener('abort', () => falha(new Error('abortado'))),
        ),
    )
    const fonte = criarFonteHttpApontamento({
      fetchImpl: lento as unknown as typeof fetch,
      tempoLimiteMs: 5,
    })
    await expect(fonte.buscar(PADRAO)).rejects.toMatchObject({ code: 'TEMPO_ESGOTADO' })
  })

  it('cancelamento pelo Query propaga o aborto, sem virar erro de tela', async () => {
    const lento = vi.fn(
      (_u: unknown, init: RequestInit) =>
        new Promise<Response>((_ok, falha) =>
          init.signal?.addEventListener('abort', () => falha(new Error('abortado'))),
        ),
    )
    const fonte = criarFonteHttpApontamento({ fetchImpl: lento as unknown as typeof fetch })
    const c = new AbortController()
    const p = fonte.buscar(PADRAO, c.signal)
    c.abort()
    await expect(p).rejects.not.toBeInstanceOf(ErroApi)
  })

  it('aborto durante a leitura do corpo propaga o aborto', async () => {
    const c = new AbortController()
    const resp = {
      ok: true,
      status: 200,
      json: () => {
        c.abort()
        return Promise.reject(new Error('lido pela metade'))
      },
    }
    const fetchImpl = vi.fn(() => Promise.resolve(resp))
    const fonte = criarFonteHttpApontamento({ fetchImpl: fetchImpl as unknown as typeof fetch })
    await expect(fonte.buscar(PADRAO, c.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('o filtro por tipo só está disponível quando a rota o aceita (422 e falhas o escondem)', async () => {
    const aceita = criarFetchFalso({ tipo: 'aceita' })
    expect(
      await criarFonteHttpApontamento({ fetchImpl: aceita.fetchFalso }).filtroTipoDisponivel?.(),
    ).toBe(true)
    const nega = criarFetchFalso({ tipo: '422' })
    expect(
      await criarFonteHttpApontamento({ fetchImpl: nega.fetchFalso }).filtroTipoDisponivel?.(),
    ).toBe(false)
    const rede = criarFetchFalso({ rede: true })
    expect(
      await criarFonteHttpApontamento({ fetchImpl: rede.fetchFalso }).filtroTipoDisponivel?.(),
    ).toBe(false)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { MockFonteMetricas } from '../mock/MockFonteMetricas'
import { ErroApi } from './ErroApi'
import { filtrosParaQuery } from './filtrosParaQuery'
import { HttpFonteMetricas } from './HttpFonteMetricas'

const FLUXO = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } }
const json = (corpo: unknown, status = 200, id = 'req-12345678') =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Request-Id': id },
  })

describe('filtrosParaQuery: tendências', () => {
  it('só a data de referência vai na query (a API recusa qualquer filtro nelas)', () => {
    expect(filtrosParaQuery({ dataReferencia: '2026-09-30' })).toBe('dataReferencia=2026-09-30')
    expect(filtrosParaQuery({})).toBe('')
  })
})

describe('filtrosParaQuery', () => {
  it('omite "Todos", serializa listas em CSV e converte o tipo para o id', () => {
    expect(filtrosParaQuery(FLUXO)).toBe('periodo=12s')
    expect(
      filtrosParaQuery({
        equipe: ['a', 'b'],
        tipo: ['Bug interno'],
        sistema: ['x'],
        periodo: { tipo: '6m' },
      }),
    ).toBe('equipe=a%2Cb&tipo=bug-interno&sistema=x&periodo=6m')
  })
  it('envia de/ate só com custom, prioridade e parâmetros extras', () => {
    expect(
      filtrosParaQuery(
        { prioridade: ['P1'], periodo: { tipo: 'custom', de: '2026-01-01', ate: '2026-02-01' } },
        { pageSize: '200' },
      ),
    ).toBe('prioridade=P1&periodo=custom&de=2026-01-01&ate=2026-02-01&pageSize=200')
  })
  it('sem filtros (visão geral) não gera query', () => {
    expect(filtrosParaQuery({})).toBe('')
  })
})

describe('HttpFonteMetricas', () => {
  it('é a fonte "api"', () => {
    expect(new HttpFonteMetricas().tipo).toBe('api')
  })

  it('usa o fetch global por padrão e valida a resposta', async () => {
    const f = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      json({
        dataReferencia: '2026-10-09',
        ultimaColeta: { businessmap: null, acelerato: null },
        versaoCriterio: '0',
      }),
    )
    expect(await new HttpFonteMetricas().dataReferencia()).toBe('2026-10-09')
    expect(f.mock.calls[0]?.[0]).toBe('/api/v1/referencia')
    f.mockRestore()
  })

  it('obter: pede a rota da métrica com os filtros e valida pelo schema do contrato', async () => {
    const mock = new MockFonteMetricas({ latenciaMs: 0 })
    const o1 = await mock.obter('O1', FLUXO)
    const fetchImpl = vi.fn().mockResolvedValue(json(o1))
    const http = new HttpFonteMetricas({ base: '/api/v1/', fetchImpl })
    const r = await http.obter('O1', { ...FLUXO, equipe: ['a'] })
    expect(r).toStrictEqual(o1)
    expect(fetchImpl.mock.calls[0]?.[0]).toBe('/api/v1/metricas/O1?equipe=a&periodo=12s')
  })

  it('obter sem filtros não deixa "?" solto', async () => {
    const mock = new MockFonteMetricas({ latenciaMs: 0 })
    const vg = await mock.obter('VISAO_GERAL', {})
    const fetchImpl = vi.fn().mockResolvedValue(json(vg))
    await new HttpFonteMetricas({ fetchImpl }).obter('VISAO_GERAL', {})
    expect(fetchImpl.mock.calls[0]?.[0]).toBe('/api/v1/metricas/VISAO_GERAL')
  })

  it('O2: pede pageSize=200 e mantém o itensMeta', async () => {
    const mock = new MockFonteMetricas({ latenciaMs: 0 })
    const o2 = await mock.obter('O2', FLUXO)
    const fetchImpl = vi.fn().mockResolvedValue(json(o2))
    const r = await new HttpFonteMetricas({ fetchImpl }).obter('O2', FLUXO)
    expect(fetchImpl.mock.calls[0]?.[0]).toBe('/api/v1/metricas/O2?periodo=12s&pageSize=200')
    // O schema descarta o que o contrato não declara (ex.: `quantidade` e `unidade` da janela de referência do mock).
    const { resultadoO2PaginadoSchema } = await import('@metricas-dspd/contratos/validacao')
    expect(r).toStrictEqual(resultadoO2PaginadoSchema.parse(o2))
    expect((r as unknown as { itensMeta: { total: number } }).itensMeta.total).toBeGreaterThan(0)
  })

  it('demais métodos usam as rotas e os schemas do contrato', async () => {
    const mock = new MockFonteMetricas({ latenciaMs: 0 })
    const respostas: Record<string, unknown> = {
      '/api/v1/filtros/businessmap': await mock.opcoesFiltro('businessmap'),
      '/api/v1/criterios': await mock.criterios(),
      '/api/v1/fontes/acelerato/estado': await mock.estadoColeta('acelerato'),
      '/api/v1/fontes/businessmap/coletas?pagina=2': await mock.historicoColetas('businessmap', 2),
    }
    const fetchImpl = vi.fn<typeof fetch>((url) => Promise.resolve(json(respostas[url as string])))
    const http = new HttpFonteMetricas({ fetchImpl })
    expect(await http.opcoesFiltro('businessmap')).toStrictEqual(
      respostas['/api/v1/filtros/businessmap'],
    )
    expect(await http.criterios()).toStrictEqual(respostas['/api/v1/criterios'])
    expect(await http.estadoColeta('acelerato')).toStrictEqual(
      respostas['/api/v1/fontes/acelerato/estado'],
    )
    expect(await http.historicoColetas('businessmap', 2)).toStrictEqual(
      respostas['/api/v1/fontes/businessmap/coletas?pagina=2'],
    )
  })

  it('400 e 500 viram ErroApi com status, code e request id', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        json({ error: { code: 'VALIDATION_ERROR', message: 'x' } }, 400, 'abc-12345'),
      )
      .mockResolvedValueOnce(json({ error: { code: 'INTERNAL_ERROR', message: 'x' } }, 500))
    const http = new HttpFonteMetricas({ fetchImpl })
    const e400 = await http.obter('O1', FLUXO).catch((e: unknown) => e)
    expect(e400).toBeInstanceOf(ErroApi)
    expect(e400).toMatchObject({ status: 400, code: 'VALIDATION_ERROR', requestId: 'abc-12345' })
    await expect(http.obter('O1', FLUXO)).rejects.toMatchObject({
      status: 500,
      code: 'INTERNAL_ERROR',
    })
  })

  it('erro sem corpo no formato padrão usa HTTP_<status>', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response('<html>', { status: 502 }))
      .mockResolvedValueOnce(json({ error: { code: 7 } }, 503))
    const http = new HttpFonteMetricas({ fetchImpl })
    await expect(http.criterios()).rejects.toMatchObject({
      status: 502,
      code: 'HTTP_502',
      requestId: null,
    })
    await expect(http.criterios()).rejects.toMatchObject({ status: 503, code: 'HTTP_503' })
  })

  it('503 REFERENCIA_AUSENTE preserva o código', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(json({ error: { code: 'REFERENCIA_AUSENTE', message: 'x' } }, 503))
    await expect(
      new HttpFonteMetricas({ fetchImpl }).obter('S1', {
        equipe: [],
        prioridade: [],
        periodo: { tipo: '12s' },
      }),
    ).rejects.toMatchObject({ status: 503, code: 'REFERENCIA_AUSENTE' })
  })

  it('resposta fora do schema (JSON de outro formato ou quebrado) vira RESPOSTA_INVALIDA sem vazar o corpo', async () => {
    const mock = new MockFonteMetricas({ latenciaMs: 0 })
    const o1 = await mock.obter('O1', FLUXO)
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ ...o1, extra: 1 }))
      .mockResolvedValueOnce(json({ lixo: true }))
      .mockResolvedValueOnce(new Response('não é json', { status: 200 }))
    const http = new HttpFonteMetricas({ fetchImpl })
    await expect(http.obter('O1', FLUXO)).resolves.toBeDefined() // campo desconhecido é descartado pelo schema
    await expect(http.obter('O1', FLUXO)).rejects.toMatchObject({ code: 'RESPOSTA_INVALIDA' })
    await expect(http.dataReferencia()).rejects.toMatchObject({ code: 'RESPOSTA_INVALIDA' })
    expect(JSON.stringify(log.mock.calls)).not.toContain('lixo')
    log.mockRestore()
  })

  it('falha de rede vira ErroApi REDE_INDISPONIVEL', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(new HttpFonteMetricas({ fetchImpl }).criterios()).rejects.toMatchObject({
      status: 0,
      code: 'REDE_INDISPONIVEL',
    })
  })

  it('cancelamento pelo sinal do Query propaga o AbortError e repassa o sinal ao fetch', async () => {
    const ctl = new AbortController()
    const fetchImpl = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise<Response>((_res, rej) => {
          init?.signal?.addEventListener('abort', () =>
            rej(new DOMException('abortado', 'AbortError')),
          )
        }),
    )
    const p = new HttpFonteMetricas({ fetchImpl }).obter('O1', FLUXO, { signal: ctl.signal })
    const assertiva = expect(p).rejects.toMatchObject({ name: 'AbortError' })
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalled())
    ctl.abort()
    await assertiva
  })

  it('tempo-limite na chamada vira TEMPO_ESGOTADO, distinto de rede indisponível', async () => {
    const fetchImpl = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise<Response>((_res, rej) => {
          init?.signal?.addEventListener('abort', () =>
            rej(new DOMException('tempo', 'TimeoutError')),
          )
        }),
    )
    await expect(
      new HttpFonteMetricas({ fetchImpl, tempoLimiteMs: 5 }).criterios(),
    ).rejects.toMatchObject({ status: 0, code: 'TEMPO_ESGOTADO' })
  })

  it('tempo-limite durante a leitura do corpo vira TEMPO_ESGOTADO, sem log de resposta inválida', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const fetchImpl = vi.fn<typeof fetch>((_url, init) => {
      const resp = new Response('{}', { status: 200 })
      vi.spyOn(resp, 'json').mockImplementation(
        () =>
          new Promise((_res, rej) => {
            init?.signal?.addEventListener('abort', () =>
              rej(new DOMException('tempo', 'TimeoutError')),
            )
          }),
      )
      return Promise.resolve(resp)
    })
    await expect(
      new HttpFonteMetricas({ fetchImpl, tempoLimiteMs: 5 }).criterios(),
    ).rejects.toMatchObject({ code: 'TEMPO_ESGOTADO' })
    expect(log).not.toHaveBeenCalled()
    log.mockRestore()
  })

  it('cancelamento pelo Query durante a leitura do corpo propaga o AbortError, sem log', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const ctl = new AbortController()
    const fetchImpl = vi.fn<typeof fetch>(() => {
      const resp = new Response('{}', { status: 200 })
      vi.spyOn(resp, 'json').mockImplementation(
        () =>
          new Promise((_res, rej) => {
            ctl.signal.addEventListener('abort', () =>
              rej(new DOMException('abortado', 'AbortError')),
            )
          }),
      )
      return Promise.resolve(resp)
    })
    const p = new HttpFonteMetricas({ fetchImpl }).obter('O1', FLUXO, { signal: ctl.signal })
    const assertiva = expect(p).rejects.toMatchObject({ name: 'AbortError' })
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalled())
    await new Promise((r) => setTimeout(r, 0))
    ctl.abort()
    await assertiva
    expect(log).not.toHaveBeenCalled()
    log.mockRestore()
  })

  it('opcoesFiltro recusa resposta de outro domínio (RESPOSTA_INVALIDA)', async () => {
    const mock = new MockFonteMetricas({ latenciaMs: 0 })
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const fetchImpl = vi.fn().mockResolvedValue(json(await mock.opcoesFiltro('acelerato')))
    await expect(
      new HttpFonteMetricas({ fetchImpl }).opcoesFiltro('businessmap'),
    ).rejects.toMatchObject({ code: 'RESPOSTA_INVALIDA' })
    const aoContrario = vi.fn().mockResolvedValue(json(await mock.opcoesFiltro('businessmap')))
    await expect(
      new HttpFonteMetricas({ fetchImpl: aoContrario }).opcoesFiltro('acelerato'),
    ).rejects.toMatchObject({ code: 'RESPOSTA_INVALIDA' })
    log.mockRestore()
  })
})

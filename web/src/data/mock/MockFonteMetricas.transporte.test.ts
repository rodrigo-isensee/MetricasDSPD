import { afterEach, describe, expect, it, vi } from 'vitest'
import * as mock from '@metricas-dspd/mock'
import { MockFonteMetricas } from './MockFonteMetricas'
import { NucleoMock, tratarPedido, type EstadoWorker } from './nucleoMock'
import type { Pedido } from './protocolo'

/** Worker de mentira: o mesmo `tratarPedido` do invólucro real, atrás de um clone de estrutura, em outra tarefa. */
class FalsoWorker {
  static instancias: FalsoWorker[] = []
  static recebidos: Pedido[] = []
  onmessage: ((e: { data: unknown }) => void) | null = null
  onerror: ((e: { message: string }) => void) | null = null
  onmessageerror: (() => void) | null = null
  private readonly estado: EstadoWorker = {}
  readonly args: unknown[]

  constructor(...args: unknown[]) {
    this.args = args
    FalsoWorker.instancias.push(this)
  }

  postMessage(msg: Pedido) {
    const pedido = structuredClone(msg)
    FalsoWorker.recebidos.push(pedido)
    void tratarPedido(this.estado, pedido).then((r) =>
      setTimeout(() => this.onmessage?.({ data: structuredClone(r) }), 0),
    )
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  FalsoWorker.instancias = []
  FalsoWorker.recebidos = []
})

const FLUXO = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } } as const
const SUST = { equipe: [], prioridade: [], periodo: { tipo: '6m' } } as const

describe('transporte do MockFonteMetricas', () => {
  it('sem Worker no ambiente (jsdom) usa o processo; com Worker usa o Worker de módulo, nunca blob', async () => {
    expect(new MockFonteMetricas().transporte).toBe('processo')
    vi.stubGlobal('Worker', FalsoWorker)
    const f = new MockFonteMetricas({ latenciaMs: 0 })
    expect(f.transporte).toBe('worker')
    expect(FalsoWorker.instancias).toHaveLength(0) // preguiçoso: só na primeira chamada
    await f.dataReferencia()
    const [url, opcoes] = FalsoWorker.instancias[0]!.args as [URL, WorkerOptions]
    expect(url.pathname).toMatch(/nucleoMock\.worker\.ts$/)
    expect(url.protocol).not.toBe('blob:')
    expect(opcoes).toStrictEqual({ type: 'module' })
  })

  it('transporte inválido falha na construção; o forçado vale mesmo com Worker disponível', () => {
    vi.stubGlobal('Worker', FalsoWorker)
    expect(() => new MockFonteMetricas({ transporte: 'x' as never })).toThrow(
      /Transporte do mock inválido/,
    )
    expect(new MockFonteMetricas({ transporte: 'processo' }).transporte).toBe('processo')
    expect(new MockFonteMetricas({ transporte: 'worker' }).transporte).toBe('worker')
  })

  it('o Worker responde igual ao processo, com as opções iniciais, e só um Worker por instância', async () => {
    vi.stubGlobal('Worker', FalsoWorker)
    const opcoes = { semente: 12345, hoje: '2026-09-30T18:00:00-03:00', latenciaMs: 0 }
    const w = new MockFonteMetricas(opcoes)
    const p = new MockFonteMetricas({ ...opcoes, transporte: 'processo' })
    for (const [id, f] of [
      ['VISAO_GERAL', {}],
      ['O2', FLUXO],
      ['S8', SUST],
      ['E6', FLUXO],
    ] as const) {
      expect(await w.obter(id, f as never), id).toStrictEqual(await p.obter(id, f as never))
    }
    expect(await w.criterios()).toStrictEqual(await p.criterios())
    expect(await w.dataReferencia()).toBe('2026-09-30')
    expect(await w.opcoesFiltro('acelerato')).toStrictEqual(await p.opcoesFiltro('acelerato'))
    expect(await w.estadoColeta('businessmap')).toStrictEqual(await p.estadoColeta('businessmap'))
    expect(await w.historicoColetas('acelerato', 1)).toStrictEqual(
      await p.historicoColetas('acelerato', 1),
    )
    expect(FalsoWorker.instancias).toHaveLength(1)
    expect(FalsoWorker.recebidos[0]).toMatchObject({
      metodo: 'iniciar',
      args: [{ semente: 12345, hoje: opcoes.hoje }],
    })
    expect(await w.duracaoBoot()).toBeGreaterThanOrEqual(0)
    expect(FalsoWorker.recebidos.filter((m) => m.metodo === 'iniciar')).toHaveLength(1)
  })

  it('sem opções, iniciar vai com objeto vazio', async () => {
    vi.stubGlobal('Worker', FalsoWorker)
    await new MockFonteMetricas({ latenciaMs: 0 }).dataReferencia()
    expect(FalsoWorker.recebidos[0]).toMatchObject({ metodo: 'iniciar', args: [{}] })
  })

  it('erro no núcleo chega com a mesma mensagem nos dois transportes', async () => {
    vi.stubGlobal('Worker', FalsoWorker)
    vi.spyOn(NucleoMock.prototype, 'criterios').mockRejectedValue(new TypeError('quebrou aqui'))
    for (const transporte of ['worker', 'processo'] as const) {
      const f = new MockFonteMetricas({ latenciaMs: 0, transporte })
      const erro = await f.criterios().catch((e: unknown) => e as Error)
      expect(erro).toBeInstanceOf(Error)
      expect(erro).toMatchObject({ message: 'quebrou aqui', name: 'TypeError' })
    }
  })

  it('erro que não é Error vira Error com o texto', async () => {
    vi.spyOn(NucleoMock.prototype, 'criterios').mockRejectedValue('texto solto')
    const estado: EstadoWorker = {}
    await tratarPedido(estado, { id: 1, metodo: 'iniciar', args: [{}] })
    expect(await tratarPedido(estado, { id: 2, metodo: 'criterios', args: [] })).toStrictEqual({
      id: 2,
      ok: false,
      erro: { nome: 'Error', mensagem: 'texto solto' },
    })
  })

  it('a latência simulada sai da thread principal na mesma ordem do processo (20 primeiras)', async () => {
    vi.stubGlobal('Worker', FalsoWorker)
    const esperas: number[] = []
    const real = globalThis.setTimeout
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: () => void, ms?: number) => {
      if (ms) esperas.push(ms)
      return real(fn, 0)
    }) as never)
    const f = new MockFonteMetricas({ transporte: 'worker' })
    await Promise.all(Array.from({ length: 20 }, () => f.obter('O1', FLUXO as never)))
    const rng = mock.derivar(mock.CONFIG_PADRAO.semente, 'latencia')
    expect(esperas).toStrictEqual(Array.from({ length: 20 }, () => mock.sortearLatencia(rng)))
  })

  it('latência fixa não troca mensagem de latência', async () => {
    vi.stubGlobal('Worker', FalsoWorker)
    await new MockFonteMetricas({ latenciaMs: 1 }).obter('O1', FLUXO as never)
    expect(FalsoWorker.recebidos.some((m) => m.metodo === 'latencia')).toBe(false)
  })

  it('erro sem tratamento no Worker rejeita os pedidos pendentes e os seguintes, sem cair no processo', async () => {
    class Mudo extends FalsoWorker {
      override postMessage() {}
    }
    vi.stubGlobal('Worker', Mudo)
    const f = new MockFonteMetricas({ latenciaMs: 0 })
    const pendente = f.dataReferencia()
    await Promise.resolve()
    FalsoWorker.instancias[0]!.onerror?.({ message: 'chunk não encontrado' })
    await expect(pendente).rejects.toThrow('Falha no Worker do mock: chunk não encontrado')
    await expect(f.criterios()).rejects.toThrow(/Falha no Worker do mock/)
    expect(FalsoWorker.instancias).toHaveLength(1)
  })

  it('Worker que falha depois de iniciado rejeita os pedidos seguintes', async () => {
    vi.stubGlobal('Worker', FalsoWorker)
    const f = new MockFonteMetricas({ latenciaMs: 0 })
    await f.dataReferencia()
    FalsoWorker.instancias[0]!.onerror?.({ message: 'caiu' })
    await expect(f.criterios()).rejects.toThrow('Falha no Worker do mock: caiu')
  })

  it('erro sem mensagem e messageerror têm texto identificável', async () => {
    class Mudo extends FalsoWorker {
      override postMessage() {}
    }
    vi.stubGlobal('Worker', Mudo)
    const a = new MockFonteMetricas({ latenciaMs: 0 })
    const pa = a.dataReferencia()
    await Promise.resolve()
    FalsoWorker.instancias[0]!.onerror?.({ message: '' })
    await expect(pa).rejects.toThrow('erro sem tratamento')
    const b = new MockFonteMetricas({ latenciaMs: 0 })
    const pb = b.dataReferencia()
    await Promise.resolve()
    FalsoWorker.instancias[1]!.onmessageerror?.()
    await expect(pb).rejects.toThrow('mensagem não clonável')
  })

  it('resposta com id desconhecido é ignorada', async () => {
    vi.stubGlobal('Worker', FalsoWorker)
    const f = new MockFonteMetricas({ latenciaMs: 0 })
    await f.dataReferencia()
    expect(() =>
      FalsoWorker.instancias[0]!.onmessage?.({ data: { id: 999, ok: true, valor: 1 } }),
    ).not.toThrow()
  })
})

describe('opções parciais', () => {
  it('só semente ou só hoje: o outro valor fica no padrão', async () => {
    const padrao = await new MockFonteMetricas({ latenciaMs: 0 }).dataReferencia()
    const soSemente = new MockFonteMetricas({ semente: 12345, latenciaMs: 0 })
    expect(await soSemente.dataReferencia()).toBe(padrao)
    const soHoje = new MockFonteMetricas({ hoje: '2026-09-30T18:00:00-03:00', latenciaMs: 0 })
    expect(await soHoje.dataReferencia()).toBe('2026-09-30')
  })
})

describe('invólucro do Worker', () => {
  it('responde cada pedido pelo postMessage, com o mesmo id', { timeout: 40000 }, async () => {
    const enviados: unknown[] = []
    vi.spyOn(self, 'postMessage').mockImplementation(((m: unknown) => {
      enviados.push(m)
    }) as never)
    await import('./nucleoMock.worker')
    const onmessage = self.onmessage as unknown as (e: { data: Pedido }) => void
    onmessage({ data: { id: 1, metodo: 'iniciar', args: [{}] } })
    await vi.waitFor(() => expect(enviados).toHaveLength(1), { timeout: 15000 })
    onmessage({ data: { id: 2, metodo: 'dataReferencia', args: [] } })
    await vi.waitFor(() => expect(enviados).toHaveLength(2), { timeout: 15000 })
    expect(enviados[1]).toStrictEqual({ id: 2, ok: true, valor: '2026-10-09' })
    self.onmessage = null
  })
})

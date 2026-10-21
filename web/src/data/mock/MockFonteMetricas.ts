import type {
  Dominio,
  EstadoColeta,
  MetricaId,
  PaginaColetas,
  VersaoCriterio,
} from '@metricas-dspd/contratos'
import type { OpcoesFiltro } from '@metricas-dspd/contratos'
import type { ContratoMetricas, ResultadoDe } from '@metricas-dspd/contratos'
import type { FonteMetricas } from '../FonteMetricas'
import type { ArgsPorMetodo, Metodo, Pedido, Resposta } from './protocolo'
import type { EstadoWorker } from './nucleoMock'

export interface OpcoesMock {
  semente?: number
  /** Data de corte ISO com fuso (ex.: 2026-10-09T18:00:00-03:00). */
  hoje?: string
  /**
   * Atraso artificial por chamada de métrica (D7). Sem valor: sorteia 150 a 400 ms por chamada
   * pelo PRNG com semente. `0` desliga (testes unitários e E2E); outro número fixa o atraso.
   */
  latenciaMs?: number
  /**
   * Onde o cálculo roda (ADR 0021). Sem valor: `'worker'` quando existe `Worker` no ambiente, senão `'processo'`
   * (jsdom do Vitest). `'processo'` chama o mesmo núcleo na thread principal; `'worker'` exige `Worker`.
   */
  transporte?: Transporte
}

/** Espera da latência simulada (D7); `0` não cede a thread. */
const esperar = (ms: number): Promise<void> | undefined =>
  ms > 0 ? new Promise((r) => setTimeout(r, ms)) : undefined

export type Transporte = 'worker' | 'processo'

/** Ligação por RPC com id (FIFO) a um Worker de módulo. Falha no Worker rejeita tudo, sem cair em silêncio. */
class ClienteWorker {
  private readonly worker: Worker
  private readonly pendentes = new Map<
    number,
    { resolver: (r: Resposta) => void; rejeitar: (e: Error) => void }
  >()
  private falha: Error | null = null

  constructor() {
    // O arquivo próprio da mesma origem satisfaz a CSP (`default-src 'self'`): nunca `blob:` nem Worker inline.
    this.worker = new Worker(new URL('./nucleoMock.worker.ts', import.meta.url), {
      type: 'module',
    })
    this.worker.onmessage = (e: MessageEvent<Resposta>) => {
      const p = this.pendentes.get(e.data.id)
      this.pendentes.delete(e.data.id)
      p?.resolver(e.data)
    }
    const aoFalhar = (detalhe: string) => {
      this.falha = new Error(`Falha no Worker do mock: ${detalhe}`)
      for (const p of this.pendentes.values()) p.rejeitar(this.falha)
      this.pendentes.clear()
    }
    this.worker.onerror = (e) => aoFalhar(e.message || 'erro sem tratamento')
    this.worker.onmessageerror = () => aoFalhar('mensagem não clonável')
  }

  enviar(pedido: Pedido): Promise<Resposta> {
    if (this.falha) return Promise.reject(this.falha)
    return new Promise((resolver, rejeitar) => {
      this.pendentes.set(pedido.id, { resolver, rejeitar })
      this.worker.postMessage(pedido)
    })
  }
}

/**
 * Fonte de dados fictícios. A base é gerada uma única vez e cada métrica é calculada com a biblioteca única, dentro
 * de um Web Worker (ADR 0021): a thread principal só renderiza e não importa o mock nem a biblioteca. Sem `Worker`
 * no ambiente (jsdom), o mesmo núcleo roda em processo, por `import()` dinâmico. A interface é assíncrona, para a
 * troca por API ser transparente.
 */
export class MockFonteMetricas implements FonteMetricas {
  readonly tipo = 'mock' as const
  /** Transporte em uso (marcação para a paridade E2E, ADR 0021 seção 3, item 4). */
  readonly transporte: Transporte

  private readonly opcoes: OpcoesMock
  private cliente: ClienteWorker | null = null
  private nucleoMod: Promise<typeof import('./nucleoMock')> | null = null
  private readonly estado: EstadoWorker = {}
  private boot: Promise<number> | null = null
  private seq = 0

  constructor(opcoes: OpcoesMock = {}) {
    const validos: readonly unknown[] = ['worker', 'processo']
    if (opcoes.transporte !== undefined && !validos.includes(opcoes.transporte))
      throw new Error(`Transporte do mock inválido: ${opcoes.transporte}`)
    this.opcoes = opcoes
    this.transporte = opcoes.transporte ?? (typeof Worker === 'undefined' ? 'processo' : 'worker')
  }

  /** Duração (ms) da geração da base e dos contextos, medida dentro de quem calcula. Informativo (C2). */
  duracaoBoot(): Promise<number> {
    this.boot ??= this.despachar({
      id: ++this.seq,
      metodo: 'iniciar',
      args: [
        {
          ...(this.opcoes.semente !== undefined && { semente: this.opcoes.semente }),
          ...(this.opcoes.hoje !== undefined && { hoje: this.opcoes.hoje }),
        },
      ],
    }).then((b) => (b as { bootMs: number }).bootMs)
    return this.boot
  }

  /** Envia ao Worker (RPC) ou ao núcleo em processo; os dois dão o mesmo valor e erro de mesma mensagem. */
  private async despachar(pedido: Pedido): Promise<unknown> {
    let r: Resposta
    if (this.transporte === 'worker') {
      this.cliente ??= new ClienteWorker()
      r = await this.cliente.enviar(pedido)
    } else {
      const m = await (this.nucleoMod ??= import('./nucleoMock'))
      r = await m.tratarPedido(this.estado, pedido)
    }
    if (r.ok) return r.valor
    const erro = new Error(r.erro.mensagem)
    erro.name = r.erro.nome
    throw erro
  }

  private async chamar<M extends Exclude<Metodo, 'iniciar'>>(
    metodo: M,
    ...args: ArgsPorMetodo[M]
  ): Promise<unknown> {
    await this.duracaoBoot()
    return this.despachar({ id: ++this.seq, metodo, args } as Pedido)
  }

  async obter<K extends MetricaId>(
    id: K,
    filtros: ContratoMetricas[K]['filtros'],
  ): Promise<ResultadoDe<K>> {
    // A espera da latência (D7) fica na thread principal; o sorteio vem do núcleo, na ordem das chamadas.
    const ms = this.opcoes.latenciaMs ?? ((await this.chamar('latencia')) as number)
    await esperar(ms)
    return (await this.chamar('obter', id, filtros)) as ResultadoDe<K>
  }

  async opcoesFiltro<D extends Dominio>(
    dominio: D,
  ): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    return (await this.chamar('opcoesFiltro', dominio)) as Extract<OpcoesFiltro, { dominio: D }>
  }

  async criterios(): Promise<VersaoCriterio[]> {
    return (await this.chamar('criterios')) as VersaoCriterio[]
  }

  async dataReferencia(): Promise<string> {
    return (await this.chamar('dataReferencia')) as string
  }

  async estadoColeta(dominio: Dominio): Promise<EstadoColeta> {
    return (await this.chamar('estadoColeta', dominio)) as EstadoColeta
  }

  async historicoColetas(dominio: Dominio, pagina: number): Promise<PaginaColetas> {
    return (await this.chamar('historicoColetas', dominio, pagina)) as PaginaColetas
  }
}

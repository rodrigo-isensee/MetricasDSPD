import type {
  Dominio,
  EstadoColeta,
  MetricaId,
  OpcoesFiltro,
  PaginaColetas,
  ResultadoDe,
  VersaoCriterio,
} from '@metricas-dspd/contratos'
import type { ContratoMetricas } from '@metricas-dspd/contratos'
import { podeSimular } from '@metricas-dspd/contratos'
import type { z } from 'zod'
import type { FonteMetricas, OpcoesObter } from './FonteMetricas'
import { SemDadoRealErro } from './http/SemDadoRealErro'
import {
  filtrosSoPeriodo,
  RegistroSimulados,
  type FonteSimuladora,
  type OrigensSimuladas,
} from './simulado'

/** Cria a fonte mock, sob demanda, a partir do dia de referência da API (AAAA-MM-DD). Só roda no primeiro cartão simulado. */
export type CriarMock = (dia: string) => Promise<FonteMetricas>

const criarMockPadrao: CriarMock = async (dia) => {
  // O pacote mock só entra no chunk de MockFonteMetricas, sob demanda, nunca na thread principal (A1 do review).
  // A hora de corte vem do núcleo do mock, junto do resto do simulado: aqui só o dia.
  const { MockFonteMetricas } = await import('./mock/MockFonteMetricas')
  // Semente padrão (fixa): o mesmo cartão mostra o mesmo número a cada recarga. Sem latência artificial.
  return new MockFonteMetricas({ dia, latenciaMs: 0 })
}

/**
 * Decorador da fonte real (pedido 070, ADR 0028). Tudo o que é real passa direto: `obter` nunca chama o mock, então o
 * real sempre ganha e exportação, faixas e Resumo só veem dado real. O simulado é um caminho à parte (`obterSimulado`),
 * pedido só pelos cartões e só depois de um `sem-dado-real` com `simulavel`. O Worker e o chunk do mock só são
 * carregados nessa primeira vez.
 */
export class FonteComSimulado implements FonteSimuladora {
  private readonly registro = new RegistroSimulados()
  private mock: Promise<FonteMetricas> | null = null
  private readonly real: FonteMetricas
  private readonly criarMock: CriarMock
  private readonly jaAvisou = new Set<MetricaId>()

  constructor(
    real: FonteMetricas,
    { criarMock = criarMockPadrao }: { criarMock?: CriarMock } = {},
  ) {
    this.real = real
    this.criarMock = criarMock
  }

  get tipo(): 'mock' | 'api' {
    return this.real.tipo
  }

  get origensSimuladas(): OrigensSimuladas {
    return this.registro
  }

  async obter<K extends MetricaId>(
    id: K,
    filtros: ContratoMetricas[K]['filtros'],
    opcoes?: OpcoesObter,
  ): Promise<ResultadoDe<K>> {
    try {
      const r = await this.real.obter(id, filtros, opcoes)
      // O dado real chegou: o cartão deixa de ser simulado (a troca é sozinha, só pelo mapa de origem da API).
      this.registro.marcar(id, null)
      return r
    } catch (e) {
      if (e instanceof SemDadoRealErro && !e.simulavel) this.registro.marcar(id, null)
      throw e
    }
  }

  async obterSimulado<K extends MetricaId>(
    id: K,
    filtros: ContratoMetricas[K]['filtros'],
    motivo: string,
  ): Promise<ResultadoDe<K>> {
    try {
      // Falha fechada: mesmo que a resposta diga `simulavel`, o contrato é quem diz o que nunca se simula (R5).
      if (!podeSimular(id)) throw new Error(`Métrica fora da simulação: ${id}`)
      const { SCHEMAS_RESULTADO } = await import('@metricas-dspd/contratos/validacao')
      const mock = await this.obterMock()
      const bruto = await mock.obter(id, filtrosSoPeriodo(filtros))
      const schema = SCHEMAS_RESULTADO[id] as z.ZodType<ResultadoDe<K>>
      const r = schema.safeParse(bruto)
      if (!r.success) throw new Error(`Simulado fora do contrato: ${id}`)
      if (!this.jaAvisou.has(id)) {
        this.jaAvisou.add(id)
        console.info(`${id}: simulado`)
      }
      // O selo é ligado antes de o dado chegar à tela: nunca há número simulado sem selo.
      this.registro.marcar(id, { motivo })
      return r.data
    } catch (e) {
      this.registro.marcar(id, null)
      // Só o nome do erro: nada do conteúdo do dado.
      console.error(`${id}: simulado indisponível (${e instanceof Error ? e.name : 'erro'})`)
      throw e
    }
  }

  private obterMock(): Promise<FonteMetricas> {
    if (!this.mock) {
      const p = this.real
        .dataReferencia()
        .then((dia) => this.criarMock(dia))
        .catch((e: unknown) => {
          this.mock = null
          throw e
        })
      this.mock = p
    }
    return this.mock
  }

  opcoesFiltro<D extends Dominio>(dominio: D): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    return this.real.opcoesFiltro(dominio)
  }
  criterios(): Promise<VersaoCriterio[]> {
    return this.real.criterios()
  }
  dataReferencia(): Promise<string> {
    return this.real.dataReferencia()
  }
  estadoColeta(dominio: Dominio): Promise<EstadoColeta> {
    return this.real.estadoColeta(dominio)
  }
  historicoColetas(dominio: Dominio, pagina: number): Promise<PaginaColetas> {
    return this.real.historicoColetas(dominio, pagina)
  }
}

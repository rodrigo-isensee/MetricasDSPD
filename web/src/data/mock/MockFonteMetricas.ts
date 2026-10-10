import type { Dominio, MetricaId, VersaoCriterio } from '@metricas-dspd/contratos'
import {
  EQUIPES_SUSTENTACAO_ID,
  NOME_EQUIPE_SUSTENTACAO,
  TIPO_ID,
  type OpcoesFiltro,
} from '@metricas-dspd/contratos'
import type { ContratoMetricas, ResultadoDe } from '@metricas-dspd/contratos'
import { TIPOS_FILTRO, PRIORIDADES } from '@metricas-dspd/contratos'
import type { FonteMetricas } from '../FonteMetricas'

type Carregado = {
  ctx: import('@metricas-dspd/metricas').ContextosMetricas
  lib: typeof import('@metricas-dspd/metricas')
  base: import('@metricas-dspd/mock').BaseMock
  /** Sorteio da latência: derivado da semente, determinístico. */
  sorteio: () => number
}

/** Devolve a thread principal ao navegador entre fases pesadas (tarefa longa < 200 ms, ADR 0003 C6). */
const ceder = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

export interface OpcoesMock {
  semente?: number
  /** Data de corte ISO com fuso (ex.: 2026-10-09T18:00:00-03:00). */
  hoje?: string
  /**
   * Atraso artificial por chamada de métrica (D7). Sem valor: sorteia 150 a 400 ms por chamada
   * pelo PRNG com semente. `0` desliga (testes unitários e E2E); outro número fixa o atraso.
   */
  latenciaMs?: number
}

/**
 * Fonte de dados fictícios. Gera a base uma única vez (memoizada) e calcula cada métrica com a
 * biblioteca única. O gerador e a biblioteca são carregados por `import()` dinâmico para não
 * pesar no chunk inicial. Também é assíncrona, para a troca por API ser transparente.
 */
export class MockFonteMetricas implements FonteMetricas {
  readonly tipo = 'mock' as const
  private carregado: Promise<Carregado> | null = null

  private readonly opcoes: OpcoesMock

  constructor(opcoes: OpcoesMock = {}) {
    this.opcoes = opcoes
  }

  private carregar(): Promise<Carregado> {
    this.carregado ??= (async () => {
      const [mock, lib] = await Promise.all([
        import('@metricas-dspd/mock'),
        import('@metricas-dspd/metricas'),
      ])
      const parcial: { semente?: number; hoje?: string } = {}
      if (this.opcoes.semente !== undefined) parcial.semente = this.opcoes.semente
      if (this.opcoes.hoje !== undefined) parcial.hoje = this.opcoes.hoje
      await ceder()
      const base = mock.gerarBaseMock(parcial)
      await ceder()
      const bm = lib.businessmap.criarContextoBM(base.bm, base.config.hoje, lib.CALENDARIO_PADRAO)
      await ceder()
      const ac = lib.acelerato.criarContextoAC(base.ac, base.config.hoje, lib.CALENDARIO_PADRAO)
      const ctx = { bm, ac }
      // A Visão geral usa uma só data de corte: os dois contextos têm de concordar (review B13).
      if (ctx.bm.hojeIso !== ctx.ac.hojeIso)
        throw new Error(`Datas de corte divergentes: ${ctx.bm.hojeIso} x ${ctx.ac.hojeIso}`)
      const rng = mock.derivar(base.config.semente, 'latencia')
      return { ctx, lib, base, sorteio: () => mock.sortearLatencia(rng) }
    })()
    return this.carregado
  }

  private async atraso(sorteio: () => number): Promise<void> {
    const ms = this.opcoes.latenciaMs ?? sorteio()
    if (ms > 0) await new Promise((r) => setTimeout(r, ms))
  }

  async obter<K extends MetricaId>(
    id: K,
    filtros: ContratoMetricas[K]['filtros'],
  ): Promise<ResultadoDe<K>> {
    const { ctx, lib, sorteio } = await this.carregar()
    await this.atraso(sorteio)
    return lib.calcularMetrica(id, filtros, ctx)
  }

  async opcoesFiltro<D extends Dominio>(
    dominio: D,
  ): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    const { lib, base } = await this.carregar()
    const historico = {
      inicio: lib.dataIso(lib.minimo(base.bm.cards.map((c) => c.criado_em)), lib.CALENDARIO_PADRAO),
      fim: lib.dataIso(
        lib.instanteDeIso(base.config.hoje, lib.CALENDARIO_PADRAO),
        lib.CALENDARIO_PADRAO,
      ),
    }
    const r: OpcoesFiltro =
      dominio === 'businessmap'
        ? {
            dominio: 'businessmap',
            equipes: base.bm.config.equipes.map((e) => ({ id: lib.slug(e.nome), nome: e.nome })),
            tipos: TIPOS_FILTRO.map((t) => ({ id: TIPO_ID[t], nome: t })),
            sistemas: base.bm.config.sistemas.map((s) => ({ id: lib.slug(s), nome: s })),
            historico,
          }
        : {
            dominio: 'acelerato',
            equipes: EQUIPES_SUSTENTACAO_ID.map((id) => ({
              id,
              nome: NOME_EQUIPE_SUSTENTACAO[id],
            })),
            prioridades: PRIORIDADES.map((p) => ({ id: p.toLowerCase(), nome: p })),
            historico: {
              inicio: lib.dataIso(
                lib.minimo(base.ac.chamados.map((c) => c.aberto_em)),
                lib.CALENDARIO_PADRAO,
              ),
              fim: historico.fim,
            },
          }
    return r as Extract<OpcoesFiltro, { dominio: D }>
  }

  async criterios(): Promise<VersaoCriterio[]> {
    const { base } = await this.carregar()
    const vistos = new Map<string, VersaoCriterio>()
    for (const v of [...base.bm.config.criterios, ...base.ac.config.criterios]) vistos.set(v.id, v)
    return [...vistos.values()].sort((a, b) => a.data.localeCompare(b.data))
  }

  async dataReferencia(): Promise<string> {
    const { lib, base } = await this.carregar()
    return lib.dataIso(
      lib.instanteDeIso(base.config.hoje, lib.CALENDARIO_PADRAO),
      lib.CALENDARIO_PADRAO,
    )
  }
}

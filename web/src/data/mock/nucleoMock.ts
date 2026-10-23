/**
 * Núcleo do mock (ADR 0021): geração da base, normalização de `data_acordada`, contextos, extensões, coletas,
 * `calcularMetrica` e `paginarO2`. Módulo puro: sem DOM e sem `postMessage`. O invólucro do Worker
 * (`nucleoMock.worker.ts`) e o fallback em processo (`MockFonteMetricas`) chamam este mesmo código.
 * Todo cálculo passa pela biblioteca única (`@metricas-dspd/metricas`).
 */
import type {
  ContratoMetricas,
  Dominio,
  EstadoColeta,
  MetricaId,
  OpcoesFiltro,
  PaginaColetas,
  ResultadoDe,
  VersaoCriterio,
} from '@metricas-dspd/contratos'
import { EQUIPES_SUSTENTACAO_ID, NOME_EQUIPE_SUSTENTACAO, TIPO_ID } from '@metricas-dspd/contratos'
import { TIPOS_FILTRO, PRIORIDADES } from '@metricas-dspd/contratos'
import type { ResultadoO2Paginado } from '@metricas-dspd/contratos/validacao'
import * as lib from '@metricas-dspd/metricas'
import type { ExtensaoTambemBM } from '@metricas-dspd/metricas/businessmap'
import * as mock from '@metricas-dspd/mock'
import type { OpcoesNucleo, Pedido, Resposta } from './protocolo'

type Carregado = {
  ctx: lib.ContextosMetricas
  /** Critérios da pesquisa (dominio 'pesquisa', T2.6), lidos do contexto da terceira fonte. */
  criteriosPesquisa: VersaoCriterio[]
  base: mock.BaseMock
  /** Sorteio da latência: derivado da semente, determinístico. */
  sorteio: () => number
}

/** Métricas complementares: as únicas que precisam das extensões mockadas. */
const COMPLEMENTARES: ReadonlySet<MetricaId> = new Set<MetricaId>([
  'O5',
  'O6',
  'O8',
  'O11',
  'O13',
  'O14',
  'O16',
  'O17',
  'T6',
  'T8',
  'E4',
  'E5',
  'S8',
  'S9',
  'S10',
  'S11',
  'S12',
])

/**
 * Métricas do pedido 011 que leem a extensão `ctx.tambem` (campos de extração nova, só em mock). É o subconjunto
 * E6/E8 de `COM_EXTENSAO_MOCK` (em `contratos`): ao entrar métrica nova dos lotes 2 e 3 (O22, O26, T13, T14),
 * atualize as duas listas juntas.
 */
const COM_TAMBEM: ReadonlySet<MetricaId> = new Set<MetricaId>(['E6', 'E8'])

/** Itens do O2 por página: o mesmo da API (`pageSize=200`, página 1). */
const PAGINA_O2 = 200

/**
 * O2 no formato da API (R3 do plano front-via-api): `itens` da página 1 (até 200), ordenados por idade
 * decrescente com desempate por `cardId`, e `itensMeta` com o total do conjunto completo.
 */
export function paginarO2(r: ResultadoDe<'O2'>): ResultadoO2Paginado {
  const ordenados = [...r.itens].sort(
    (a, b) =>
      b.idadeDiasUteis - a.idadeDiasUteis ||
      (a.cardId < b.cardId ? -1 : a.cardId > b.cardId ? 1 : 0),
  )
  return {
    ...r,
    itens: ordenados.slice(0, PAGINA_O2),
    itensMeta: { page: 1, pageSize: PAGINA_O2, total: ordenados.length },
  }
}

/** Devolve a thread ao navegador entre fases pesadas (tarefa longa < 200 ms, ADR 0003 C6). */
const ceder = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

/** Mede a geração da base e dos contextos (informativo, ADR 0021 seção 5, C2). */
export interface Boot {
  bootMs: number
}

export class NucleoMock {
  private carregado: Promise<Carregado> | null = null
  private coletas: Promise<mock.ColetasMock> | null = null
  private extensoes: Promise<lib.ExtensoesMetricas> | null = null
  private tambem: Promise<ExtensaoTambemBM> | null = null

  private readonly opcoes: OpcoesNucleo

  constructor(opcoes: OpcoesNucleo = {}) {
    this.opcoes = opcoes
  }

  /** Gera a base e os contextos (uma vez) e devolve a duração, medida dentro de quem executa. */
  async iniciar(): Promise<Boot> {
    const t0 = performance.now()
    await this.carregar()
    return { bootMs: performance.now() - t0 }
  }

  private carregar(): Promise<Carregado> {
    this.carregado ??= (async () => {
      const parcial: { semente?: number; hoje?: string } = {}
      if (this.opcoes.semente !== undefined) parcial.semente = this.opcoes.semente
      if (this.opcoes.hoje !== undefined) parcial.hoje = this.opcoes.hoje
      await ceder()
      const gerada = mock.gerarBaseMock(parcial)
      // `data_acordada` é uma data (briefing: tipo Data; coluna `date` no banco) que vale até o fim do expediente do dia (P2):
      // o gerador sorteia um instante, e a API só tem o dia. Normaliza aqui (o gerador e o hash da base ficam como estão)
      // para o mock e a API calcularem o O12 sobre o mesmo valor (FA-003).
      const cal = lib.CALENDARIO_PADRAO
      const base = {
        ...gerada,
        bm: {
          ...gerada.bm,
          cards: gerada.bm.cards.map((c) =>
            c.data_acordada === null
              ? c
              : {
                  ...c,
                  data_acordada: lib.fimDoExpediente(lib.diaLocal(c.data_acordada, cal), cal),
                },
          ),
        },
      }
      await ceder()
      const bm = lib.businessmap.criarContextoBM(base.bm, base.config.hoje, lib.CALENDARIO_PADRAO)
      await ceder()
      const ac = lib.acelerato.criarContextoAC(base.ac, base.config.hoje, lib.CALENDARIO_PADRAO)
      const pesq = lib.pesquisa.criarContextoPesquisa(
        mock.gerarPesquisaMock(base.config),
        base.config.hoje,
      )
      const ctx = { bm, ac, pesq }
      // A Visão geral usa uma só data de corte: os dois contextos têm de concordar (review B13).
      if (ctx.bm.hojeIso !== ctx.ac.hojeIso)
        throw new Error(`Datas de corte divergentes: ${ctx.bm.hojeIso} x ${ctx.ac.hojeIso}`)
      const rng = mock.derivar(base.config.semente, 'latencia')
      return {
        ctx,
        criteriosPesquisa: pesq.base.criterios,
        base,
        sorteio: () => mock.sortearLatencia(rng),
      }
    })()
    return this.carregado
  }

  /** Extensões mockadas (causa raiz, sprint, natureza, reabertura...), fora da base: o hash dela não muda. */
  private carregarExtensoes(): Promise<lib.ExtensoesMetricas> {
    this.extensoes ??= this.carregar().then(async ({ base }) => {
      await ceder()
      return mock.gerarExtensoesMock(base)
    })
    return this.extensoes
  }

  /** Extensão do pedido 011 (E6, E8): lazy e separada das demais, como no servidor (ADR 0003, C1 e C2). */
  private carregarTambem(): Promise<ExtensaoTambemBM> {
    this.tambem ??= this.carregar().then(async ({ base }) => {
      await ceder()
      return mock.gerarExtensaoTambemMock(base)
    })
    return this.tambem
  }

  /** Próximo atraso simulado (D7), na mesma ordem das chamadas a `obter`. */
  async latencia(): Promise<number> {
    const { sorteio } = await this.carregar()
    return sorteio()
  }

  async obter<K extends MetricaId>(
    id: K,
    filtros: ContratoMetricas[K]['filtros'],
  ): Promise<ResultadoDe<K>> {
    const { ctx } = await this.carregar()
    // As extensões das complementares só são geradas quando uma delas é pedida (carga sob demanda).
    const comExt = COMPLEMENTARES.has(id) ? { ...ctx, ext: await this.carregarExtensoes() } : ctx
    const completo = COM_TAMBEM.has(id)
      ? { ...comExt, tambem: await this.carregarTambem() }
      : comExt
    const r = lib.calcularMetrica(id, filtros, completo)
    if (id === 'O2') return paginarO2(r as unknown as ResultadoDe<'O2'>)
    return r
  }

  async opcoesFiltro<D extends Dominio>(
    dominio: D,
  ): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    const { base } = await this.carregar()
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
            // Em ordem alfabética, como a API (as equipes do banco vêm ordenadas por nome).
            equipes: base.bm.config.equipes
              .map((e) => ({ id: lib.slug(e.nome), nome: e.nome }))
              .sort((x, y) => x.nome.localeCompare(y.nome, 'pt-BR')),
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
    const { base, criteriosPesquisa } = await this.carregar()
    const vistos = new Map<string, VersaoCriterio>()
    for (const v of [
      ...base.bm.config.criterios,
      ...base.ac.config.criterios,
      ...criteriosPesquisa,
    ])
      vistos.set(v.id, v)
    return [...vistos.values()].sort((a, b) => a.data.localeCompare(b.data))
  }

  async dataReferencia(): Promise<string> {
    const { base } = await this.carregar()
    return lib.dataIso(
      lib.instanteDeIso(base.config.hoje, lib.CALENDARIO_PADRAO),
      lib.CALENDARIO_PADRAO,
    )
  }

  /** Coletas fictícias (fora da base: o hash da base não muda), geradas sob demanda e memoizadas. */
  private carregarColetas(): Promise<mock.ColetasMock> {
    this.coletas ??= this.carregar().then(({ base }) => mock.gerarColetasMock(base))
    return this.coletas
  }

  async estadoColeta(dominio: Dominio): Promise<EstadoColeta> {
    const [{ base }, coletas, versoes] = await Promise.all([
      this.carregar(),
      this.carregarColetas(),
      this.criterios(),
    ])
    return lib.montarEstadoColeta(
      dominio,
      coletas[dominio],
      versoes,
      lib.instanteDeIso(base.config.hoje, lib.CALENDARIO_PADRAO),
    )
  }

  async historicoColetas(dominio: Dominio, pagina: number): Promise<PaginaColetas> {
    const coletas = await this.carregarColetas()
    return lib.paginarColetas(coletas[dominio], pagina)
  }
}

/** Estado de um Worker: o núcleo nasce na mensagem `iniciar`. */
export interface EstadoWorker {
  nucleo?: NucleoMock
}

/**
 * Trata um pedido do RPC (usado pelo invólucro do Worker): devolve a resposta com o mesmo `id`, ou o erro com
 * nome e mensagem (a thread principal o rejeita com `Error` de mesma mensagem).
 */
export async function tratarPedido(estado: EstadoWorker, pedido: Pedido): Promise<Resposta> {
  try {
    let valor: unknown
    if (pedido.metodo === 'iniciar') {
      estado.nucleo = new NucleoMock(pedido.args[0])
      valor = await estado.nucleo.iniciar()
    } else {
      const n = estado.nucleo as NucleoMock
      switch (pedido.metodo) {
        case 'obter':
          valor = await n.obter(pedido.args[0], pedido.args[1] as never)
          break
        case 'opcoesFiltro':
          valor = await n.opcoesFiltro(pedido.args[0])
          break
        case 'criterios':
          valor = await n.criterios()
          break
        case 'dataReferencia':
          valor = await n.dataReferencia()
          break
        case 'estadoColeta':
          valor = await n.estadoColeta(pedido.args[0])
          break
        case 'historicoColetas':
          valor = await n.historicoColetas(pedido.args[0], pedido.args[1])
          break
        case 'latencia':
          valor = await n.latencia()
          break
      }
    }
    return { id: pedido.id, ok: true, valor }
  } catch (e) {
    const erro = e instanceof Error ? e : new Error(String(e))
    return { id: pedido.id, ok: false, erro: { nome: erro.name, mensagem: erro.message } }
  }
}

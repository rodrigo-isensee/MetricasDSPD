import { describe, expect, it } from 'vitest'
import {
  METRICA_IDS,
  fonteDaMetrica,
  type Dominio,
  type FiltrosFluxo,
  type FiltrosSustentacao,
  type MetricaId,
} from '@metricas-dspd/contratos'
import * as lib from '@metricas-dspd/metricas'
import * as mock from '@metricas-dspd/mock'
import { NucleoMock, paginarO2 } from './nucleoMock'

/**
 * Paridade 1 a 3 da ADR 0021: o núcleo (que roda no Worker e em processo) contra a biblioteca chamada direto sobre a
 * mesma base, atravessando a fronteira de clone. Aqui a "referência" monta os contextos por conta própria, sem o núcleo.
 */
const SEMENTES: (number | undefined)[] = [undefined, 12345]

function referencia(semente: number | undefined) {
  const base = mock.gerarBaseMock(semente === undefined ? {} : { semente })
  const cal = lib.CALENDARIO_PADRAO
  const bmBase = {
    ...base.bm,
    cards: base.bm.cards.map((c) =>
      c.data_acordada === null
        ? c
        : { ...c, data_acordada: lib.fimDoExpediente(lib.diaLocal(c.data_acordada, cal), cal) },
    ),
  }
  const pesq = lib.pesquisa.criarContextoPesquisa(
    mock.gerarPesquisaMock(base.config),
    base.config.hoje,
  )
  const ctx = {
    bm: lib.businessmap.criarContextoBM(bmBase, base.config.hoje, cal),
    ac: lib.acelerato.criarContextoAC(base.ac, base.config.hoje, cal),
    pesq,
  }
  const ext = mock.gerarExtensoesMock({ ...base, bm: bmBase })
  const tambem = mock.gerarExtensaoTambemMock({ ...base, bm: bmBase })
  const hoje = lib.dataIso(lib.instanteDeIso(base.config.hoje, cal), cal)
  const inicioBm = lib.dataIso(lib.minimo(bmBase.cards.map((c) => c.criado_em)), cal)
  const inicioAc = lib.dataIso(lib.minimo(base.ac.chamados.map((c) => c.aberto_em)), cal)
  return { base, ctx, ext, tambem, hoje, inicioBm, inicioAc }
}

const COM_EXT = new Set<MetricaId>([
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
const COM_TAMBEM = new Set<MetricaId>(['E6', 'E8', 'O22', 'O26'])

const SEM_FILTRO = (id: MetricaId) => id === 'VISAO_GERAL' || id === 'PV1'

function filtrosDe(id: MetricaId, r: ReturnType<typeof referencia>): object[] {
  if (SEM_FILTRO(id)) return [{}]
  if (id.startsWith('TENDENCIA_')) return [{ dataReferencia: r.hoje }]
  if (fonteDaMetrica(id) === 'acelerato') {
    const padrao: FiltrosSustentacao = { equipe: [], prioridade: [], periodo: { tipo: '6m' } }
    return [padrao, { ...padrao, periodo: { tipo: 'custom', de: r.inicioAc, ate: r.hoje } }]
  }
  const padrao: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
  return [padrao, { ...padrao, periodo: { tipo: 'custom', de: r.inicioBm, ate: r.hoje } }]
}

/** Item 2: só objeto simples, array, string, número finito, booleano ou null. */
function formaInvalida(v: unknown, caminho: string): string | null {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return null
  if (typeof v === 'number') return Number.isFinite(v) ? null : `${caminho}: número não finito`
  if (Array.isArray(v)) {
    for (const [i, x] of v.entries()) {
      const e = formaInvalida(x, `${caminho}[${i}]`)
      if (e) return e
    }
    return null
  }
  if (typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    for (const [k, x] of Object.entries(v)) {
      const e = formaInvalida(x, `${caminho}.${k}`)
      if (e) return e
    }
    return null
  }
  return `${caminho}: ${typeof v} fora do formato de dados simples`
}

describe.each(SEMENTES)('paridade do núcleo, semente %s', (semente) => {
  it('toda MetricaId: o núcleo clonado é idêntico à biblioteca direta, e o DTO é só dado simples', async () => {
    const r = referencia(semente)
    const nucleo = new NucleoMock(semente === undefined ? {} : { semente })
    for (const id of METRICA_IDS) {
      for (const f of filtrosDe(id, r)) {
        const ctx = COM_TAMBEM.has(id)
          ? { ...r.ctx, ext: r.ext, tambem: r.tambem }
          : COM_EXT.has(id)
            ? { ...r.ctx, ext: r.ext }
            : r.ctx
        const direto = lib.calcularMetrica(id, f, ctx)
        const esperado = id === 'O2' ? paginarO2(direto as never) : direto
        const obtido = await nucleo.obter(id, f)
        expect(structuredClone(obtido), `${id} ${JSON.stringify(f)}`).toStrictEqual(esperado)
        expect(formaInvalida(obtido, id), id).toBeNull()
      }
    }
  }, 180_000)

  it('opcoesFiltro, criterios, dataReferencia, estadoColeta e historicoColetas', async () => {
    const r = referencia(semente)
    const nucleo = new NucleoMock(semente === undefined ? {} : { semente })
    const cal = lib.CALENDARIO_PADRAO
    const coletas = mock.gerarColetasMock(r.base)
    const versoes = await nucleo.criterios()
    const doms: Dominio[] = ['businessmap', 'acelerato']
    const lidos: unknown[] = [versoes, await nucleo.dataReferencia()]
    for (const d of doms) {
      lidos.push(
        await nucleo.opcoesFiltro(d),
        await nucleo.estadoColeta(d),
        await nucleo.historicoColetas(d, 1),
      )
      expect(await nucleo.estadoColeta(d)).toStrictEqual(
        lib.montarEstadoColeta(d, coletas[d], versoes, lib.instanteDeIso(r.base.config.hoje, cal)),
      )
      expect(await nucleo.historicoColetas(d, 1)).toStrictEqual(lib.paginarColetas(coletas[d], 1))
    }
    expect(await nucleo.dataReferencia()).toBe(r.hoje)
    expect((await nucleo.opcoesFiltro('businessmap')).historico).toStrictEqual({
      inicio: r.inicioBm,
      fim: r.hoje,
    })
    expect((await nucleo.opcoesFiltro('acelerato')).historico).toStrictEqual({
      inicio: r.inicioAc,
      fim: r.hoje,
    })
    lidos.forEach((v, i) => {
      expect(formaInvalida(v, `leitura${i}`)).toBeNull()
      expect(structuredClone(v)).toStrictEqual(v)
    })
  }, 60_000)

  it('as 20 primeiras latências são as do sorteio por semente de antes do Worker', async () => {
    const nucleo = new NucleoMock(semente === undefined ? {} : { semente })
    const rng = mock.derivar(semente ?? mock.CONFIG_PADRAO.semente, 'latencia')
    for (let i = 0; i < 20; i++) expect(await nucleo.latencia()).toBe(mock.sortearLatencia(rng))
  })
})

describe('determinismo da base', () => {
  it('os hashes da base, do Acelerato e das extensões seguem os de antes', () => {
    const base = mock.gerarBaseMock()
    expect(mock.hashJson(base)).toBe('68a67741')
    expect(mock.hashJson(base.ac)).toBe('0113e077')
    expect(mock.hashJson(mock.gerarExtensaoTambemMock(base))).toBe('9159f65b')
  })

  it('a duração do boot é informada e a base do núcleo não altera a gerada (hash estável)', async () => {
    const { bootMs } = await new NucleoMock().iniciar()
    expect(bootMs).toBeGreaterThanOrEqual(0)
    expect(mock.hashJson(mock.gerarBaseMock())).toBe('68a67741')
  })
})

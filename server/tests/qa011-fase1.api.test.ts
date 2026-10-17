import { MINIMO_AMOSTRA, METRICA_IDS, type MetricaId } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { slug } from '@metricas-dspd/metricas'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { resultadoO2PaginadoSchema } from '../src/modulos/metricas/schemas.js'
import { bancoDoMock } from './base-duble.js'
import { criarDublePg } from './duble-pg.js'

/**
 * QA do back do pedido 011, fase 1 (docs/qa/011-back.md): A-2, A-5, A-6, A-11 e A-12 do plano. O que as suítes
 * `api.sistemico-intensivo` e `metricas.paridade` já varrem nas 60 ids (A-1, A-3, A-4, A-7, A-9) não se repete aqui.
 * B11b: o T11 entra em A-2 (não é 404), T11-5 e no corte no meio do mês (T11-B11b-1), por API. As ids da fase 2 entraram
 * com o cálculo (A-2 mudou de 404 para 200); a fase 3 não cria id novo.
 */
const AGORA = new Date('2026-10-10T15:00:00Z')
const base = gerarBaseMock({ escala: 0.25 })
const FASE1 = [
  'O2',
  'O19',
  'O20',
  'O21',
  'O24',
  'O25',
  'T10',
  'T12',
  'E7',
  'E9',
] as const satisfies readonly MetricaId[]
const url = (id: string, q = ''): string => `/api/v1/metricas/${id}${q ? `?${q}` : ''}`
const schemaDe = (id: MetricaId) =>
  id === 'O2' ? resultadoO2PaginadoSchema : SCHEMAS_RESULTADO[id]
let app: Awaited<ReturnType<typeof buildApp>>

beforeAll(async () => {
  app = await buildApp({
    db: criarDublePg(bancoDoMock(base)).pool,
    agora: () => AGORA,
    nivelLog: 'silent',
  })
}, 60_000)

/** Objetos com percentil numérico e n abaixo do mínimo, ou `insuficiente` com percentil. */
function violacoes(x: unknown, caminho = '$', out: string[] = []): string[] {
  if (Array.isArray(x)) x.forEach((v, i) => violacoes(v, `${caminho}[${i}]`, out))
  else if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    const pct = ['p50', 'p85', 'p95'].some((k) => typeof o[k] === 'number')
    if (pct && typeof o.n === 'number' && o.n < MINIMO_AMOSTRA) out.push(`${caminho} n=${o.n}`)
    if (pct && o.status === 'insuficiente') out.push(`${caminho} insuficiente com percentil`)
    for (const [k, v] of Object.entries(o)) violacoes(v, `${caminho}.${k}`, out)
  }
  return out
}

describe('A-2: cada id entra com o seu cálculo (nenhum dado inventado)', () => {
  // Fase 2 (E1 e E2 do back): as deste lote entraram com o cálculo, o contrato e o mock; antes disso eram 404.
  it.each(['T13', 'T14', 'E6', 'E8'] as const)(
    '%s: existe no catálogo, responde 200 no schema e, sem a extensão do mock, o estado vazio',
    async (id) => {
      expect((METRICA_IDS as readonly string[]).includes(id), `${id} no catálogo`).toBe(true)
      const r = await app.inject(url(id, 'equipe=fluig'))
      expect(r.statusCode).toBe(200)
      expect(SCHEMAS_RESULTADO[id].safeParse(r.json()).success).toBe(true)
    },
  )
  it('id de lote seguinte (operacionais), da fase 3 ou inexistente: 404 METRICA_NAO_ENCONTRADA', async () => {
    for (const id of ['O22', 'O26', 'O27', 'T15', 'E10']) {
      const r = await app.inject(url(id))
      expect(r.statusCode).toBe(404)
      expect(r.json().error.code).toBe('METRICA_NAO_ENCONTRADA')
    }
  })
})

describe('A-5 / A-6: recorte pequeno e recorte vazio nas 10 ids da fase 1', () => {
  const equipes = base.bm.config.equipes.map((e) => slug(e.nome))
  const periodos = ['', 'periodo=4s', 'periodo=12m', 'periodo=custom&de=2025-04-09&ate=2025-04-20']
  it.each(FASE1)(
    '%s: toda equipe e todo período dão 200 no schema, sem percentil abaixo de 20',
    async (id) => {
      expect(equipes.length).toBeGreaterThanOrEqual(2)
      let vistas = 0
      for (const eq of ['', ...equipes.map((e) => `equipe=${e}`)]) {
        for (const p of periodos) {
          const q = [eq, p].filter(Boolean).join('&')
          const r = await app.inject(url(id, q))
          expect(r.statusCode, `${id}?${q} ${r.body.slice(0, 160)}`).toBe(200)
          expect(schemaDe(id).safeParse(r.json()).success, `${id}?${q} fora do schema`).toBe(true)
          expect(violacoes(r.json()), `${id}?${q}`).toEqual([])
          vistas++
        }
      }
      expect(vistas).toBe((equipes.length + 1) * periodos.length)
    },
    120_000,
  )

  it('período futuro não inventa dado: 422 PERIODO_FORA_DO_HISTORICO nas 10 ids', async () => {
    for (const id of FASE1) {
      const r = await app.inject(url(id, 'periodo=custom&de=2027-01-04&ate=2027-01-29'))
      expect(r.statusCode, id).toBe(422)
      expect(r.json().error.code, id).toBe('PERIODO_FORA_DO_HISTORICO')
    }
  })

  it('recorte sem dado dentro do histórico: T10 vazio (0 bloqueios, nenhum fornecedor) e O20 de fim de semana sem dias, 200 válido', async () => {
    const inicio = 'periodo=custom&de=2025-04-09&ate=2025-04-20'
    const t10 = (await app.inject(url('T10', inicio))).json()
    expect(t10.base.n).toBe(0)
    expect(t10.fornecedores).toEqual([])
    const fds = await app.inject(url('O20', 'periodo=custom&de=2025-04-12&ate=2025-04-13'))
    expect(fds.statusCode).toBe(200)
    expect(schemaDe('O20').safeParse(fds.json()).success).toBe(true)
    expect(fds.json().dias).toEqual([])
  })
})

describe('A-11: as rotas de métrica são só de leitura', () => {
  it.each(['POST', 'PUT', 'PATCH', 'DELETE'] as const)(
    '%s em /metricas/O20 não é aceito e nada muda',
    async (metodo) => {
      const antes = (await app.inject(url('O20'))).body
      const r = await app.inject({
        method: metodo,
        url: url('O20'),
        payload: { qualquer: 'coisa' },
      })
      expect([404, 405]).toContain(r.statusCode)
      expect((await app.inject(url('O20'))).body).toBe(antes)
    },
  )
})

describe('A-12 / AL-1: a Visão geral não alerta por nenhuma métrica da fase 1', () => {
  it('nenhum alerta nem indicador é de O19, O20, O21, O23, O24, O25, T10, T12, E7 ou E9', async () => {
    const r = await app.inject(url('VISAO_GERAL'))
    expect(r.statusCode).toBe(200)
    const vg = r.json() as {
      alertas: { codigo: string }[]
      niveis: { indicadores: { metrica: string; codigo: string }[] }[]
    }
    const fase1 = /^(O19|O20|O21|O23|O24|O25|T10|T12|E7|E9)(_|$)/
    for (const a of vg.alertas) expect(a.codigo).not.toMatch(fase1)
    const indicadores = vg.niveis.flatMap((n) => n.indicadores)
    expect(indicadores.length).toBeGreaterThan(5)
    for (const i of indicadores) {
      expect(i.metrica).not.toMatch(fase1)
      expect(i.codigo).not.toMatch(fase1)
    }
  })
})

describe('T11-5 e B11b-1 pela API: sem percentil, sem equipe vazia, e o corte no meio do mês nunca mostra dado além do corte', () => {
  type Mes = { mes: number; entradas: number | null; emAndamento: boolean }
  type T11 = {
    anos: { ano: number; meses: Mes[] }[]
    mesesComDado: number
    historicoCurto: boolean
    base: { n: number }
  }
  const mes = (r: T11, ano: number, m: number): Mes =>
    r.anos.find((a) => a.ano === ano)!.meses.find((x) => x.mes === m)!
  const get = async (q: string): Promise<T11> => {
    const r = await app.inject(url('T11', q))
    expect(r.statusCode, `T11?${q}`).toBe(200)
    expect(SCHEMAS_RESULTADO.T11.safeParse(r.json()).success, `T11?${q} fora do schema`).toBe(true)
    return r.json() as T11
  }

  it('T11 existe (não é 404) e está no catálogo; não traz percentil nem estatística (censo)', async () => {
    expect((METRICA_IDS as readonly string[]).includes('T11')).toBe(true)
    const r = await get('')
    expect(violacoes(r)).toEqual([])
    expect(JSON.stringify(r)).not.toMatch(/"(p50|p85|p95|estatistica)"/)
  })

  it('toda equipe dá 200 no schema e a soma das equipes não passa do total (recorte nunca cria entrada)', async () => {
    const total = (await get('')).base.n
    const equipes = base.bm.config.equipes.map((e) => slug(e.nome))
    let soma = 0
    for (const e of equipes) soma += (await get(`equipe=${e}`)).base.n
    expect(equipes.length).toBeGreaterThanOrEqual(2)
    expect(soma).toBeLessThanOrEqual(total)
    expect(soma).toBeGreaterThan(0)
  })

  it('corte no meio do mês: n e meses crescem com a data; o mês do corte só fecha no último dia', async () => {
    const d10 = await get('dataReferencia=2026-08-10')
    const d31 = await get('dataReferencia=2026-08-31')
    const s15 = await get('dataReferencia=2026-09-15')
    const hoje = await get('')
    expect(d10.base.n).toBeLessThan(d31.base.n)
    expect(d31.base.n).toBeLessThan(s15.base.n)
    expect(s15.base.n).toBeLessThan(hoje.base.n)
    expect(mes(d10, 2026, 8).emAndamento).toBe(true)
    expect(mes(d31, 2026, 8).emAndamento).toBe(false)
    expect(mes(d10, 2026, 8).entradas!).toBeLessThan(mes(d31, 2026, 8).entradas!)
    // Nada além do corte: em 10/08 setembro e outubro de 2026 não têm contagem
    expect(mes(d10, 2026, 9).entradas ?? null).toBeNull()
    expect(mes(d10, 2026, 10).entradas ?? null).toBeNull()
    // primeiro dia do mês: o mês do corte entra em andamento com o que houve até aquele dia
    expect(mes(await get('dataReferencia=2026-09-01'), 2026, 9).emAndamento).toBe(true)
  })
})

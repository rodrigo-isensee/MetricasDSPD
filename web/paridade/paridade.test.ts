/**
 * FA-4: paridade MockFonteMetricas x HttpFonteMetricas contra a API real local (DADOS_FONTE=mock).
 * Rode com `pnpm run test:paridade` (raiz), que sobe a API com o mock semeado (scripts/com-api-mock.sh).
 *
 * Duas comparações por métrica e conjunto de filtros:
 *  - "após o parse": o que a tela recebe (o Zod do contrato descarta campo não declarado);
 *  - "corpo bruto": o JSON que a API enviou x o resultado do mock, para pegar campo descartado pelo parse
 *    (ex.: `janela.quantidade/unidade` do O2) e schema que não é `.strict()`.
 */
import {
  METRICA_IDS,
  METRICAS_SUSTENTACAO,
  PRIORIDADES,
  TIPOS_FILTRO,
  type FiltrosFluxo,
  type FiltrosSustentacao,
  type MetricaId,
} from '@metricas-dspd/contratos'
import { resultadoO2PaginadoSchema, SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { beforeAll, describe, expect, it } from 'vitest'
import { HttpFonteMetricas } from '../src/data/http/HttpFonteMetricas'
import { MockFonteMetricas } from '../src/data/mock/MockFonteMetricas'

const API_URL = process.env.API_URL
const d = describe.skipIf(!API_URL)

const mock = new MockFonteMetricas({ latenciaMs: 0 })
const corpos = new Map<string, string>()
/** `fetch` que guarda o corpo bruto de cada resposta, por caminho. */
const fetchGravando: typeof fetch = async (url, init) => {
  const r = await fetch(url, init)
  corpos.set(
    typeof url === 'string' ? url : url instanceof URL ? url.href : url.url,
    await r.clone().text(),
  )
  return r
}
const http = new HttpFonteMetricas({ base: `${API_URL}/api/v1`, fetchImpl: fetchGravando })

type Conjunto = { nome: string; filtros: object }

function conjuntosFluxo(equipe: string, sistema: string, ref: string): Conjunto[] {
  const base = { equipe: [], tipo: [], sistema: [] }
  const dias = (n: number) =>
    new Date(Date.parse(`${ref}T12:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10)
  const f = (p: Partial<FiltrosFluxo>): FiltrosFluxo => ({
    ...base,
    periodo: { tipo: '12s' },
    ...p,
  })
  return [
    { nome: 'padrão 12s', filtros: f({}) },
    { nome: '4s', filtros: f({ periodo: { tipo: '4s' } }) },
    { nome: '6m', filtros: f({ periodo: { tipo: '6m' } }) },
    { nome: '12m', filtros: f({ periodo: { tipo: '12m' } }) },
    { nome: 'tipo Incidente+Melhoria', filtros: f({ tipo: ['Incidente', 'Melhoria'] }) },
    { nome: 'todos os tipos', filtros: f({ tipo: [...TIPOS_FILTRO] }) },
    { nome: 'equipe+sistema', filtros: f({ equipe: [equipe], sistema: [sistema] }) },
    {
      nome: 'personalizado 8 semanas',
      filtros: f({ periodo: { tipo: 'custom', de: dias(56), ate: ref } }),
    },
    {
      nome: 'combinado 6m',
      filtros: f({
        equipe: [equipe],
        tipo: ['Defeito em produção'],
        sistema: [sistema],
        periodo: { tipo: '6m' },
      }),
    },
  ]
}

function conjuntosSust(ref: string): Conjunto[] {
  const dias = (n: number) =>
    new Date(Date.parse(`${ref}T12:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10)
  const f = (p: Partial<FiltrosSustentacao>): FiltrosSustentacao => ({
    equipe: [],
    prioridade: [],
    periodo: { tipo: '12s' },
    ...p,
  })
  return [
    { nome: 'padrão 12s', filtros: f({}) },
    { nome: '4s', filtros: f({ periodo: { tipo: '4s' } }) },
    { nome: '6m', filtros: f({ periodo: { tipo: '6m' } }) },
    { nome: '12m', filtros: f({ periodo: { tipo: '12m' } }) },
    { nome: 'equipe totvs', filtros: f({ equipe: ['totvs'] }) },
    { nome: 'duas equipes', filtros: f({ equipe: ['senior', 'fluig'] }) },
    { nome: 'prioridade', filtros: f({ prioridade: [PRIORIDADES[0]] }) },
    {
      nome: 'personalizado 8 semanas',
      filtros: f({ periodo: { tipo: 'custom', de: dias(56), ate: ref } }),
    },
    {
      nome: 'combinado 6m',
      filtros: f({
        equipe: ['totvs'],
        prioridade: [PRIORIDADES[0], PRIORIDADES[1]],
        periodo: { tipo: '6m' },
      }),
    },
  ]
}

/** Texto curto de um valor (JSON.stringify devolve undefined para `undefined`, apesar do tipo). */
const txt = (v: unknown): string =>
  ((JSON.stringify(v) as string | undefined) ?? 'undefined').slice(0, 60)

/** Primeiras diferenças entre dois JSON, como `caminho: mock=... api=...` (mensagem legível, sem despejar o objeto). */
function difs(mock: unknown, api: unknown, caminho = '$', saida: string[] = []): string[] {
  if (saida.length >= 4) return saida
  const obj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
  if (obj(mock) && obj(api) && Array.isArray(mock) === Array.isArray(api)) {
    for (const k of new Set([...Object.keys(mock), ...Object.keys(api)])) {
      if (!(k in api)) saida.push(`${caminho}.${k}: só no mock`)
      else if (!(k in mock)) saida.push(`${caminho}.${k}: só na API`)
      else difs(mock[k], api[k], `${caminho}.${k}`, saida)
    }
  } else if (JSON.stringify(mock) !== JSON.stringify(api)) {
    saida.push(`${caminho}: mock=${txt(mock)} api=${txt(api)}`)
  }
  return saida
}

/**
 * O banco dá às versões de critério ids sequenciais (1, 2, ...: BusinessMap, Acelerato e pesquisa, na ordem do seed); o mock usa ids textuais. É a única diferença de representação aceita: troca o id do mock pelo do banco.
 */
let idsDoBanco = new Map<string, string>()
const viaJson = (v: unknown): unknown => {
  let t = JSON.stringify(v)
  for (const [mockId, id] of idsDoBanco) t = t.replaceAll(`"${mockId}"`, `"${id}"`)
  return JSON.parse(t)
}

d('paridade mock x API (servidor real, DADOS_FONTE=mock)', () => {
  let conjuntosFl: Conjunto[] = []
  let conjuntosSu: Conjunto[] = []
  let dataRef = ''

  beforeAll(async () => {
    // Equipe e sistema vêm das opções do mock (a API devolve as mesmas, o que o primeiro teste confere).
    // Ordem de gravação do seed: BusinessMap, Acelerato e pesquisa (o mock as devolve ordenadas por data).
    const fonteDe = (v: { afeta: string[] }): number =>
      v.afeta.includes('PV1')
        ? 2
        : v.afeta.every((m) => m.startsWith('S') || m === 'EI_SUST')
          ? 1
          : 0
    const doMock = await mock.criterios()
    const naOrdemDoSeed = [0, 1, 2].flatMap((f) => doMock.filter((v) => fonteDe(v) === f))
    idsDoBanco = new Map(naOrdemDoSeed.map((v, i) => [v.id, String(i + 1)]))
    const [bm, ref] = await Promise.all([mock.opcoesFiltro('businessmap'), http.dataReferencia()])
    conjuntosFl = conjuntosFluxo(bm.equipes[0]!.id, bm.sistemas[0]!.id, ref)
    conjuntosSu = conjuntosSust(ref)
    dataRef = ref
  })

  it('data de referência, critérios e opções de filtro iguais', async () => {
    expect(await http.dataReferencia()).toBe(await mock.dataReferencia())
    expect(await http.criterios()).toEqual(viaJson(await mock.criterios()))
    for (const dom of ['businessmap', 'acelerato'] as const)
      expect(await http.opcoesFiltro(dom)).toEqual(viaJson(await mock.opcoesFiltro(dom)))
  })

  it.each(METRICA_IDS.map((id) => [id]))(
    '%s: iguais após o parse e no corpo bruto',
    async (id: MetricaId) => {
      // A PV1 vem da fonte mock da pesquisa (ids textuais do mock, sem passar pelo banco): não traduz ids.
      const traduzir = id === 'PV1' ? (v: unknown): unknown => v : viaJson
      const sust = METRICAS_SUSTENTACAO.includes(id)
      const lista =
        id === 'VISAO_GERAL'
          ? [{ nome: 'sem filtros', filtros: {} }]
          : id === 'PV1' // a pesquisa só aceita a data de referência (nada de equipe, sistema nem período)
            ? [
                { nome: 'sem filtros', filtros: {} },
                { nome: 'data de referência', filtros: { dataReferencia: dataRef } },
              ]
            : sust
              ? conjuntosSu
              : conjuntosFl
      const schema = id === 'O2' ? resultadoO2PaginadoSchema : SCHEMAS_RESULTADO[id]
      const falhas: string[] = []
      for (const { nome, filtros } of lista) {
        const esperadoBruto = traduzir(await mock.obter(id, filtros))
        const esperadoParse = schema.parse(esperadoBruto)
        let obtido: unknown
        try {
          obtido = await http.obter(id, filtros)
        } catch (e) {
          falhas.push(`[${nome}] a API respondeu com erro: ${(e as Error).message}`)
          continue
        }
        const dp = difs(esperadoParse, traduzir(obtido))
        if (dp.length > 0) {
          falhas.push(`[${nome}] após o parse: ${dp.join(' | ')}`)
          continue
        }
        const bruto = JSON.parse(corpos.get([...corpos.keys()].at(-1)!)!)
        const db = difs(esperadoBruto, bruto)
        if (db.length > 0) falhas.push(`[${nome}] corpo bruto: ${db.join(' | ')}`)
      }
      expect(falhas).toEqual([])
    },
    120_000,
  )
})

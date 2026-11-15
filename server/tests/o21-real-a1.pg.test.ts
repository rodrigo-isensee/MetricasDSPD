import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import type pg from 'pg'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js'
import { migrar } from '../src/plataforma/db/migrar.js'
import { semear } from '../src/plataforma/db/seed.js'
import { poolDe, url } from './pg/ctx.js'

// Pedido 099, lote A1 (E3.219): portão do O21 Fluxo reverso com dado real. A base "real" daqui é o seed mínimo em schemas próprios (a estrutura é a
// da base alimentada pela coleta) lida pelo papel `dspd_api` (grants por coluna); nenhuma coleta nem projeção real. O retorno é a `direcao` da
// transição em `vw_transicao_canonica` (Q-RO-1); o tempo de ciclo do par com × sem vem do O3 (`entreguesDe`), sem recálculo.
const d = describe.skipIf(!url)
const AGORA = new Date('2026-10-10T15:00:00Z')
const DIA = '2026-09-20'
type Taxa = { status: 'ok' | 'insuficiente'; k: number; n: number; pct?: number; minimo?: number }
type Est = { status: 'ok' | 'insuficiente'; n: number }
type O21 = {
  entregas: Taxa
  matriz: { eixo: string; celulas: { retornos: number }[] }
  reaberturas: number
  comparacoes: { tipo: string; com: Est; sem: Est; grupoAbaixoDoMinimo: string | null }[]
}

d('O21 Fluxo reverso com dado real (099, lote A1): PostgreSQL, papel dspd_api', () => {
  const base = gerarBaseMock({ escala: 0.15 })
  const p = prefixoDeTeste()
  const R = montarEsquemas(p)
  let mig: pg.Pool
  let api: pg.Pool
  const app = () => buildApp({ db: api, S: R, agora: () => AGORA, nivelLog: 'silent' })
  const o21 = async (
    consulta: string,
  ): Promise<{ status: number; corpo: O21; texto: string; json: unknown }> => {
    const r = await (await app()).inject(`/api/v1/metricas/O21?${consulta}`)
    return { status: r.statusCode, corpo: r.json() as O21, texto: r.body, json: r.json() }
  }

  beforeAll(async () => {
    mig = poolDe()
    await migrar(url!, { prefixo: p })
    await semear(mig, base, R)
    api = poolDe('dspd_api')
  }, 180_000)
  afterAll(async () => {
    for (const s of [R.bm, R.ac, R.core]) await mig.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`)
    await api.end()
    await mig.end()
  })

  // Suposição do seed (escala 0.15 do mock): ao menos 20 entregas em 12 meses e pelo menos uma transição de retorno. A consulta abaixo
  // torna a segunda explícita; se a semente mudar e a suposição cair, a falha aparece aqui, no CI, e não em produção.
  it('(a) com transições de retorno na base, o O21 responde 200 no schema com a taxa de entregas com retorno em número', async () => {
    const retornos = await mig.query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM ${R.bm}.vw_transicao_canonica WHERE direcao = 'retorno'`,
    )
    expect(Number(retornos.rows[0]?.n)).toBeGreaterThan(0)
    const r = await o21('periodo=12m')
    expect(r.status).toBe(200)
    expect(SCHEMAS_RESULTADO.O21.safeParse(r.json).success).toBe(true)
    expect(r.corpo.entregas.n).toBeGreaterThanOrEqual(20)
    expect(r.corpo.entregas.status).toBe('ok')
    expect(r.corpo.entregas.k).toBeGreaterThan(0)
    expect(r.corpo.entregas.k).toBeLessThanOrEqual(r.corpo.entregas.n)
    expect(r.corpo.entregas.pct).toBeGreaterThan(0)
    // Sem equipe, a matriz é por papel (os nomes de coluna variam por quadro); nunca por equipe nem por pessoa.
    expect(r.corpo.matriz.eixo).toBe('papel')
    expect(r.corpo.matriz.celulas.length).toBeGreaterThan(0)
  }, 60_000)

  it('(b) abaixo de 20 entregas a taxa é "insuficiente", sem percentual; cada grupo do par com × sem só tem estatística com 20 itens', async () => {
    const curto = await o21(`periodo=custom&de=${DIA}&ate=${DIA}`)
    expect(curto.status).toBe(200)
    expect(curto.corpo.entregas.n).toBeLessThan(20)
    expect(curto.corpo.entregas.status).toBe('insuficiente')
    expect(curto.corpo.entregas.minimo).toBe(20)
    expect(curto.corpo.entregas).not.toHaveProperty('pct')
    const longo = await o21('periodo=12m')
    for (const c of longo.corpo.comparacoes)
      for (const g of [c.com, c.sem]) {
        if (g.status === 'ok') expect(g.n).toBeGreaterThanOrEqual(20)
        else expect(g.n).toBeLessThan(20)
      }
  }, 60_000)

  it('(c) nenhum campo de pessoa nem de equipe na resposta', async () => {
    for (const q of ['periodo=12m', `periodo=custom&de=${DIA}&ate=${DIA}`]) {
      const r = await o21(q)
      expect(r.status, q).toBe(200)
      expect(r.texto, q).not.toMatch(/responsave|usuario|assignee|email|realname|"equipe"/i)
      expect(r.texto, q).not.toMatch(/Pessoa \d+/)
    }
  }, 60_000)
})

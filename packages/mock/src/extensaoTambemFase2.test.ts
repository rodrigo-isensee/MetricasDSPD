import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { businessmap, CALENDARIO_PADRAO } from '@metricas-dspd/metricas'
import { gerarBaseMock, gerarExtensaoTambemMock } from '.'
import { hashJson } from './prng'

/**
 * Fase 2 do pedido 011 (E1 e E2): os campos novos da extensão só de mock (E6 e E8) com hash próprio
 * por campo, os alvos da especificação (seção 8) medidos com o cálculo real, e a garantia da ADR 0020 (item 8): a
 * extensão não lê pessoa. Valores de faixa em comentário vêm da base padrão (semente 20261009, escala 1).
 */
const base = gerarBaseMock()
const ext = gerarExtensaoTambemMock(base)
const ctx = businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO)
const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const F12M: FiltrosFluxo = { ...F, periodo: { tipo: '12m' } }
const AQUI = dirname(fileURLToPath(import.meta.url))
const fonte = (rel: string) => readFileSync(join(AQUI, rel), 'utf8')
const cardPorId = new Map(base.bm.cards.map((c) => [c.card_id, c]))

describe('extensão do 011, fase 2: hash por campo e determinismo', () => {
  it('cada campo novo tem hash próprio e estável (uma stream por campo)', () => {
    expect(hashJson(ext.datasProjeto)).toBe('c09a7436')
    expect(hashJson(ext.conhecimentoSistema)).toBe('2356c445')
  })

  it('determinística, e outra semente muda os campos novos', () => {
    expect(hashJson(gerarExtensaoTambemMock(base))).toBe(hashJson(ext))
    const outra = gerarExtensaoTambemMock(gerarBaseMock({ semente: 7, escala: 0.2 }))
    expect(hashJson(outra.datasProjeto)).not.toBe(hashJson(ext.datasProjeto))
    expect(hashJson(outra.conhecimentoSistema)).not.toBe(hashJson(ext.conhecimentoSistema))
  })

  it('o gerador lazy continua dentro do orçamento (200 ms, CI 600 ms) mesmo com os campos novos', () => {
    gerarExtensaoTambemMock(base)
    const amostras: number[] = []
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now()
      gerarExtensaoTambemMock(base)
      amostras.push(performance.now() - t0)
    }
    expect(Math.min(...amostras)).toBeLessThan(600)
  })
})

describe('ADR 0020, item 8: a extensão não lê pessoa', () => {
  it('o gerador da fase 2 não toca em `responsaveis` nem em `usuario` (nem em código, nem no tipo)', () => {
    const codigo = fonte('businessmap/extensaoTambemFase2.ts')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    expect(codigo).not.toMatch(/responsaveis|usuario|pseudonimo/)
  })

  it('nenhum campo novo guarda nome de pessoa da base; as chaves são ids de projeto e de sistema', () => {
    const pessoas = new Set<string>()
    for (const c of base.bm.cards) for (const r of c.responsaveis) pessoas.add(r)
    const txt = JSON.stringify([ext.datasProjeto, ext.conhecimentoSistema])
    expect(pessoas.size).toBeGreaterThan(3)
    for (const p of pessoas) expect(txt, p).not.toContain(p)
  })

  it('o E8 sai do mock só como faixa por sistema (1, 2 ou 3), nunca o número de pessoas', () => {
    for (const l of ext.conhecimentoSistema) {
      expect(Object.keys(l).sort()).toEqual(['entregas', 'faixa', 'sistema'])
      expect([1, 2, 3]).toContain(l.faixa)
    }
  })
})

describe('ALVO DO E6: datas do portfólio', () => {
  const r = businessmap.calcularE6(ctx, F12M, ext)
  it('de 11 a 14 projetos concluídos em 12 meses com data, abaixo de 20 de propósito (variante lenta)', () => {
    expect(r.projetos.length).toBeGreaterThanOrEqual(11)
    expect(r.projetos.length).toBeLessThanOrEqual(14)
    expect(r.naData.status).toBe('insuficiente')
    expect(r.deslize.status).toBe('insuficiente')
    expect(r.semData).toBeGreaterThan(0)
  })
  it('cerca de um terço entregue na data, replanejamentos de 0 a 3 e atrasos de até 63 dias úteis', () => {
    expect(r.naData.k).toBeGreaterThanOrEqual(2)
    expect(r.naData.k).toBeLessThanOrEqual(7)
    for (const p of r.projetos) {
      expect(p.replanejamentos).toBeGreaterThanOrEqual(0)
      expect(p.replanejamentos).toBeLessThanOrEqual(3)
      expect(p.deslizeDiasUteis).toBeLessThanOrEqual(70)
    }
    expect(r.projetos.some((p) => p.replanejamentos > 0)).toBe(true)
    expect(SCHEMAS_RESULTADO.E6.safeParse(r).success).toBe(true)
  })
  it('a data comprometida nunca vem antes do compromisso do projeto e a final nunca antes da original', () => {
    for (const [id, d] of Object.entries(ext.datasProjeto)) {
      expect(d.original, id).toBeGreaterThanOrEqual(cardPorId.get(id)?.comprometido_em ?? 0)
      expect(d.final, id).toBeGreaterThanOrEqual(d.original)
    }
  })
})

describe('ALVO DO E8: concentração de conhecimento', () => {
  const r = businessmap.calcularE8(ctx, F12M, ext)
  it('os sistemas da base, com a proporção da especificação (cerca de 4/19 em 1 pessoa e 6/19 em 2) e o resto em 3 ou mais', () => {
    expect(r.sistemasComEntrega).toBe(base.bm.config.sistemas.length)
    expect(r.recortePequeno).toBe(false)
    expect(r.faixas).toEqual({ uma: 2, duas: 3, tresOuMais: 3 })
    expect(SCHEMAS_RESULTADO.E8.safeParse(r).success).toBe(true)
  })
  it('com menos de 5 sistemas o recorte é pequeno e as faixas somem (CA-10)', () => {
    const pequeno = { ...ext, conhecimentoSistema: ext.conhecimentoSistema.slice(0, 4) }
    const p = businessmap.calcularE8(ctx, F12M, pequeno)
    expect(p).toMatchObject({ recortePequeno: true, faixas: null, sistemasComEntrega: 4 })
  })
})

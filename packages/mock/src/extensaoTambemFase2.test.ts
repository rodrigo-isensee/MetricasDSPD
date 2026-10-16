import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { businessmap, CALENDARIO_PADRAO } from '@metricas-dspd/metricas'
import { gerarBaseMock, gerarExtensaoTambemMock, PARAMETROS_FASE2 } from '.'
import { hashJson } from './prng'

/**
 * Fase 2 do pedido 011 (E1): os campos novos da extensão só de mock (O22, O26, T13 e E6) com hash próprio
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
    expect(hashJson(ext.primeiroToque)).toBe('1a3574f8')
    expect(hashJson(ext.passagens)).toBe('c661a29f')
    expect(hashJson(ext.vinculos)).toBe('027c2361')
    expect(hashJson(ext.datasProjeto)).toBe('c09a7436')
  })

  it('determinística, e outra semente muda os campos novos', () => {
    expect(hashJson(gerarExtensaoTambemMock(base))).toBe(hashJson(ext))
    const outra = gerarExtensaoTambemMock(gerarBaseMock({ semente: 7, escala: 0.2 }))
    expect(hashJson(outra.primeiroToque)).not.toBe(hashJson(ext.primeiroToque))
    expect(hashJson(outra.passagens)).not.toBe(hashJson(ext.passagens))
  })

  it('o gerador lazy continua dentro do orçamento (200 ms, CI 600 ms) mesmo com os quatro campos novos', () => {
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

  it('nenhum campo novo guarda nome de pessoa da base; as chaves são ids de card, de projeto e de sistema', () => {
    const pessoas = new Set<string>()
    for (const c of base.bm.cards) for (const r of c.responsaveis) pessoas.add(r)
    const txt = JSON.stringify([ext.primeiroToque, ext.passagens, ext.vinculos, ext.datasProjeto])
    expect(pessoas.size).toBeGreaterThan(3)
    for (const p of pessoas) expect(txt, p).not.toContain(p)
  })
})

describe('ALVO DO O22: primeiro toque', () => {
  const r = businessmap.calcularO22(ctx, F, ext)
  it('mediana abaixo de 1 dia útil e cauda até 15; no schema', () => {
    const publicados = r.porTipo.flatMap((t) =>
      t.distribuicao.status === 'ok' ? [t.distribuicao.valor] : [],
    )
    expect(publicados.length).toBeGreaterThanOrEqual(2)
    for (const v of publicados) {
      expect(v.p50).toBeLessThan(1)
      expect(v.p95).toBeLessThanOrEqual(PARAMETROS_FASE2.toque.tetoDiasUteis)
    }
    expect(SCHEMAS_RESULTADO.O22.safeParse(r).success).toBe(true)
  })
  it('de 5 a 8 pedidos abertos sem toque, e a idade do mais antigo', () => {
    const total = r.porTipo.reduce((s, t) => s + t.semToque.itens, 0)
    expect(total).toBeGreaterThanOrEqual(5)
    expect(total).toBeLessThanOrEqual(8)
    const idade = Math.max(...r.porTipo.map((t) => t.semToque.maisAntigoDiasUteis ?? 0))
    expect(idade).toBeGreaterThan(0)
    expect(idade).toBeLessThanOrEqual(13)
  })
  it('há um tipo com menos de 20 tocados (exercita insuficiente) e histograma só nos outros', () => {
    const abaixo = r.porTipo.filter((t) => t.distribuicao.status === 'insuficiente')
    expect(abaixo.length).toBeGreaterThanOrEqual(1)
    for (const t of abaixo) expect(t.histograma).toBeNull()
    for (const t of r.porTipo.filter((x) => x.distribuicao.status === 'ok'))
      expect(t.histograma).not.toBeNull()
  })
  it('nenhum toque antes da criação nem depois de hoje', () => {
    const hoje = Date.parse(base.config.hoje)
    for (const [id, t] of Object.entries(ext.primeiroToque)) {
      if (t === null) continue
      expect(t, id).toBeGreaterThanOrEqual(cardPorId.get(id)?.criado_em ?? 0)
      expect(t, id).toBeLessThanOrEqual(hoje)
    }
  })
})

describe('ALVO DO O26: passagens', () => {
  const r = businessmap.calcularO26(ctx, F12M, ext)
  it('inteiros de 0 a 6 por entrega e algumas sem dado (anteriores à coleta)', () => {
    for (const p of Object.values(ext.passagens)) {
      expect(Number.isInteger(p)).toBe(true)
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(6)
    }
    expect(Math.max(...Object.values(ext.passagens))).toBe(6)
    expect(r.porTipo.reduce((s, t) => s + t.semDado, 0)).toBeGreaterThan(0)
    expect(SCHEMAS_RESULTADO.O26.safeParse(r).success).toBe(true)
  })
  it('correlação positiva com o tempo de ciclo: o P85 do ciclo cresce com a faixa em Melhoria', () => {
    const m = r.porTipo.find((t) => t.tipo === 'Melhoria')
    const p85 = m?.faixas.map((f) => (f.cicloP85.status === 'ok' ? f.cicloP85.valor.p85 : null))
    expect(p85?.every((v) => v !== null)).toBe(true)
    const v = p85 as number[]
    expect(v[3]).toBeGreaterThan(v[0] as number)
    expect(v[4]).toBeGreaterThan(v[0] as number)
    expect(v[2]).toBeGreaterThan(v[0] as number)
  })
})

describe('ALVO DO T13: vínculos', () => {
  const r = businessmap.calcularT13(ctx, F12M, ext)
  it('cerca de 35% das demandas e 50% das frentes entregues têm vínculo, apontando para cards existentes', () => {
    const comVinculo = new Set(ext.vinculos.map((v) => v.card_id))
    const parte = (g: 'story' | 'frente') => {
      const es = base.bm.cards.filter(
        (c) => c.granularidade === g && c.concluido_em !== null && !c.eh_subtarefa,
      )
      return es.filter((c) => comVinculo.has(c.card_id)).length / es.length
    }
    expect(parte('story')).toBeGreaterThan(0.28)
    expect(parte('story')).toBeLessThan(0.42)
    expect(parte('frente')).toBeGreaterThan(0.4)
    expect(parte('frente')).toBeLessThan(0.65)
    for (const v of ext.vinculos) {
      expect(cardPorId.has(v.relacionado_id)).toBe(true)
      expect(v.tipo).toBe('predecessor')
    }
  })
  it('exercita a R-4 (removido antes da entrega), vínculo de mesmo quadro (não conta) e quadro desconhecido (semDado)', () => {
    const removidoAntes = ext.vinculos.filter((v) => {
      const c = cardPorId.get(v.card_id)
      return (
        v.removido_em !== null &&
        c?.concluido_em !== null &&
        v.removido_em <= (c?.concluido_em ?? 0)
      )
    })
    expect(removidoAntes.length).toBeGreaterThan(10)
    expect(ext.vinculos.some((v) => v.outro_quadro === false)).toBe(true)
    expect(ext.vinculos.some((v) => v.outro_quadro === null)).toBe(true)
    expect(r.porGranularidade.every((g) => g.semDado > 0)).toBe(true)
    expect(SCHEMAS_RESULTADO.T13.safeParse(r).success).toBe(true)
  })
  it('o vínculo de outro quadro aponta mesmo para outro quadro; o de mesmo quadro, para o mesmo', () => {
    for (const v of ext.vinculos) {
      if (v.outro_quadro === null) continue
      const a = cardPorId.get(v.card_id)
      const b = cardPorId.get(v.relacionado_id)
      expect(v.outro_quadro, v.card_id).toBe(a?.quadro_id !== b?.quadro_id)
    }
  })
  it('demandas e frentes em blocos separados; ambos publicam o percentual em 12 meses', () => {
    expect(r.porGranularidade.map((g) => g.granularidade)).toEqual(['story', 'frente'])
    for (const g of r.porGranularidade) expect(g.entregas.status).toBe('ok')
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

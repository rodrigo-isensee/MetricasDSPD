import { beforeAll, describe, expect, it } from 'vitest'
import { FASES_DETECCAO, MOTIVOS_BLOQUEIO } from '@/contracts/comum'
import {
  acelerato,
  businessmap,
  diaLocal,
  ehDiaUtil,
  horasUteisEntre,
  CALENDARIO_PADRAO as cal,
} from '@/lib/metrics'
import { MATRIZ_PRIORIDADE } from '@/lib/metrics/acelerato/modelo'
import { gerarBaseMock, type BaseMock } from '.'
import { derivar, hashJson } from './prng'
import { sortearLatencia } from './latencia'

let base: BaseMock
let hoje: number
beforeAll(() => {
  base = gerarBaseMock()
  hoje = Date.parse(base.config.hoje)
})

describe('determinismo', () => {
  it('mesma semente gera a mesma base; semente diferente, outra', () => {
    const b = gerarBaseMock({ escala: 0.2 })
    expect(hashJson(gerarBaseMock({ escala: 0.2 }))).toBe(hashJson(b))
    expect(hashJson(gerarBaseMock({ escala: 0.2, semente: 7 }))).not.toBe(hashJson(b))
  })
  it('gera a base completa em menos de 1,5 s (ADR 0003, D6)', () => {
    const t0 = performance.now()
    gerarBaseMock()
    const ms = performance.now() - t0
    console.info(`gerador: ${ms.toFixed(0)} ms (limite 1500 ms)`)
    expect(ms).toBeLessThan(1500)
  })

  it('a base padrão tem o mesmo hash de antes de mover CRITERIOS_MOCK para mock/criterios.ts (K-021/ADR 0002)', () => {
    expect(hashJson(base)).toBe('924448d4')
    expect(hashJson(gerarBaseMock({ escala: 0.2 }))).toBe('b2bfd4c0')
  })

  it('as duas bases usam o mesmo "hoje" (padrão e personalizado), e o contexto também', () => {
    const custom = gerarBaseMock({ escala: 0.1, semente: 5, hoje: '2026-05-15T18:00:00-03:00' })
    for (const [b, esperado] of [
      [base, '2026-10-09'],
      [custom, '2026-05-15'],
    ] as const) {
      const bm = businessmap.criarContextoBM(b.bm, b.config.hoje, cal)
      const ac = acelerato.criarContextoAC(b.ac, b.config.hoje, cal)
      expect(bm.hojeIso).toBe(ac.hojeIso)
      expect(bm.hojeIso).toBe(esperado)
      expect(bm.hoje).toBe(ac.hoje)
    }
  })

  it('latência simulada: sorteio com semente, sempre entre 150 e 400 ms, reproduzível', () => {
    const sorteios = (semente: number) => {
      const rng = derivar(semente, 'latencia')
      return Array.from({ length: 200 }, () => sortearLatencia(rng))
    }
    const a = sorteios(1)
    expect(a).toEqual(sorteios(1))
    expect(a.every((ms) => ms >= 150 && ms <= 400)).toBe(true)
    expect(new Set(a).size).toBeGreaterThan(20)
  })
})

describe('invariantes do BusinessMap', () => {
  it('hierarquia: todo card_pai existe e tem granularidade imediatamente superior', () => {
    const ids = new Map(base.bm.cards.map((c) => [c.card_id, c]))
    const ordem = { story: 0, frente: 1, projeto: 2 } as const
    for (const c of base.bm.cards) {
      if (!c.card_pai) continue
      const pai = ids.get(c.card_pai)
      expect(pai, `pai de ${c.card_id}`).toBeDefined()
      expect(ordem[pai?.granularidade ?? 'story']).toBe(ordem[c.granularidade] + 1)
    }
    expect(
      base.bm.cards.some(
        (c) => c.granularidade === 'story' && c.card_pai === null && c.tipo === 'Melhoria',
      ),
    ).toBe(true)
  })

  it('marcos em ordem, nada depois de hoje, e coerentes com as transições', () => {
    const idx = businessmap.indexarBM(base.bm, cal)
    for (const m of idx.marcos) {
      const c = m.card
      expect(c.criado_em).toBeLessThanOrEqual(hoje)
      const seq = [c.criado_em, c.comprometido_em, c.iniciado_em, c.concluido_em].filter(
        (x): x is number => x !== null,
      )
      expect(seq).toEqual([...seq].sort((a, b) => a - b))
      expect(seq.at(-1) ?? 0).toBeLessThanOrEqual(hoje)
      expect(m.entrega).toBe(c.concluido_em)
      const trs = idx.transicoesPorCard.get(c.card_id) ?? []
      expect(trs[0]?.coluna_origem ?? null).toBeNull()
      expect(trs.at(-1)?.coluna_destino ?? null).toBe(c.coluna_atual)
    }
  })

  it('colunas de fila começam por "Aguardando" ou "Pronto para" e transições têm tipo coerente', () => {
    for (const col of base.bm.colunas.filter((c) => c.tipo_coluna === 'fila')) {
      expect(col.coluna).toMatch(/^(Aguardando|Pronto para)/)
    }
    expect(base.bm.transicoes.every((t) => t.timestamp <= hoje)).toBe(true)
  })

  it('cards arquivados e excluídos permanecem na base; existem reaberturas, bloqueios e todos os motivos', () => {
    expect(base.bm.cards.some((c) => c.arquivado_em !== null && c.motivo_descarte)).toBe(true)
    expect(base.bm.cards.some((c) => c.excluido_em !== null)).toBe(true)
    expect(base.bm.transicoes.some((t) => t.direcao === 'retorno')).toBe(true)
    expect(new Set(base.bm.bloqueios.map((b) => b.motivo))).toEqual(new Set(MOTIVOS_BLOQUEIO))
    expect(base.bm.bloqueios.some((b) => b.fim === null)).toBe(true)
    expect(new Set(base.bm.cards.map((c) => c.fase_deteccao).filter(Boolean))).toEqual(
      new Set(FASES_DETECCAO),
    )
  })

  it('há histórico de 12+ meses, 6 equipes, 5+ sistemas e 2+ mudanças de critério', () => {
    const primeiro = base.bm.cards.reduce((m, c) => Math.min(m, c.criado_em), Infinity)
    expect((hoje - primeiro) / 86_400_000).toBeGreaterThan(365)
    expect(new Set(base.bm.cards.map((c) => c.equipe)).size).toBeGreaterThanOrEqual(6)
    expect(new Set(base.bm.cards.map((c) => c.sistema)).size).toBeGreaterThanOrEqual(5)
    expect(base.bm.config.criterios.length).toBeGreaterThanOrEqual(2)
  })

  it('nenhum nome de pessoa: apenas pseudônimos "Pessoa NN"', () => {
    const nomes = new Set([
      ...base.bm.cards.flatMap((c) => c.responsaveis),
      ...base.bm.transicoes.map((t) => t.usuario),
    ])
    for (const n of nomes) expect(n).toMatch(/^Pessoa \d{2}$/)
    expect(base.bm.cards.some((c) => /Pessoa/.test(c.titulo))).toBe(false)
  })
})

describe('requisitos de UX da seção 9.2', () => {
  const f = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } }
  const ctx = () => businessmap.criarContextoBM(base.bm, base.config.hoje, cal)

  it('há tipo, classe de serviço e sistema com menos de 20 itens, e outros com mais', () => {
    const o3 = businessmap.calcularO3(ctx(), f)
    expect(o3.classes.some((c) => c.estatistica.status === 'insuficiente' && c.n > 0)).toBe(true)
    expect(o3.classes.some((c) => c.estatistica.status === 'ok')).toBe(true)
    const t1 = businessmap.calcularT1(ctx(), f)
    expect(t1.classes.some((c) => c.estatistica.status === 'insuficiente' && c.n > 0)).toBe(true)
    expect(t1.classes.some((c) => c.estatistica.status === 'ok')).toBe(true)
    const t5 = businessmap.calcularT5(ctx(), f)
    expect(t5.porSistema.some((g) => g.estatistica.status === 'insuficiente')).toBe(true)
    expect(t5.porSistema.some((g) => g.estatistica.status === 'ok')).toBe(true)
  })

  it('há itens acima do P95, backlog > 180 dias, bloqueados agora, as 4 responsabilidades, escopo adicionado e iniciativas sem ficha', () => {
    const c = ctx()
    expect(businessmap.calcularO2(c, f).acimaP95).toBeGreaterThan(0)
    expect(businessmap.calcularO10(c, f).acimaDe180.time).toBeGreaterThan(0)
    expect(businessmap.calcularBloqueados(c, f).itens.length).toBeGreaterThan(0)
    const resp = businessmap.calcularO12(c, { ...f, periodo: { tipo: '12m' } }).totais
      .porResponsabilidade
    expect(Object.values(resp).every((n) => n > 0)).toBe(true)
    expect(businessmap.calcularT9(c, f).projetosComEscopoCrescido).toBeGreaterThan(0)
    expect(businessmap.calcularE3(c, f).semFicha).toBeGreaterThanOrEqual(2)
  })

  it('P1 tem menos de 20 chamados na janela e as demais prioridades têm mais', () => {
    const c = acelerato.criarContextoAC(base.ac, base.config.hoje, cal)
    const s1 = acelerato.calcularS1(c, { equipe: [], prioridade: [], periodo: { tipo: '6m' } })
    expect(s1.prioridades.find((p) => p.prioridade === 'P1')?.restauracao.estatistica.status).toBe(
      'insuficiente',
    )
    expect(s1.prioridades.find((p) => p.prioridade === 'P3')?.restauracao.estatistica.status).toBe(
      'ok',
    )
  })
})

describe('invariantes do Acelerato', () => {
  it('prioridade segue a matriz Impacto x Urgência, salvo ajuste manual', () => {
    for (const c of base.ac.chamados) {
      const matriz = MATRIZ_PRIORIDADE[c.impacto][c.urgencia]
      if (!c.prioridade_ajustada_manualmente) expect(c.prioridade).toBe(matriz)
      else expect(c.prioridade).not.toBe(matriz)
    }
  })
  it('status_sla_r só em concluídos; abertos sem data_finalizado; nada depois de hoje', () => {
    for (const c of base.ac.chamados) {
      if (c.status_sla_r !== null) expect(c.status).toBe('Concluído')
      if (c.status === 'Aberto') expect(c.data_finalizado).toBeNull()
      expect(c.aberto_em).toBeLessThanOrEqual(hoje)
      expect(c.data_finalizado ?? 0).toBeLessThanOrEqual(hoje)
    }
  })
  it('população DSPD-SSSC: só a organização, fila e equipes do briefing; P1 em todo crítico coordenado', () => {
    for (const c of base.ac.chamados) {
      expect(c.organizacao).toBe('DSPD Sustentação')
      expect(c.tipo_fila).toBe('DSPD - SSSC')
      expect(['SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG']).toContain(c.equipe)
      if (c.prioridade === 'P1') expect(c.incidente_critico_coordenado).toBe(true)
    }
  })
  it('etapas em ordem por chamado e a soma dos totalizadores é o tempo de vida (aberto → encerrado)', () => {
    const idx = acelerato.criarContextoAC(base.ac, base.config.hoje, cal).idx
    for (const x of idx.chamados.filter((y) => y.fechado).slice(0, 300)) {
      for (let i = 1; i < x.etapas.length; i++)
        expect(x.etapas[i]?.entrada).toBeGreaterThanOrEqual(x.etapas[i - 1]?.entrada ?? 0)
      const vida = horasUteisEntre(x.c.aberto_em, x.c.data_finalizado ?? 0, cal)
      expect(x.vidaHU).toBeCloseTo(vida, 6)
    }
  })
  it('dia da abertura cai em dia útil', () => {
    expect(
      base.ac.chamados.slice(0, 500).every((c) => ehDiaUtil(diaLocal(c.aberto_em, cal), cal)),
    ).toBe(true)
  })
})

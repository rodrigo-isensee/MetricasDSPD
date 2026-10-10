import { describe, expect, it } from 'vitest'
import { CALENDARIO_PADRAO } from '../core/calendario'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { instanteDeIso } from '../core/calendario'
import {
  calcularEIBM,
  calcularO1,
  calcularO3,
  calcularO15,
  calcularO18,
  calcularT7,
  calcularT9,
  calcularBloqueados,
} from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (e: EspecCard[], bl = []) =>
  criarContextoBM(umaBase(e, bl), HOJE_TESTE, CALENDARIO_PADRAO)
const dia = (n: number) => `2026-09-${String(n).padStart(2, '0')}`

describe('marcos e tempo de ciclo (4.1, 4.2)', () => {
  it('calcula o ciclo em horas úteis, de início a entrega', () => {
    const ctx = ctxDe([
      {
        id: 'A',
        criado: `${dia(1)}T09:00-03:00`,
        trilha: trilhaSimples(
          `${dia(1)}T09:00-03:00`,
          `${dia(1)}T10:00-03:00`,
          `${dia(2)}T08:00-03:00`,
          `${dia(3)}T17:00-03:00`,
        ),
      },
    ])
    const m = ctx.idx.marcosPorId.get('A')
    expect(m?.cicloHU).toBe(16) // 2 dias úteis cheios
    expect(m?.entrega).not.toBeNull()
  })

  it('descartado sai do cálculo de tempo de ciclo e permanece na base', () => {
    const base = umaBase([
      {
        id: 'D',
        criado: `${dia(1)}T09:00-03:00`,
        trilha: [
          ['Aguardando priorização', `${dia(1)}T09:00-03:00`],
          ['Pronto para desenvolver', `${dia(2)}T09:00-03:00`],
        ],
        descarte: `${dia(3)}T09:00-03:00`,
      },
    ])
    const ctx = criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
    expect(ctx.idx.marcosPorId.get('D')?.ativo).toBe(false)
    expect(base.cards).toHaveLength(1)
    expect(calcularO3(ctx, F).classes.every((c) => c.n === 0)).toBe(true)
  })

  it('reaberto: o intervalo entregue não conta e o tempo volta a contar (P10)', () => {
    const ctx = ctxDe([
      {
        id: 'R',
        criado: `${dia(1)}T09:00-03:00`,
        trilha: trilhaSimples(
          `${dia(1)}T09:00-03:00`,
          `${dia(1)}T10:00-03:00`,
          `${dia(2)}T08:00-03:00`,
          `${dia(2)}T16:00-03:00`,
        ),
        retornoEm: [
          ['Em desenvolvimento', `${dia(8)}T08:00-03:00`],
          ['Entregue', `${dia(8)}T12:00-03:00`],
        ],
      },
    ])
    const m = ctx.idx.marcosPorId.get('R')
    expect(m?.segmentos).toHaveLength(2)
    expect(m?.cicloHU).toBe(7 + 4) // 08h-16h com almoço = 7 h; depois 4 h
    expect(m?.entrega).toBe(instanteDeIso(`${dia(8)}T12:00-03:00`, CALENDARIO_PADRAO))
  })

  it('subtarefa não conta como item', () => {
    const ctx = ctxDe([
      {
        id: 'S',
        subtarefa: true,
        criado: `${dia(1)}T09:00-03:00`,
        trilha: trilhaSimples(
          `${dia(1)}T09:00-03:00`,
          `${dia(1)}T10:00-03:00`,
          `${dia(2)}T08:00-03:00`,
          `${dia(3)}T09:00-03:00`,
        ),
      },
    ])
    expect(ctx.idx.marcosPorId.get('S')?.ativo).toBe(false)
  })
})

describe('regra de 20 itens nas métricas', () => {
  it('O3 com 19 itens esconde percentis e mantém os pontos', () => {
    const e: EspecCard[] = Array.from({ length: 19 }, (_, i) => ({
      id: `C${i}`,
      criado: `2026-09-01T09:00-03:00`,
      trilha: trilhaSimples(
        '2026-09-01T09:00-03:00',
        '2026-09-01T10:00-03:00',
        '2026-09-02T08:00-03:00',
        `2026-09-${String(3 + (i % 5)).padStart(2, '0')}T17:00-03:00`,
      ),
    }))
    const c = calcularO3(ctxDe(e), F).classes.find((x) => x.tipo === 'Melhoria')
    expect(c?.estatistica.status).toBe('insuficiente')
    expect(c?.estatistica).not.toHaveProperty('valor')
    expect(c?.pontos).toHaveLength(19)
    e.push({
      id: 'C19',
      criado: '2026-09-01T09:00-03:00',
      trilha: trilhaSimples(
        '2026-09-01T09:00-03:00',
        '2026-09-01T10:00-03:00',
        '2026-09-02T08:00-03:00',
        '2026-09-07T17:00-03:00',
      ),
    })
    expect(
      calcularO3(ctxDe(e), F).classes.find((x) => x.tipo === 'Melhoria')?.estatistica.status,
    ).toBe('ok')
  })

  it('espera invisível: se as visões não chegam a 20 itens, nenhuma é publicada', () => {
    const e: EspecCard[] = Array.from({ length: 5 }, (_, i) => ({
      id: `E${i}`,
      criado: '2026-08-01T09:00-03:00',
      trilha: trilhaSimples(
        '2026-08-01T09:00-03:00',
        '2026-08-20T10:00-03:00',
        '2026-08-21T08:00-03:00',
        '2026-09-02T17:00-03:00',
      ),
    }))
    const r = calcularEIBM(ctxDe(e), F, 'FL1')
    const seg = r.segmentos[0]
    expect(r.segmentoPor).toBe('tipo')
    expect(seg?.estatistica.status).toBe('insuficiente')
    expect(seg?.estatistica).not.toHaveProperty('valor')
  })

  it('espera invisível: (cliente - time) / cliente sobre as medianas', () => {
    const e: EspecCard[] = Array.from({ length: 20 }, (_, i) => ({
      id: `E${i}`,
      criado: '2026-08-03T08:00-03:00',
      trilha: trilhaSimples(
        '2026-08-03T08:00-03:00',
        '2026-08-10T08:00-03:00',
        '2026-08-10T09:00-03:00',
        '2026-08-14T17:00-03:00',
      ),
    }))
    const r = calcularEIBM(ctxDe(e), F, 'FL1')
    const est = r.segmentos[0]?.estatistica
    expect(est?.status).toBe('ok')
    if (est?.status === 'ok') {
      expect(est.valor.cliente).toBeCloseTo(10, 5) // 03/08 a 14/08 = 10 dias úteis
      expect(est.valor.time).toBeCloseTo(5, 5)
      expect(est.valor.indicePct).toBeCloseTo(50, 5)
    }
  })

  it('espera invisível FL1: um segmento por tipo; tipos com distribuições diferentes nunca entram na mesma mediana', () => {
    const lote = (tipo: 'Melhoria' | 'Incidente', pref: string, entrega: string): EspecCard[] =>
      Array.from({ length: 20 }, (_, i) => ({
        id: `${pref}${i}`,
        tipo,
        criado: '2026-08-03T08:00-03:00',
        trilha: trilhaSimples(
          '2026-08-03T08:00-03:00',
          '2026-08-10T08:00-03:00',
          '2026-08-10T09:00-03:00',
          entrega,
        ),
      }))
    // Melhoria: cliente 10 d.u. (até 14/08). Incidente: cliente 20 d.u. (até 28/08).
    const r = calcularEIBM(
      ctxDe([
        ...lote('Melhoria', 'M', '2026-08-14T17:00-03:00'),
        ...lote('Incidente', 'I', '2026-08-28T17:00-03:00'),
      ]),
      F,
      'FL1',
    )
    expect(r.segmentos.map((x) => x.rotulo)).toEqual(['Incidente', 'Melhoria'])
    const por = Object.fromEntries(r.segmentos.map((x) => [x.chave, x.estatistica]))
    const mel = por['melhoria']
    const inc = por['incidente']
    expect(mel?.status === 'ok' && mel.valor.cliente).toBeCloseTo(10, 5)
    expect(inc?.status === 'ok' && inc.valor.cliente).toBeCloseTo(20, 5)
    // Nenhum segmento reúne os 40 itens: cada um tem só os seus 20.
    expect(r.segmentos.every((x) => x.n === 20)).toBe(true)
    expect(r.base.n).toBe(40)
  })

  it('espera invisível FL1: a regra de 20 vale por tipo (um tipo publica, o outro não)', () => {
    const mk = (tipo: 'Melhoria' | 'Incidente', n: number): EspecCard[] =>
      Array.from({ length: n }, (_, i) => ({
        id: `${tipo}${i}`,
        tipo,
        criado: '2026-08-03T08:00-03:00',
        trilha: trilhaSimples(
          '2026-08-03T08:00-03:00',
          '2026-08-10T08:00-03:00',
          '2026-08-10T09:00-03:00',
          '2026-08-14T17:00-03:00',
        ),
      }))
    const r = calcularEIBM(ctxDe([...mk('Melhoria', 20), ...mk('Incidente', 12)]), F, 'FL1')
    const st = Object.fromEntries(r.segmentos.map((x) => [x.chave, x.estatistica.status]))
    expect(st).toEqual({ incidente: 'insuficiente', melhoria: 'ok' })
  })

  it('espera invisível FL2: um único segmento, sem tipo (frente não tem tipo)', () => {
    const r = calcularEIBM(ctxDe([]), F, 'FL2')
    expect(r.segmentoPor).toBeNull()
    expect(r.segmentos).toHaveLength(1)
    expect(r.segmentos[0]?.chave).toBeNull()
  })
})

describe('WIP (O1)', () => {
  it('fila e bloqueados contam como WIP; bloqueio não move o card', () => {
    const base = umaBase(
      [
        {
          id: 'W1',
          criado: '2026-10-01T09:00-03:00',
          trilha: [
            ['Aguardando priorização', '2026-10-01T09:00-03:00'],
            ['Pronto para desenvolver', '2026-10-01T10:00-03:00'],
            ['Em desenvolvimento', '2026-10-02T08:00-03:00'],
            ['Aguardando revisão', '2026-10-05T08:00-03:00'],
          ],
        },
        {
          id: 'W2',
          criado: '2026-10-01T09:00-03:00',
          trilha: [
            ['Aguardando priorização', '2026-10-01T09:00-03:00'],
            ['Pronto para desenvolver', '2026-10-01T10:00-03:00'],
            ['Em desenvolvimento', '2026-10-02T08:00-03:00'],
          ],
        },
        {
          id: 'W3',
          criado: '2026-10-01T09:00-03:00',
          trilha: [['Aguardando priorização', '2026-10-01T09:00-03:00']],
        },
      ],
      [
        {
          card_id: 'W2',
          motivo: 'Janela de mudança',
          coluna_em_que_bloqueou: 'Em desenvolvimento',
          fornecedor: null,
          inicio: instanteDeIso('2026-10-06T09:00-03:00', CALENDARIO_PADRAO),
          fim: null,
          duracao_horas_uteis: null,
        },
      ],
    )
    const ctx = criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
    const r = calcularO1(ctx, F)
    expect(r.hoje.total).toBe(2) // W3 ainda não começou; W1 está em fila e conta
    expect(r.hoje.bloqueados).toBe(1)
    expect(r.porTipoColuna.find((x) => x.tipoColuna === 'fila')?.itens).toBe(1)
    expect(ctx.idx.marcosPorId.get('W2')?.colunaAtual).toBe('Em desenvolvimento')
    expect(calcularBloqueados(ctx, F).itens[0]).toMatchObject({
      cardId: 'W2',
      motivo: 'Janela de mudança',
    })
  })
})

describe('qualidade (O15, O18)', () => {
  it('bug vinculado até 30 dias após a entrega conta para o mês da entrega; depois não', () => {
    const base: EspecCard[] = [
      {
        id: 'E1',
        criado: '2026-07-01T09:00-03:00',
        trilha: trilhaSimples(
          '2026-07-01T09:00-03:00',
          '2026-07-01T10:00-03:00',
          '2026-07-02T08:00-03:00',
          '2026-07-10T17:00-03:00',
        ),
      },
      {
        id: 'B1',
        tipo: 'Defeito em produção',
        fase: 'Produção',
        origemBug: 'E1',
        criado: '2026-07-25T09:00-03:00',
        trilha: [['Aguardando priorização', '2026-07-25T09:00-03:00']],
      },
      {
        id: 'B2',
        tipo: 'Defeito em produção',
        fase: 'Produção',
        origemBug: 'E1',
        criado: '2026-08-20T09:00-03:00',
        trilha: [['Aguardando priorização', '2026-08-20T09:00-03:00']],
      },
    ]
    const r = calcularO18(ctxDe(base), { ...F, periodo: { tipo: '6m' } })
    const jul = r.meses.find((m) => m.mes === '2026-07')
    expect(jul?.entregues).toBe(1)
    expect(jul?.bugs).toBe(1) // B2 (41 dias depois) fica fora
    expect(r.meses.find((m) => m.mes === '2026-10')?.emApuracaoAte).not.toBeNull()
  })

  it('O15 calcula contenção e escape pela fase; abaixo de 20 bugs só sobram contagens', () => {
    const bugs: EspecCard[] = (['Desenvolvimento', 'Revisão de código', 'Produção'] as const).map(
      (fase, i) => ({
        id: `G${i}`,
        tipo: fase === 'Produção' ? 'Defeito em produção' : 'Bug interno',
        fase,
        criado: '2026-09-10T09:00-03:00',
        trilha: [['Aguardando priorização', '2026-09-10T09:00-03:00']],
      }),
    )
    const r = calcularO15(ctxDe(bugs), F)
    expect(r.fases.map((f) => f.contagem)).toEqual([1, 1, 0, 0, 1])
    expect(r.contencao).toMatchObject({ status: 'insuficiente', k: 2, n: 3 })
  })
})

describe('granularidades (T7, T9)', () => {
  it('frentes não entram no histograma de story e T9 calcula avanço e escopo pelos filhos', () => {
    const t = trilhaSimples
    const base = umaBase([
      {
        id: 'P1',
        gran: 'projeto',
        criado: '2026-06-01T09:00-03:00',
        trilha: [
          ['Pronto para desenvolver', '2026-06-01T09:00-03:00'],
          ['Em desenvolvimento', '2026-06-20T09:00-03:00'],
        ],
      },
      {
        id: 'F1',
        gran: 'frente',
        pai: 'P1',
        criado: '2026-06-02T09:00-03:00',
        trilha: t(
          '2026-06-02T09:00-03:00',
          '2026-06-03T09:00-03:00',
          '2026-06-22T09:00-03:00',
          '2026-07-20T09:00-03:00',
        ),
      },
      {
        id: 'F2',
        gran: 'frente',
        pai: 'P1',
        criado: '2026-06-02T09:00-03:00',
        trilha: [
          ['Aguardando priorização', '2026-06-02T09:00-03:00'],
          ['Pronto para desenvolver', '2026-06-03T09:00-03:00'],
          ['Em desenvolvimento', '2026-09-01T09:00-03:00'],
        ],
      },
      {
        id: 'F3',
        gran: 'frente',
        pai: 'P1',
        criado: '2026-08-02T09:00-03:00',
        trilha: [['Aguardando priorização', '2026-08-02T09:00-03:00']],
      },
    ])
    const f3 = base.cards.find((c) => c.card_id === 'F3')
    if (f3) f3.adicionado_apos_inicio_pai = true
    const ctx = criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
    const t9 = calcularT9(ctx, F)
    expect(t9.projetos[0]).toMatchObject({
      totalFrentes: 3,
      originais: 2,
      adicionadas: 1,
      concluidas: 1,
      emAndamento: 1,
      aFazer: 1,
    })
    expect(t9.projetos[0]?.crescimentoEscopoPct).toBe(50)
    expect(t9.projetos[0]?.avancoPct).toBeCloseTo(33.33, 1)
    const t7 = calcularT7(ctx, F)
    expect(t7.kpis.frentesEmAndamento).toBe(1)
    expect(t7.histograma.status).toBe('insuficiente')
  })
})

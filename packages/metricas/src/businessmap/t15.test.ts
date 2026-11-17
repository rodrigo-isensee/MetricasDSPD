import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO, diaDeIso, isoDeDia } from '../core/calendario'
import { calcularT8, calcularT15 } from './index'
import {
  EXTENSAO_BM_VAZIA,
  TETO_DIAS_UTEIS_SPRINT,
  type ExtensaoBM,
  type Sprint,
  type SprintCard,
} from './extensao'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, umaBase, type EspecCard } from './testing'

// Pedido 105 (E7.504): tamanho das sprints, a mesma janela do T8, mínimo de 20 sprints.
const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12m' } }
const ctxDe = (e: EspecCard[]) => criarContextoBM(umaBase(e), HOJE_TESTE, CALENDARIO_PADRAO)
const SEGUNDA = diaDeIso('2026-03-02')
const inicioDe = (i: number) => isoDeDia(SEGUNDA + 7 * i)
/** `dur` = dias úteis da sprint (1 a 5), de segunda até o dia útil pedido. */
const sprint = (i: number, dur = 5, extra: Partial<Sprint> = {}): Sprint => ({
  sprint_id: `S${i}`,
  nome: `Sprint S${i}`,
  inicio: inicioDe(i),
  fim: isoDeDia(SEGUNDA + 7 * i + dur - 1),
  ...extra,
})
const card = (id: string, criado: string): EspecCard => ({
  id,
  criado,
  trilha: [['Aguardando priorização', criado]],
})
const extReal = (sprints: Sprint[], sprintCards: SprintCard[]): ExtensaoBM => ({
  ...EXTENSAO_BM_VAZIA,
  sprints,
  sprintCards,
  sprintsDadoReal: true,
})
function mundo(durs: number[]) {
  const sprints = durs.map((d, i) => sprint(i, d))
  const cards = durs.map((_, i) => card(`C${i}`, `${isoDeDia(SEGUNDA + 7 * i - 3)}T09:00-03:00`))
  const vinc = durs.map((_, i): SprintCard => ({
    card_id: `C${i}`,
    sprint_id: `S${i}`,
    ligado_em: null,
  }))
  return { sprints, cards, vinc }
}

describe('T15: tamanho das sprints', () => {
  it('com 20 sprints publica P50, P85 e média juntos, em dias úteis, e valida no schema', () => {
    const m = mundo([...Array(10).fill(5), ...Array(10).fill(3)])
    const r = calcularT15(ctxDe(m.cards), F, extReal(m.sprints, m.vinc))
    expect(SCHEMAS_RESULTADO.T15.safeParse(r).success).toBe(true)
    expect(r.sprintsNoRecorte).toBe(20)
    expect(r.base.unidade).toBe('sprints')
    expect(r.estatistica.status).toBe('ok')
    if (r.estatistica.status !== 'ok') return
    expect(r.estatistica.valor.media).toBeCloseTo(4, 0) // feriados do calendário reduzem alguma semana
    expect(r.estatistica.valor.p50).toBeGreaterThanOrEqual(3)
    expect(r.estatistica.valor.p85).toBe(5)
    expect(r.estatistica.valor.p95).toBeGreaterThanOrEqual(r.estatistica.valor.p85)
  })

  it('com 19 sprints só a contagem, sem estatística', () => {
    const m = mundo(Array(19).fill(5))
    const r = calcularT15(ctxDe(m.cards), F, extReal(m.sprints, m.vinc))
    expect(r.sprintsNoRecorte).toBe(19)
    expect(r.estatistica.status).toBe('insuficiente')
    expect(r.estatistica).not.toHaveProperty('valor')
    expect(SCHEMAS_RESULTADO.T15.safeParse(r).success).toBe(true)
  })

  it('sem first_end fica fora do período; sem início ou acima do teto fica fora da conta e é contada; a conta é a do T8', () => {
    const m = mundo(Array(20).fill(5))
    m.sprints.push(sprint(30, 5, { fim: null }), sprint(31, 5, { inicio: null }))
    m.sprints.push({
      sprint_id: 'LONGA',
      nome: 'Sprint LONGA',
      inicio: inicioDe(0),
      fim: isoDeDia(SEGUNDA + 7 * (TETO_DIAS_UTEIS_SPRINT / 5 + 2)),
    })
    for (const id of ['S30', 'S31', 'LONGA']) {
      m.cards.push(card(`F${id}`, `${isoDeDia(SEGUNDA - 3)}T09:00-03:00`))
      m.vinc.push({ card_id: `F${id}`, sprint_id: id, ligado_em: null })
    }
    const ext = extReal(m.sprints, m.vinc)
    const r = calcularT15(ctxDe(m.cards), F, ext)
    const t8 = calcularT8(ctxDe(m.cards), F, ext)
    expect(r.sprintsNoRecorte).toBe(20)
    // regra do dono (E7.536, 2 = A): o recorte é pela conclusão e vem antes da contagem; S30 (sem first_end) nem entra no período, só S31 (sem início) é contada
    expect(r.foraDaConta).toEqual({ semDatas: 1, acimaDoTeto: 1, tetoDiasUteis: 30 })
    expect(r.foraDaConta).toEqual(t8.foraDaConta)
    expect(r.sprintsNoRecorte).toBe(t8.sprintsNoRecorte)
  })

  it('sem sprints devolve zero e insuficiente (nunca erro)', () => {
    const r = calcularT15(ctxDe([]), F)
    expect(r.sprintsNoRecorte).toBe(0)
    expect(r.estatistica.status).toBe('insuficiente')
  })
})

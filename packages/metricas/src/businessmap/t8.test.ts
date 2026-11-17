import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO, diaDeIso, diasUteisNoIntervalo, isoDeDia } from '../core/calendario'
import { calcularT8 } from './index'
import {
  EXTENSAO_BM_VAZIA,
  TETO_DIAS_UTEIS_SPRINT,
  type ExtensaoBM,
  type Sprint,
  type SprintCard,
} from './extensao'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12m' } }
const ctxDe = (e: EspecCard[]) => criarContextoBM(umaBase(e), HOJE_TESTE, CALENDARIO_PADRAO)

/** Segunda-feira 2026-03-02; cada sprint dura 5 dias úteis e começa numa segunda, uma por semana. */
const SEGUNDA = diaDeIso('2026-03-02')
const inicioDe = (i: number) => isoDeDia(SEGUNDA + 7 * i)
const fimDe = (i: number) => isoDeDia(SEGUNDA + 7 * i + 4)
const sprint = (i: number, extra: Partial<Sprint> = {}): Sprint => ({
  sprint_id: `S${i}`,
  nome: `Sprint S${i}`,
  inicio: inicioDe(i),
  fim: fimDe(i),
  ...extra,
})
const card = (id: string, criado: string, entregue: string | null): EspecCard => ({
  id,
  criado,
  trilha: [
    ['Aguardando priorização', criado],
    ...(entregue === null
      ? []
      : ([
          ['Pronto para desenvolver', criado],
          ['Em desenvolvimento', criado],
          ['Entregue', entregue],
        ] as [string, string][])),
  ],
})
const extReal = (sprints: Sprint[], sprintCards: SprintCard[]): ExtensaoBM => ({
  ...EXTENSAO_BM_VAZIA,
  sprints,
  sprintCards,
  sprintsDadoReal: true,
})

/** `n` sprints válidas com 1 filho planejado entregue cada (criado na semana anterior, entregue na quarta). */
function mundo(n: number) {
  const sprints: Sprint[] = []
  const cards: EspecCard[] = []
  const vinc: SprintCard[] = []
  for (let i = 0; i < n; i++) {
    sprints.push(sprint(i))
    cards.push(
      card(
        `C${i}`,
        `${isoDeDia(SEGUNDA + 7 * i - 3)}T09:00-03:00`,
        `${isoDeDia(SEGUNDA + 7 * i + 2)}T10:00-03:00`,
      ),
    )
    vinc.push({ card_id: `C${i}`, sprint_id: `S${i}`, ligado_em: null })
  }
  return { sprints, cards, vinc }
}

describe('T8 com dado real (E7.499, D-T8 "A")', () => {
  it('com 20 sprints publica: comprometido x entregue, carry-over e entrada não planejada; no schema', () => {
    const m = mundo(20)
    // sprint 0: um filho criado depois do início (entrada não planejada) e não entregue (carry-over do comprometido)
    m.cards.push(card('X', `${isoDeDia(SEGUNDA + 1)}T15:00-03:00`, null))
    m.vinc.push({ card_id: 'X', sprint_id: 'S0', ligado_em: null })
    m.cards.push(card('Y', `${isoDeDia(SEGUNDA - 5)}T09:00-03:00`, null))
    m.vinc.push({ card_id: 'Y', sprint_id: 'S0', ligado_em: null })
    const r = calcularT8(ctxDe(m.cards), F, extReal(m.sprints, m.vinc))
    expect(SCHEMAS_RESULTADO.T8.safeParse(r).success).toBe(true)
    expect(r.sprints).toHaveLength(20)
    expect(r.sprintsNoRecorte).toBe(20)
    expect(r.foraDaConta).toEqual({
      semDatas: 0,
      acimaDoTeto: 0,
      tetoDiasUteis: TETO_DIAS_UTEIS_SPRINT,
    })
    const s0 = r.sprints.find((s) => s.sprintId === 'S0')!
    expect(s0.itens).toBe(3)
    expect(s0.entradaNaoPlanejada).toBe(1) // X: criado depois do início
    expect(s0.comprometidos).toBe(2) // C0 e Y
    expect(s0.entreguesDoComprometido).toBe(1)
    expect(s0.carryOver).toBe(1)
    expect(r.base.unidade).toBe('sprints')
    expect(r.base.n).toBe(20)
    expect(r.agregado.entreguePct.status).toBe('ok')
    expect(r.agregado.naoPlanejadoPct.status).toBe('ok')
  })

  it('filho criado no próprio dia do início conta como planejado; um dia depois, não', () => {
    const m = mundo(20)
    m.cards.push(
      card('D0', `${inicioDe(1)}T08:00-03:00`, null),
      card('D1', `${isoDeDia(SEGUNDA + 8)}T08:00-03:00`, null),
    )
    m.vinc.push(
      { card_id: 'D0', sprint_id: 'S1', ligado_em: null },
      { card_id: 'D1', sprint_id: 'S1', ligado_em: null },
    )
    const r = calcularT8(ctxDe(m.cards), F, extReal(m.sprints, m.vinc))
    const s1 = r.sprints.find((s) => s.sprintId === 'S1')!
    expect(s1.comprometidos).toBe(2) // C1 e D0
    expect(s1.entradaNaoPlanejada).toBe(1) // D1
  })

  it('com a data do vínculo (ligado_em), ela vale no lugar da criação', () => {
    const m = mundo(20)
    m.vinc[0] = { card_id: 'C0', sprint_id: 'S0', ligado_em: isoDeDia(SEGUNDA + 2) }
    const r = calcularT8(ctxDe(m.cards), F, extReal(m.sprints, m.vinc))
    expect(r.sprints.find((s) => s.sprintId === 'S0')!.entradaNaoPlanejada).toBe(1)
  })

  it('sem as duas datas ou acima do teto de 30 dias úteis fica fora da conta, contada à parte', () => {
    const m = mundo(20)
    // sem início, sem fim, janela invertida e janela de 31 dias úteis (2026-03-02 a 2026-04-14; a Sexta-feira Santa, 03/04, não é dia útil)
    const extras: Sprint[] = [
      sprint(30, { inicio: null }),
      sprint(31, { fim: null }),
      sprint(32, { inicio: fimDe(32), fim: inicioDe(32) }),
      sprint(33, { inicio: '2026-03-02', fim: '2026-04-14' }),
      sprint(34, { inicio: '2026-03-02', fim: '2026-04-13' }), // 30 dias úteis exatos: entra
    ]
    for (const s of extras) {
      m.cards.push(card(`K${s.sprint_id}`, '2026-02-20T09:00-03:00', null))
      m.vinc.push({ card_id: `K${s.sprint_id}`, sprint_id: s.sprint_id, ligado_em: null })
    }
    expect(
      diasUteisNoIntervalo(diaDeIso('2026-03-02'), diaDeIso('2026-04-14'), CALENDARIO_PADRAO),
    ).toHaveLength(31)
    expect(
      diasUteisNoIntervalo(diaDeIso('2026-03-02'), diaDeIso('2026-04-13'), CALENDARIO_PADRAO),
    ).toHaveLength(30)
    const r = calcularT8(ctxDe(m.cards), F, extReal([...m.sprints, ...extras], m.vinc))
    expect(r.foraDaConta).toEqual({ semDatas: 3, acimaDoTeto: 1, tetoDiasUteis: 30 })
    expect(r.sprintsNoRecorte).toBe(21)
    expect(r.sprints.map((s) => s.sprintId)).not.toContain('S33')
    expect(r.sprints.map((s) => s.sprintId)).toContain('S34')
    expect(SCHEMAS_RESULTADO.T8.safeParse(r).success).toBe(true)
  })

  it('sprint sem filho nos filtros não entra nem na contagem de fora da conta', () => {
    const m = mundo(20)
    const r = calcularT8(
      ctxDe(m.cards),
      F,
      extReal([...m.sprints, sprint(40, { inicio: null })], m.vinc),
    )
    expect(r.foraDaConta?.semDatas).toBe(0)
  })

  it('abaixo de 20 sprints no recorte não publica estatística, só a contagem', () => {
    const m = mundo(19)
    const r = calcularT8(ctxDe(m.cards), F, extReal(m.sprints, m.vinc))
    expect(r.sprints).toEqual([])
    expect(r.sprintsNoRecorte).toBe(19)
    expect(r.base.n).toBe(19)
    expect(r.agregado.entreguePct).toEqual({ status: 'insuficiente', k: 0, n: 19, minimo: 20 })
    expect(r.agregado.naoPlanejadoPct.status).toBe('insuficiente')
    expect(SCHEMAS_RESULTADO.T8.safeParse(r).success).toBe(true)
  })

  it('sem extensão (base real sem sprint): vazio, nunca 0%', () => {
    const r = calcularT8(ctxDe([]), F, extReal([], []))
    expect(r.sprints).toEqual([])
    expect(r.sprintsNoRecorte).toBe(0)
    expect(r.agregado.entreguePct.status).toBe('insuficiente')
    expect(SCHEMAS_RESULTADO.T8.safeParse(r).success).toBe(true)
  })

  it('o recorte pelo período descarta a sprint fora dele', () => {
    const m = mundo(20)
    const r = calcularT8(
      ctxDe(m.cards),
      { ...F, periodo: { tipo: '12s' } },
      extReal(m.sprints, m.vinc),
    )
    // 12 semanas até 2026-10-09 começam em 2026-07-17: nenhuma sprint de março a julho entra
    expect(r.sprints).toEqual([])
    expect(r.sprintsNoRecorte).toBe(0)
  })

  it('mock (sem a marca de dado real): sem mínimo de sprints e sem a contagem de fora da conta', () => {
    const m = mundo(3)
    const r = calcularT8(ctxDe(m.cards), F, {
      ...EXTENSAO_BM_VAZIA,
      sprints: m.sprints,
      sprintCards: m.vinc,
    })
    expect(r.sprints).toHaveLength(3)
    expect(r.foraDaConta).toBeUndefined()
    expect(r.sprintsNoRecorte).toBeUndefined()
    expect(r.base.unidade).toBe('itens em sprint')
  })
})

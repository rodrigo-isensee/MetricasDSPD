import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import {
  calcularE6,
  EXTENSAO_TAMBEM_BM_VAZIA,
  type DatasProjeto,
  type ExtensaoTambemBM,
} from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12m' } }
const F12S: FiltrosFluxo = { ...F, periodo: { tipo: '12s' } }
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
const ctxDe = (cards: EspecCard[]) => criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO)
const extDe = (datasProjeto: Record<string, DatasProjeto>): ExtensaoTambemBM => ({
  ...EXTENSAO_TAMBEM_BM_VAZIA,
  datasProjeto,
})

/** Projeto concluído na quarta 30/09 às 10:00. */
const concluido = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  gran: 'projeto',
  criado: '2026-06-01T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-06-01T08:00:00-03:00',
    '2026-06-02T08:00:00-03:00',
    '2026-07-01T09:00:00-03:00',
    '2026-09-30T10:00:00-03:00',
  ),
  ...extra,
})
const datas = (original: string, replanejamentos = 0): DatasProjeto => ({
  original: t(`${original}T18:00:00-03:00`),
  final: t(`${original}T18:00:00-03:00`),
  replanejamentos,
})
const deslizeDe = (original: string): number => {
  const r = calcularE6(ctxDe([concluido('p')]), F, extDe({ p: datas(original) }))
  return r.projetos[0]?.deslizeDiasUteis as number
}

describe('E6: datas do portfólio (D-7, CA-20)', () => {
  it('deslize em dias úteis com sinal: antes é negativo, na data é 0, depois é positivo (tolerância zero)', () => {
    expect(deslizeDe('2026-09-30')).toBe(0)
    expect(deslizeDe('2026-10-01')).toBe(-1)
    expect(deslizeDe('2026-10-06')).toBe(-4) // 01, 02, 05 e 06/10
    expect(deslizeDe('2026-09-29')).toBe(1)
    expect(deslizeDe('2026-09-04')).toBe(17) // 08 a 11, 14 a 18, 21 a 25 e 28 a 30/09 (07/09 é feriado)
  })

  it('entregue até o fim do dia da data comprometida está na data; um dia depois não está', () => {
    const cards = [concluido('na-data'), concluido('atrasado')]
    const r = calcularE6(
      ctxDe(cards),
      F,
      extDe({ 'na-data': datas('2026-09-30'), atrasado: datas('2026-09-29') }),
    )
    expect(r.naData).toMatchObject({ k: 1, n: 2 })
  })

  it('entrega no fim de semana depois de uma sexta comprometida atrasou, mesmo com 0 dia útil de deslize', () => {
    const sabado: EspecCard = {
      ...concluido('s'),
      trilha: trilhaSimples(
        '2026-06-01T08:00:00-03:00',
        '2026-06-02T08:00:00-03:00',
        '2026-07-01T09:00:00-03:00',
        '2026-09-26T10:00:00-03:00',
      ),
    }
    const r = calcularE6(ctxDe([sabado]), F, extDe({ s: datas('2026-09-25') }))
    expect(r.projetos[0]?.deslizeDiasUteis).toBe(0)
    expect(r.naData.k).toBe(0)
  })

  it('replanejamentos vêm da extensão; os pontos saem sempre, com código e título, em ordem fixa', () => {
    const r = calcularE6(
      ctxDe([concluido('p-2'), concluido('p-1')]),
      F,
      extDe({ 'p-1': datas('2026-09-29', 2), 'p-2': datas('2026-10-02', 0) }),
    )
    expect(r.projetos).toEqual([
      { cardId: 'p-1', codigo: 'p-1', titulo: 'Card p-1', deslizeDiasUteis: 1, replanejamentos: 2 },
      {
        cardId: 'p-2',
        codigo: 'p-2',
        titulo: 'Card p-2',
        deslizeDiasUteis: -2,
        replanejamentos: 0,
      },
    ])
    expect(SCHEMAS_RESULTADO.E6.safeParse(r).success).toBe(true)
  })

  it('projeto concluído sem data comprometida vai para semData e fora das contas; sem extensão, tudo é semData', () => {
    const cards = [concluido('com'), concluido('sem')]
    const r = calcularE6(ctxDe(cards), F, extDe({ com: datas('2026-09-30') }))
    expect(r.semData).toBe(1)
    expect(r.naData).toMatchObject({ k: 1, n: 1 })
    const vazio = calcularE6(ctxDe(cards), F, undefined)
    expect(vazio.semData).toBe(2)
    expect(vazio.projetos).toEqual([])
    expect(SCHEMAS_RESULTADO.E6.safeParse(vazio).success).toBe(true)
  })

  const lote = (n: number) => {
    const cards = Array.from({ length: n }, (_, i) => concluido(`p${i}`))
    const mapa = Object.fromEntries(
      cards.map((c, i) => [c.id, datas(i < 8 ? '2026-09-30' : '2026-09-29')]),
    )
    return { cards, mapa }
  }

  it('fronteira 19/20: percentual e P50/P85 do deslize só com 20 projetos; a lista sai sempre', () => {
    const l19 = lote(19)
    const r19 = calcularE6(ctxDe(l19.cards), F, extDe(l19.mapa))
    expect(r19.naData).toEqual({ status: 'insuficiente', k: 8, n: 19, minimo: 20 })
    expect(r19.deslize).toMatchObject({ status: 'insuficiente', n: 19 })
    expect(r19.deslize).not.toHaveProperty('valor')
    expect(r19.projetos).toHaveLength(19)

    const l20 = lote(20)
    const r20 = calcularE6(ctxDe(l20.cards), F, extDe(l20.mapa))
    expect(r20.naData).toEqual({ status: 'ok', k: 8, n: 20, pct: 40 })
    expect(r20.deslize).toMatchObject({ status: 'ok', n: 20, valor: { p50: 1, p85: 1 } })
  })

  it('o P50/P85 usa a janela de 12 semanas e a contagem usa o período: projeto antigo conta, mas não entra no percentil', () => {
    const antigo: EspecCard = {
      ...concluido('antigo'),
      trilha: trilhaSimples(
        '2026-03-01T08:00:00-03:00',
        '2026-03-02T08:00:00-03:00',
        '2026-03-03T09:00:00-03:00',
        '2026-04-30T10:00:00-03:00',
      ),
    }
    const l20 = lote(20)
    const r = calcularE6(
      ctxDe([...l20.cards, antigo]),
      F,
      extDe({ ...l20.mapa, antigo: datas('2026-04-29') }),
    )
    expect(r.projetos).toHaveLength(21)
    expect(r.deslize).toMatchObject({ status: 'ok', n: 20 })
    // o mesmo fixture, só com 12 semanas de período, deixa o antigo de fora
    const curto = calcularE6(
      ctxDe([...l20.cards, antigo]),
      F12S,
      extDe({ ...l20.mapa, antigo: datas('2026-04-29') }),
    )
    expect(curto.projetos).toHaveLength(20)
  })

  it('só projeto: demanda e frente concluídas não entram; projeto aberto também não', () => {
    const cards: EspecCard[] = [
      concluido('p'),
      concluido('s', { gran: 'story' }),
      concluido('f', { gran: 'frente' }),
      {
        id: 'aberto',
        gran: 'projeto',
        criado: '2026-06-01T08:00:00-03:00',
        trilha: [['Aguardando priorização', '2026-06-01T08:00:00-03:00']],
      },
    ]
    const r = calcularE6(
      ctxDe(cards),
      F,
      extDe({
        p: datas('2026-09-30'),
        s: datas('2026-09-30'),
        f: datas('2026-09-30'),
        aberto: datas('2026-09-30'),
      }),
    )
    expect(r.projetos.map((p) => p.cardId)).toEqual(['p'])
  })

  it('não traz pessoa nem equipe; o resultado é o tipo estrito do contrato', () => {
    const r = calcularE6(ctxDe([concluido('p')]), F, extDe({ p: datas('2026-09-30') }))
    expect(JSON.stringify(r)).not.toMatch(/Pessoa|responsave|equipe/i)
    expect(Object.keys(r.projetos[0] ?? {}).sort()).toEqual([
      'cardId',
      'codigo',
      'deslizeDiasUteis',
      'replanejamentos',
      'titulo',
    ])
  })
})

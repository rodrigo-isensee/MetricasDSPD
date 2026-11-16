/**
 * Pedido 105 (E7.100): T1, T2, T4, T6 e O6 separam pela prioridade nativa do BusinessMap (Crítica, Alta, Média, Baixa).
 * Fronteira de 19 e 20 itens por nível, card sem prioridade fora e contado à parte (nunca Média por omissão), T4 sem total.
 */
import { describe, expect, it } from 'vitest'
import { NIVEIS_PRIORIDADE_BM, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO, diaDeIso, isoDeDia } from '../core/calendario'
import { calcularO6, calcularT1, calcularT2, calcularT4, calcularT6 } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'
import type { DimCard } from './modelo'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const D0 = diaDeIso('2026-08-03') // segunda-feira
const util = (k: number) => isoDeDia(D0 + k + 2 * Math.floor(k / 5))
const em = (k: number, hora: string) => `${util(k)}T${hora}-03:00`
const ctxDe = (especs: EspecCard[]) =>
  criarContextoBM(umaBase(especs), HOJE_TESTE, CALENDARIO_PADRAO)

type Nivel = DimCard['prioridade']
let seq = 0
/** `n` stories entregues com a prioridade dada. */
const entregues = (n: number, prioridade: Nivel): EspecCard[] =>
  Array.from({ length: n }, (_, i) => {
    const k0 = i % 8
    return {
      id: `E${seq++}`,
      prioridade,
      criado: em(k0, '08:00'),
      trilha: trilhaSimples(em(k0, '08:00'), em(k0, '09:00'), em(k0, '10:00'), em(k0 + 2, '16:00')),
    }
  })
/** `n` stories que só chegaram (sem entrega). */
const chegadas = (n: number, prioridade: Nivel): EspecCard[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `C${seq++}`,
    prioridade,
    criado: em(i % 8, '08:00'),
    trilha: [['Aguardando priorização', em(i % 8, '08:00')]] as [string, string][],
  }))

/** 19 Crítica, 20 Alta, 20 Média, 19 Baixa e 7 sem prioridade. */
const mistura = (fabrica: (n: number, p: Nivel) => EspecCard[]): EspecCard[] => [
  ...fabrica(19, 'Crítica'),
  ...fabrica(20, 'Alta'),
  ...fabrica(20, 'Média'),
  ...fabrica(19, 'Baixa'),
  ...fabrica(7, null),
]
const porNivel = <T extends { classe: string }>(classes: readonly T[]) =>
  Object.fromEntries(classes.map((c) => [c.classe, c])) as Record<string, T>

describe('E7.100: separação pela prioridade nativa do BusinessMap', () => {
  it('T1: um grupo por nível, 19 = insuficiente e 20 = ok em cada um, sem prioridade fora e contada', () => {
    const r = calcularT1(ctxDe(mistura(entregues)), F)
    expect(r.classes.map((c) => c.classe)).toEqual([...NIVEIS_PRIORIDADE_BM])
    const c = porNivel(r.classes)
    expect([c.Crítica!.n, c.Alta!.n, c.Média!.n, c.Baixa!.n]).toEqual([19, 20, 20, 19])
    expect(c.Crítica!.estatistica.status).toBe('insuficiente')
    expect(c.Alta!.estatistica.status).toBe('ok')
    expect(c.Média!.estatistica.status).toBe('ok')
    expect(c.Baixa!.estatistica.status).toBe('insuficiente')
    expect(r.semPrioridade).toEqual({ n: 7 })
    expect(r.base.n).toBe(78) // os 7 sem prioridade não entram, nem somados a nível nenhum
    expect(SCHEMAS_RESULTADO.T1.safeParse(r).success).toBe(true)
  })

  it('T1: nível abaixo de 20 nunca é somado a outro (19 Baixa + 7 sem prioridade continua 19)', () => {
    const r = calcularT1(ctxDe([...entregues(19, 'Baixa'), ...entregues(7, null)]), F)
    expect(porNivel(r.classes).Baixa!.n).toBe(19)
    expect(porNivel(r.classes).Baixa!.estatistica.status).toBe('insuficiente')
    expect(r.semPrioridade.n).toBe(7)
    expect(porNivel(r.classes).Média!.n).toBe(0)
  })

  it('T2: n por nível, sem prioridade fora e contada; o SLE só existe onde foi publicado (Média)', () => {
    const r = calcularT2(ctxDe(mistura(entregues)), F)
    const c = porNivel(r.classes)
    expect([c.Crítica!.n, c.Alta!.n, c.Média!.n, c.Baixa!.n]).toEqual([19, 20, 20, 19])
    expect(c.Média!.sle).toEqual({ diasUteis: 5, publicadoEm: '2026-06-15' })
    expect(c.Crítica!.sle).toBeNull()
    expect(c.Alta!.sle).toBeNull() // sem SLE publicado para a Alta: "SLE não definido"
    expect(r.semPrioridade).toEqual({ n: 7 })
    expect(SCHEMAS_RESULTADO.T2.safeParse(r).success).toBe(true)
  })

  it('T2: Média com 19 entregas não publica o SLE (abaixo de 20)', () => {
    const r = calcularT2(ctxDe(entregues(19, 'Média')), F)
    expect(porNivel(r.classes).Média!.sle).toBeNull()
  })

  it('T4: uma linha por nível, nenhuma agregada; fronteira 19 e 20; sem prioridade contada', () => {
    const r = calcularT4(ctxDe(mistura(chegadas)), F)
    expect(r.classes.map((c) => c.classe)).toEqual([...NIVEIS_PRIORIDADE_BM])
    const c = porNivel(r.classes)
    expect([c.Crítica!.n, c.Alta!.n, c.Média!.n, c.Baixa!.n]).toEqual([19, 20, 20, 19])
    expect(c.Crítica!.estatistica.status).toBe('insuficiente')
    expect(c.Alta!.estatistica.status).toBe('ok')
    expect(c.Baixa!.estatistica.status).toBe('insuficiente')
    expect(r.semPrioridade).toEqual({ n: 7 })
    expect(Object.keys(r).sort()).toEqual(['base', 'classes', 'criterios', 'semPrioridade'])
    expect(
      r.classes.some((x) => !(NIVEIS_PRIORIDADE_BM as readonly string[]).includes(x.classe)),
    ).toBe(false)
    expect(SCHEMAS_RESULTADO.T4.safeParse(r).success).toBe(true)
  })

  it('T6: n por nível (itens entregues na janela), sem prioridade fora e contada', () => {
    const r = calcularT6(ctxDe(mistura(entregues)), F)
    const c = porNivel(r.classes)
    expect([c.Crítica!.n, c.Alta!.n, c.Média!.n, c.Baixa!.n]).toEqual([19, 20, 20, 19])
    expect(r.semPrioridade).toEqual({ n: 7 })
    expect(r.base.n).toBe(78)
    expect(SCHEMAS_RESULTADO.T6.safeParse(r).success).toBe(true)
  })

  it('O6: fronteira 19 e 20 por nível; nível vazio some; sem prioridade fora e contada', () => {
    const r = calcularO6(
      ctxDe([...entregues(19, 'Crítica'), ...entregues(20, 'Alta'), ...entregues(7, null)]),
      F,
    )
    expect(r.classes.map((c) => c.classe)).toEqual(['Crítica', 'Alta'])
    expect(r.classes[0]!.estatistica.status).toBe('insuficiente')
    expect(r.classes[1]!.estatistica.status).toBe('ok')
    expect(r.semPrioridade).toEqual({ n: 7 })
    expect(r.base.n).toBe(39)
    expect(SCHEMAS_RESULTADO.O6.safeParse(r).success).toBe(true)
  })

  it('a prioridade nula nunca vira Média: sem nenhuma Média, o nível Média fica vazio', () => {
    const base = ctxDe(entregues(25, null))
    expect(porNivel(calcularT1(base, F).classes).Média!.n).toBe(0)
    expect(porNivel(calcularT2(base, F).classes).Média!.n).toBe(0)
    expect(porNivel(calcularT4(base, F).classes).Média!.n).toBe(0)
    expect(calcularT1(base, F).semPrioridade.n).toBe(25)
    expect(calcularO6(base, F).classes).toEqual([])
  })
})

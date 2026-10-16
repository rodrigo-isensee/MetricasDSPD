import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { resultadoE8 } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO } from '../core/calendario'
import {
  calcularE8,
  EXTENSAO_TAMBEM_BM_VAZIA,
  JANELA_MESES_E8,
  type ConhecimentoSistema,
  type ExtensaoTambemBM,
} from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, umaBase } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12m' } }
const ctx = criarContextoBM(umaBase([]), HOJE_TESTE, CALENDARIO_PADRAO)
const extDe = (conhecimentoSistema: ConhecimentoSistema[]): ExtensaoTambemBM => ({
  ...EXTENSAO_TAMBEM_BM_VAZIA,
  conhecimentoSistema,
})
const linha = (sistema: string, faixa: 1 | 2 | 3, entregas = 30): ConhecimentoSistema => ({
  sistema,
  faixa,
  entregas,
})

describe('E8: concentração de conhecimento (D-3, R-1 = B)', () => {
  it('sem extensão: vazio, recorte pequeno, nunca erro', () => {
    for (const ext of [undefined, EXTENSAO_TAMBEM_BM_VAZIA]) {
      const r = calcularE8(ctx, F, ext)
      expect(r).toMatchObject({ sistemasComEntrega: 0, faixas: null, recortePequeno: true })
      expect(SCHEMAS_RESULTADO.E8.safeParse(r).success).toBe(true)
    }
  })

  it('conta SISTEMAS por faixa (1, 2, 3 ou mais) na janela de 12 meses terminada em hoje', () => {
    const r = calcularE8(
      ctx,
      F,
      extDe([
        linha('A', 1),
        linha('B', 1),
        linha('C', 2),
        linha('D', 3),
        linha('E', 3),
        linha('F', 3),
      ]),
    )
    expect(r.faixas).toEqual({ uma: 2, duas: 1, tresOuMais: 3 })
    expect(r.sistemasComEntrega).toBe(6)
    expect(r.recortePequeno).toBe(false)
    expect(r.janelaMeses).toBe(JANELA_MESES_E8)
    expect(r.base).toMatchObject({ n: 6, unidade: 'sistemas com entrega' })
    expect(r.base.janela).toEqual({ inicio: '2025-10-10', fim: '2026-10-09' })
  })

  it('CA-10: com 4 sistemas as faixas não abrem; com 5 abrem (fronteira)', () => {
    const quatro = calcularE8(
      ctx,
      F,
      extDe([1, 2, 3, 1].map((f, i) => linha(`S${i}`, f as 1 | 2 | 3))),
    )
    expect(quatro).toMatchObject({ faixas: null, recortePequeno: true, sistemasComEntrega: 4 })
    const cinco = calcularE8(
      ctx,
      F,
      extDe([1, 2, 3, 1, 1].map((f, i) => linha(`S${i}`, f as 1 | 2 | 3))),
    )
    expect(cinco.faixas).toEqual({ uma: 3, duas: 1, tresOuMais: 1 })
    expect(cinco.recortePequeno).toBe(false)
  })

  it('sistema sem entrega na janela não conta como sistema com entrega', () => {
    const r = calcularE8(
      ctx,
      F,
      extDe([
        linha('A', 1),
        linha('B', 2),
        linha('C', 3),
        linha('D', 3),
        linha('E', 3),
        linha('Parado', 1, 0),
      ]),
    )
    expect(r.sistemasComEntrega).toBe(5)
    expect(r.faixas).toEqual({ uma: 1, duas: 1, tresOuMais: 3 })
  })

  it('R-1 = B: nenhum nome de sistema sai, nem o da faixa "1 pessoa"; o schema rejeita a lista antiga e campo de pessoa', () => {
    const r = calcularE8(
      ctx,
      F,
      extDe([linha('SIGILOSO-X', 1), linha('B', 2), linha('C', 3), linha('D', 3), linha('E', 3)]),
    )
    expect(JSON.stringify(r)).not.toContain('SIGILOSO')
    expect(Object.keys(r).sort()).toEqual([
      'base',
      'criterios',
      'faixas',
      'janelaMeses',
      'recortePequeno',
      'sistemasComEntrega',
    ])
    expect(resultadoE8.safeParse({ ...r, sistemasUmaPessoa: ['SIGILOSO-X'] }).success).toBe(false)
    expect(resultadoE8.safeParse({ ...r, pessoas: 1 }).success).toBe(false)
  })

  it('equipe, sistema e tipo não atuam (filtrar por sistema reduziria a uma linha)', () => {
    const ext = extDe([1, 2, 3, 1, 3].map((f, i) => linha(`S${i}`, f as 1 | 2 | 3)))
    const ref = calcularE8(ctx, F, ext)
    expect(
      calcularE8(ctx, { ...F, equipe: ['equipe-a'], sistema: ['s0'], tipo: ['Melhoria'] }, ext),
    ).toEqual(ref)
  })
})

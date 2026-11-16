import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { VERSAO_CRITERIO_T9_ESCOPO_CRIADO_EM, VERSOES_DA_BIBLIOTECA } from '../core/criterios'
import { calcularT9 } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (e: EspecCard[]) => criarContextoBM(umaBase(e), HOJE_TESTE, CALENDARIO_PADRAO)

const projeto = (id: string, iniciado: string | null): EspecCard => ({
  id,
  gran: 'projeto',
  criado: '2026-06-01T09:00-03:00',
  trilha: [
    ['Pronto para desenvolver', '2026-06-01T09:00-03:00'],
    ...(iniciado === null ? [] : [['Em desenvolvimento', iniciado] as [string, string]]),
  ],
})
const frente = (id: string, pai: string, criado: string, entregue = false): EspecCard => ({
  id,
  gran: 'frente',
  pai,
  criado,
  trilha: [
    ['Aguardando priorização', criado],
    ...(entregue
      ? ([
          ['Pronto para desenvolver', criado],
          ['Em desenvolvimento', criado.replace(/T09/, 'T10')],
          [
            'Entregue',
            criado.replace(/-(\d\d)T09/, (_, d) => `-${String(Number(d) + 3).padStart(2, '0')}T09`),
          ],
        ] as [string, string][])
      : []),
  ],
})

describe('T9 pela regra do dono (D-T9 "T9 A"): frente criada depois do início do projeto', () => {
  it('frente criada antes do início conta como original; criada depois, como adicionada (avanço pelas filhas)', () => {
    const t9 = calcularT9(
      ctxDe([
        projeto('P1', '2026-06-20T09:00-03:00'),
        frente('F1', 'P1', '2026-06-02T09:00-03:00', true), // criada antes e ligada, talvez, depois: original
        frente('F2', 'P1', '2026-06-19T09:00-03:00'), // antes do início: original
        frente('F3', 'P1', '2026-06-21T09:00-03:00'), // depois do início: adicionada
        frente('F4', 'P1', '2026-08-02T09:00-03:00', true), // adicionada e concluída
      ]),
      F,
    )
    expect(t9.projetos).toHaveLength(1)
    expect(t9.projetos[0]).toMatchObject({
      totalFrentes: 4,
      originais: 2,
      adicionadas: 2,
      concluidas: 2,
      avancoPct: 50,
      crescimentoEscopoPct: 100,
    })
    expect(t9.projetosComEscopoCrescido).toBe(1)
    expect(t9.projetosSemInicio).toBe(0)
  })

  it('não lê adicionado_apos_inicio_pai: a coluna nunca gravada (false) não zera as adicionadas', () => {
    const base = umaBase([
      projeto('P1', '2026-06-20T09:00-03:00'),
      frente('F1', 'P1', '2026-06-02T09:00-03:00'),
      frente('F2', 'P1', '2026-08-02T09:00-03:00'),
    ])
    base.cards.forEach((c) => (c.adicionado_apos_inicio_pai = false))
    const t9 = calcularT9(criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(t9.projetos[0]).toMatchObject({ originais: 1, adicionadas: 1 })
  })

  it('projeto sem início fica fora da tabela e é contado, nunca vira 0 adicionadas', () => {
    const t9 = calcularT9(
      ctxDe([
        projeto('P1', '2026-06-20T09:00-03:00'),
        frente('F1', 'P1', '2026-06-02T09:00-03:00'),
        projeto('P2', null),
        frente('F2', 'P2', '2026-06-03T09:00-03:00'),
        frente('F3', 'P2', '2026-08-03T09:00-03:00'),
        projeto('P3', null), // sem início e sem frente: nem entra na contagem
      ]),
      F,
    )
    expect(t9.projetos.map((p) => p.projetoId)).toEqual(['P1'])
    expect(t9.projetosSemInicio).toBe(1)
  })

  it('o avanço sai pelas frentes filhas e nunca mistura story, frente e projeto', () => {
    const t9 = calcularT9(
      ctxDe([
        projeto('P1', '2026-06-20T09:00-03:00'),
        frente('F1', 'P1', '2026-06-02T09:00-03:00', true),
        frente('F2', 'P1', '2026-06-03T09:00-03:00'),
        {
          id: 'S1',
          criado: '2026-06-04T09:00-03:00',
          pai: 'P1',
          trilha: [['Aguardando priorização', '2026-06-04T09:00-03:00']],
        },
      ]),
      F,
    )
    expect(t9.projetos[0]).toMatchObject({ totalFrentes: 2, concluidas: 1, avancoPct: 50 })
    expect(t9.base.unidade).toContain('frentes')
  })

  it.each([19, 20])(
    'fronteira com %i projetos: censo por projeto, só "k de n", sem percentil nem estatística agregada',
    (n) => {
      const especs: EspecCard[] = []
      for (let i = 0; i < n; i++) {
        const id = `P${String(i).padStart(2, '0')}`
        especs.push(projeto(id, '2026-06-20T09:00-03:00'))
        especs.push(frente(`${id}-F1`, id, '2026-06-02T09:00-03:00', true))
        if (i % 2 === 0) especs.push(frente(`${id}-F2`, id, '2026-08-02T09:00-03:00'))
      }
      const t9 = calcularT9(ctxDe(especs), F)
      expect(t9.projetos).toHaveLength(n)
      expect(t9.projetosComEscopoCrescido).toBe(Math.ceil(n / 2))
      expect(Object.keys(t9).sort()).toEqual(
        ['base', 'criterios', 'projetos', 'projetosComEscopoCrescido', 'projetosSemInicio'].sort(),
      )
      // por projeto segue o briefing (censo): o projeto de 19 e o de 20 publicam igual
      expect(t9.projetos[0]).toMatchObject({ totalFrentes: 2, adicionadas: 1 })
    },
  )

  it('a versão de critério afeta o T9 e leva a data da decisão', () => {
    expect(VERSOES_DA_BIBLIOTECA).toContain(VERSAO_CRITERIO_T9_ESCOPO_CRIADO_EM)
    expect(VERSAO_CRITERIO_T9_ESCOPO_CRIADO_EM).toMatchObject({ data: '2026-11-16', afeta: ['T9'] })
  })
})

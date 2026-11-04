import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { calcularO2 } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase } from './testing'
import type { BaseBM } from './modelo'

// 069 L3-a: o O2 com uma equipe acha as colunas pela equipe da coluna (como o O1), não por `quadro-<slug>`.
const F: FiltrosFluxo = { equipe: ['equipe-a'], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const trilha = trilhaSimples(
  '2026-09-01T09:00-03:00',
  '2026-09-01T10:00-03:00',
  '2026-09-02T08:00-03:00',
  '2026-09-30T17:00-03:00',
).slice(0, 3)

function base(real: boolean): BaseBM {
  const b = umaBase([{ id: 'W1', criado: '2026-09-01T09:00-03:00', trilha }])
  if (!real) return b
  b.cards[0]!.quadro_id = '35'
  return {
    ...b,
    // base real: quadro numérico; a coluna diz a equipe do workflow dela
    colunas: b.colunas.map((c) => ({ ...c, quadro_id: '35', equipe: 'Equipe A' })),
  }
}

const rodar = (b: BaseBM, f: FiltrosFluxo = F) =>
  calcularO2(criarContextoBM(b, HOJE_TESTE, CALENDARIO_PADRAO), f)

describe('O2 com filtro de equipe (069 L3-a)', () => {
  it('base real: etapas são as colunas de trabalho e homologação do time, em ordem, e o parado cai na coluna certa', () => {
    const b = base(true)
    const r = rodar(b)
    const esperadas = [...b.colunas]
      .filter((c) => c.papel === 'trabalho' || c.papel === 'homologacao')
      .sort((x, y) => x.ordem - y.ordem)
      .map((c) => c.coluna)
    expect(r.etapas.length).toBeGreaterThan(0)
    expect(r.etapas).toEqual(esperadas)
    expect(r.agrupadoPorColuna).toBe(true)
    expect(r.parados.porEtapa.map((e) => e.etapa)).toEqual(r.etapas)
    expect(r.parados.porEtapa.find((e) => e.etapa === 'Em desenvolvimento')?.k).toBe(1)
    expect(r.parados.porEtapa.reduce((s, e) => s + e.k, 0)).toBe(1)
  })

  it('base semeada: sem `equipe` na coluna vale o quadro `quadro-<slug>` (comportamento anterior)', () => {
    expect(rodar(base(false)).etapas).toEqual([]) // o quadro de teste não é `quadro-equipe-a`
    const b = base(false)
    b.colunas = b.colunas.map((c) => ({ ...c, quadro_id: 'quadro-equipe-a' }))
    expect(rodar(b).etapas).toContain('Em desenvolvimento')
  })

  it('coluna de outro time no mesmo quadro não entra', () => {
    const b = base(true)
    b.colunas = b.colunas.map((c) =>
      c.coluna === 'Em desenvolvimento' ? { ...c, equipe: 'Equipe B' } : c,
    )
    const r = rodar(b)
    expect(r.etapas).not.toContain('Em desenvolvimento')
  })

  it('sem filtro de equipe: Fila e Execução, como antes', () => {
    const r = rodar(base(true), { ...F, equipe: [] })
    expect(r.etapas).toEqual(['Fila', 'Execução'])
    expect(r.agrupadoPorColuna).toBe(false)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase } from './testing'

vi.mock('./t3', () => ({ naturezaDe: () => 'Dívida técnica' }))

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }

/** CA-23: a natureza do E7 é a função do T3. Se o E7 tivesse mapeamento próprio, trocar o T3 não mudaria o resultado. */
describe('E7 não tem mapeamento próprio de natureza (CA-23, R-3)', () => {
  it('trocar naturezaDe do T3 muda a natureza das barras do E7', async () => {
    const { calcularE7 } = await import('./e7')
    const cards = Array.from({ length: 3 }, (_, i) => ({
      id: `c${i}`,
      tipo: 'Incidente' as const,
      criado: '2026-08-03T08:00:00-03:00',
      trilha: trilhaSimples(
        '2026-08-03T08:00:00-03:00',
        '2026-08-04T08:00:00-03:00',
        '2026-08-05T08:00:00-03:00',
        '2026-09-30T10:00:00-03:00',
      ),
    }))
    const r = calcularE7(criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO), F)
    const nat = r.sistemas[0]?.porNatureza ?? []
    expect(nat.find((n) => n.natureza === 'Dívida técnica')?.taxa.k).toBe(3)
    expect(nat.find((n) => n.natureza === 'Sustentação')?.taxa.k).toBe(0)
  })

  it('o código do E7 importa naturezaDe do T3 e não lista tipos de card', () => {
    const fonte = readFileSync(new URL('./e7.ts', import.meta.url), 'utf8')
    expect(fonte).toMatch(/import \{ naturezaDe \} from '\.\/t3'/)
    expect(fonte).not.toMatch(/Incidente|Requisição|Defeito em produção|case '/)
  })
})

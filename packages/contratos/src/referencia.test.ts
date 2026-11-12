import { describe, expect, it } from 'vitest'
import { opcoesFiltroSchema, referenciaSchema } from './referencia'

const historico = { inicio: '2025-01-01', fim: '2025-12-31' }

describe('schemas de referência', () => {
  it('aceita opções de fluxo e de sustentação e discrimina pelo domínio', () => {
    const o = { id: 'a', nome: 'A' }
    expect(
      opcoesFiltroSchema.safeParse({
        dominio: 'businessmap',
        equipes: [o],
        tipos: [o],
        sistemas: [o],
        historico,
      }).success,
    ).toBe(true)
    expect(
      opcoesFiltroSchema.safeParse({
        dominio: 'acelerato',
        equipes: [o],
        prioridades: [o],
        historico,
      }).success,
    ).toBe(true)
    expect(
      opcoesFiltroSchema.safeParse({ dominio: 'acelerato', equipes: [o], tipos: [o], historico })
        .success,
    ).toBe(false)
  })
  it('opcoes de fluxo aceitam setores (id e nome) e continuam válidas sem eles; setor fora da forma recusa', () => {
    const o = { id: 'plataformas', nome: 'Plataformas' }
    const base = { dominio: 'businessmap', equipes: [], tipos: [], sistemas: [], historico }
    expect(opcoesFiltroSchema.safeParse({ ...base, setores: [o] }).success).toBe(true)
    expect(opcoesFiltroSchema.safeParse({ ...base, setores: [] }).success).toBe(true)
    expect(opcoesFiltroSchema.safeParse(base).success).toBe(true)
    expect(opcoesFiltroSchema.safeParse({ ...base, setores: [{ ...o, quadro: 23 }] }).success).toBe(false)
    expect(opcoesFiltroSchema.safeParse({ ...base, setores: [{ id: '', nome: 'X' }] }).success).toBe(false)
    expect(opcoesFiltroSchema.safeParse({ dominio: 'acelerato', equipes: [], prioridades: [], setores: [o], historico }).success).toBe(false)
  })
  it('valida a referência (datas e instantes com deslocamento) e rejeita campo extra', () => {
    const ok = {
      dataReferencia: '2025-06-01',
      ultimaColeta: { businessmap: '2025-06-01T10:00:00-03:00', acelerato: null },
      versaoCriterio: 'v1',
    }
    expect(referenciaSchema.safeParse(ok).success).toBe(true)
    expect(referenciaSchema.safeParse({ ...ok, extra: 1 }).success).toBe(false)
    expect(referenciaSchema.safeParse({ ...ok, dataReferencia: '01/06/2025' }).success).toBe(false)
  })
})

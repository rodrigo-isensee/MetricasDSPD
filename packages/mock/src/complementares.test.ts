import { describe, expect, it } from 'vitest'
import { CAUSAS_RAIZ } from '@metricas-dspd/contratos'
import { gerarBaseMock, gerarExtensoesMock } from '.'
import { hashJson } from './prng'

const base = gerarBaseMock()
const ext = gerarExtensoesMock(base)

describe('extensões mock das métricas complementares', () => {
  it('não altera a base: hashes do núcleo intactos', () => {
    expect(hashJson(base)).toBe('b9645d93')
    expect(hashJson(gerarBaseMock({ escala: 0.2 }))).toBe('4a7c9719')
  })

  it('é determinística pela semente e pura da base', () => {
    expect(hashJson(gerarExtensoesMock(base))).toBe(hashJson(ext))
    const outra = gerarBaseMock({ escala: 0.2, semente: 7 })
    expect(hashJson(gerarExtensoesMock(outra))).not.toBe(hashJson(ext))
    expect(hashJson(ext)).toBe('27659a0a')
  })

  it('AC: causa raiz só em incidentes, domínio fechado (O17 é da Sustentação)', () => {
    const incidentes = base.ac.chamados.filter((c) => c.natureza === 'incidente')
    expect(Object.keys(ext.ac.causasRaiz)).toHaveLength(incidentes.length)
    for (const v of Object.values(ext.ac.causasRaiz)) expect(CAUSAS_RAIZ).toContain(v)
    expect('causasRaiz' in ext.bm).toBe(false)
  })

  it('BM: sprints quinzenais; natureza fechada', () => {
    expect(ext.bm.sprints.length).toBeGreaterThan(20)
    expect(ext.bm.sprints[0]?.sprint_id).toBe('SPR-01')
    const projetos = base.bm.cards.filter((c) => c.granularidade === 'projeto')
    expect(Object.keys(ext.bm.naturezaProjeto)).toHaveLength(projetos.length)
    const ids = new Set(ext.bm.sprints.map((s) => s.sprint_id))
    for (const sc of ext.bm.sprintCards) expect(ids.has(sc.sprint_id)).toBe(true)
    const inicio = new Map(ext.bm.sprints.map((x) => [x.sprint_id, x.inicio]))
    const naoPlan = ext.bm.sprintCards.filter(
      (s) => s.ligado_em > (inicio.get(s.sprint_id) as string),
    ).length
    expect(naoPlan / ext.bm.sprintCards.length).toBeGreaterThan(0.1)
    expect(naoPlan / ext.bm.sprintCards.length).toBeLessThan(0.2)
  })

  it('AC: reabertura liga incidentes da mesma categoria, sem criar chamado', () => {
    const porId = new Map(base.ac.chamados.map((c) => [c.chamado_id, c]))
    const pares = Object.entries(ext.ac.reabertoDe)
    expect(pares.length).toBeGreaterThan(50)
    for (const [novo, orig] of pares) {
      const a = porId.get(novo)
      const b = porId.get(orig)
      expect(a?.categoria_sistema).toBe(b?.categoria_sistema)
      expect(a?.aberto_em).toBeGreaterThan(b?.data_finalizado as number)
    }
    expect(Object.values(ext.ac.registroProblema).some(Boolean)).toBe(true)
  })
})

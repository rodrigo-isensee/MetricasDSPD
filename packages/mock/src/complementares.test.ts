import { describe, expect, it } from 'vitest'
import { CAUSAS_RAIZ } from '@metricas-dspd/contratos'
import { gerarBaseMock, gerarExtensoesMock } from '.'
import { hashJson } from './prng'

const base = gerarBaseMock()
const ext = gerarExtensoesMock(base)

describe('extensões mock das métricas complementares', () => {
  it('não altera a base: hashes do núcleo intactos', () => {
    expect(hashJson(base)).toBe('924448d4')
    expect(hashJson(gerarBaseMock({ escala: 0.2 }))).toBe('b2bfd4c0')
  })

  it('é determinística pela semente e pura da base', () => {
    expect(hashJson(gerarExtensoesMock(base))).toBe(hashJson(ext))
    const outra = gerarBaseMock({ escala: 0.2, semente: 7 })
    expect(hashJson(gerarExtensoesMock(outra))).not.toBe(hashJson(ext))
    expect(hashJson(ext)).toBe('a4a5647e')
  })

  it('BM: causa raiz só em bugs, domínio fechado; sprints quinzenais; natureza fechada', () => {
    const bugs = base.bm.cards.filter(
      (c) => c.tipo === 'Bug interno' || c.tipo === 'Defeito em produção',
    )
    expect(Object.keys(ext.bm.causasRaiz)).toHaveLength(bugs.length)
    for (const v of Object.values(ext.bm.causasRaiz)) expect(CAUSAS_RAIZ).toContain(v)
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

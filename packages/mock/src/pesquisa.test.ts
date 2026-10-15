import { describe, expect, it } from 'vitest'
import { linhaPesquisaSchema, MINIMOS_PESQUISA } from '@metricas-dspd/contratos'
import { gerarBaseMock, gerarPesquisaMock, CONFIG_PADRAO } from '.'
import { hashJson } from './prng'

const pesq = gerarPesquisaMock(CONFIG_PADRAO)
const vigente = (tri: string) =>
  pesq.cargas.filter((c) => c.trimestre === tri).sort((a, b) => b.cargaId - a.cargaId)[0]
const respondentes = (
  linhas: { pergunta: string; f1: number; f2: number; f3: number; f4: number; f5: number }[],
  p: string,
) =>
  linhas.filter((l) => l.pergunta === p).reduce((s, l) => s + l.f1 + l.f2 + l.f3 + l.f4 + l.f5, 0)

describe('pesquisa mock (PV1): determinismo e isolamento', () => {
  it('hash fixo da pesquisa (muda só de propósito)', () => {
    expect(hashJson(pesq)).toBe('b2eb2918')
  })
  it('é determinística por semente e muda com outra semente', () => {
    expect(hashJson(gerarPesquisaMock(CONFIG_PADRAO))).toBe(hashJson(pesq))
    expect(hashJson(gerarPesquisaMock({ ...CONFIG_PADRAO, semente: 7 }))).not.toBe(hashJson(pesq))
  })
  it('não toca a base de BusinessMap e Acelerato: hashes 68a67741 e 824092e4 intactos', () => {
    gerarPesquisaMock(CONFIG_PADRAO)
    expect(hashJson(gerarBaseMock())).toBe('68a67741')
    expect(hashJson(gerarBaseMock({ escala: 0.2 }))).toBe('824092e4')
  })
})

describe('pesquisa mock (PV1): cenário e invariantes', () => {
  it('as 5 perguntas da decisão 22; só o texto de `informado` muda na v2', () => {
    const [v1, v2] = pesq.versoes
    const cod = (v?: (typeof pesq.versoes)[number]) => v?.perguntas.map((p) => p.codigo)
    expect(cod(v1)).toEqual(['resolve', 'prazo', 'informado', 'nao_volta', 'confianca'])
    expect(cod(v2)).toEqual(cod(v1))
    const mudou = v1?.perguntas.filter((p, i) => p.texto !== v2?.perguntas[i]?.texto)
    expect(mudou?.map((p) => p.codigo)).toEqual(['informado'])
  })
  it('totais fixados por trimestre vigente (9, 11, 4, 14, 19, 24) e reenvio guardado', () => {
    const n = (t: string) => respondentes(vigente(t)?.linhas ?? [], 'resolve')
    expect(['2025-T2', '2025-T3', '2025-T4', '2026-T1', '2026-T2', '2026-T3'].map(n)).toEqual([
      9, 11, 4, 14, 19, 24,
    ])
    const t2 = pesq.cargas
      .filter((c) => c.trimestre === '2026-T2')
      .sort((a, b) => a.cargaId - b.cargaId)
    expect(t2.map((c) => respondentes(c.linhas, 'resolve'))).toEqual([17, 19])
  })
  it('A10 exercitado: 2026-T1 tem áreas 4,3,3,3,1 e 2026-T3 tem 5,4,4,3,3,2,2,1', () => {
    const tam = (t: string) =>
      (vigente(t)?.linhas ?? [])
        .filter((l) => l.pergunta === 'resolve')
        .map((l) => l.f1 + l.f2 + l.f3 + l.f4 + l.f5)
        .sort((a, b) => b - a)
    expect(tam('2026-T1')).toEqual([4, 3, 3, 3, 1])
    expect(tam('2026-T3')).toEqual([5, 4, 4, 3, 3, 2, 2, 1])
  })
  it('soma por pergunta = respondentes da área; respondentes <= convidados; áreas e perguntas existem', () => {
    const areas = new Set(pesq.areas.map((a) => a.codigo))
    for (const c of pesq.cargas) {
      const versao = pesq.versoes.find((v) => v.id === c.versaoId)
      const codigos = new Set(versao?.perguntas.map((p) => p.codigo))
      const porArea = new Map<string, number[]>()
      for (const l of c.linhas) {
        expect(linhaPesquisaSchema.safeParse(l).success).toBe(true)
        expect(areas.has(l.area)).toBe(true)
        expect(codigos.has(l.pergunta)).toBe(true)
        const r = l.f1 + l.f2 + l.f3 + l.f4 + l.f5
        porArea.set(l.area, [...(porArea.get(l.area) ?? []), r])
        expect(r).toBeLessThanOrEqual(l.convidados)
      }
      for (const soma of porArea.values()) expect(new Set(soma).size).toBe(1)
    }
  })
  it('questionário v1 até 31/03/2026 e v2 a partir de 01/04/2026, com a marcação T2.6', () => {
    expect(pesq.versoes.map((v) => [v.id, v.vigenteDesde])).toEqual([
      ['q-v1', '2025-04-01'],
      ['q-v2', '2026-04-01'],
    ])
    expect(pesq.criterios).toEqual([
      expect.objectContaining({ data: '2026-04-01', afeta: ['PV1'] }),
    ])
    const txt = (id: string) =>
      pesq.versoes.find((v) => v.id === id)?.perguntas.find((p) => p.codigo === 'informado')?.texto
    expect(txt('q-v1')).not.toBe(txt('q-v2'))
  })
  it('só nomes de unidade, sem pessoa, e mínimo do consolidado respeitado nos parâmetros', () => {
    expect(pesq.areas).toHaveLength(8)
    expect(JSON.stringify(pesq)).not.toMatch(/@/)
    expect(MINIMOS_PESQUISA.consolidado).toBe(5)
  })
})

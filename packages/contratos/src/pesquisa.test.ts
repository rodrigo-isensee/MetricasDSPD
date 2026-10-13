import { describe, expect, it } from 'vitest'
import {
  COLUNAS_CSV_PESQUISA,
  FAIXAS_ESCALA,
  METRICAS_PESQUISA,
  METRICAS_SUSTENTACAO,
  METRICA_IDS,
  MINIMOS_PESQUISA,
  fonteDaMetrica,
  linhaPesquisaSchema,
  resultadoPV1,
  type ResultadoPV1,
} from '.'
import { SCHEMAS_RESULTADO } from './validacao'

describe('fonteDaMetrica', () => {
  it('toda métrica tem fonte conhecida e as três fontes não se misturam', () => {
    for (const id of METRICA_IDS) {
      const f = fonteDaMetrica(id)
      expect(['businessmap', 'acelerato', 'pesquisa', 'ambos']).toContain(f)
      expect(f === 'acelerato').toBe(METRICAS_SUSTENTACAO.includes(id))
      expect(f === 'pesquisa').toBe(METRICAS_PESQUISA.includes(id))
    }
  })

  it('PV1 é pesquisa (nem Acelerato nem fluxo); S1 e O17 são Acelerato; O1 é BusinessMap; Visão geral é ambos', () => {
    expect(fonteDaMetrica('PV1')).toBe('pesquisa')
    expect(METRICAS_SUSTENTACAO).not.toContain('PV1')
    expect(fonteDaMetrica('S1')).toBe('acelerato')
    expect(fonteDaMetrica('O17')).toBe('acelerato')
    expect(fonteDaMetrica('O1')).toBe('businessmap')
    expect(fonteDaMetrica('VISAO_GERAL')).toBe('ambos')
  })
})

describe('parâmetros da pesquisa', () => {
  it('mínimos 5 e 3, por área só do ciclo 2, e escala de 5 rótulos', () => {
    expect(MINIMOS_PESQUISA).toEqual({ consolidado: 5, area: 3, porAreaDesdeCiclo: 2 })
    expect(FAIXAS_ESCALA).toHaveLength(5)
  })
})

describe('linha do CSV agregado', () => {
  const linha = {
    trimestre: '2026-T3',
    area: 'financeiro',
    pergunta: 'resolve',
    f1: 0,
    f2: 1,
    f3: 2,
    f4: 3,
    f5: 1,
    convidados: 10,
  }
  it('aceita só o cabeçalho da allow-list', () => {
    expect(COLUNAS_CSV_PESQUISA).toHaveLength(9)
    expect(linhaPesquisaSchema.safeParse(linha).success).toBe(true)
    expect(linhaPesquisaSchema.safeParse({ ...linha, email: 'a@b.com' }).success).toBe(false)
    expect(linhaPesquisaSchema.safeParse({ ...linha, nome: 'x' }).success).toBe(false)
  })
  it('recusa trimestre inválido, faixa negativa ou fracionada, "@" e respondentes acima de convidados', () => {
    expect(linhaPesquisaSchema.safeParse({ ...linha, trimestre: '2026-T5' }).success).toBe(false)
    expect(linhaPesquisaSchema.safeParse({ ...linha, f1: -1 }).success).toBe(false)
    expect(linhaPesquisaSchema.safeParse({ ...linha, f2: 1.5 }).success).toBe(false)
    expect(linhaPesquisaSchema.safeParse({ ...linha, area: 'joao@x.com' }).success).toBe(false)
    expect(linhaPesquisaSchema.safeParse({ ...linha, pergunta: 'a@b' }).success).toBe(false)
    expect(linhaPesquisaSchema.safeParse({ ...linha, convidados: 6 }).success).toBe(false)
  })
})

type Faixas = { faixa: 1 | 2 | 3 | 4 | 5; contagem: unknown }[]
const faixas = (n: number): Faixas =>
  ([1, 2, 3, 4, 5] as const).map((faixa) => ({
    faixa,
    contagem:
      n >= 20 ? { status: 'ok', k: 1, n, pct: 5 } : { status: 'insuficiente', k: 1, n, minimo: 20 },
  }))
const publicado = (n: number) => ({
  status: 'publicado',
  n,
  perguntas: [{ codigo: 'resolve', faixas: faixas(n) }],
})
const area = (rotulo: string, n: number, outras = false) => ({
  rotulo,
  outras,
  bloco: publicado(n),
})

function ok(sobre: Record<string, unknown> = {}): unknown {
  return {
    status: 'ok',
    fonte: 'pesquisa',
    trimestre: '2026-T3',
    ciclo: 3,
    questionario: {
      versaoId: 'v2',
      vigenteDesde: '2026-04-01',
      perguntas: [{ codigo: 'resolve', ordem: 1, texto: 'Resolve?' }],
    },
    participacao: {
      respondentes: 24,
      convidados: 30,
      taxa: { status: 'ok', k: 24, n: 30, pct: 80 },
    },
    consolidado: publicado(24),
    porArea: {
      status: 'publicado',
      areas: [area('Financeiro', 12), area('RH', 9), area('Outras áreas', 3, true)],
    },
    tendencia: [
      {
        trimestre: '2026-T2',
        versaoId: 'v2',
        bloco: { status: 'base-insuficiente', n: 4, minimo: 5 },
      },
      {
        trimestre: '2026-T3',
        versaoId: 'v2',
        bloco: {
          status: 'publicado',
          n: 24,
          concordam: [{ codigo: 'resolve', contagem: { status: 'ok', k: 15, n: 24, pct: 62.5 } }],
        },
      },
    ],
    oQueMudou: { trimestre: '2026-T3', texto: 'Ajustamos o prazo.' },
    criterios: { serie: [], janela: [] },
    base: { n: 24, unidade: 'respostas', janela: null },
    ...sobre,
  }
}
const valida = (v: unknown) => resultadoPV1.safeParse(v).success

describe('resultadoPV1 (zod estrito, mínimos no schema)', () => {
  it('é o schema registrado para PV1 e tipa o resultado', () => {
    expect(SCHEMAS_RESULTADO.PV1).toBe(resultadoPV1)
    const r: ResultadoPV1 = { status: 'sem-pesquisa', fonte: 'pesquisa' }
    expect(valida(r)).toBe(true)
  })

  it('aceita o resultado completo e o sem-pesquisa; recusa chave extra (pessoa, média, meta)', () => {
    expect(valida(ok())).toBe(true)
    expect(valida({ status: 'sem-pesquisa', fonte: 'pesquisa', media: 4 })).toBe(false)
    expect(valida({ status: 'sem-pesquisa', fonte: 'businessmap' })).toBe(false)
    expect(valida(ok({ media: 4.2 }))).toBe(false)
    expect(valida(ok({ meta: 80 }))).toBe(false)
    expect(
      valida(
        ok({
          participacao: {
            respondentes: 24,
            convidados: 30,
            taxa: { status: 'ok', k: 24, n: 30, pct: 80 },
            meta: 80,
          },
        }),
      ),
    ).toBe(false)
    expect(
      valida(ok({ porArea: { status: 'publicado', areas: [{ ...area('RH', 9), email: 'x' }] } })),
    ).toBe(false)
  })

  it('consolidado: n < 5 só existe como base-insuficiente; publicado exige n >= 5', () => {
    expect(valida(ok({ consolidado: { status: 'base-insuficiente', n: 4, minimo: 5 } }))).toBe(true)
    expect(valida(ok({ consolidado: { status: 'base-insuficiente', n: 5, minimo: 5 } }))).toBe(
      false,
    )
    expect(valida(ok({ consolidado: { status: 'base-insuficiente', n: 4, minimo: 3 } }))).toBe(
      false,
    )
    expect(
      valida(ok({ consolidado: { status: 'base-insuficiente', n: 4, minimo: 5, perguntas: [] } })),
    ).toBe(false)
    expect(valida(ok({ consolidado: publicado(4) }))).toBe(false)
    expect(valida(ok({ consolidado: publicado(5) }))).toBe(true)
  })

  it('faixas: k de n de 5 a 19 e percentual só com n >= 20; taxa.n tem de ser o n do bloco', () => {
    expect(valida(ok({ consolidado: publicado(19) }))).toBe(true)
    expect(valida(ok({ consolidado: publicado(20) }))).toBe(true)
    const pctAbaixoDe20 = {
      status: 'publicado',
      n: 19,
      perguntas: [
        {
          codigo: 'resolve',
          faixas: [{ faixa: 1, contagem: { status: 'ok', k: 1, n: 19, pct: 5 } }],
        },
      ],
    }
    expect(valida(ok({ consolidado: pctAbaixoDe20 }))).toBe(false)
    const nDiferente = {
      status: 'publicado',
      n: 24,
      perguntas: [
        {
          codigo: 'resolve',
          faixas: [{ faixa: 1, contagem: { status: 'ok', k: 1, n: 30, pct: 3 } }],
        },
      ],
    }
    expect(valida(ok({ consolidado: nDiferente }))).toBe(false)
    const faixaSeis = {
      status: 'publicado',
      n: 24,
      perguntas: [
        {
          codigo: 'resolve',
          faixas: [{ faixa: 6, contagem: { status: 'ok', k: 1, n: 24, pct: 4 } }],
        },
      ],
    }
    expect(valida(ok({ consolidado: faixaSeis }))).toBe(false)
  })

  it('por área: bloco publicado exige n >= 3; não publicado tem motivo fechado', () => {
    expect(valida(ok({ porArea: { status: 'nao-publicado', motivo: 'primeiro-ciclo' } }))).toBe(
      true,
    )
    expect(valida(ok({ porArea: { status: 'nao-publicado', motivo: 'base-insuficiente' } }))).toBe(
      true,
    )
    expect(valida(ok({ porArea: { status: 'nao-publicado', motivo: 'outro' } }))).toBe(false)
    expect(valida(ok({ porArea: { status: 'publicado', areas: [area('Financeiro', 2)] } }))).toBe(
      false,
    )
  })

  it('por área: ordem alfabética, "Outras áreas" por último e uma só vez', () => {
    const com = (areas: unknown[]) => ok({ porArea: { status: 'publicado', areas } })
    expect(valida(com([area('Financeiro', 12), area('RH', 12)]))).toBe(true)
    expect(valida(com([area('RH', 12), area('Financeiro', 12)]))).toBe(false)
    expect(
      valida(com([area('Financeiro', 12), area('Outras áreas', 3, true), area('RH', 9)])),
    ).toBe(false)
    expect(
      valida(com([area('Financeiro', 12), area('Outras áreas', 6, true), area('Outras', 6, true)])),
    ).toBe(false)
  })

  it('A10: consolidado menos as áreas publicadas nunca dá 1 ou 2', () => {
    const com = (areas: unknown[]) => ok({ porArea: { status: 'publicado', areas } })
    // 24 - (12 + 11) = 1; 24 - (12 + 10) = 2; 24 - (12 + 9) = 3; 24 - 24 = 0
    expect(valida(com([area('A', 12), area('B', 11)]))).toBe(false)
    expect(valida(com([area('A', 12), area('B', 10)]))).toBe(false)
    expect(valida(com([area('A', 12), area('B', 9)]))).toBe(true)
    expect(valida(com([area('A', 12), area('B', 12)]))).toBe(true)
    // sem consolidado publicado não há subtração possível
    expect(
      valida(
        ok({
          consolidado: { status: 'base-insuficiente', n: 4, minimo: 5 },
          porArea: { status: 'publicado', areas: [area('A', 12), area('B', 11)] },
        }),
      ),
    ).toBe(true)
  })

  it('tendência: até 4 pontos, cada um com o mínimo 5; "concordam" só com taxa válida', () => {
    const ponto = (n: number) => ({
      trimestre: '2026-T3',
      versaoId: 'v2',
      bloco: { status: 'base-insuficiente', n, minimo: 5 },
    })
    expect(valida(ok({ tendencia: [ponto(0), ponto(1), ponto(2), ponto(3)] }))).toBe(true)
    expect(valida(ok({ tendencia: [ponto(0), ponto(1), ponto(2), ponto(3), ponto(4)] }))).toBe(
      false,
    )
    expect(valida(ok({ tendencia: [ponto(5)] }))).toBe(false)
    const publ = (n: number, contagem: unknown) => ({
      trimestre: '2026-T3',
      versaoId: 'v2',
      bloco: { status: 'publicado', n, concordam: [{ codigo: 'resolve', contagem }] },
    })
    expect(
      valida(ok({ tendencia: [publ(4, { status: 'insuficiente', k: 1, n: 4, minimo: 20 })] })),
    ).toBe(false)
    expect(
      valida(ok({ tendencia: [publ(5, { status: 'insuficiente', k: 3, n: 5, minimo: 20 })] })),
    ).toBe(true)
    expect(valida(ok({ tendencia: [publ(5, { status: 'ok', k: 3, n: 5, pct: 60 })] }))).toBe(false)
  })

  it('O que mudou: texto até 500 caracteres ou nulo; trimestre no formato 2026-T3', () => {
    expect(valida(ok({ oQueMudou: null }))).toBe(true)
    expect(valida(ok({ oQueMudou: { trimestre: '2026-T3', texto: 'x'.repeat(500) } }))).toBe(true)
    expect(valida(ok({ oQueMudou: { trimestre: '2026-T3', texto: 'x'.repeat(501) } }))).toBe(false)
    expect(valida(ok({ trimestre: '3T/2026' }))).toBe(false)
    expect(valida(ok({ ciclo: 0 }))).toBe(false)
  })
})

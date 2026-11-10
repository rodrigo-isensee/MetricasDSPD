import { describe, expect, it } from 'vitest'
import { resultadoTendenciaFluxo, resultadoTendenciaSust } from './schemas'

// Pedido 077, L1a (CA-1, CA-3, CA-4, CA-15): `janelaIncompleta` opcional por mês e sem estatística nesse mês.
const janela = { inicio: '2026-03-02', fim: '2026-05-24', unidade: 'semanas', quantidade: 12 }
const base = { n: 30, unidade: 'cards', janela: null }
const comum = { base, criterios: { serie: [], janela: [] } }
const taxa = { status: 'insuficiente', k: 2, n: 8, minimo: 20 }
const prio = [
  {
    prioridade: 'P1',
    primeiroAtendimento: { taxa, statusMeta: 'sem-referencia' },
    restauracao: { taxa, statusMeta: 'sem-referencia' },
  },
]
const tipoP85 = [
  {
    tipo: 'Incidente',
    n: 5,
    estatistica: { status: 'insuficiente', n: 5, minimo: 20, janela },
  },
]
const marca = { historicoDesde: '2026-03-10' }
const fluxo = (m: object) => ({
  ...comum,
  meses: [
    {
      mes: '2026-05',
      fimDoMes: '2026-05-31',
      janelaPercentis: janela,
      p85PorTipo: [],
      concluidos: 4,
      ...m,
    },
  ],
})
const sust = (m: object) => ({
  ...comum,
  meses: [{ mes: '2026-05', fimDoMes: '2026-05-31', janela, prioridades: [], volume: 4, ...m }],
})

describe('janelaIncompleta no contrato das tendências', () => {
  it('ausente é aceito nos dois schemas (aditivo)', () => {
    expect(resultadoTendenciaFluxo.safeParse(fluxo({ p85PorTipo: tipoP85 })).success).toBe(true)
    expect(resultadoTendenciaSust.safeParse(sust({ prioridades: prio })).success).toBe(true)
  })

  it('refine recusa mês com janelaIncompleta e estatística', () => {
    expect(
      resultadoTendenciaFluxo.safeParse(fluxo({ janelaIncompleta: marca, p85PorTipo: tipoP85 }))
        .success,
    ).toBe(false)
    expect(
      resultadoTendenciaSust.safeParse(sust({ janelaIncompleta: marca, prioridades: prio }))
        .success,
    ).toBe(false)
  })

  it('refine aceita mês com janelaIncompleta e só as contagens', () => {
    expect(resultadoTendenciaFluxo.safeParse(fluxo({ janelaIncompleta: marca })).success).toBe(true)
    expect(resultadoTendenciaSust.safeParse(sust({ janelaIncompleta: marca })).success).toBe(true)
  })

  it('campo extra de pessoa some no parse (sem .strict())', () => {
    const f = resultadoTendenciaFluxo.parse(fluxo({ janelaIncompleta: marca, responsavel: 'Ana' }))
    const s = resultadoTendenciaSust.parse(sust({ janelaIncompleta: marca, solicitante: 'Ana' }))
    expect(f.meses[0]).not.toHaveProperty('responsavel')
    expect(s.meses[0]).not.toHaveProperty('solicitante')
  })
})

// Pedido 077, L6a: `notas` opcional na tendência de sustentação; id fora do enum é recusado.
describe('notas no resultado da tendência de sustentação', () => {
  it('ausente e id válido passam; id fora do enum é recusado', () => {
    expect(resultadoTendenciaSust.safeParse(sust({})).success).toBe(true)
    expect(
      resultadoTendenciaSust.safeParse({ ...sust({}), notas: ['excecao-sla-sem-fonte'] }).success,
    ).toBe(true)
    expect(resultadoTendenciaSust.safeParse({ ...sust({}), notas: ['inventada'] }).success).toBe(
      false,
    )
  })
})

describe('contagemParcial no contrato das tendências (077 L8a)', () => {
  it('ausente e presente são aceitos, com o número no item', () => {
    expect(resultadoTendenciaFluxo.safeParse(fluxo({})).success).toBe(true)
    expect(resultadoTendenciaFluxo.safeParse(fluxo({ contagemParcial: marca })).success).toBe(true)
    expect(resultadoTendenciaSust.safeParse(sust({ contagemParcial: marca })).success).toBe(true)
  })
})

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarApp } from '@/test/helpers'
import { textoAlerta, textoIndicador, type Alerta, type Indicador } from './textos'

const alerta = (codigo: string, valor: number, de: number | null = null) =>
  ({ nivel: 'operacional', metrica: 'X', ancora: 'x', codigo, valor, de }) as unknown as Alerta
const ind = (codigo: string, valor: number | null, de: number | null = null, status = 'fora') =>
  ({
    metrica: codigo,
    codigo,
    valor,
    de,
    base: { n: 1, unidade: 'u' },
    status,
    amostra: null,
  }) as unknown as Indicador

describe('textos da Visão geral', () => {
  it('todo código de alerta tem frase com os números do DTO (com e sem denominador)', () => {
    const casos: [string, string][] = [
      ['O2_ACIMA_P95', '3 de 10 itens acima do P95 de idade'],
      ['O1_WIP_ACIMA_LIMITE', 'WIP dentro do limite em 3 de 10 dias úteis'],
      ['O12_VENCIDOS_INTERNOS', '3 itens vencidos por causa interna'],
      ['O10_BACKLOG_180', '3 itens do backlog com mais de 180 dias'],
      ['T2_ABAIXO_85', 'Aderência ao SLE abaixo de 85% em 3 de 10 classes'],
      ['T4_RAZAO_FORA', 'fora de 0,9 a 1,0 em 3 de 10 classes'],
      ['T3_DESVIO', 'acima de 10 p.p. em 3 de 10 naturezas'],
      ['T9_ESCOPO', '3 de 10 projetos com escopo adicionado'],
      ['E2_ABAIXO_60', 'Evolução vinculada a objetivo em 3% (meta: 60% ou mais)'],
      ['E3_SEM_RESULTADO', '3 de 10 iniciativas sem resultado declarado'],
      ['S2_ABAIXO_90', 'abaixo de 90% em 3 de 10 prioridades'],
      ['S1_MEDIANA_ACIMA_ALVO', 'Mediana acima do alvo em 3 de 10 prioridades'],
    ]
    for (const [codigo, trecho] of casos)
      expect(textoAlerta(alerta(codigo, 3, 10))).toContain(trecho)
    expect(textoAlerta(alerta('O2_ACIMA_P95', 3))).toBe('3 itens acima do P95 de idade')
  })

  it('todo indicador tem frase; valor ausente conta zero; código desconhecido cai no formato genérico', () => {
    const casos: [string, string][] = [
      ['O2', '3 de 10 acima do P95 de idade (O2)'],
      ['O1', 'WIP dentro do limite em 3% dos dias (O1)'],
      ['BLOQUEADOS', '3 bloqueados agora'],
      ['T2', '3 de 10 classes com aderência abaixo de 85% (T2)'],
      ['T4', '3 de 10 classes fora de 0,9 a 1,0 (T4)'],
      ['T9', '3 de 10 projetos com escopo crescido (T9)'],
      ['E3', '3 de 10 iniciativas sem resultado declarado (E3)'],
      ['E2', 'Evolução vinculada a objetivo: 3% (E2)'],
      ['S2', '3 de 10 prioridades abaixo de 90% (S2)'],
      ['S1', '3 de 10 prioridades com mediana acima do alvo (S1)'],
      ['S2_P1', 'P1: 3% das restaurações no prazo (S2)'],
      ['O3', '3 (O3)'],
    ]
    for (const [codigo, texto] of casos) expect(textoIndicador(ind(codigo, 3, 10))).toBe(texto)
    expect(textoIndicador(ind('BLOQUEADOS', null))).toBe('0 bloqueados agora')
  })

  it('indicador sem amostra declarada: frase curta; com amostra: "n de 20"', () => {
    expect(
      textoIndicador({ ...ind('O2', null), status: 'insuficiente' } as unknown as Indicador),
    ).toBe('Amostra insuficiente')
    expect(
      textoIndicador({
        ...ind('O2', null),
        status: 'insuficiente',
        amostra: { n: 7 },
      } as unknown as Indicador),
    ).toBe('Amostra insuficiente (7 de 20 itens mínimos)')
  })
})

describe('Página Visão geral: ramos', () => {
  it('indicador com amostra insuficiente mostra o selo "Amostra insuficiente" e nenhum número', async () => {
    renderizarApp(
      '/',
      new FonteAjustada({
        VISAO_GERAL: (r: { niveis: { indicadores: { status: string; amostra: unknown }[] }[] }) => {
          const i = (r.niveis[0] as { indicadores: { status: string; amostra: unknown }[] })
            .indicadores[0] as {
            status: string
            amostra: unknown
          }
          i.status = 'insuficiente'
          i.amostra = { n: 5 }
        },
      }),
    )
    const nivel = await screen.findByTestId('nivel-operacional')
    await waitFor(() =>
      expect(within(nivel).getAllByText('Amostra insuficiente').length).toBeGreaterThan(0),
    )
  })

  it('espera invisível sem segmento publicável: mostra o quanto falta, com e sem nome do segmento', async () => {
    renderizarApp(
      '/',
      new FonteAjustada({
        VISAO_GERAL: (r: {
          esperaInvisivel: {
            nivel: string
            segmentos: { rotulo: string | null; estatistica: unknown }[]
          }[]
        }) => {
          const insuf = (n: number) => ({
            status: 'insuficiente',
            n,
            minimo: 20,
            janela: { inicio: '2026-07-18', fim: '2026-10-09' },
          })
          const fl1 = r.esperaInvisivel.find(
            (e) => e.nivel === 'FL1',
          ) as (typeof r.esperaInvisivel)[number]
          fl1.segmentos.forEach((s) => (s.estatistica = insuf(9)))
          const fl2 = r.esperaInvisivel.find(
            (e) => e.nivel === 'FL2',
          ) as (typeof r.esperaInvisivel)[number]
          fl2.segmentos = [{ rotulo: null, estatistica: insuf(4) }]
          const fl3 = r.esperaInvisivel.find(
            (e) => e.nivel === 'FL3',
          ) as (typeof r.esperaInvisivel)[number]
          fl3.segmentos = []
        },
      }),
    )
    const fl1 = await screen.findByTestId('ei-resumo-fl1')
    expect(fl1).toHaveTextContent(/Amostra insuficiente \(9 de 20 demandas, no maior segmento: /)
    expect(screen.getByTestId('ei-resumo-fl2')).toHaveTextContent(
      /Amostra insuficiente \(4 de 20 frentes\)/,
    )
    expect(screen.getByTestId('ei-resumo-fl3')).toHaveTextContent(
      /^Estratégico:Amostra insuficiente\s*Ver todos/,
    )
  })

  it('?mock=erro: a Visão geral mostra o erro de página dentro do shell', async () => {
    renderizarApp('/?mock=erro')
    expect(await screen.findByTestId('erro-pagina')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(screen.getByTestId('erro-pagina')).toBeInTheDocument()
  })
})

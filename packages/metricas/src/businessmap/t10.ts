import type { ResultadoT10 } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { estatistica, percentisDe } from '../core/estatistica'
import { ordenarNeutro } from '../core/ordenar'
import { amostraBM } from './amostra'
import { bloqueiosDoPeriodo } from './bloqueios'
import { baseAmostral, criterios, du, janelaPercentis, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM } from './indice'

const soma = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0)

/**
 * T10: tempo de terceiros, só o praticado (D-10 = A): sem prazo contratado e sem status. Entra todo bloqueio
 * encerrado com fornecedor informado, de qualquer motivo (R-5, CA-24); sem fornecedor fica fora. Uma linha por
 * fornecedor em ordem alfabética (CA-11), com P50/P85 só com n >= 20 por fornecedor, na janela móvel de 12 semanas.
 * Fornecedor igual a menos de diferenças de maiúsculas e espaços (B11-001) é um só, exibido pela grafia mais
 * frequente. O fornecedor é dimensão permitida, nunca pessoa.
 */
export function calcularT10(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT10 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story')
  // Percentis na janela móvel de 12 semanas (opção A, até o usuário decidir a janela do T10); o censo segue no período.
  const janela = janelaPercentis(ctx, f, 'story')
  // B11-001 (usuário): o fornecedor é agrupado pelo nome normalizado (sem diferença de maiúsculas e minúsculas nem de
  // espaços nas pontas e repetidos); a exibição usa a grafia mais frequente do grupo no período (empate: ordem neutra).
  const agrupar = (periodoOuJanela: typeof periodo) => {
    const mapa = new Map<string, { horas: number[]; grafias: Map<string, number> }>()
    for (const b of bloqueiosDoPeriodo(ctx, cards, periodoOuJanela).encerrados) {
      const grafia = b.fornecedor?.trim().replace(/\s+/g, ' ')
      if (!grafia) continue
      const chave = grafia.toLowerCase()
      const g = mapa.get(chave) ?? { horas: [], grafias: new Map<string, number>() }
      g.horas.push(b.duracao_horas_uteis)
      g.grafias.set(grafia, (g.grafias.get(grafia) ?? 0) + 1)
      mapa.set(chave, g)
    }
    return mapa
  }
  const grafiaMaisFrequente = (grafias: ReadonlyMap<string, number>): string =>
    (ordenarNeutro([...grafias.entries()], ([g, n]) => [-n, g])[0] as readonly [string, number])[0]
  const porFornecedor = agrupar(periodo)
  const naJanela = agrupar(janela)
  const linhas = [...porFornecedor.entries()].map(([chave, g]) => ({
    chave,
    fornecedor: grafiaMaisFrequente(g.grafias),
    horas: g.horas,
  }))
  const fornecedores = ordenarNeutro(linhas, (l) => [l.fornecedor]).map(
    ({ chave, fornecedor, horas }) => {
      const daJanela = (naJanela.get(chave) ?? { horas: [] }).horas
      return {
        fornecedor,
        bloqueios: horas.length,
        diasUteis: r2(du(ctx, soma(horas))),
        duracao: estatistica(daJanela.length, janela, () => {
          const p = percentisDe(
            amostraBM(
              'story',
              daJanela.map((h) => du(ctx, h)),
              janela,
            ),
          )
          return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
        }),
      }
    },
  )
  const todas = [...porFornecedor.values()].flatMap((g) => g.horas)
  return {
    base: baseAmostral(todas.length, 'bloqueios encerrados com fornecedor', periodo),
    criterios: criterios('T10', periodo, janela, ctx),
    fornecedores,
    totalDiasUteis: r2(du(ctx, soma(todas))),
  }
}

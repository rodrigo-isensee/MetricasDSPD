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
 * fornecedor em ordem alfabética (CA-11), com P50/P85 só com n >= 20 por fornecedor, na janela móvel de 12 semanas. O fornecedor é
 * dimensão permitida, nunca pessoa.
 */
export function calcularT10(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT10 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story')
  // Percentis na janela móvel de 12 semanas (opção A, até o usuário decidir a janela do T10); o censo segue no período.
  const janela = janelaPercentis(ctx, f, 'story')
  const agrupar = (periodoOuJanela: typeof periodo) => {
    const mapa = new Map<string, number[]>()
    for (const b of bloqueiosDoPeriodo(ctx, cards, periodoOuJanela).encerrados) {
      const nome = b.fornecedor?.trim()
      if (!nome) continue
      const l = mapa.get(nome)
      if (l) l.push(b.duracao_horas_uteis)
      else mapa.set(nome, [b.duracao_horas_uteis])
    }
    return mapa
  }
  const porFornecedor = agrupar(periodo)
  const naJanela = agrupar(janela)
  const fornecedores = ordenarNeutro([...porFornecedor.entries()], ([nome]) => [nome]).map(
    ([fornecedor, horas]) => ({
      fornecedor,
      bloqueios: horas.length,
      diasUteis: r2(du(ctx, soma(horas))),
      duracao: estatistica((naJanela.get(fornecedor) ?? []).length, janela, () => {
        const p = percentisDe(
          amostraBM(
            'story',
            (naJanela.get(fornecedor) ?? []).map((h) => du(ctx, h)),
            janela,
          ),
        )
        return { p50: r2(p.p50), p85: r2(p.p85), p95: r2(p.p95) }
      }),
    }),
  )
  const todas = [...porFornecedor.values()].flat()
  return {
    base: baseAmostral(todas.length, 'bloqueios encerrados com fornecedor', periodo),
    criterios: criterios('T10', periodo, janela, ctx),
    fornecedores,
    totalDiasUteis: r2(du(ctx, soma(todas))),
  }
}

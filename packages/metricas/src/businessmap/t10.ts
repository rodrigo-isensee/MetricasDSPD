import type { ResultadoT10 } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { estatistica, percentisDe } from '../core/estatistica'
import { amostraBM } from './amostra'
import { bloqueiosDoPeriodo } from './bloqueios'
import { baseAmostral, criterios, du, janelaPercentis, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM } from './indice'

const soma = (xs: readonly number[]): number => xs.reduce((s, x) => s + x, 0)

/** Único motivo de bloqueio que é espera de fornecedor (domínio versionado `MOTIVOS_BLOQUEIO`). */
export const MOTIVO_FORNECEDOR = 'Aguardando fornecedor'

/** Por que a lista por fornecedor sai vazia (texto simples, a UX revisa). */
export const MOTIVO_SEM_LISTA_POR_FORNECEDOR =
  'O nome do fornecedor não é guardado na base; só o tempo total esperando fornecedores é publicado.'

/**
 * T10 Tempo de terceiros (pedido 105, E7.77, decisão do dono de 2026-11-16, opção A): uma linha total com os bloqueios
 * encerrados cujo motivo é "Aguardando fornecedor", sem separar por fornecedor (o nome fica no texto livre, que nunca
 * entra na base). Bloqueio aberto e de outro motivo ficam fora. P50/P85/P95 só com n >= 20 na janela móvel de 12 semanas,
 * pela biblioteca compartilhada; contagem e soma são o censo do período. A lista por fornecedor fica vazia, com motivo.
 */
export function calcularT10(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT10 {
  const periodo = periodoDe(ctx, f)
  const cards = selecionar(ctx, f, 'story')
  const janela = janelaPercentis(ctx, f, 'story')
  const deFornecedor = (p: typeof periodo): number[] =>
    bloqueiosDoPeriodo(ctx, cards, p)
      .encerrados.filter((b) => b.motivo === MOTIVO_FORNECEDOR)
      .map((b) => b.duracao_horas_uteis)
  const horas = deFornecedor(periodo)
  const daJanela = deFornecedor(janela)
  const diasUteis = r2(du(ctx, soma(horas)))
  return {
    base: baseAmostral(horas.length, 'bloqueios encerrados esperando fornecedor', periodo),
    criterios: criterios('T10', periodo, janela, ctx),
    fornecedores: [],
    totalDiasUteis: diasUteis,
    esperaFornecedores: {
      bloqueios: horas.length,
      diasUteis,
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
    },
    motivoSemFornecedores: MOTIVO_SEM_LISTA_POR_FORNECEDOR,
  }
}

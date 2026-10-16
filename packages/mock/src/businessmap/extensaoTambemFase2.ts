import type {
  ConhecimentoSistema,
  DatasProjeto,
  DimCard,
  ExtensaoTambemBM,
  FaixaConhecimento,
} from '@metricas-dspd/metricas/businessmap'
import {
  CALENDARIO_PADRAO as cal,
  diaLocal,
  instanteDe,
  ordenarNeutro,
  proximoDiaUtil,
  somarMeses,
} from '@metricas-dspd/metricas/core'
import { bernoulli, inteiro } from '../distribuicoes'
import type { ConfigMock } from '../config'
import { derivar, type Prng } from '../prng'

/**
 * Fase 2 da extensão só de mock do pedido 011 (E6 e E8). Cada campo tem a sua stream
 * (`derivar(semente, 'businessmap/tambem:<campo>')`), então um campo nunca desloca os sorteios de outro e o hash da base
 * e das extensões anteriores não muda. ADR 0020, item 8: `conhecimentoSistema` sai DIRETO como
 * faixa, sem pessoas, e este arquivo NUNCA lê `responsaveis` nem `usuario` (um teste confere o texto do arquivo).
 * Valores FICTÍCIOS. Função pura de (base, semente), lazy como a fase 1.
 */
export const PARAMETROS_FASE2 = {
  /** E6: projetos concluídos nos últimos 12 meses com data comprometida registrada (11 a 14, abaixo de 20 de propósito). */
  projetosComData: { minimo: 11, maximo: 14 },
  /** E6: chance de entregar até a data; deslize em dias úteis (negativo = antes). */
  naData: 0.35,
  deslizeAntes: { min: -12, max: 0 },
  deslizeAtraso: { min: 3, max: 63 },
  /** E8: fração dos sistemas com entrega em 1 e em 2 pessoas (4 e 6 de 19); o resto fica em 3 ou mais. */
  conhecimento: { uma: 4 / 19, duas: 6 / 19 },
} as const

export interface EntradaFase2 {
  cards: readonly DimCard[]
  equipes: readonly { nome: string; sistemas: readonly string[] }[]
  config: ConfigMock
}

type Fase2 = Omit<ExtensaoTambemBM, 'entradasSazonais'>

const ativa = (c: DimCard): boolean =>
  !c.eh_subtarefa && c.excluido_em === null && c.motivo_descarte === null

const embaralhar = <T>(r: Prng, itens: readonly T[]): T[] => {
  const a = [...itens]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

export function gerarFase2(base: EntradaFase2): Fase2 {
  const { cards, config } = base
  const hoje = Date.parse(config.hoje)
  const stories = cards.filter((c) => c.granularidade === 'story' && !c.eh_subtarefa)
  const dozeMeses = instanteDe(somarMeses(diaLocal(hoje, cal), -12), 0, cal)
  const P = PARAMETROS_FASE2

  // E6: projetos concluídos nos últimos 12 meses; alguns com data comprometida, abaixo de 20 de propósito (variante lenta).
  const rD = derivar(config.semente, 'businessmap/tambem:datas-projeto')
  const concluidos = cards.filter(
    (c) =>
      c.granularidade === 'projeto' &&
      ativa(c) &&
      c.concluido_em !== null &&
      c.concluido_em >= dozeMeses,
  )
  const datasProjeto: Record<string, DatasProjeto> = {}
  const comData = embaralhar(
    rD,
    ordenarNeutro(concluidos, (c) => [c.card_id]),
  ).slice(0, inteiro(rD, P.projetosComData.minimo, P.projetosComData.maximo))
  for (const c of comData) {
    const conclusao = c.concluido_em as number
    const naData = bernoulli(rD, P.naData)
    const deslize = naData
      ? inteiro(rD, P.deslizeAntes.min, P.deslizeAntes.max)
      : inteiro(rD, P.deslizeAtraso.min, P.deslizeAtraso.max)
    const dia = diaLocal(conclusao, cal) - Math.round((deslize * 7) / 5)
    const original0 = instanteDe(proximoDiaUtil(dia, cal), 18 * 60, cal)
    // A data comprometida nunca precede o compromisso do próprio projeto (todo concluído tem compromisso).
    const original = Math.max(original0, (c.comprometido_em as number) + 7 * 86_400_000)
    const replanejamentos = naData ? inteiro(rD, 0, 1) : inteiro(rD, 1, 3)
    datasProjeto[c.card_id] = {
      original,
      final: original + replanejamentos * inteiro(rD, 5, 20) * 86_400_000,
      replanejamentos,
    }
  }

  // E8: faixa por sistema gerada direto (agregado), nunca contada de responsáveis.
  const rK = derivar(config.semente, 'businessmap/tambem:conhecimento')
  const entregasPorSistema = new Map<string, number>()
  for (const c of stories)
    if (
      ativa(c) &&
      c.tipo !== 'Bug interno' &&
      c.concluido_em !== null &&
      c.concluido_em >= dozeMeses
    )
      entregasPorSistema.set(c.sistema, (entregasPorSistema.get(c.sistema) ?? 0) + 1)
  const sistemas = embaralhar(rK, [...entregasPorSistema.keys()].sort())
  const n1 = Math.max(1, Math.round(sistemas.length * P.conhecimento.uma))
  const n2 = Math.round(sistemas.length * P.conhecimento.duas)
  const conhecimentoSistema: ConhecimentoSistema[] = ordenarNeutro(
    sistemas.map((sistema, i) => ({
      sistema,
      faixa: (i < n1 ? 1 : i < n1 + n2 ? 2 : 3) as FaixaConhecimento,
      entregas: entregasPorSistema.get(sistema) as number,
    })),
    (l) => [l.sistema],
  )

  return {
    datasProjeto,
    conhecimentoSistema,
  }
}

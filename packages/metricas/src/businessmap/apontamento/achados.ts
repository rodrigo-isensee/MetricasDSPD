import type { AchadoApontamento, RespostaApontamento } from '@metricas-dspd/contratos'
import { ordenarNeutro } from '../../core/ordenar'
import { horas } from './comum'
import type { LimiaresAchado } from './tipos'

/** PROVISÓRIOS (ver `LimiaresAchado`): a especificação não define "alto"; pergunta ao dono. */
export const LIMIARES_ACHADO_PADRAO: LimiaresAchado = {
  naoClassificadoPct: 20,
  semComentarioPct: 20,
  concentracaoPct: 50,
  diasAtipicos: 1,
  variacaoUtilizacaoPp: 10,
}

/** Limite do dia atípico (decisão do dono, pedido 067, 2026-11-04): a soma do dia da pessoa acima disto é marcada `valor-atipico` (marca, nunca descarta). Antes: 16 h. */
export const LIMITE_ATIPICO_HORAS_PADRAO = 10
export const LIMITE_ATIPICO_SEGUNDOS_PADRAO = LIMITE_ATIPICO_HORAS_PADRAO * 3600

export const SUBGRUPO_NAO_CLASSIFICADO_ID = 'nao-classificado'

export interface BaseAchados {
  distribuicao: RespostaApontamento['distribuicao']
  qualidade: RespostaApontamento['qualidade']
  capacidade: RespostaApontamento['capacidade']
  /** Dias (pessoa e dia) atípicos dentro do recorte. */
  diasAtipicos: number
  limiteAtipicoSegundos: number
}

/**
 * Achados gerados por regra (M-1 do UX, CA-11; a especificação os escrevia à mão, limitação 7). Cada achado é um
 * código mais números e, quando cita, o rótulo de PROJETO, TIPO ou SUBGRUPO: nunca nome nem `pessoaRef`. Achado com
 * percentual só sai com a base de 20 apontamentos ou mais (o3): sem piso não há achado. Ordem do contrato.
 */
export function gerarAchados(
  base: BaseAchados,
  limiares: Partial<LimiaresAchado> = {},
): AchadoApontamento[] {
  const lim = { ...LIMIARES_ACHADO_PADRAO, ...limiares }
  const achados: AchadoApontamento[] = []
  const { distribuicao, qualidade, capacidade } = base

  // Pedido 089 (D2, D3): o subgrupo `nao-classificado` agora se chama "Sem comentário" (sem comentário e sem regra por tipo); o código e o id
  // seguem como contrato versionado. `execucao-tecnica` não entra aqui: deixou de ser falha de qualidade.
  const naoClass = distribuicao.porSubgrupo.find((l) => l.id === SUBGRUPO_NAO_CLASSIFICADO_ID)
  if (naoClass?.participacao.status === 'ok' && naoClass.participacao.pct >= lim.naoClassificadoPct)
    achados.push({
      codigo: 'nao-classificado-alto',
      valores: { pct: naoClass.participacao.pct, n: naoClass.apontamentos },
      rotuloRef: naoClass.rotulo,
    })

  const semComentario = qualidade.geral.porFlag.find((f) => f.flag === 'sem-comentario')
  if (semComentario?.pct.status === 'ok' && semComentario.pct.pct >= lim.semComentarioPct)
    achados.push({
      codigo: 'sem-comentario-alto',
      valores: { pct: semComentario.pct.pct, n: semComentario.apontamentos },
      rotuloRef: null,
    })

  const topo = ordenarNeutro(distribuicao.porProjeto, (l) => [-l.segundos, l.rotulo, l.id])[0]
  if (topo?.participacao.status === 'ok' && topo.participacao.pct >= lim.concentracaoPct)
    achados.push({
      codigo: 'concentracao-em-projeto',
      valores: { pct: topo.participacao.pct },
      rotuloRef: topo.rotulo,
    })

  if (base.diasAtipicos >= lim.diasAtipicos)
    achados.push({
      codigo: 'dias-atipicos',
      valores: { n: base.diasAtipicos, limite: horas(base.limiteAtipicoSegundos) },
      rotuloRef: null,
    })

  const [anterior, atual] = capacidade.mensal.slice(-2)
  if (
    anterior?.utilizacao.status === 'ok' &&
    atual?.utilizacao.status === 'ok' &&
    Math.abs(atual.utilizacao.pct - anterior.utilizacao.pct) >= lim.variacaoUtilizacaoPp
  )
    achados.push({
      codigo: 'utilizacao-mensal-variou',
      valores: {
        pctAnterior: anterior.utilizacao.pct,
        pct: atual.utilizacao.pct,
        mesAnterior: anterior.mes,
        mes: atual.mes,
      },
      rotuloRef: null,
    })

  return achados
}

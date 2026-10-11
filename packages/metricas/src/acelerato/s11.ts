import type { ResultadoS11, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'
import { baseAmostral, criterios, noIntervalo, periodoDe, selecionarAC } from './comum'
import { EXTENSAO_AC_VAZIA, type ExtensaoAC } from './extensao'
import type { ContextoAC } from './indice'

/**
 * S11: avaliação de Problema em chamados P1, P2 e encerrados por contorno, e conversão em Registro
 * de Problema. O filtro de prioridade não atua (o escopo já é por prioridade e contorno).
 */
export function calcularS11(
  ctx: ContextoAC,
  f: FiltrosSustentacao,
  ext: ExtensaoAC = EXTENSAO_AC_VAZIA,
): ResultadoS11 {
  const periodo = periodoDe(ctx, f)
  const fechados = selecionarAC(ctx, f, { semPrioridade: true }).filter(
    (x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo),
  )
  const contorno = (x: (typeof fechados)[number]) => x.c.motivo_encerramento === 'Contorno aplicado'
  const grupos = {
    P1: fechados.filter((x) => x.c.prioridade === 'P1'),
    P2: fechados.filter((x) => x.c.prioridade === 'P2'),
    Contorno: fechados.filter(contorno),
  }
  const avaliado = (x: (typeof fechados)[number]) => x.c.avaliacao_problema !== null
  const escopo = fechados.filter(
    (x) => x.c.prioridade === 'P1' || x.c.prioridade === 'P2' || contorno(x),
  )
  const avaliacoes = fechados.filter(avaliado)
  return {
    base: baseAmostral(escopo.length, 'chamados no escopo', periodo),
    criterios: criterios('S11', periodo, periodo, ctx),
    escopo: taxa(escopo.filter(avaliado).length, escopo.length),
    porGrupo: (['P1', 'P2', 'Contorno'] as const).map((grupo) => ({
      grupo,
      taxa: taxa(grupos[grupo].filter(avaliado).length, grupos[grupo].length),
    })),
    conversao: taxa(
      avaliacoes.filter((x) => ext.registroProblema[x.c.chamado_id] === true).length,
      avaliacoes.length,
    ),
  }
}

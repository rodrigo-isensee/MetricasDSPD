import type { ResultadoS11, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { taxa } from '../core/estatistica'
import { baseAmostral, criterios, noIntervalo, periodoDe, selecionarAC } from './comum'
import type { ChamadoCalc, ContextoAC } from './indice'
import { motivoEncerramentoDe } from './motivos'

/** Etapa dos fluxos antigo e intermediário que marca a avaliação de Problema (Decisão 18b do dono, pedido 099); sem diferença de caixa. */
const ETAPA_CAUSA_RAIZ = 'causa raiz'
const passouPelaCausaRaiz = (x: ChamadoCalc): boolean =>
  x.etapas.some((e) => (e.etapa as string).trim().toLocaleLowerCase('pt-BR') === ETAPA_CAUSA_RAIZ)

/**
 * Regra de "avaliado" pelo fluxo do chamado (Decisão 18b do dono, pedido 099; L20 = a: vale o fluxo do chamado). No fluxo do PROC conta o campo
 * nativo "Avaliação de Problema" preenchido; nos fluxos antigo e intermediário (fluxo gravado fora da lista do PROC) conta a passagem pela etapa
 * "Causa Raiz". Chamado sem fluxo ou com fluxo múltiplo (`fluxo` nulo) não tem regra: fica fora do cálculo e é contado (P-S11-1 aberta ao dono).
 * Sem a lista do PROC na base (mock e testes) a base não separa fluxo: todos pelo campo nativo e ninguém fica fora.
 */
type Regra = 'campo' | 'causa-raiz' | null
function regraDe(ctx: ContextoAC, x: ChamadoCalc): Regra {
  const lista = ctx.idx.base.config.fluxos_proc
  if (lista === undefined) return 'campo'
  if (x.c.fluxo == null) return null
  return lista.includes(x.c.fluxo) ? 'campo' : 'causa-raiz'
}

/**
 * S11: avaliação de Problema em chamados P1, P2 e encerrados por contorno (motivo pelo de-para do D2, "Contorno Aplicado" em qualquer caixa), e
 * conversão em Registro de Problema. Conversão (pedido 105, E7.101; decisão do dono de 16/11): pela decisão registrada no chamado, não pelo vínculo.
 * "Aberto" no campo "Avaliação de Problema" = Registro de Problema aberto; conversão = "Aberto" ÷ avaliações registradas ("Não aplicável e com
 * justificativa" fica só no denominador), só nos chamados dos fluxos do PROC (nos fluxos antigos a regra é a etapa, que não tem valor: ficam fora
 * e são contados em `foraDaConversao`). Abaixo de 20 avaliações não publica (taxa insuficiente). Só Acelerato. O filtro de prioridade não atua
 * (o escopo já é por prioridade e contorno).
 */
export function calcularS11(ctx: ContextoAC, f: FiltrosSustentacao): ResultadoS11 {
  const periodo = periodoDe(ctx, f)
  const fechados = selecionarAC(ctx, f, { semPrioridade: true }).filter(
    (x) => x.fechado && noIntervalo(ctx, x.c.data_finalizado, periodo),
  )
  const contorno = (x: ChamadoCalc) =>
    motivoEncerramentoDe(x.c.motivo_encerramento) === 'Contorno aplicado'
  const noEscopo = fechados.filter(
    (x) => x.c.prioridade === 'P1' || x.c.prioridade === 'P2' || contorno(x),
  )
  const comRegra = (xs: readonly ChamadoCalc[]) => xs.filter((x) => regraDe(ctx, x) !== null)
  const escopo = comRegra(noEscopo)
  const avaliado = (x: ChamadoCalc) =>
    regraDe(ctx, x) === 'campo' ? x.c.avaliacao_problema !== null : passouPelaCausaRaiz(x)
  const grupos = {
    P1: escopo.filter((x) => x.c.prioridade === 'P1'),
    P2: escopo.filter((x) => x.c.prioridade === 'P2'),
    Contorno: escopo.filter(contorno),
  }
  const avaliados = comRegra(fechados).filter(avaliado)
  const avaliacoes = avaliados.filter((x) => regraDe(ctx, x) === 'campo')
  return {
    base: baseAmostral(escopo.length, 'chamados no escopo', periodo),
    criterios: criterios('S11', periodo, periodo, ctx),
    escopo: taxa(escopo.filter(avaliado).length, escopo.length),
    porGrupo: (['P1', 'P2', 'Contorno'] as const).map((grupo) => ({
      grupo,
      taxa: taxa(grupos[grupo].filter(avaliado).length, grupos[grupo].length),
    })),
    campoDisponivel: true,
    semFluxo: noEscopo.length - escopo.length,
    conversao: taxa(
      avaliacoes.filter((x) => x.c.avaliacao_problema === 'Aberto').length,
      avaliacoes.length,
    ),
    motivoConversao: null,
    foraDaConversao: avaliados.length - avaliacoes.length,
  }
}

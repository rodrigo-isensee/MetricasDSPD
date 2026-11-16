import {
  MOTIVO_OUTRO,
  MOTIVOS_ENCERRAMENTO,
  MOTIVOS_ESCALACAO,
  type MotivoEncerramento,
  type MotivoEscalacao,
} from '@metricas-dspd/contratos'
import type { ChamadoCalc, ContextoAC } from './indice'

/** Chave de comparação do de-para: sem diferença de caixa, de espaço nas pontas nem de vírgula (P2 = A do dono, pedido 105). */
const chave = (valor: string): string =>
  valor.replace(/,/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('pt-BR')

const parDe = <T extends string>(dominio: readonly T[]): ReadonlyMap<string, T> =>
  new Map(dominio.map((m) => [chave(m), m]))

const PARES_ESCALACAO = parDe<MotivoEscalacao>(MOTIVOS_ESCALACAO)
const PARES_ENCERRAMENTO = parDe<MotivoEncerramento>(MOTIVOS_ENCERRAMENTO)

/** Resultado do de-para: o motivo do domínio fechado, `Outro` (preenchido sem par) ou `null` (vazio, "Não informado"). */
export type MotivoDe<T extends string> = T | typeof MOTIVO_OUTRO | null

/**
 * De-para do motivo de escalação gravado para o domínio fechado do S5. Só os pares óbvios (caixa e vírgula); qualquer outro valor
 * preenchido é `Outro`, nunca inferido. Vazio (ou só espaços) é `null`: "Não informado" nunca vira `Outro`.
 */
export function motivoEscalacaoDe(valor: string | null): MotivoDe<MotivoEscalacao> {
  if (valor === null || valor.trim() === '') return null
  return PARES_ESCALACAO.get(chave(valor)) ?? MOTIVO_OUTRO
}

/**
 * De-para do motivo de encerramento gravado para o domínio fechado do S6 e do S7 (pedido 105, P2 = A). Pares óbvios: Contorno Aplicado,
 * "Reclassificado não é incidente", Resolução definitiva, Encerrado sem retorno, Duplicado. Solução Definitiva Validada, Encerrado com
 * Contorno e Plano de Ação e Não é Problema ficam como `Outro` até o dono dizer onde entram.
 */
export function motivoEncerramentoDe(valor: string | null): MotivoDe<MotivoEncerramento> {
  if (valor === null || valor.trim() === '') return null
  return PARES_ENCERRAMENTO.get(chave(valor)) ?? MOTIVO_OUTRO
}

/**
 * Separa os chamados nos fluxos do PROC (S5, S6 e S7; P1 = B). Sem `fluxos_proc` na base todos entram e `fora` é 0. Com a lista, só o chamado
 * cujo `fluxo` está nela entra; sem fluxo, com fluxo múltiplo ou de outro fluxo, fica fora e é contado.
 */
export function separarPorFluxoProc(
  ctx: ContextoAC,
  xs: readonly ChamadoCalc[],
): { dentro: ChamadoCalc[]; fora: number } {
  const lista = ctx.idx.base.config.fluxos_proc
  if (lista === undefined) return { dentro: [...xs], fora: 0 }
  const fluxos = new Set(lista)
  const dentro = xs.filter((x) => x.c.fluxo != null && fluxos.has(x.c.fluxo))
  return { dentro, fora: xs.length - dentro.length }
}

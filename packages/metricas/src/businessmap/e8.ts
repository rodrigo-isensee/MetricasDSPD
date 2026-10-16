import type { FiltrosFluxo, ResultadoE8 } from '@metricas-dspd/contratos'
import { isoDeDia, somarMeses } from '../core/calendario'
import { baseAmostral, criterios } from './comum'
import type { ExtensaoTambemBM } from './extensao'
import type { ContextoBM } from './indice'

/** Janela fixa do E8 (D-3 = A, decisão do usuário): 12 meses terminados em "hoje". */
export const JANELA_MESES_E8 = 12
/** Recorte pequeno (CA-10): com menos de 5 sistemas com entrega as faixas não abrem, para não apontar uma pessoa. */
export const MINIMO_SISTEMAS_E8 = 5

/**
 * E8: concentração de conhecimento. Conta SISTEMAS (não pessoas) por faixa de pessoas que fizeram as entregas do
 * sistema na janela: 1, 2 ou 3 ou mais. A faixa por sistema vem pronta do agregado `agg_conhecimento_sistema` (no
 * coletor/projetor; no mock, gerada direto, ADR 0020): esta função só soma sistemas por faixa e nunca lê `responsaveis`.
 * R-1 = B (2026-10-16): nenhum nome de sistema sai, nem o da faixa "1 pessoa" (a lista da D-4 = B foi revista). Com
 * menos de 5 sistemas com entrega, `faixas` é `null` e `recortePequeno` é verdadeiro (CA-10). Censo: sem percentil. A janela
 * é fixa (12 meses até hoje); filtros de equipe, sistema e tipo não atuam (filtrar por sistema reduziria a uma linha).
 * Sem a extensão, o resultado sai vazio e com recorte pequeno, nunca erro.
 */
export function calcularE8(ctx: ContextoBM, _f: FiltrosFluxo, ext?: ExtensaoTambemBM): ResultadoE8 {
  const janela = {
    inicio: isoDeDia(somarMeses(ctx.hojeDia, -JANELA_MESES_E8) + 1),
    fim: ctx.hojeIso,
  }
  const comEntrega = (ext?.conhecimentoSistema ?? []).filter((s) => s.entregas > 0)
  const pequeno = comEntrega.length < MINIMO_SISTEMAS_E8
  const conta = (faixa: 1 | 2 | 3) => comEntrega.filter((s) => s.faixa === faixa).length
  return {
    base: baseAmostral(comEntrega.length, 'sistemas com entrega', janela),
    criterios: criterios('E8', janela, janela, ctx),
    janelaMeses: JANELA_MESES_E8,
    sistemasComEntrega: comEntrega.length,
    faixas: pequeno ? null : { uma: conta(1), duas: conta(2), tresOuMais: conta(3) },
    recortePequeno: pequeno,
  }
}

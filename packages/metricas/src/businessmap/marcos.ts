import { ordenarNeutro } from '../core/ordenar'
import type { DimColuna } from './modelo'

/*
 * Marcos do card a partir das transições (briefing 4.1 e T2.4; plano 052 F4, H-9, H-10, H-11, H-23). Função única: o projetor do
 * BusinessMap real chama esta, e nenhum outro lugar deriva compromisso, início, entrega ou descarte de transição. Só instantes
 * (epoch ms) e a classificação da coluna de destino no instante da entrada; nada de pessoa, nada de horas úteis aqui (as horas
 * úteis são de `horasUteisEntre`, na mesma biblioteca).
 */

/** Como a coluna de destino era no instante da entrada (a referência vigente no dia, resolvida por quem chama). */
export interface ColunaDoPasso {
  /** Seção do quadro (1 a 5). */
  section: number | null
  papel: DimColuna['papel'] | null
  tipo_coluna: 'fila' | 'execucao' | null
  /** Coluna "Descartado" (H-11): sem papel; entrar nela é descartar. */
  eh_descarte: boolean
  /** Posição da folha dentro do workflow (para classificar avanço e retorno). */
  ordem: number | null
  /** Workflow da coluna: ordem só se compara dentro do mesmo workflow. */
  workflow: string | null
}

/** Uma entrada do card numa coluna. `coluna` ausente = coluna sem referência: o passo existe, mas não marca nada. */
export interface Passo {
  ocorrido_em: number
  coluna: ColunaDoPasso | undefined
}

export interface MarcosDerivados {
  /** H-9 (com H-23): primeira entrada em folha de seção 2; sem seção 2, a primeira entrada em folha de trabalho da seção 3. */
  comprometido_em: number | null
  /** 4.1: primeira entrada em coluna de execução (trabalho ou homologação). */
  iniciado_em: number | null
  /** H-10 (com H-23): primeira entrada em coluna de papel entrega (seção 4 e, se pulou a 4, a 5); "Descartado" nunca conta. */
  concluido_em: number | null
  /** H-11: primeira entrada em coluna "Descartado". */
  descartado_em: number | null
}

const primeiro = (passos: readonly Passo[], quando: (c: ColunaDoPasso) => boolean): number | null =>
  passos.find((p) => p.coluna !== undefined && quando(p.coluna))?.ocorrido_em ?? null

export function derivarMarcos(passos: readonly Passo[]): MarcosDerivados {
  const ordenados = ordenarNeutro(passos, (p) => [p.ocorrido_em])
  const emTrabalho = (c: ColunaDoPasso): boolean =>
    c.papel === 'trabalho' || c.papel === 'homologacao'
  return {
    comprometido_em:
      primeiro(ordenados, (c) => !c.eh_descarte && c.papel === 'compromisso') ??
      primeiro(ordenados, (c) => !c.eh_descarte && c.section === 3 && emTrabalho(c)),
    iniciado_em: primeiro(
      ordenados,
      (c) => !c.eh_descarte && c.tipo_coluna === 'execucao' && emTrabalho(c),
    ),
    concluido_em: primeiro(ordenados, (c) => !c.eh_descarte && c.papel === 'entrega'),
    descartado_em: primeiro(ordenados, (c) => c.eh_descarte),
  }
}

/**
 * Avanço ou retorno (T2.4): retorno só dentro do mesmo workflow, para uma folha de posição menor; mudar de workflow, a primeira
 * entrada do card e coluna sem posição valem avanço (não se infere retorno sem a ordem das duas).
 */
export function direcaoDaTransicao(
  origem: ColunaDoPasso | undefined,
  destino: ColunaDoPasso | undefined,
): 'avanco' | 'retorno' {
  if (origem === undefined || destino === undefined) return 'avanco'
  if (origem.workflow === null || origem.workflow !== destino.workflow) return 'avanco'
  if (origem.ordem === null || destino.ordem === null) return 'avanco'
  return destino.ordem < origem.ordem ? 'retorno' : 'avanco'
}

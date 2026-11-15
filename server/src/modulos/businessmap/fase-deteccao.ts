import { FASES_DETECCAO, type FaseDeteccao } from '@metricas-dspd/contratos';
import { ordenarNeutro } from '@metricas-dspd/metricas/core';

/**
 * Fase de detecção do bug (pedido 105, E7.5; decisão do dono de 2026-11-15; análise `docs/analises/105-o15-o18-o24.md`, §2): a coluna em que estava o card
 * da demanda (o pai do bug, vínculo parent e child) no instante em que o bug foi criado, traduzida pela tabela versionada coluna para fase
 * (`ref_dominio campo = 'fase_deteccao_coluna'`, chave `coluna_id`). Regra pura: sem banco, sem relógio, sem pessoa; só os instantes e os
 * ids de coluna que a projeção já tem. Só os bugs com pai na base entram; os demais ficam sem fase, contados à parte (nunca inferidos).
 */

/** Tipos de card que são bug (rótulos do contrato, `dim_card.tipo`). */
export const TIPOS_DE_BUG = ['Bug interno', 'Defeito em produção'] as const;

export interface TransicaoDoPai { origem: string | null; destino: string; em: Date }

export interface PaiParaFase {
  concluidoEm: Date | null;
  colunaAtualId: string | null;
  /** Transições do pai, em qualquer ordem; a função as ordena. */
  transicoes: readonly TransicaoDoPai[];
}

/** Por que o bug ficou sem fase (contagem por nota, nunca id de card). */
export type NotaDaFase =
  | 'bug_sem_card_pai'
  | 'bug_pai_fora_da_base'
  | 'fase_pai_sem_coluna'
  | 'fase_pai_antes_do_desenvolvimento'
  | 'fase_sem_mapa';

export interface ResultadoFase { fase: FaseDeteccao | null; nota: NotaDaFase | null }

/**
 * Coluna do pai em `T`: a destino da última transição com `em <= T`; se todas são posteriores a `T`, a coluna inicial do pai (a origem da primeira
 * transição, ou o destino dela quando a origem é nula, que é o caso da primeira entrada do card); sem transição nenhuma, a coluna atual.
 */
export function colunaDoPaiEm(pai: PaiParaFase, t: Date): string | null {
  const ordenadas = ordenarNeutro(pai.transicoes, (x) => [x.em.getTime(), x.destino]);
  let atual: string | null = null;
  for (const x of ordenadas) if (x.em.getTime() <= t.getTime()) atual = x.destino;
  if (atual !== null) return atual;
  const primeira = ordenadas[0];
  return primeira === undefined ? pai.colunaAtualId : (primeira.origem ?? primeira.destino);
}

const EH_FASE = (v: string): v is FaseDeteccao => (FASES_DETECCAO as readonly string[]).includes(v);

/**
 * Fase de um bug. `pai` ausente = o pai não está na base. Pai já entregue na criação do bug (`concluido_em <= criado_em`) é Produção, sem olhar a coluna
 * (regra do dono). Coluna sem linha no mapa fica sem fase: de papel `backlog` ou `compromisso` (P-2) com a nota própria, as demais como `fase_sem_mapa`.
 */
export function faseDeDeteccao(
  bug: { criadoEm: Date; cardPai: string | null },
  pai: PaiParaFase | undefined,
  mapa: ReadonlyMap<string, FaseDeteccao>,
  papelDaColuna: (colunaId: string) => string | null,
): ResultadoFase {
  if (bug.cardPai === null) return { fase: null, nota: 'bug_sem_card_pai' };
  if (pai === undefined) return { fase: null, nota: 'bug_pai_fora_da_base' };
  if (pai.concluidoEm !== null && pai.concluidoEm.getTime() <= bug.criadoEm.getTime()) return { fase: 'Produção', nota: null };
  const coluna = colunaDoPaiEm(pai, bug.criadoEm);
  if (coluna === null) return { fase: null, nota: 'fase_pai_sem_coluna' };
  const fase = mapa.get(coluna);
  if (fase !== undefined && EH_FASE(fase)) return { fase, nota: null };
  const papel = papelDaColuna(coluna);
  return { fase: null, nota: papel === 'backlog' || papel === 'compromisso' ? 'fase_pai_antes_do_desenvolvimento' : 'fase_sem_mapa' };
}

import { noDia, diaDe } from './normalizador.js';

// F6 do plano 052 (A4 da E2.67, U-1 e U-2): o tipo da coluna (fila ou execução) de uma transição é resolvido na LEITURA, pela versão da
// coluna destino vigente no dia civil da transição, e não pelo `fato_transicao.tipo_coluna` (que fica como foi gravado, só para auditoria).
// A regra de vigência é a única do projeto (`vigenteEm`, via `noDia`): versão `processo` vale da sua data em diante ("como foi", T2.6);
// versão `correcao` vale para todo o período (U-1). Nenhuma escrita, nenhum UPDATE de fato.

export type VersaoTipoColuna = {
  quadro_id: string; coluna_id: string; tipo_coluna: string | null; vigente_de: string; motivo: string | null;
};
export type TipoDaColuna = 'fila' | 'execucao';

/**
 * Índice por chave `quadro|coluna`, montado uma vez por contexto (as versões não são reordenadas por transição). Devolve o tipo da
 * coluna destino no instante `ocorridoEm` (epoch ms), ou `null` quando a coluna não tem versão ou a versão do dia não tem tipo conhecido.
 */
export function indiceTipoDaColuna(versoes: readonly VersaoTipoColuna[]): (quadro: string, coluna: string, ocorridoEm: number) => TipoDaColuna | null {
  const porChave = new Map<string, VersaoTipoColuna[]>();
  for (const v of versoes) {
    const k = `${v.quadro_id}|${v.coluna_id}`;
    porChave.set(k, [...(porChave.get(k) ?? []), v]);
  }
  const memo = new Map<string, TipoDaColuna | null>();
  return (quadro, coluna, ocorridoEm) => {
    const dia = diaDe(ocorridoEm);
    const k = `${quadro}|${coluna}|${dia}`;
    const feito = memo.get(k);
    if (feito !== undefined) return feito;
    const tipo = noDia(porChave.get(`${quadro}|${coluna}`), dia, [])?.tipo_coluna;
    const r = tipo === 'fila' || tipo === 'execucao' ? tipo : null;
    memo.set(k, r);
    return r;
  };
}

/** Transição lida da view canônica, com o tipo da coluna ainda por resolver. */
export type TransicaoLida = { card_id: string; quadro_id: string | null; coluna_destino_id: string; ocorrido_em: number; tipo_coluna: string | null };

/**
 * Troca `tipo_coluna` de cada transição pelo tipo resolvido no dia e descarta as que ficam sem tipo (fora do cálculo, como a regra
 * antiga `tipo_coluna IS NOT NULL`, agora sobre o tipo resolvido: uma correção que dê tipo a coluna sem tipo passa a contar).
 */
export function resolverTipoDasTransicoes<T extends TransicaoLida>(
  transicoes: readonly T[], versoes: readonly VersaoTipoColuna[], quadrosDosCards: ReadonlyMap<string, string>,
): T[] {
  const tipoNoDia = indiceTipoDaColuna(versoes);
  const saida: T[] = [];
  for (const t of transicoes) {
    const quadro = t.quadro_id ?? quadrosDosCards.get(t.card_id) ?? '';
    const tipo = tipoNoDia(quadro, t.coluna_destino_id, t.ocorrido_em);
    if (tipo !== null) saida.push({ ...t, tipo_coluna: tipo });
  }
  return saida;
}

// Pedido 059 (K-193), A3: hierarquia do card até a iniciativa (plano 059 §3.5, C-5). Função pura sobre `dim_card.card_pai` (vínculo
// nativo `parent`; o pai do tipo Sprint já não vale na projeção do card). Raiz preferida: o primeiro card, a partir do próprio, em
// workflow de iniciativa (`granularidade` = projeto, H-1); sem ele, o card mais alto alcançado. Pai fora dos quadros coletados:
// a cadeia para no último card conhecido e marca `raiz_fora_do_escopo`. Guarda de ciclo e profundidade máxima 10.

export const PROFUNDIDADE_MAXIMA = 10;

export interface NoCard { id: string; pai: string | null; iniciativa: boolean }
export interface RaizDoCard {
  card_id: string; raiz_card_id: string; profundidade: number; raiz_eh_iniciativa: boolean; raiz_fora_do_escopo: boolean;
}

/** Raiz de cada card de `nos`. O CHECK da tabela vale por construção: profundidade 0 se, e só se, o card é a própria raiz. */
export function calcularRaizes(nos: readonly NoCard[]): RaizDoCard[] {
  const porId = new Map(nos.map((n) => [n.id, n]));
  return nos.map((no) => {
    const visitados = new Set([no.id]);
    let atual = no;
    let profundidade = 0;
    for (;;) {
      const resultado = (eh: boolean, fora: boolean): RaizDoCard => ({
        card_id: no.id, raiz_card_id: atual.id, profundidade, raiz_eh_iniciativa: eh, raiz_fora_do_escopo: fora,
      });
      if (atual.iniciativa) return resultado(true, false);
      if (atual.pai === null) return resultado(false, false);
      const pai = porId.get(atual.pai);
      if (pai === undefined) return resultado(false, true);
      if (visitados.has(pai.id) || profundidade === PROFUNDIDADE_MAXIMA) return resultado(false, false);
      visitados.add(pai.id);
      atual = pai;
      profundidade += 1;
    }
  });
}

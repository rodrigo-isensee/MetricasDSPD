import { migracao } from '../src/plataforma/db/executar.js';
import { drop, DT, IDN, indice, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), A1: hierarquia até a iniciativa (plano 059 §3.5, C-5, limitação 1). Projeção refeita a cada projeção do
 * apontamento (sem DELETE: o coletor só atualiza e insere). `raiz_card_id` = o primeiro card, subindo por `dim_card.card_pai`
 * a partir do próprio card, que está em workflow de iniciativa (`raiz_eh_iniciativa`); sem ele, o card mais alto alcançado. Pai fora
 * dos quadros coletados: a cadeia para no último card conhecido e marca `raiz_fora_do_escopo`. Profundidade máxima 10 e guarda de
 * ciclo no cálculo; o CHECK liga profundidade 0 a "o card é a própria raiz" (A8 do review). Fora do `dspd_api`.
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabela(S, 'businessmap', 'dim_card_raiz', `${IDN('card_id')} PRIMARY KEY, ${IDN('raiz_card_id')},
  profundidade smallint NOT NULL CHECK (profundidade BETWEEN 0 AND 10),
  raiz_eh_iniciativa boolean NOT NULL, raiz_fora_do_escopo boolean NOT NULL,
  ${DT('coletado_em')}, atualizado_por_coleta_id bigint NOT NULL,
  CONSTRAINT ck_dim_card_raiz_propria CHECK ((profundidade = 0) = (raiz_card_id = card_id))`),
      indice(s, 'ix_dim_card_raiz_raiz', 'dim_card_raiz', 'raiz_card_id'),
    ],
    down: drop(`${s}.dim_card_raiz`),
  };
};
export const { up, down } = migracao(ddl);

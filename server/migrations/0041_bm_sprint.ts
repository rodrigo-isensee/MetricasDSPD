import { migracao } from '../src/plataforma/db/executar.js';
import { appendOnly, COLETA_FK, drop, DT, ID, IDENT, indice, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const B = 'businessmap' as const;

/**
 * Pedido 105 (E7.499, D-T8 "A" do dono, 2026-11-17): base do T8 com dado real. Duas tabelas, só ids e instantes (nenhuma coluna de pessoa, sem título, sem texto livre):
 * - `dim_sprint`: projeção do card Sprint (`type_id` 12, `eh_item = false`): o primeiro início (`first_start_time`) e a primeira conclusão (`first_end_time`) de execução dele, e se
 *   foi descartado ou excluído. Refeita por card a cada projeção (como `dim_card`); a história fica no staging append-only.
 * - `fato_sprint_filho`: o vínculo do filho com a Sprint (`linked_cards`, `parent` no filho e `child` na Sprint). Append-only (gatilhos de imutabilidade): nunca sobrescreve
 *   histórico; vínculo desfeito no BusinessMap continua aqui, e a releitura idêntica não duplica (`UNIQUE (sprint_id, filho_id)` com `ON CONFLICT DO NOTHING`). A data do vínculo
 *   não existe na fonte (a revisão não a guarda), então a tabela guarda só a primeira coleta que o viu.
 * O staging não muda: a fronteira (allow-list 4a/4c) já deixa passar `linked_cards` reduzido a `card_id` e `link_type`, `type_id` e as datas de execução.
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabela(S, B, 'dim_sprint', `${ID('sprint_id')} PRIMARY KEY,
  ${ID('quadro_id', true)},
  ${DT('inicio_em', true)}, ${DT('fim_em', true)},
  descartada boolean NOT NULL,
  ${DT('coletado_em')}, atualizado_por_coleta_id bigint NOT NULL`),
      tabela(S, B, 'fato_sprint_filho', `${IDENT('vinculo_sk')} PRIMARY KEY,
  ${ID('sprint_id')}, ${ID('filho_id')},
  ${DT('coletado_em')}, coleta_id bigint NOT NULL,
  CONSTRAINT uq_fato_sprint_filho UNIQUE (sprint_id, filho_id),
  ${COLETA_FK(s, 'fato_sprint_filho')}`),
      indice(s, 'ix_fato_sprint_filho_filho', 'fato_sprint_filho', 'filho_id'),
      indice(s, 'ix_fato_sprint_filho_coleta', 'fato_sprint_filho', 'coleta_id'),
      ...appendOnly(S, s, 'fato_sprint_filho'),
    ],
    down: drop(`${s}.fato_sprint_filho`, `${s}.dim_sprint`),
  };
};
export const { up, down } = migracao(ddl);

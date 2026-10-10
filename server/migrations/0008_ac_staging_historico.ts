import { migracao } from '../src/plataforma/db/executar.js';
import {
  ATRIBUTOS_CHAMADO, COD, COLETA_FK, DT, ID, IDENT, appendOnly, drop, indice, stgVersionada, tabela, type Ddl,
} from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const A = 'acelerato' as const;
const EXTRA_STG = ['ausente_na_extracao boolean NOT NULL DEFAULT false'];

export const ddl = (S: Esquemas): Ddl => {
  const s = S.ac;
  const R = (t: string): string => `${DT('coletado_em')}, coleta_id bigint NOT NULL,
  ${COLETA_FK(s, t)}`;
  return {
    up: [
      // Ausência na extração (ADR 0013): nova versão na mesma cadeia com a marca; nada é apagado.
      ...stgVersionada(S, A, 'stg_chamado', ['id_origem'], EXTRA_STG),
      ...stgVersionada(S, A, 'stg_etapa', ['chamado_id', 'id_origem'], EXTRA_STG),
      tabela(S, A, 'dim_chamado_versao', `${IDENT('chamado_versao_sk')} PRIMARY KEY,
  ${ID('chamado_id')}, ${DT('vigente_de')}, stg_chamado_sk bigint NOT NULL,
  ${ATRIBUTOS_CHAMADO.map(([, def]) => def).join(',\n  ')},
  ${R('dim_chamado_versao')},
  CONSTRAINT uq_dim_chamado_versao UNIQUE (chamado_id, vigente_de),
  CONSTRAINT fk_dim_chamado_versao_stg FOREIGN KEY (stg_chamado_sk) REFERENCES ${s}.stg_chamado (stg_sk)`),
      indice(s, 'ix_dim_chamado_versao_coleta', 'dim_chamado_versao', 'coleta_id'),
      ...appendOnly(S, s, 'dim_chamado_versao'),
      tabela(S, A, 'evt_etapa_chamado', `${IDENT('evt_sk')} PRIMARY KEY,
  ${ID('chamado_id')}, etapa ${COD} NOT NULL, ${DT('entrada_em')}, motivo_pendencia ${COD} NULL,
  ${R('evt_etapa_chamado')},
  CONSTRAINT uq_evt_etapa_chamado UNIQUE (chamado_id, etapa, entrada_em)`),
      indice(s, 'ix_evt_etapa_chamado_coleta', 'evt_etapa_chamado', 'coleta_id'),
      ...appendOnly(S, s, 'evt_etapa_chamado'),
    ],
    down: drop(`${s}.evt_etapa_chamado`, `${s}.dim_chamado_versao`, `${s}.stg_etapa`, `${s}.stg_chamado`),
  };
};
export const { up, down } = migracao(ddl);

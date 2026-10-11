import { migracao } from '../src/plataforma/db/executar.js';
import {
  ATRIBUTOS_CHAMADO, COD, COLETA_FK, DT, ENUM, ID, IDENT, VIG, drop, dropView, indice, refVigencia, tabela, type Ddl,
} from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const A = 'acelerato' as const;
const PROJ = `${DT('coletado_em')}, atualizado_por_coleta_id bigint NOT NULL`;
const COLUNAS = ATRIBUTOS_CHAMADO.map(([n]) => `c.${n}`);
const colunasView = (alias: string): string => ATRIBUTOS_CHAMADO.map(([n]) => `${alias}.${n}`).join(', ');

export const ddl = (S: Esquemas): Ddl => {
  const s = S.ac;
  const vigente = (campo: string): string =>
    `(SELECT codigo FROM ${s}.ref_dominio WHERE campo = '${campo}' AND vigente_ate IS NULL)`;
  return {
    up: [
      tabela(S, A, 'dim_chamado', `${ID('chamado_id')} PRIMARY KEY,
  ${ATRIBUTOS_CHAMADO.map(([, def]) => def).join(',\n  ')},
  ${PROJ}`),
      indice(s, 'ix_dim_chamado_equipe', 'dim_chamado', 'equipe, prioridade, data_finalizado'),
      indice(s, 'ix_dim_chamado_abertos', 'dim_chamado', 'aberto_em', 'data_finalizado IS NULL'),
      tabela(S, A, 'fato_etapa_chamado', `${ID('chamado_id')}, etapa ${COD} NOT NULL, ${DT('entrada')}, ${DT('saida', true)},
  motivo_pendencia ${COD} NULL, totalizador varchar(40) NULL, ${PROJ},
  PRIMARY KEY (chamado_id, etapa, entrada)`),
      indice(s, 'ix_fato_etapa_etapa', 'fato_etapa_chamado', 'etapa, entrada'),
      ...refVigencia(s, 'ref_etapa_totalizador', `natureza ${COD} NOT NULL, etapa_origem ${COD} NOT NULL, ${VIG},
  totalizador varchar(40) NOT NULL, PRIMARY KEY (natureza, etapa_origem, vigente_de)`, 'natureza, etapa_origem'),
      ...refVigencia(s, 'ref_dominio', `campo varchar(40) NOT NULL, codigo ${COD} NOT NULL, ${VIG},
  rotulo varchar(120) NOT NULL, ordem smallint NOT NULL CHECK (ordem >= 0), PRIMARY KEY (campo, codigo, vigente_de)`, 'campo, codigo'),
      ...refVigencia(s, 'ref_alvo_prioridade', `prioridade ${COD} NOT NULL, ${VIG},
  prazo_pa_horas_uteis numeric(8,2) NOT NULL, prazo_r_horas_uteis numeric(8,2) NOT NULL,
  PRIMARY KEY (prioridade, vigente_de)`, 'prioridade'),
      // Ações da automação (T4.3): append-only; resultado conhecido depois = nova tentativa. Sem gatilho: ctl_ (data-model §1).
      tabela(S, A, 'ctl_automacao', `${IDENT('automacao_sk')} PRIMARY KEY,
  ${ID('chamado_id')}, regra varchar(60) NOT NULL, ${DT('momento_gatilho')}, tentativa smallint NOT NULL CHECK (tentativa >= 0),
  acao varchar(80) NOT NULL, ${ENUM('modo', ['simulacao', 'ativo'])}, resultado varchar(200) NULL,
  registrado_no_chamado boolean NOT NULL DEFAULT false, ${DT('coletado_em')}, coleta_id bigint NULL,
  CONSTRAINT uq_ctl_automacao UNIQUE (chamado_id, regra, momento_gatilho, tentativa),
  ${COLETA_FK(s, 'ctl_automacao')}`),
      indice(s, 'ix_ctl_automacao_coleta', 'ctl_automacao', 'coleta_id'),
      // Recorte do DSPD-SSSC sobre a nossa cópia; valores vêm de ref_dominio, não fixos (T5.1). Colunas explícitas (nunca *).
      `CREATE VIEW ${s}.vw_populacao_sssc WITH (security_invoker = true) AS
  SELECT c.chamado_id, ${COLUNAS.join(', ')} FROM ${s}.dim_chamado c
  WHERE c.excluido = false
    AND c.organizacao IN ${vigente('organizacao_recorte')}
    AND c.tipo IN ${vigente('tipo_recorte')}
    AND c.equipe IN ${vigente('equipe')}`,
      // Fechado com status_sla_r nulo: dentro_sla NULL (contado à parte, nunca dentro nem fora). Exceção é coluna explícita (C3).
      `CREATE VIEW ${s}.vw_fechados_sla WITH (security_invoker = true) AS
  SELECT p.chamado_id, ${colunasView('p')},
    CASE p.status_sla_r WHEN 'REALIZADO_NO_PRAZO' THEN true WHEN 'REALIZADO_APOS_VENCIMENTO' THEN false END AS dentro_sla
  FROM ${s}.vw_populacao_sssc p
  WHERE p.status = 'Concluído' AND p.data_finalizado IS NOT NULL`,
      `CREATE VIEW ${s}.vw_abertos WITH (security_invoker = true) AS
  SELECT p.chamado_id, ${colunasView('p')} FROM ${s}.vw_populacao_sssc p WHERE p.data_finalizado IS NULL`,
    ],
    down: [dropView(`${s}.vw_abertos`), dropView(`${s}.vw_fechados_sla`), dropView(`${s}.vw_populacao_sssc`),
      ...drop(...['ctl_automacao', 'ref_alvo_prioridade', 'ref_dominio', 'ref_etapa_totalizador', 'fato_etapa_chamado',
        'dim_chamado'].map((t) => `${s}.${t}`))],
  };
};
export const { up, down } = migracao(ddl);

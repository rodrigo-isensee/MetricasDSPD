import { migracao } from '../src/plataforma/db/executar.js';
import { COD, drop, IDN, indice, tabelaPlana, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), A1: dicionário de subgrupo do apontamento (plano 059 §3.6; ADR 0020, revisão 4, R4-2). Referência versionada por
 * `ref:sync`: cada linha aponta a versão de critério que a incluiu (`incluido_por_versao_id`, como `ref_time`, sem FK entre schemas).
 * Mudar o dicionário não reclassifica o passado (a staging guarda `versao_dicionario`) e é marcado nos gráficos (T2.6, A9 do review).
 * Termo é uma palavra só, já normalizada (minúsculas, sem acento): o casamento é por início de palavra, sem regex do dicionário.
 * `prioridade` única decide o empate entre subgrupos. Fora do `dspd_api` (CA-AP-1): lidas só pelo coletor e pelo papel da aba.
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabelaPlana(s, 'ref_apontamento_subgrupo', `codigo ${COD} NOT NULL PRIMARY KEY CHECK (codigo ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  rotulo varchar(120) NOT NULL CHECK (rotulo <> ''), prioridade smallint NOT NULL CHECK (prioridade >= 0),
  incluido_por_versao_id bigint NOT NULL,
  CONSTRAINT uq_ref_apontamento_subgrupo_prioridade UNIQUE (prioridade)`),
      tabelaPlana(s, 'ref_apontamento_termo', `subgrupo_codigo ${COD} NOT NULL, termo_normalizado varchar(40) NOT NULL CHECK (termo_normalizado ~ '^[a-z0-9]{2,40}$'),
  incluido_por_versao_id bigint NOT NULL,
  PRIMARY KEY (termo_normalizado, subgrupo_codigo),
  CONSTRAINT fk_ref_apontamento_termo_subgrupo FOREIGN KEY (subgrupo_codigo) REFERENCES ${s}.ref_apontamento_subgrupo (codigo)`),
      indice(s, 'ix_ref_apontamento_termo_subgrupo', 'ref_apontamento_termo', 'subgrupo_codigo'),
      tabelaPlana(s, 'ref_apontamento_regra_tipo', `${IDN('type_id')}, condicao varchar(40) NOT NULL CHECK (condicao ~ '^[a-z0-9_]+$'), subgrupo_codigo ${COD} NOT NULL,
  incluido_por_versao_id bigint NOT NULL,
  PRIMARY KEY (type_id, condicao),
  CONSTRAINT fk_ref_apontamento_regra_subgrupo FOREIGN KEY (subgrupo_codigo) REFERENCES ${s}.ref_apontamento_subgrupo (codigo)`),
    ],
    down: drop(...['ref_apontamento_regra_tipo', 'ref_apontamento_termo', 'ref_apontamento_subgrupo'].map((t) => `${s}.${t}`)),
  };
};
export const { up, down } = migracao(ddl);

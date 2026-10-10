import type { Kysely } from 'kysely';
import { executar, drop, type Ddl } from './_util.js';

// Referência com vigência: só INSERT de nova vigência; fechar vigência = UPDATE (vigente_ate) por grant de coluna.
const VIG = `vigente_de DATE NOT NULL, vigente_ate DATE NULL`;
const T = (n: string, corpo: string): string =>
  `CREATE TABLE dspd_bm.${n} (\n  ${corpo}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
const ID = (c: string): string => `${c} VARCHAR(32) CHARACTER SET ascii NOT NULL`;

export const ddl: Ddl = {
  up: [
    T('ref_quadro', `${ID('quadro_id')}, ${VIG}, equipe VARCHAR(60) NOT NULL,
  nivel ENUM('time','coordenacao','gerencia') NOT NULL, eh_teste TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (quadro_id, vigente_de)`),
    T('ref_coluna', `${ID('quadro_id')}, ${ID('coluna_id')}, ${VIG}, nome VARCHAR(80) NOT NULL,
  tipo_coluna ENUM('fila','execucao') NULL, papel VARCHAR(30) NULL, ordem SMALLINT UNSIGNED NOT NULL,
  limite_wip SMALLINT UNSIGNED NULL,
  PRIMARY KEY (quadro_id, coluna_id, vigente_de)`),
    T('ref_dominio', `campo VARCHAR(40) NOT NULL, codigo VARCHAR(60) NOT NULL, ${VIG},
  rotulo VARCHAR(120) NOT NULL, ordem SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (campo, codigo, vigente_de)`),
    T('ref_sle', `equipe VARCHAR(60) NOT NULL, classe_servico VARCHAR(40) NOT NULL, ${VIG},
  percentil TINYINT UNSIGNED NOT NULL, dias_uteis DECIMAL(6,1) NOT NULL,
  PRIMARY KEY (equipe, classe_servico, percentil, vigente_de)`),
    T('ref_alocacao_acordada', `equipe VARCHAR(60) NOT NULL, classe_servico VARCHAR(40) NOT NULL, ${VIG},
  percentual DECIMAL(5,2) NOT NULL, PRIMARY KEY (equipe, classe_servico, vigente_de)`),
    T('ref_limite_frentes', `equipe VARCHAR(60) NOT NULL, ${VIG}, limite SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (equipe, vigente_de)`),
    T('ref_ficha_resultado', `${ID('card_id')}, ${VIG}, ficha JSON NOT NULL, PRIMARY KEY (card_id, vigente_de)`),
  ],
  down: drop(...['ref_ficha_resultado', 'ref_limite_frentes', 'ref_alocacao_acordada', 'ref_sle', 'ref_dominio',
    'ref_coluna', 'ref_quadro'].map((t) => `dspd_bm.${t}`)),
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);

import { migracao } from '../src/plataforma/db/executar.js';
import { COD, ENUM, ID, VIG, drop, refVigencia, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

// Referência com vigência: só INSERT de nova vigência; fechar vigência = UPDATE (vigente_ate) por grant de coluna.
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      ...refVigencia(s, 'ref_quadro', `${ID('quadro_id')}, ${VIG}, equipe varchar(60) NOT NULL,
  ${ENUM('nivel', ['time', 'coordenacao', 'gerencia'])}, eh_teste boolean NOT NULL DEFAULT false,
  PRIMARY KEY (quadro_id, vigente_de)`, 'quadro_id'),
      ...refVigencia(s, 'ref_coluna', `${ID('quadro_id')}, ${ID('coluna_id')}, ${VIG}, nome varchar(80) NOT NULL,
  ${ENUM('tipo_coluna', ['fila', 'execucao'], true)}, papel varchar(30) NULL, ordem smallint NOT NULL CHECK (ordem >= 0),
  limite_wip smallint NULL CHECK (limite_wip >= 0),
  PRIMARY KEY (quadro_id, coluna_id, vigente_de)`, 'quadro_id, coluna_id'),
      ...refVigencia(s, 'ref_dominio', `campo varchar(40) NOT NULL, codigo ${COD} NOT NULL, ${VIG},
  rotulo varchar(120) NOT NULL, ordem smallint NOT NULL CHECK (ordem >= 0),
  PRIMARY KEY (campo, codigo, vigente_de)`, 'campo, codigo'),
      ...refVigencia(s, 'ref_sle', `equipe varchar(60) NOT NULL, classe_servico ${COD} NOT NULL, ${VIG},
  percentil smallint NOT NULL CHECK (percentil BETWEEN 1 AND 99), dias_uteis numeric(6,1) NOT NULL,
  PRIMARY KEY (equipe, classe_servico, percentil, vigente_de)`, 'equipe, classe_servico, percentil'),
      ...refVigencia(s, 'ref_alocacao_acordada', `equipe varchar(60) NOT NULL, classe_servico ${COD} NOT NULL, ${VIG},
  percentual numeric(5,2) NOT NULL, PRIMARY KEY (equipe, classe_servico, vigente_de)`, 'equipe, classe_servico'),
      ...refVigencia(s, 'ref_limite_frentes', `equipe varchar(60) NOT NULL, ${VIG}, limite smallint NOT NULL CHECK (limite >= 0),
  PRIMARY KEY (equipe, vigente_de)`, 'equipe'),
      ...refVigencia(s, 'ref_ficha_resultado', `${ID('card_id')}, ${VIG}, ficha jsonb NOT NULL,
  PRIMARY KEY (card_id, vigente_de)`, 'card_id'),
    ],
    down: drop(...['ref_ficha_resultado', 'ref_limite_frentes', 'ref_alocacao_acordada', 'ref_sle', 'ref_dominio',
      'ref_coluna', 'ref_quadro'].map((t) => `${s}.${t}`)),
  };
};
export const { up, down } = migracao(ddl);

import { migracao } from '../src/plataforma/db/executar.js';
import { DT, IDENT, VIG, appendOnly, dropView, indice, refVigencia, tabelaPlana, drop, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const DOMINIOS_ANTES = ['businessmap', 'acelerato'] as const;
const DOMINIOS = [...DOMINIOS_ANTES, 'pesquisa'] as const;
const TEXTO_SEGURO = (c: string): string => `${c} !~ '(@|https?://|www\\.)'`;

/**
 * Pesquisa trimestral de percepção (PV1; plano lacuna-de-valor §2). Só contagens agregadas por trimestre, área, pergunta e faixa:
 * nenhuma coluna guarda respondente, comentário ou texto livre de respondente. `pesq_*` é append-only (gatilho para qualquer papel);
 * reenvio cria carga nova (a anterior fica guardada). A área vem de lista fechada (`ref_pesq_area`), conferida por gatilho.
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.core;
  return {
    up: [
      `ALTER TABLE ${s}.ref_versao_criterio DROP CONSTRAINT ref_versao_criterio_dominio_check`,
      `ALTER TABLE ${s}.ref_versao_criterio ADD CONSTRAINT ref_versao_criterio_dominio_check CHECK (dominio IN (${DOMINIOS.map((d) => `'${d}'`).join(',')}))`,
      ...refVigencia(s, 'ref_pesq_area', `codigo varchar(40) NOT NULL CHECK (codigo ~ '^[a-z0-9_]+$'),
  rotulo varchar(80) NOT NULL CHECK (${TEXTO_SEGURO('rotulo')}), ${VIG},
  PRIMARY KEY (codigo, vigente_de),
  CONSTRAINT ck_ref_pesq_area_vigencia CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de)`, 'codigo'),
      tabelaPlana(s, 'ref_pesq_pergunta', `versao_id bigint NOT NULL, codigo varchar(40) NOT NULL CHECK (codigo ~ '^[a-z0-9_]+$'),
  ordem smallint NOT NULL CHECK (ordem > 0), texto varchar(200) NOT NULL CHECK (${TEXTO_SEGURO('texto')}), ${VIG},
  PRIMARY KEY (versao_id, codigo),
  CONSTRAINT uq_ref_pesq_pergunta_ordem UNIQUE (versao_id, ordem),
  CONSTRAINT ck_ref_pesq_pergunta_vigencia CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de),
  CONSTRAINT fk_ref_pesq_pergunta_versao FOREIGN KEY (versao_id) REFERENCES ${s}.ref_versao_criterio (versao_id)`),
      tabelaPlana(s, 'pesq_carga', `${IDENT('carga_id')} PRIMARY KEY,
  trimestre char(7) NOT NULL CHECK (trimestre ~ '^[0-9]{4}-T[1-4]$'), versao_id bigint NOT NULL,
  ${DT('recebida_em')} DEFAULT now(), arquivo_sha256 char(64) NOT NULL CHECK (arquivo_sha256 ~ '^[0-9a-f]{64}$'),
  linhas integer NOT NULL CHECK (linhas > 0), substitui_carga_id bigint NULL,
  o_que_mudou varchar(500) NULL CHECK (char_length(btrim(o_que_mudou)) > 0 AND ${TEXTO_SEGURO('o_que_mudou')}),
  CONSTRAINT ck_pesq_carga_substitui CHECK (substitui_carga_id IS NULL OR substitui_carga_id < carga_id),
  CONSTRAINT fk_pesq_carga_versao FOREIGN KEY (versao_id) REFERENCES ${s}.ref_versao_criterio (versao_id),
  CONSTRAINT fk_pesq_carga_substitui FOREIGN KEY (substitui_carga_id) REFERENCES ${s}.pesq_carga (carga_id)`),
      indice(s, 'ix_pesq_carga_trimestre', 'pesq_carga', 'trimestre, carga_id DESC'),
      // Cadeia linear: uma carga só é substituída uma vez (protege também contra dois reenvios simultâneos).
      indice(s, 'uq_pesq_carga_substitui', 'pesq_carga', 'substitui_carga_id', 'substitui_carga_id IS NOT NULL', true),
      tabelaPlana(s, 'pesq_resultado', `carga_id bigint NOT NULL, area_codigo varchar(40) NOT NULL, pergunta_codigo varchar(40) NOT NULL,
  faixa smallint NOT NULL CHECK (faixa BETWEEN 1 AND 5), contagem integer NOT NULL CHECK (contagem >= 0),
  PRIMARY KEY (carga_id, area_codigo, pergunta_codigo, faixa),
  CONSTRAINT fk_pesq_resultado_carga FOREIGN KEY (carga_id) REFERENCES ${s}.pesq_carga (carga_id)`),
      tabelaPlana(s, 'pesq_participacao', `carga_id bigint NOT NULL, area_codigo varchar(40) NOT NULL,
  convidados integer NOT NULL CHECK (convidados >= 0), respondentes integer NOT NULL CHECK (respondentes >= 0),
  PRIMARY KEY (carga_id, area_codigo),
  CONSTRAINT ck_pesq_participacao CHECK (respondentes <= convidados),
  CONSTRAINT fk_pesq_participacao_carga FOREIGN KEY (carga_id) REFERENCES ${s}.pesq_carga (carga_id)`),
      ...['pesq_carga', 'pesq_resultado', 'pesq_participacao'].flatMap((t) => appendOnly(S, s, t)),
      // Lista fechada: a área (e a pergunta, do questionário da carga) precisa existir na referência.
      `CREATE FUNCTION ${s}.pesq_conferir_lista() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ${s}.ref_pesq_area a WHERE a.codigo = NEW.area_codigo) THEN
    RAISE EXCEPTION 'área fora da lista fechada (ref_pesq_area)' USING ERRCODE = '23514';
  END IF;
  IF TG_TABLE_NAME = 'pesq_resultado' THEN
    IF NOT EXISTS (
      SELECT 1 FROM ${s}.pesq_carga c JOIN ${s}.ref_pesq_pergunta p ON p.versao_id = c.versao_id
      WHERE c.carga_id = NEW.carga_id AND p.codigo = NEW.pergunta_codigo) THEN
      RAISE EXCEPTION 'pergunta fora do questionário da carga (ref_pesq_pergunta)' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END
$f$`,
      `CREATE TRIGGER tg_pesq_resultado_lista BEFORE INSERT ON ${s}.pesq_resultado FOR EACH ROW EXECUTE FUNCTION ${s}.pesq_conferir_lista()`,
      `CREATE TRIGGER tg_pesq_participacao_lista BEFORE INSERT ON ${s}.pesq_participacao FOR EACH ROW EXECUTE FUNCTION ${s}.pesq_conferir_lista()`,
      // Carga vigente de cada trimestre = a de maior carga_id.
      `CREATE VIEW ${s}.vw_pesq_vigente WITH (security_invoker = true) AS
  SELECT c.carga_id, c.trimestre, c.versao_id, c.recebida_em, c.o_que_mudou FROM ${s}.pesq_carga c
  WHERE NOT EXISTS (SELECT 1 FROM ${s}.pesq_carga n WHERE n.trimestre = c.trimestre AND n.carga_id > c.carga_id)`,
    ],
    down: [
      dropView(`${s}.vw_pesq_vigente`),
      ...drop(...['pesq_participacao', 'pesq_resultado', 'pesq_carga', 'ref_pesq_pergunta', 'ref_pesq_area'].map((t) => `${s}.${t}`)),
      `DROP FUNCTION IF EXISTS ${s}.pesq_conferir_lista()`,
      `DELETE FROM ${s}.ref_versao_criterio_metrica WHERE versao_id IN (SELECT versao_id FROM ${s}.ref_versao_criterio WHERE dominio = 'pesquisa')`,
      `DELETE FROM ${s}.ref_versao_criterio WHERE dominio = 'pesquisa'`,
      `ALTER TABLE ${s}.ref_versao_criterio DROP CONSTRAINT ref_versao_criterio_dominio_check`,
      `ALTER TABLE ${s}.ref_versao_criterio ADD CONSTRAINT ref_versao_criterio_dominio_check CHECK (dominio IN (${DOMINIOS_ANTES.map((d) => `'${d}'`).join(',')}))`,
    ],
  };
};
export const { up, down } = migracao(ddl);

import { migracao } from '../src/plataforma/db/executar.js';
import { DT, ENUM, ID, VIG, drop, refVigencia, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * F0 do plano 052 (data-model §3.4): referência do quadro real pelas decisões H do dono (2026-10-30).
 * - `ref_workflow`: nível pelo workflow (H-1). `ref_tipo_card`: tipo → item ou não (H-2) e categoria do briefing 4.3 (H-17).
 * - `ref_coluna`: vínculo com o workflow, coluna mãe, seção, tipo de fluxo, folha e descarte (H-8 a H-11). `limite_wip` (H-12)
 *   já existe desde a 0007. Linhas anteriores (mock) ficam com as colunas novas nulas ou no valor padrão; a F2 as preenche.
 * - `ref_time` e `ref_time_workflow`: tabela de times no banco, com histórico (decisão de 16:44). Serve de filtro do painel
 *   operacional; nenhuma view nem rota agrupa por time para comparar (data-model §9). Carga inicial na migração seguinte.
 * Escrita: só INSERT de nova vigência e UPDATE de `vigente_ate` (grant por coluna + gatilho `proibir_alteracao_vigencia`).
 * `registrado_por` não é de pessoa e fica fora da API (COLUNAS_FORA_DA_API): nunca nome nem e-mail.
 */
const NOVAS = ['ref_workflow', 'ref_tipo_card', 'ref_time', 'ref_time_workflow'] as const;
const COLUNAS_NOVAS_REF_COLUNA = ['workflow_id', 'coluna_mae_id', 'section', 'flow_type', 'eh_folha', 'eh_descarte', 'motivo'] as const;

export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  const rastroVigencia = `motivo text NOT NULL CHECK (motivo IN ('processo','correcao','carga_inicial')),
  versao_id bigint NOT NULL, ${DT('registrado_em')} DEFAULT now(), registrado_por varchar(64) NOT NULL CHECK (registrado_por <> '')`;
  return {
    up: [
      // Gatilho de vigência: o único UPDATE aceito fecha a vigência vigente (NULL -> data), sem mudar mais nada. DELETE e TRUNCATE nunca.
      `CREATE FUNCTION ${S.core}.proibir_alteracao_vigencia() RETURNS trigger LANGUAGE plpgsql AS $f$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.vigente_ate IS NULL AND NEW.vigente_ate IS NOT NULL
     AND (to_jsonb(NEW) - 'vigente_ate') = (to_jsonb(OLD) - 'vigente_ate') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'tabela % tem vigência: só INSERT de nova vigência e UPDATE de vigente_ate; % não é permitido', TG_TABLE_NAME, TG_OP
    USING ERRCODE = '55000';
END
$f$`,
      ...refVigencia(s, 'ref_workflow', `${ID('quadro_id')}, ${ID('workflow_id')}, ${VIG}, nome varchar(120) NOT NULL,
  tipo_api smallint NOT NULL CHECK (tipo_api IN (0,1,2)),
  ${ENUM('nivel', ['projeto', 'feature', 'story', 'nenhum'])},
  PRIMARY KEY (quadro_id, workflow_id, vigente_de)`, 'quadro_id, workflow_id'),
      ...refVigencia(s, 'ref_tipo_card', `${ID('tipo_id')}, ${VIG}, nome varchar(80) NOT NULL, eh_item boolean NOT NULL,
  ${ENUM('categoria', ['bug_interno', 'defeito_producao', 'requisicao', 'divida_tecnica', 'melhoria', 'produto'], true)},
  CONSTRAINT ck_ref_tipo_card_item_categoria CHECK (eh_item = (categoria IS NOT NULL)),
  PRIMARY KEY (tipo_id, vigente_de)`, 'tipo_id'),
      ...refVigencia(s, 'ref_time', `time_id integer NOT NULL CHECK (time_id > 0), ${VIG}, nome varchar(80) NOT NULL CHECK (nome <> ''),
  ativo boolean NOT NULL DEFAULT true, ${rastroVigencia},
  PRIMARY KEY (time_id, vigente_de)`, 'time_id'),
      ...refVigencia(s, 'ref_time_workflow', `${ID('workflow_id')}, ${VIG}, ${ID('quadro_id')}, time_id integer NULL,
  ${ENUM('situacao', ['time', 'fora'])},
  ${ENUM('motivo_fora', ['fora_de_todo_calculo', 'fora_do_operacional'], true)},
  CONSTRAINT ck_ref_time_workflow_time CHECK ((situacao = 'time') = (time_id IS NOT NULL)),
  CONSTRAINT ck_ref_time_workflow_fora CHECK ((situacao = 'fora') = (motivo_fora IS NOT NULL)),
  ${rastroVigencia},
  PRIMARY KEY (workflow_id, vigente_de)`, 'workflow_id'),
      ...NOVAS.flatMap((t) => [
        `CREATE TRIGGER tg_${t}_vigencia BEFORE UPDATE OR DELETE ON ${s}.${t} FOR EACH ROW EXECUTE FUNCTION ${S.core}.proibir_alteracao_vigencia()`,
        `CREATE TRIGGER tg_${t}_sem_truncate BEFORE TRUNCATE ON ${s}.${t} FOR EACH STATEMENT EXECUTE FUNCTION ${S.core}.proibir_alteracao_vigencia()`,
      ]),
      `ALTER TABLE ${s}.ref_coluna ADD COLUMN ${ID('workflow_id', true)}`,
      `ALTER TABLE ${s}.ref_coluna ADD COLUMN ${ID('coluna_mae_id', true)}`,
      `ALTER TABLE ${s}.ref_coluna ADD COLUMN section smallint NULL CHECK (section BETWEEN 1 AND 5)`,
      `ALTER TABLE ${s}.ref_coluna ADD COLUMN flow_type smallint NULL CHECK (flow_type IN (1,2))`,
      `ALTER TABLE ${s}.ref_coluna ADD COLUMN eh_folha boolean NOT NULL DEFAULT true`,
      `ALTER TABLE ${s}.ref_coluna ADD COLUMN eh_descarte boolean NOT NULL DEFAULT false`,
      `ALTER TABLE ${s}.ref_coluna ADD COLUMN ${ENUM('motivo', ['processo', 'correcao'], true)}`,
    ],
    down: [
      ...[...COLUNAS_NOVAS_REF_COLUNA].reverse().map((c) => `ALTER TABLE ${s}.ref_coluna DROP COLUMN IF EXISTS ${c}`),
      ...drop(...[...NOVAS].reverse().map((t) => `${s}.${t}`)),
      `DROP FUNCTION ${S.core}.proibir_alteracao_vigencia()`,
    ],
  };
};
export const { up, down } = migracao(ddl);

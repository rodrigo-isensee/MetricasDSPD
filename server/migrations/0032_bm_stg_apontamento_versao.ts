import { migracao } from '../src/plataforma/db/executar.js';
import { indice, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), E2.44, decisão A2 do plano da aba (§3.3) e ADR 0025 itens 5 e 9: a staging do worklog guarda a volta ao valor antigo.
 * Com `UNIQUE (logged_time_id, registro_sha256)`, o apontamento editado de A para B e de volta para A perdia a terceira leitura (o segundo A
 * colidia com o primeiro): a última linha da staging ficava B, o fato ficava A, e a transição B para A não ficava em lugar nenhum. Agora a
 * chave é `UNIQUE (logged_time_id, versao)` (mesmo nome, `uq_stg_apontamento`, para o `ON CONFLICT ON CONSTRAINT`), `versao` vai de 1 em
 * diante por `logged_time_id`, e a coleta insere a linha nova (`versao` = última + 1) só quando o hash difere do da última versão: A, B, A
 * vira três linhas. O fato segue reconstruível da staging (maior `versao`, `fato.versoes` = maior `versao`).
 *
 * Preenchimento das linhas existentes: `row_number()` por `logged_time_id` na ordem de `stg_sk`, com o gatilho de imutabilidade desligado SÓ
 * dentro desta migração (a transação religa; o preenchimento é correto porque a chave antiga nunca deixou entrar hash repetido do mesmo id,
 * então a ordem de `stg_sk` é a ordem das versões). Nenhum dado é alterado além da coluna nova.
 *
 * `ix_stg_apontamento_ultima (logged_time_id, stg_sk DESC)` sai: o índice da chave nova (`logged_time_id, versao`) serve à busca da última
 * versão (`ORDER BY versao DESC LIMIT 1`), e manter os dois só encareceria a gravação.
 *
 * `down`: só enquanto não houver hash repetido por id (a chave antiga não comporta); se houver, recusa com mensagem clara e nada muda.
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  const t = `${s}.stg_apontamento`;
  return {
    up: [
      `ALTER TABLE ${t} DROP CONSTRAINT uq_stg_apontamento`,
      `DROP INDEX IF EXISTS ${s}.ix_stg_apontamento_ultima`,
      `ALTER TABLE ${t} ADD COLUMN versao smallint NULL`,
      `ALTER TABLE ${t} DISABLE TRIGGER tg_stg_apontamento_imutavel`,
      `UPDATE ${t} AS x SET versao = n.v
       FROM (SELECT stg_sk, row_number() OVER (PARTITION BY logged_time_id ORDER BY stg_sk)::smallint AS v FROM ${t}) AS n
       WHERE x.stg_sk = n.stg_sk`,
      `ALTER TABLE ${t} ENABLE TRIGGER tg_stg_apontamento_imutavel`,
      `ALTER TABLE ${t} ALTER COLUMN versao SET NOT NULL`,
      `ALTER TABLE ${t} ADD CONSTRAINT ck_stg_apontamento_versao CHECK (versao >= 1)`,
      `ALTER TABLE ${t} ADD CONSTRAINT uq_stg_apontamento UNIQUE (logged_time_id, versao)`,
    ],
    down: [
      `DO $mig$ BEGIN
         IF EXISTS (SELECT 1 FROM ${t} GROUP BY logged_time_id, registro_sha256 HAVING count(*) > 1) THEN
           RAISE EXCEPTION 'down da 0032 recusado: ha apontamento com a volta a um valor antigo na staging (hash repetido por id); a chave antiga nao comporta';
         END IF;
       END $mig$`,
      `ALTER TABLE ${t} DROP CONSTRAINT uq_stg_apontamento`,
      `ALTER TABLE ${t} DROP CONSTRAINT ck_stg_apontamento_versao`,
      `ALTER TABLE ${t} DROP COLUMN versao`,
      `ALTER TABLE ${t} ADD CONSTRAINT uq_stg_apontamento UNIQUE (logged_time_id, registro_sha256)`,
      indice(s, 'ix_stg_apontamento_ultima', 'stg_apontamento', 'logged_time_id, stg_sk DESC'),
    ],
  };
};
export const { up, down } = migracao(ddl);

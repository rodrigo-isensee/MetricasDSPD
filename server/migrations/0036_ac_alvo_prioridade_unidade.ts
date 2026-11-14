import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 099, D3 (Q-099-5a e Q-099-11; desenho em docs/analises/099-d3-unidade-prazo.md, alternativa a): cada prazo de `ref_alvo_prioridade`
 * passa a dizer em que relógio é medido. As colunas `prazo_pa_horas_uteis` e `prazo_r_horas_uteis` viram `prazo_pa_horas` e `prazo_r_horas`
 * (só metadado: nenhum valor é reescrito) e ganham `unidade_pa` e `unidade_r` (`corrido` ou `util`). A unidade fica na mesma linha e na mesma
 * vigência do valor: trocar a unidade é nova vigência, nunca UPDATE. O `DEFAULT 'util'` só preenche as linhas que já existirem (não é
 * inferência: é o que o nome antigo da coluna declarava sobre elas) e sai em seguida: linha nova tem de dizer a unidade.
 * `down` recusa, sem mudar nada, se houver linha com unidade `corrido` (voltar apagaria a informação em silêncio); senão tira as colunas e
 * devolve os nomes.
 */
const T = 'ref_alvo_prioridade';

export const ddl = (S: Esquemas): Ddl => {
  const t = `${S.ac}.${T}`;
  return {
    up: [
      `ALTER TABLE ${t} RENAME COLUMN prazo_pa_horas_uteis TO prazo_pa_horas`,
      `ALTER TABLE ${t} RENAME COLUMN prazo_r_horas_uteis TO prazo_r_horas`,
      `ALTER TABLE ${t} ADD COLUMN unidade_pa text NOT NULL DEFAULT 'util' CHECK (unidade_pa IN ('corrido','util'))`,
      `ALTER TABLE ${t} ADD COLUMN unidade_r text NOT NULL DEFAULT 'util' CHECK (unidade_r IN ('corrido','util'))`,
      `ALTER TABLE ${t} ALTER COLUMN unidade_pa DROP DEFAULT`,
      `ALTER TABLE ${t} ALTER COLUMN unidade_r DROP DEFAULT`,
    ],
    down: [
      `DO $guarda$ BEGIN
  IF EXISTS (SELECT 1 FROM ${t} WHERE unidade_pa = 'corrido' OR unidade_r = 'corrido') THEN
    RAISE EXCEPTION 'ref_alvo_prioridade tem prazo em tempo corrido: a volta para horas úteis foi recusada, nada foi alterado';
  END IF;
END $guarda$`,
      `ALTER TABLE ${t} DROP COLUMN unidade_pa`,
      `ALTER TABLE ${t} DROP COLUMN unidade_r`,
      `ALTER TABLE ${t} RENAME COLUMN prazo_pa_horas TO prazo_pa_horas_uteis`,
      `ALTER TABLE ${t} RENAME COLUMN prazo_r_horas TO prazo_r_horas_uteis`,
    ],
  };
};
export const { up, down } = migracao(ddl);

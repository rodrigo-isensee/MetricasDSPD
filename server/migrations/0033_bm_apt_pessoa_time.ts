import { migracao } from '../src/plataforma/db/executar.js';
import { dropView, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), E2.21: quem é do time na aba Apontamento (decisão do dono de 2026-11-02): foi responsável por pelo menos um card do
 * escopo do DSPD (`raiz_fora_do_escopo` falso) nos últimos 12 meses; as demais pessoas viram a entrada "Outra área". A conta precisa de
 * `dim_card_versao.responsaveis` (ids do BusinessMap) e de `dim_responsavel.responsavel_id`, que o papel da aba NÃO lê (R4-4). Por isso é uma
 * view SEM `security_invoker`: roda com o privilégio do dono (o migrador) e entrega só `pessoa_ref` e a data até a qual a pessoa foi
 * responsável (`NULL` = ainda é, numa versão vigente). Nome fora do prefixo `vw_`: o `dspd_api` nunca a recebe. O corte dos 12 meses é da rota
 * (parâmetro), não da view.
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      `CREATE VIEW ${s}.apt_pessoa_time AS
SELECT r.pessoa_ref,
       CASE WHEN bool_or(x.ate IS NULL) THEN NULL ELSE max(x.ate) END AS vigencia_ate
FROM (
  SELECT v.card_id, unnest(v.responsaveis) AS responsavel_id,
         lead(v.vigente_de) OVER (PARTITION BY v.card_id ORDER BY v.vigente_de) AS ate
  FROM ${s}.dim_card_versao v
) x
JOIN ${s}.dim_responsavel r ON r.responsavel_id = x.responsavel_id
JOIN ${s}.dim_card_raiz c ON c.card_id = x.card_id
WHERE NOT c.raiz_fora_do_escopo
GROUP BY r.pessoa_ref`,
    ],
    down: [dropView(`${s}.apt_pessoa_time`)],
  };
};
export const { up, down } = migracao(ddl);

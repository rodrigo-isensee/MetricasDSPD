-- ID: B2-a
-- FONTE: pg
-- ORIGEM: docs/analises/099-revisao-campos.md §3.2
-- COLUNAS: tipo:dominio,criticidade:dominio,cards:numero
-- B2-a (*): valores da criticidade (priority) na última versão de cada story, por tipo de card
-- (bugs = 'Bug interno' e 'Defeito em produção'); conta cards, nunca mostra card
SELECT d.tipo, s.payload->>'priority' AS criticidade, COUNT(*) AS cards
  FROM (SELECT DISTINCT ON (id_origem) id_origem, payload
          FROM dspd_bm.stg_card ORDER BY id_origem, coletado_em DESC) s
  JOIN dspd_bm.dim_card d ON d.card_id = s.id_origem
 WHERE d.granularidade = 'story' AND d.excluido_em IS NULL
 GROUP BY d.tipo, 2
 ORDER BY d.tipo, 2;

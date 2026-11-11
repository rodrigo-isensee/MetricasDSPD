-- ID: B2-b
-- FONTE: pg
-- ORIGEM: docs/analises/099-revisao-campos.md §3.2
-- COLUNAS: cards_com_mudanca:numero,cards:numero
-- B2-b (*): a criticidade é mexida pelas pessoas? cards com mais de um valor ao longo das versões
SELECT COUNT(*) FILTER (WHERE n > 1) AS cards_com_mudanca, COUNT(*) AS cards
  FROM (SELECT id_origem, COUNT(DISTINCT payload->>'priority') AS n
          FROM dspd_bm.stg_card GROUP BY id_origem) x;

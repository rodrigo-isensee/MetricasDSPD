-- ID: B4-a
-- FONTE: pg
-- ORIGEM: docs/analises/099-revisao-campos.md §3.3
-- COLUNAS: stories:numero,com_prazo:numero,prazo_mudou:numero
-- B4-a (*): stories com prazo, e quantas tiveram o prazo mudado entre versões coletadas
SELECT COUNT(*) AS stories,
       COUNT(*) FILTER (WHERE com_prazo) AS com_prazo,
       COUNT(*) FILTER (WHERE prazos > 1) AS prazo_mudou
  FROM (SELECT d.card_id,
               bool_or(s.payload->>'deadline' IS NOT NULL) AS com_prazo,
               COUNT(DISTINCT s.payload->>'deadline') AS prazos
          FROM dspd_bm.dim_card d JOIN dspd_bm.stg_card s ON s.id_origem = d.card_id
         WHERE d.granularidade = 'story' AND d.excluido_em IS NULL
         GROUP BY d.card_id) x;

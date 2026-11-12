-- ID: B3-c
-- FONTE: pg
-- ORIGEM: docs/analises/099-revisao-campos.md §3.4
-- COLUNAS: stories:numero,com_projeto_ancestral:numero,projetos:numero
-- B3-c (*): quantas stories têm um projeto como ancestral pela cadeia card_pai (story -> frente -> projeto)
WITH RECURSIVE sobe(story, ancestral, nivel) AS (
  SELECT card_id, card_pai, 1 FROM dspd_bm.dim_card WHERE granularidade = 'story' AND excluido_em IS NULL
  UNION ALL
  SELECT s.story, d.card_pai, s.nivel + 1
    FROM sobe s JOIN dspd_bm.dim_card d ON d.card_id = s.ancestral
   WHERE s.ancestral IS NOT NULL AND s.nivel < 4)
SELECT (SELECT COUNT(*) FROM dspd_bm.dim_card WHERE granularidade = 'story' AND excluido_em IS NULL) AS stories,
       COUNT(DISTINCT s.story) AS com_projeto_ancestral,
       (SELECT COUNT(*) FROM dspd_bm.dim_card WHERE granularidade = 'projeto' AND excluido_em IS NULL) AS projetos
  FROM sobe s JOIN dspd_bm.dim_card p ON p.card_id = s.ancestral
 WHERE p.granularidade = 'projeto';

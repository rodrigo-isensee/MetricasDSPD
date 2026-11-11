-- ID: Q-RO-4
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: revisoes:numero,com_campo:numero,trocas:numero,cards:numero
-- Q-RO-4 (O26) (*): revisões com o booleano de troca de responsável
SELECT COUNT(*) AS revisoes,
       COUNT(*) FILTER (WHERE payload ? 'troca_responsavel') AS com_campo,
       COUNT(*) FILTER (WHERE payload->>'troca_responsavel' = 'true') AS trocas,
       COUNT(DISTINCT card_id) AS cards
  FROM dspd_bm.stg_revision;

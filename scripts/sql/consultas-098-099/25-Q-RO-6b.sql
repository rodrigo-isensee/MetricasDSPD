-- ID: Q-RO-6b
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: cards_com_deadline:numero
-- Q-RO-6b (O12, Q-099-10) (*): cards com o prazo nativo (deadline) no staging
SELECT COUNT(DISTINCT id_origem) AS cards_com_deadline
  FROM dspd_bm.stg_card
 WHERE payload->>'deadline' IS NOT NULL;

-- ID: Q-RO-5
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: tipo_vinculo:dominio,n:numero
-- Q-RO-5 (O18) (*): tipos de vínculo nativo presentes no staging (conta versões, não cards)
SELECT l->>'link_type' AS tipo_vinculo, COUNT(*) AS n
  FROM dspd_bm.stg_card s, jsonb_array_elements(COALESCE(s.payload->'linked_cards', '[]'::jsonb)) l
 GROUP BY 1 ORDER BY 2 DESC;

-- ID: C-BM4
-- FONTE: pg
-- ORIGEM: docs/analises/098-discovery.md §1.2
-- COLUNAS: quadro_id:numero,cards:numero
-- C-BM4 (E3). Quadros lidos pela referência e quadros com card na base (só ids e contagens).
SELECT q.quadro_id, (SELECT count(*) FROM dspd_bm.dim_card c WHERE c.quadro_id = q.quadro_id) AS cards
  FROM dspd_bm.ref_quadro q WHERE q.vigente_ate IS NULL ORDER BY q.quadro_id;

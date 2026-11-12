-- ID: C-BM5
-- FONTE: pg
-- ORIGEM: docs/analises/098-discovery.md §1.2
-- COLUNAS: stories_com_time:numero,cards_fora_do_fluxo:numero,times_sem_card:numero
-- C-BM5 (E3). Cobertura: stories com e sem time, e quantos times ativos não têm nenhum card (sem listar contagem por time).
SELECT (SELECT count(*) FROM dspd_bm.dim_card WHERE granularidade = 'story' AND equipe IS NOT NULL) AS stories_com_time,
       (SELECT count(*) FROM dspd_bm.dim_card WHERE granularidade IS NULL AND excluido_em IS NULL) AS cards_fora_do_fluxo,
       (SELECT count(*) FROM dspd_bm.ref_time t WHERE t.vigente_ate IS NULL AND t.ativo
           AND NOT EXISTS (SELECT 1 FROM dspd_bm.dim_card c WHERE c.equipe = t.nome)) AS times_sem_card;

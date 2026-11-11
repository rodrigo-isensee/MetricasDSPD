-- ID: Q-RO-1
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: direcao:dominio,transicoes:numero,sem_tipo_coluna:numero
-- Q-RO-1 (O20, O21): transições na janela de 84 dias, por direção, e sem tipo de coluna
SELECT direcao, COUNT(*) AS transicoes, COUNT(*) FILTER (WHERE tipo_coluna IS NULL) AS sem_tipo_coluna
  FROM dspd_bm.vw_transicao_canonica
 WHERE ocorrido_em >= now() - interval '84 days'
 GROUP BY direcao;

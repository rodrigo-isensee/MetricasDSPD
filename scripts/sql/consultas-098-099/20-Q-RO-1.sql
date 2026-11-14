-- ID: Q-RO-1
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: direcao:dominio,transicoes:numero,sem_tipo_coluna:numero
-- Q-RO-1 (O20, O21): transições na janela de 84 dias, por direção, e sem tipo de coluna
-- O papel dspd_coletor não tem SELECT na vw_transicao_canonica (só a API, grants.ts); por isso lê as duas tabelas e repete o filtro da view
-- (0005_bm_historico: todas as revision + webhooks sem par em rec_transicao_par). Mesma contagem da view.
SELECT t.direcao, COUNT(*) AS transicoes, COUNT(*) FILTER (WHERE t.tipo_coluna IS NULL) AS sem_tipo_coluna
  FROM dspd_bm.fato_transicao t
 WHERE t.ocorrido_em >= now() - interval '84 days'
   AND (t.fonte = 'revision'
        OR NOT EXISTS (SELECT 1 FROM dspd_bm.rec_transicao_par p WHERE p.transicao_webhook_sk = t.transicao_sk))
 GROUP BY t.direcao;

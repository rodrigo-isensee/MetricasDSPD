-- ID: Q-RO-2
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: tipo:dominio,descartados_nativos:numero,excluidos:numero,encerrados_ou_arquivados:numero
-- Q-RO-2 (O25): descartados nativos, excluídos e arquivados por tipo, na janela de 84 dias
SELECT tipo,
       COUNT(*) FILTER (WHERE motivo_descarte IS NOT NULL AND arquivado_em IS NOT NULL) AS descartados_nativos,
       COUNT(*) FILTER (WHERE excluido_em IS NOT NULL) AS excluidos,
       COUNT(*) AS encerrados_ou_arquivados
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND COALESCE(excluido_em, arquivado_em) >= now() - interval '84 days'
 GROUP BY tipo;

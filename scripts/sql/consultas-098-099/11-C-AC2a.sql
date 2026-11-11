-- ID: C-AC2a
-- FONTE: mysql
-- ORIGEM: docs/analises/098-discovery.md §1.1
-- COLUNAS: chave:numero,organizacao:dominio,n:numero,n_12m:numero
-- C-AC2a. Organizações do próprio grupo (nome começa por UNIFIQUE): nome e contagens.
SELECT organizacao_key AS chave, organizacao, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m
  FROM ACELERATO_CHAMADOS
 WHERE organizacao LIKE 'UNIFIQUE%'
 GROUP BY organizacao_key, organizacao
 ORDER BY n DESC;

-- ID: C-AC3
-- FONTE: mysql
-- ORIGEM: docs/analises/098-discovery.md §1.1
-- COLUNAS: tipo_ticket_key:numero,tipo_ticket:dominio,equipe_key:numero,equipe:dominio,n:numero,n_12m:numero,n_fech_12s:numero
-- C-AC3. Equipes por tipo, dentro das organizações do grupo: base das opções (a) e (b) de P-098-1.
SELECT tipo_ticket_key, tipo_ticket, equipe_key, equipe, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m,
       SUM(data_pronto  >= DATE_SUB(CURRENT_DATE, INTERVAL 84 DAY))   AS n_fech_12s
  FROM ACELERATO_CHAMADOS
 WHERE organizacao LIKE 'UNIFIQUE%'
 GROUP BY tipo_ticket_key, tipo_ticket, equipe_key, equipe
 ORDER BY tipo_ticket_key, n DESC;

-- ID: B5-b
-- FONTE: mysql
-- ORIGEM: docs/analises/099-revisao-campos.md §3.5
-- COLUNAS: nome:dominio,kanban_status_key:numero,ocorrencias:numero,preenchidos:numero
-- B5-b: em que etapas (chave) cada campo de etapa aparece e quantas vezes vem preenchido (o valor nunca sai)
SELECT f.nome, f.kanban_status_key, COUNT(*) AS ocorrencias,
       SUM(f.valor IS NOT NULL AND f.valor <> '') AS preenchidos
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
         nome VARCHAR(255) PATH '$.nome',
         kanban_status_key BIGINT PATH '$.kanbanStatusKey' NULL ON ERROR,
         valor VARCHAR(255) PATH '$.valor' NULL ON ERROR)) f
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
 GROUP BY f.nome, f.kanban_status_key
 ORDER BY f.nome, f.kanban_status_key;

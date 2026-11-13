-- ID: B6-a
-- FONTE: mysql
-- ORIGEM: docs/analises/099-revisao-campos.md §3.6
-- COLUNAS: nome:dominio,tipo:dominio,ocorrencias:numero,preenchidos:numero
-- B6-a (MySQL): os campos equivalentes existem e com que tipo? (nomes e contagens; o valor nunca sai)
SELECT f.nome, f.tipo, COUNT(*) AS ocorrencias, SUM(f.valor IS NOT NULL AND f.valor <> '') AS preenchidos
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
         nome VARCHAR(255) PATH '$.nome', tipo VARCHAR(60) PATH '$.tipo',
         valor VARCHAR(255) PATH '$.valor' NULL ON ERROR)) f
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
   AND f.nome IN ('Motivo de Encerramento', 'Categoria de solução', 'Motivo da Escalação:',
                  'Prioridade ajustada manualmente?', 'Classifique o chamado no Tipo de Prioridade corretamente!',
                  'Avaliação de Problema', 'Motivo de Pendência')
 GROUP BY f.nome, f.tipo;

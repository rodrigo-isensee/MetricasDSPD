-- ID: B5-a
-- FONTE: mysql
-- ORIGEM: docs/analises/099-revisao-campos.md §3.5
-- COLUNAS: descricao_workflow:dominio,etapa_key:numero,etapa:dominio,n:numero,pos_min:numero,pos_media:numero,pos_max:numero
-- B5-a: etapas por workflow, com a chave e a posição média em que a ferramenta lista a etapa
-- (pos = ordem no array estatisticas.workflow.etapas; se for a ordem do desenho, ela substitui a proposta do §4)
SELECT e.descricao_workflow, e.etapa_key, e.descricao AS etapa, COUNT(*) AS n,
       MIN(e.pos) AS pos_min, ROUND(AVG(e.pos), 1) AS pos_media, MAX(e.pos) AS pos_max
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]' COLUMNS (
         pos FOR ORDINALITY,
         etapa_key BIGINT PATH '$.etapaKey' NULL ON ERROR,
         descricao VARCHAR(255) PATH '$.descricao',
         descricao_workflow VARCHAR(255) PATH '$.descricaoWorkflow')) e
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
 GROUP BY e.descricao_workflow, e.etapa_key, e.descricao
 ORDER BY e.descricao_workflow, pos_media;

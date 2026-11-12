-- ID: Q-RO-6
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: stories:numero,classe:numero,tamanho:numero,data_acordada:numero,responsabilidade:numero,origem_demanda:numero,area:numero,sistema:numero,fase_deteccao:numero,severidade:numero,origem_bug:numero
-- Q-RO-6 (O8, O12, O14, O15, O16, O24): preenchimento dos campos T1.3 nas stories ativas
SELECT COUNT(*) AS stories, COUNT(classe_servico) AS classe, COUNT(tamanho_declarado) AS tamanho,
       COUNT(data_acordada) AS data_acordada, COUNT(responsabilidade_atraso) AS responsabilidade,
       COUNT(origem_demanda) AS origem_demanda, COUNT(area_solicitante) AS area, COUNT(sistema) AS sistema,
       COUNT(fase_deteccao) AS fase_deteccao, COUNT(severidade) AS severidade, COUNT(origem_bug) AS origem_bug
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND excluido_em IS NULL;

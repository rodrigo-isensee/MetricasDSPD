-- ID: Q-RO-8
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: base:dominio,campo:dominio,count:numero
-- Q-RO-8 (C1, D1, D3): listas de referência carregadas
SELECT 'bm' AS base, campo, COUNT(*) FROM dspd_bm.ref_dominio WHERE vigente_ate IS NULL AND campo = 'campo_customizado' GROUP BY campo
UNION ALL
SELECT 'ac', campo, COUNT(*) FROM dspd_ac.ref_dominio WHERE vigente_ate IS NULL AND (campo LIKE 'cpe_%' OR campo = 'etapa_fluxo') GROUP BY campo
UNION ALL
SELECT 'ac', 'ref_alvo_prioridade', COUNT(*) FROM dspd_ac.ref_alvo_prioridade;

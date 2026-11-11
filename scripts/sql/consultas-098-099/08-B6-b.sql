-- ID: B6-b
-- FONTE: pg
-- ORIGEM: docs/analises/099-revisao-campos.md §3.6
-- COLUNAS: etapa:dominio,intervalos:numero,chamados:numero
-- B6-b (*) (PostgreSQL): etapas reais que servem de equivalente (espera, reclassificação, causa raiz, escalação),
-- em intervalos e chamados, na janela de 84 dias
SELECT e.etapa, COUNT(*) AS intervalos, COUNT(DISTINCT e.chamado_id) AS chamados
  FROM dspd_ac.fato_etapa_chamado e JOIN dspd_ac.dim_chamado c ON c.chamado_id = e.chamado_id
 WHERE c.fora_do_recorte = false AND c.aberto_em >= now() - interval '84 days'
   AND (e.etapa ILIKE 'Aguardando%' OR e.etapa IN ('Pendente', 'Data Acordada', 'Causa Raiz', 'Revisão',
        'Em Avaliação de Escalação', 'Em Atendimento N2', 'Em Atendimento N3'))
 GROUP BY e.etapa ORDER BY 2 DESC;

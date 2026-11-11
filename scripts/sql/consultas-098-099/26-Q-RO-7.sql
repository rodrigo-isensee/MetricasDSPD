-- ID: Q-RO-7
-- FONTE: pg
-- ORIGEM: docs/analises/099-dado-real-operacional.md §5
-- COLUNAS: chamados:numero,motivo_escalacao:numero,motivo_encerramento:numero,avaliacao_problema:numero,motivo_pendencia:numero,com_previsao:numero,ajuste_prioridade:numero,nivel_resolucao:numero,primeiro_atendimento:numero
-- Q-RO-7 (S5, S6, S7, S9, S11, S1): preenchimento dos campos do chamado na janela de 84 dias
SELECT COUNT(*) AS chamados, COUNT(motivo_escalacao) AS motivo_escalacao, COUNT(motivo_encerramento) AS motivo_encerramento,
       COUNT(avaliacao_problema) AS avaliacao_problema, COUNT(motivo_pendencia_atual) AS motivo_pendencia,
       COUNT(*) FILTER (WHERE previsao_retorno) AS com_previsao, COUNT(*) FILTER (WHERE prioridade_ajustada_manualmente) AS ajuste_prioridade,
       COUNT(nivel_resolucao) AS nivel_resolucao, COUNT(primeiro_atendimento_em) AS primeiro_atendimento
  FROM dspd_ac.dim_chamado
 WHERE fora_do_recorte = false AND aberto_em >= now() - interval '84 days';

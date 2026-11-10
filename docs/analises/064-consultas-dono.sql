-- 064 · Consultas de conferência do mapa de lacunas de dado real (E1.3, K-202)
-- Autor: qa-engineer. Data: 2026-11-04. SOMENTE SELECT, só contagens, nenhuma coluna de pessoa na saída.
-- Como rodar: psql com o papel de leitura do dono, contra a base local, uma consulta por vez (cada bloco é independente).
-- Esquemas: dspd_bm (BusinessMap), dspd_ac (Acelerato), dspd_core (referências comuns). Nunca se cruzam numa consulta.
-- Janela: 12 semanas = 84 dias terminando hoje (now()); troque o intervalo se o filtro da tela for outro.
-- Regra do briefing, não lacuna: abaixo de 20 itens a estatística não é publicada. Os "n >= 20" abaixo só dizem se o cartão sai com número.
-- Cole o resultado de cada bloco no mapa (coluna "resultado na base") ou devolva ao qa-engineer.

-- ======================================================================================================================
-- BLOCO BM · fluxo de projeto (BusinessMap)
-- ======================================================================================================================

-- Q01 · L1 · BLOQUEADOS, O1, O2, O5, faixa "Pede atenção hoje".
-- Total de bloqueios na base, os com motivo (os únicos que a tela lê) e os abertos (fim nulo).
-- Resultado 0 em tudo = a tela diz "nenhum bloqueado" sem que a base tenha sequer um bloqueio carregado (lacuna L1 confirmada na base).
-- Resultado > 0 = alguém carregou bloqueios por fora do código da develop; investigar a origem.
SELECT count(*)                                         AS bloqueios_total,
       count(*) FILTER (WHERE motivo IS NOT NULL)       AS com_motivo_lidos_pela_tela,
       count(*) FILTER (WHERE fim IS NULL)              AS abertos,
       count(*) FILTER (WHERE duracao_horas_uteis IS NOT NULL) AS com_duracao
  FROM dspd_bm.fato_bloqueio;

-- Q02 · L1 · evidência de que o evento de bloqueio também não chega.
-- Linhas em evt_bloqueio (histórico de eventos). 0 = nenhum evento de bloqueio no caminho da coleta.
SELECT (SELECT count(*) FROM dspd_bm.evt_bloqueio) AS evt_bloqueio_linhas;

-- Q03 · portão de leitura de todas as métricas do fluxo (O1 a O13, EI_FL1).
-- Cards que a leitura aceita (criado_em, granularidade e tipo não nulos) contra o total de dim_card.
-- Diferença grande = cards fora do escopo (granularidade nula) ou de tipo que não é item; eles nunca entram em métrica.
SELECT count(*)                                                                        AS dim_card_total,
       count(*) FILTER (WHERE criado_em IS NOT NULL AND granularidade IS NOT NULL AND tipo IS NOT NULL) AS lidos_pelas_metricas,
       count(*) FILTER (WHERE granularidade IS NULL)                                   AS sem_granularidade,
       count(*) FILTER (WHERE tipo IS NULL)                                            AS sem_tipo,
       count(*) FILTER (WHERE excluido_em IS NOT NULL)                                 AS excluidos,
       count(*) FILTER (WHERE arquivado_em IS NOT NULL)                                AS arquivados_ou_descartados
  FROM dspd_bm.dim_card;

-- Q04 · O4, O6, O13 · cards por granularidade e tipo (os tipos que existem de fato; story, frente e projeto nunca se somam).
-- Mostra quais tipos têm massa. 'Defeito em produção' = 0 deixa O13 sem contagem de defeitos.
SELECT granularidade, tipo, count(*) AS cards
  FROM dspd_bm.dim_card
 WHERE criado_em IS NOT NULL AND granularidade IS NOT NULL AND tipo IS NOT NULL AND excluido_em IS NULL
 GROUP BY granularidade, tipo
 ORDER BY granularidade, tipo;

-- Q05 · L2 · colunas de dim_card que a projeção real nunca grava (O6, O8, O10 visão do cliente, O12, O14, O15, O16, O18, filtro de sistema).
-- Cada contagem é de cards story ativos com a coluna preenchida. Tudo 0 (menos comprometido_em) = lacuna L2 confirmada na base.
SELECT count(*)                                              AS story_ativos,
       count(*) FILTER (WHERE comprometido_em IS NOT NULL)   AS com_comprometido_em,
       count(*) FILTER (WHERE classe_servico IS NOT NULL)    AS com_classe_servico,
       count(*) FILTER (WHERE area_solicitante IS NOT NULL)  AS com_area_solicitante,
       count(*) FILTER (WHERE sistema IS NOT NULL)           AS com_sistema,
       count(*) FILTER (WHERE tamanho_declarado IS NOT NULL) AS com_tamanho_declarado,
       count(*) FILTER (WHERE data_acordada IS NOT NULL)     AS com_data_acordada,
       count(*) FILTER (WHERE origem_demanda IS NOT NULL)    AS com_origem_demanda,
       count(*) FILTER (WHERE fase_deteccao IS NOT NULL)     AS com_fase_deteccao,
       count(*) FILTER (WHERE severidade IS NOT NULL)        AS com_severidade,
       count(*) FILTER (WHERE origem_bug IS NOT NULL)        AS com_origem_bug,
       count(*) FILTER (WHERE eh_subtarefa IS NOT NULL)      AS com_eh_subtarefa
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND excluido_em IS NULL AND criado_em IS NOT NULL AND tipo IS NOT NULL;

-- Q06 · L3 · O2 com filtro de uma equipe.
-- O O2 procura o quadro como 'quadro-<equipe>'; a base real usa id numérico. Se quadros_no_formato_semeado = 0 e quadros_distintos > 0,
-- a lista de etapas do O2 sai vazia com equipe filtrada (L3 confirmada na base).
SELECT count(DISTINCT quadro_id)                                       AS quadros_distintos,
       count(DISTINCT quadro_id) FILTER (WHERE quadro_id LIKE 'quadro-%') AS quadros_no_formato_semeado,
       count(DISTINCT equipe)                                          AS equipes_distintas
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story';

-- Q07 · O1, O2, O11 · colunas de referência vigentes por papel e tipo (colunas sem tipo ou sem papel nem entram no cálculo).
-- Esperado: ao menos uma coluna com papel entrega, uma de trabalho e uma de backlog/compromisso. 'entrega' = 0 zera todas as entregas.
SELECT coalesce(papel, '(sem papel)') AS papel, coalesce(tipo_coluna, '(sem tipo)') AS tipo_coluna,
       count(*) AS colunas, count(*) FILTER (WHERE limite_wip > 0) AS com_limite_wip
  FROM dspd_bm.ref_coluna
 WHERE vigente_ate IS NULL
 GROUP BY 1, 2
 ORDER BY 1, 2;

-- Q08 · O1 · limite de WIP por time (soma dos limites das colunas de trabalho e homologação, só workflow ligado a time ativo).
-- Time com soma 0 (ou ausente) = O1 sai "sem-referencia" (sem taxa de aderência). Sem nome de pessoa: time é equipe.
SELECT t.nome AS time, count(*) AS colunas_trabalho_homologacao,
       coalesce(sum(c.limite_wip) FILTER (WHERE c.limite_wip > 0), 0) AS limite_wip_do_time
  FROM dspd_bm.ref_coluna c
  JOIN dspd_bm.ref_time_workflow w ON w.workflow_id = c.workflow_id AND w.vigente_ate IS NULL AND w.situacao = 'time'
  JOIN dspd_bm.ref_time t ON t.time_id = w.time_id AND t.vigente_ate IS NULL AND t.ativo = true
 WHERE c.vigente_ate IS NULL AND c.papel IN ('trabalho', 'homologacao')
 GROUP BY t.nome
 ORDER BY t.nome;

-- Q09 · O2, O3, O5, O9, EI_FL1 · entregas por tipo nas últimas 12 semanas (story).
-- Entrega = última transição do card para coluna de papel 'entrega'. Tipo com n < 20 fica sem percentil (regra do briefing, não lacuna).
-- n = 0 em todos = não há coluna de entrega com transição na janela (conferir Q07 e Q10).
WITH ultima AS (
  SELECT t.card_id, max(t.ocorrido_em) AS entregue_em
    FROM dspd_bm.vw_transicao_canonica t
    JOIN dspd_bm.ref_coluna c ON c.quadro_id = t.quadro_id AND c.coluna_id = t.coluna_destino_id AND c.vigente_ate IS NULL
   WHERE c.papel = 'entrega'
   GROUP BY t.card_id
)
SELECT d.tipo, count(*) AS entregas_12_semanas,
       count(*) FILTER (WHERE d.comprometido_em IS NOT NULL) AS com_comprometido_em,
       (count(*) >= 20) AS passa_de_20
  FROM ultima u
  JOIN dspd_bm.dim_card d ON d.card_id = u.card_id
 WHERE d.granularidade = 'story' AND d.excluido_em IS NULL AND d.tipo IS NOT NULL
   AND u.entregue_em >= now() - interval '84 days'
 GROUP BY d.tipo
 ORDER BY d.tipo;

-- Q10 · O2, O3, O4, O7 · transições existentes (fato canônico) por tipo de coluna e direção, sem valor de linha.
-- 0 transições com tipo_coluna nulo é o esperado na base real (o tipo vale o da versão da coluna no dia, resolvido na leitura).
SELECT count(*) AS transicoes,
       count(*) FILTER (WHERE tipo_coluna IS NULL)  AS sem_tipo_coluna_no_fato,
       count(*) FILTER (WHERE direcao IS NULL)      AS sem_direcao,
       count(DISTINCT card_id)                      AS cards_com_transicao,
       min(ocorrido_em)::date                       AS mais_antiga,
       max(ocorrido_em)::date                       AS mais_recente
  FROM dspd_bm.vw_transicao_canonica;

-- Q11 · O7 · cards story criados por mês nos últimos 6 meses (entrada). Mostra se há massa para o cartão de entrada x saída.
SELECT date_trunc('month', criado_em)::date AS mes, count(*) AS criados
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND excluido_em IS NULL AND tipo IS NOT NULL
   AND criado_em >= date_trunc('month', now()) - interval '6 months'
 GROUP BY 1 ORDER BY 1;

-- Q12 · O10 · backlog não iniciado (cards story sem início, sem arquivamento, sem exclusão) e os com área solicitante.
-- com_area_solicitante = 0 com não_iniciados > 0 = a visão do cliente do O10 repete a do time (L2 confirmada na base).
SELECT count(*) AS nao_iniciados,
       count(*) FILTER (WHERE area_solicitante IS NOT NULL) AS com_area_solicitante,
       (count(*) >= 20) AS passa_de_20
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND excluido_em IS NULL AND arquivado_em IS NULL AND iniciado_em IS NULL AND tipo IS NOT NULL;

-- Q13 · O13 · categorias de tipo de card vigentes (quantos tipos são item e a categoria de cada).
-- Sem a categoria 'defeito_producao' o O13 não tem o que contar.
SELECT eh_item, categoria, count(*) AS tipos
  FROM dspd_bm.ref_tipo_card
 WHERE vigente_ate IS NULL
 GROUP BY eh_item, categoria
 ORDER BY eh_item, categoria;

-- Q14 · O3 (SLE), L5 · referências do fluxo sem carregador na develop: linhas vigentes por tabela.
-- 0 em ref_sle = nota "SLE não definido" no O3 (esperado até a T6.2). 0 em ref_dominio = filtros de sistema, objetivo e área vazios.
SELECT 'ref_sle'             AS tabela, count(*) AS vigentes FROM dspd_bm.ref_sle WHERE vigente_ate IS NULL
UNION ALL SELECT 'ref_limite_frentes',     count(*) FROM dspd_bm.ref_limite_frentes     WHERE vigente_ate IS NULL
UNION ALL SELECT 'ref_alocacao_acordada',  count(*) FROM dspd_bm.ref_alocacao_acordada  WHERE vigente_ate IS NULL
UNION ALL SELECT 'ref_ficha_resultado',    count(*) FROM dspd_bm.ref_ficha_resultado    WHERE vigente_ate IS NULL
UNION ALL SELECT 'ref_dominio (BM)',       count(*) FROM dspd_bm.ref_dominio            WHERE vigente_ate IS NULL
UNION ALL SELECT 'ref_time',               count(*) FROM dspd_bm.ref_time               WHERE vigente_ate IS NULL
UNION ALL SELECT 'ref_time_workflow',      count(*) FROM dspd_bm.ref_time_workflow      WHERE vigente_ate IS NULL;

-- Q15 · frescor de todos os painéis do fluxo · última coleta por tarefa e situação (BusinessMap).
-- Sem 'sucesso' recente o selo de frescor aparece sem última coleta. Inclui a tarefa 'apontamento' (aba Apontamento).
SELECT tarefa, status, count(*) AS coletas, max(finalizado_em) AS ultima_finalizacao
  FROM dspd_bm.ctl_coleta
 GROUP BY tarefa, status
 ORDER BY tarefa, status;

-- ======================================================================================================================
-- BLOCO APONTAMENTO · aba Apontamento (BusinessMap). Só contagens, sem pessoa na saída.
-- ======================================================================================================================

-- Q16 · todos os cartões da aba · apontamentos ativos no período padrão (84 dias) e preenchimento das colunas que a tela usa.
-- ativos = 0 = estado vazio da aba. sem_pessoa_ref > 0 = linhas que não resolvem para pessoa (caem em "Outra área" ou ficam fora do por-pessoa).
-- sem_type_id > 0 = linhas que viram "Sem tipo" e não são opção de filtro. sem_iniciativa = linhas sem projeto (distribuição por projeto).
SELECT count(*)                                              AS apontamentos_ativos,
       round(sum(segundos) / 3600.0, 1)                      AS horas_total,
       count(*) FILTER (WHERE pessoa_ref IS NULL)            AS sem_pessoa_ref,
       count(*) FILTER (WHERE type_id IS NULL)               AS sem_type_id,
       count(*) FILTER (WHERE iniciativa_card_id IS NULL)    AS sem_iniciativa,
       count(*) FILTER (WHERE flags_qualidade <> 0)          AS com_alguma_flag_de_qualidade,
       min(data_apontamento)                                 AS primeira_data,
       max(data_apontamento)                                 AS ultima_data
  FROM dspd_bm.fato_apontamento
 WHERE excluido_em IS NULL AND data_apontamento >= (now() - interval '84 days')::date;

-- Q17 · Distribuição e Achados · apontamentos ativos por subgrupo (código) no período padrão.
-- Subgrupo com menos de 20 apontamentos não publica percentual (regra do briefing). Código ausente em ref_apontamento_subgrupo = rótulo cru.
SELECT a.subgrupo_codigo, r.rotulo IS NOT NULL AS tem_rotulo_no_dicionario, count(*) AS apontamentos
  FROM dspd_bm.fato_apontamento a
  LEFT JOIN dspd_bm.ref_apontamento_subgrupo r ON r.codigo = a.subgrupo_codigo
 WHERE a.excluido_em IS NULL AND a.data_apontamento >= (now() - interval '84 days')::date
 GROUP BY a.subgrupo_codigo, r.rotulo IS NOT NULL
 ORDER BY apontamentos DESC;

-- Q18 · Capacidade e Dia a dia · L7 · calendário e feriados de referência (domínio businessmap, classe apontamento).
-- aplicacao_vigente = 0 e feriados = 0 = a capacidade conta feriado como dia útil (L7 confirmada na base).
SELECT (SELECT count(*) FROM dspd_core.ref_calendario_aplicacao WHERE dominio = 'businessmap' AND classe = 'apontamento' AND vigente_ate IS NULL) AS aplicacao_vigente,
       (SELECT count(*) FROM dspd_core.ref_calendario)         AS calendarios,
       (SELECT count(*) FROM dspd_core.ref_feriado)            AS feriados,
       (SELECT count(*) FROM dspd_core.ref_calendario_turno WHERE vigente_ate IS NULL) AS turnos_vigentes;

-- Q19 · Dia a dia · L6 · quantos dias de pessoa passam do limite atípico de 16 h (constante de código). Só a contagem; a pessoa não aparece.
-- 0 = a marca de valor atípico nunca dispara no período; > 0 = a constante de 16 h já influencia a tela (e os Achados).
SELECT count(*) AS dias_de_pessoa_acima_de_16h
  FROM (SELECT pessoa_ref, data_apontamento
          FROM dspd_bm.fato_apontamento
         WHERE excluido_em IS NULL AND pessoa_ref IS NOT NULL AND data_apontamento >= (now() - interval '28 days')::date
         GROUP BY pessoa_ref, data_apontamento
        HAVING sum(segundos) > 16 * 3600) x;

-- Q20 · aviso "Registro de horas incompleto" (pedido 063) · cards com cobertura incompleta no último estado.
-- 0 = o aviso não aparece. > 0 = há cards cuja coleta de apontamento ficou no teto e a tela deve avisar.
SELECT count(*) AS cards_incompletos
  FROM (SELECT DISTINCT ON (card_id) card_id, estado
          FROM dspd_bm.ctl_apontamento_cobertura
         ORDER BY card_id, cobertura_sk DESC) u
 WHERE u.estado = 'incompleto';

-- Q21 · L12 · a rota do Apontamento depende de configuração do ambiente, não da base: a consulta abaixo só diz se a base tem o que a rota lê.
-- apontamentos_ativos > 0 com a aba mostrando erro = PG_APONTAMENTO_URL ausente no ambiente (conferir no processo da API, sem abrir .env).
SELECT count(*) AS apontamentos_ativos_total FROM dspd_bm.fato_apontamento WHERE excluido_em IS NULL;

-- ======================================================================================================================
-- BLOCO AC · sustentação (Acelerato)
-- ======================================================================================================================

-- Q22 · todos os cartões S · recorte da população: chamados dentro do recorte e preenchimento das colunas que a leitura exige.
-- A leitura só aceita aberto_em e equipe não nulos e fora_do_recorte = false. Compare o total com o aceito.
SELECT count(*)                                                                   AS dim_chamado_total,
       count(*) FILTER (WHERE fora_do_recorte)                                    AS fora_do_recorte,
       count(*) FILTER (WHERE aberto_em IS NOT NULL AND equipe IS NOT NULL AND NOT fora_do_recorte) AS lidos_pelas_metricas,
       count(*) FILTER (WHERE excluido)                                           AS excluidos,
       count(*) FILTER (WHERE com_agente = false)                                 AS sem_agente_fora_do_S2,
       count(*) FILTER (WHERE natureza IS NULL)                                   AS sem_natureza
  FROM dspd_ac.dim_chamado;

-- Q23 · S2 · chamados fechados (status Concluído, com data_finalizado, não excluídos) nos últimos 84 dias, por prioridade.
-- Mostra, por prioridade, quantos têm veredito de SLA de resolução e de primeiro atendimento. n < 20 por prioridade = sem taxa (regra do briefing).
-- sla_pa = 0 com fechados > 0 = a coluna status_sla_pa (nome hipotético, P5) não vem preenchida; o relógio PA fica sem taxa.
SELECT coalesce(prioridade, '(sem prioridade)') AS prioridade, count(*) AS fechados,
       count(*) FILTER (WHERE status_sla_r IS NOT NULL)  AS com_sla_resolucao,
       count(*) FILTER (WHERE status_sla_pa IS NOT NULL) AS com_sla_primeiro_atendimento,
       (count(*) >= 20) AS passa_de_20
  FROM dspd_ac.dim_chamado
 WHERE aberto_em IS NOT NULL AND equipe IS NOT NULL AND NOT fora_do_recorte
   AND status = 'Concluído' AND data_finalizado IS NOT NULL AND NOT excluido AND com_agente
   AND data_finalizado >= now() - interval '84 days'
 GROUP BY 1 ORDER BY 1;

-- Q24 · L9 · colunas de dim_chamado que a projeção não grava (S1, S3, S5, S6, S7, S9, S11, S12, S2).
-- Tudo 0 (e false em ajustada/excecao) = lacuna L9 confirmada. Contagem sobre os chamados do recorte.
SELECT count(*)                                                             AS chamados,
       count(*) FILTER (WHERE primeiro_atendimento_em IS NOT NULL)          AS com_primeiro_atendimento_em,
       count(*) FILTER (WHERE prioridade_ajustada_manualmente)              AS com_prioridade_ajustada,
       count(*) FILTER (WHERE justificativa_informada)                      AS com_justificativa,
       count(*) FILTER (WHERE excecao_sla_registro_posterior)               AS com_excecao_sla,
       count(*) FILTER (WHERE incidente_critico_coordenado)                 AS com_incidente_critico,
       count(*) FILTER (WHERE motivo_escalacao IS NOT NULL)                 AS com_motivo_escalacao,
       count(*) FILTER (WHERE motivo_pendencia_atual IS NOT NULL)           AS com_motivo_pendencia,
       count(*) FILTER (WHERE previsao_retorno IS NOT NULL)                 AS com_previsao_retorno,
       count(*) FILTER (WHERE motivo_encerramento IS NOT NULL)              AS com_motivo_encerramento,
       count(*) FILTER (WHERE avaliacao_problema IS NOT NULL)               AS com_avaliacao_problema,
       count(*) FILTER (WHERE impacto IS NOT NULL OR urgencia IS NOT NULL)  AS com_impacto_ou_urgencia
  FROM dspd_ac.dim_chamado
 WHERE aberto_em IS NOT NULL AND equipe IS NOT NULL AND NOT fora_do_recorte;

-- Q25 · S3 · chamados abertos nos últimos 84 dias por prioridade (n < 20 = sem percentual P1+P2).
SELECT coalesce(prioridade, '(sem prioridade)') AS prioridade, count(*) AS abertos,
       (count(*) >= 20) AS passa_de_20
  FROM dspd_ac.dim_chamado
 WHERE aberto_em IS NOT NULL AND equipe IS NOT NULL AND NOT fora_do_recorte AND NOT excluido AND com_agente
   AND aberto_em >= now() - interval '84 days'
 GROUP BY 1 ORDER BY 1;

-- Q26 · S4 · fechados nos últimos 84 dias por prioridade e nível de resolução.
-- nivel_resolucao nulo em todos = S4 sem percentual por célula.
SELECT coalesce(prioridade, '(sem prioridade)') AS prioridade, coalesce(nivel_resolucao, '(sem nível)') AS nivel_resolucao, count(*) AS fechados
  FROM dspd_ac.dim_chamado
 WHERE aberto_em IS NOT NULL AND equipe IS NOT NULL AND NOT fora_do_recorte AND NOT excluido
   AND status = 'Concluído' AND data_finalizado >= now() - interval '84 days'
 GROUP BY 1, 2 ORDER BY 1, 2;

-- Q27 · S4, S10, L10 · intervalos de etapa por etapa (derivados do total por etapa, terminando em data_finalizado).
-- 'Aguardando atribuição' com 0 linhas = S10 vazio. Etapas 'Em atendimento N1/N2/N3' = base do tempo por nível do S4.
SELECT etapa, count(*) AS intervalos, count(DISTINCT chamado_id) AS chamados,
       count(*) FILTER (WHERE saida IS NULL) AS sem_saida,
       count(*) FILTER (WHERE motivo_pendencia IS NOT NULL) AS com_motivo_pendencia
  FROM dspd_ac.fato_etapa_chamado
 GROUP BY etapa
 ORDER BY etapa;

-- Q28 · S8 · incidentes abertos nos últimos 84 dias por valor do campo de reincidência em 90 dias.
-- Só 'sim' e 'nao' contam como informados? (decisão D-10: 'nao' e 'sem_resposta' contam como não reincidentes.) Tudo nulo = S8 sai "sem campo".
SELECT coalesce(reincidente_90d, '(nulo)') AS reincidente_90d, count(*) AS incidentes
  FROM dspd_ac.dim_chamado
 WHERE aberto_em IS NOT NULL AND equipe IS NOT NULL AND NOT fora_do_recorte AND NOT excluido
   AND natureza = 'incidente' AND aberto_em >= now() - interval '84 days'
 GROUP BY 1 ORDER BY 1;

-- Q29 · S1, L8 · referências do Acelerato: prazos por prioridade e domínio que define o recorte.
-- ref_alvo_prioridade = 0 mantém S1 "Sem dado real". Compare os domínios com o texto fixo da tela (organização DSPD Sustentação,
-- tipo DSPD - SSSC, equipes SSSC TOTVS, SENIOR e FLUIG): divergência = L8.
SELECT 'ref_alvo_prioridade' AS tabela, '-' AS campo, count(*) AS vigentes FROM dspd_ac.ref_alvo_prioridade WHERE vigente_ate IS NULL
UNION ALL
SELECT 'ref_dominio (AC)', campo, count(*) FROM dspd_ac.ref_dominio WHERE vigente_ate IS NULL GROUP BY campo
ORDER BY 1, 2;

-- Q30 · L8 · valores distintos de organização, tipo e equipe dos chamados do recorte (contagem por valor), para comparar com o texto da tela.
SELECT 'organizacao' AS campo, coalesce(organizacao, '(nulo)') AS valor, count(*) AS chamados FROM dspd_ac.dim_chamado WHERE NOT fora_do_recorte AND NOT excluido GROUP BY 2
UNION ALL
SELECT 'tipo', coalesce(tipo, '(nulo)'), count(*) FROM dspd_ac.dim_chamado WHERE NOT fora_do_recorte AND NOT excluido GROUP BY 2
UNION ALL
SELECT 'equipe', coalesce(equipe, '(nulo)'), count(*) FROM dspd_ac.dim_chamado WHERE NOT fora_do_recorte AND NOT excluido GROUP BY 2
ORDER BY 1, 3 DESC;

-- Q31 · frescor da sustentação · última coleta por tarefa e situação (Acelerato).
SELECT tarefa, status, count(*) AS coletas, max(finalizado_em) AS ultima_finalizacao
  FROM dspd_ac.ctl_coleta
 GROUP BY tarefa, status
 ORDER BY tarefa, status;

-- ======================================================================================================================
-- BLOCO CORE · pesquisa de percepção (terceira fonte; não é BusinessMap nem Acelerato)
-- ======================================================================================================================

-- Q32 · PV1 · L11 · cargas da pesquisa. 0 = "sem pesquisa" (esperado, decisão Q2 "A").
SELECT count(*) AS cargas, max(trimestre) AS ultimo_trimestre FROM dspd_core.pesq_carga;

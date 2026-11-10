-- SQL versionado do coletor do Acelerato (ADR 0023, itens 4 a 6). Copia EXATA das constantes de
-- server/src/modulos/acelerato/sql.ts: um teste compara os dois e o SHA-256 do texto vai em ctl_coleta.parametros.
-- Mudar qualquer consulta é mudança de critério (T2.6). "?" = placeholder; <lista> = expansão em "?, ?, ?" pela quantidade.
-- Sem ponto e vírgula: cada consulta é um bloco separado por linha em branco; os comentários "-- Qn" abrem o bloco.

-- Q1 chamados (uma página)
SELECT ticket_key, tipo_ticket_key, tipo_ticket, status_key, status, encerrado,
       categoria_key, categoria, organizacao_key, organizacao, equipe_key, equipe,
       (agente_key IS NOT NULL) AS com_agente,
       prioridade, data_criacao, data_atualizacao, data_pronto, lixeira, arquivado,
       suspenso, impedido, tempo_vida_dias, tempo_ciclico_dias,
       sla_pa_tempo_min, sla_pa_saldo_min, sla_pa_prazo_min, sla_pa_violado, sla_pa_status,
       sla_r_saldo_min, sla_r_prazo_min, sla_r_violado, sla_r_status,
       data_primeiro_comentario, primeiro_comentario_min_uteis,
       sincronizado_em, estatisticas_em
FROM ACELERATO_CHAMADOS
WHERE tipo_ticket_key IN (<tipos>) AND organizacao_key IN (<organizacoes>) AND equipe_key IN (<equipes>)
  AND data_atualizacao >= ?
  AND (data_atualizacao > ? OR (data_atualizacao = ? AND ticket_key > ?))
ORDER BY data_atualizacao, ticket_key
LIMIT 1000

-- Q2 etapas dos chamados da página
SELECT c.ticket_key, e.etapa_key, e.descricao, e.descricao_workflow, e.tempo_sla, e.quantidade_vezes
FROM ACELERATO_CHAMADOS c,
     JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]' COLUMNS (
       etapa_key BIGINT PATH '$.etapaKey', descricao VARCHAR(255) PATH '$.descricao',
       descricao_workflow VARCHAR(255) PATH '$.descricaoWorkflow',
       tempo_sla BIGINT PATH '$.tempoSla', quantidade_vezes INT PATH '$.quantidadeDeVezes')) e
WHERE c.ticket_key IN (<chaves>)

-- Q3 campos por nome exato
SELECT c.ticket_key, f.nome, f.valor
FROM ACELERATO_CHAMADOS c,
     JSON_TABLE(c.campos_personalizados, '$[*]' COLUMNS (
       nome VARCHAR(255) PATH '$.nomeCampo', valor VARCHAR(80) PATH '$.valor')) f
WHERE c.ticket_key IN (<chaves>) AND f.nome IN (<nomes>)

-- Q4 contagem fora das organizações do recorte
SELECT COUNT(*) AS n FROM ACELERATO_CHAMADOS
WHERE tipo_ticket_key IN (<tipos>) AND equipe_key IN (<equipes>) AND organizacao_key NOT IN (<organizacoes>)

-- Q5 saída do recorte (releitura semanal)
SELECT ticket_key, tipo_ticket_key, organizacao_key, equipe_key, lixeira, data_atualizacao
FROM ACELERATO_CHAMADOS
WHERE ticket_key IN (<ids>)

-- Q6 campos de etapa de tratamento lista, por nome exato (F3; a lista de nomes é constante do código); kanban_status_key é só o inteiro da chave da etapa, usado para achar a posição no desenho do fluxo (L9-c, decisão B), e não é gravado
SELECT c.ticket_key, f.nome, f.tipo, f.valor, f.kanban_status_key
FROM ACELERATO_CHAMADOS c,
     JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
       nome VARCHAR(255) PATH '$.nome', tipo VARCHAR(40) PATH '$.tipo', valor VARCHAR(80) PATH '$.valor',
       kanban_status_key BIGINT PATH '$.kanbanStatusKey' NULL ON EMPTY NULL ON ERROR)) f
WHERE c.ticket_key IN (<chaves>) AND f.nome IN (<nomes>)
ORDER BY c.ticket_key, f.nome, f.kanban_status_key

-- Q7 campos de etapa de tratamento preenchido (F3): só o booleano sai do MySQL, nunca o valor
SELECT c.ticket_key, f.nome, (f.valor IS NOT NULL AND CHAR_LENGTH(TRIM(f.valor)) > 0) AS preenchido
FROM ACELERATO_CHAMADOS c,
     JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (
       nome VARCHAR(255) PATH '$.nome', valor VARCHAR(4000) PATH '$.valor')) f
WHERE c.ticket_key IN (<chaves>) AND f.nome IN (<nomes>)

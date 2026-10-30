# Respostas ao questionário sobre a tabela do Acelerato (UNIFIQUE.ACELERATO_CHAMADOS)

Entrada do dono no pedido 056 (2026-10-30), respondendo pelo time de ciência de dados às 19 perguntas do plano `docs/architecture/features/056-acelerato-mysql.md` §6.1 e do modelo de ameaças `docs/security/056-acelerato-mysql-ameacas.md` §6. Coleta feita só com SELECT e SHOW, sem credenciais e sem dado de chamado (só estrutura, domínios e contagens). Itens "NÃO SEI" dependem do time de dados, da infra ou do dono. Guardado sem alteração de conteúdo, só com acentos e formatação em Markdown.

## Bloco A: dados

### 1. Atualização
- Carga incremental (não recarrega tudo). Em 30/10, `sincronizado_em` tocou 562 linhas; nos dias comuns de outubro foram de dezenas a cerca de 1.000 linhas por dia.
- Exceção: carga em massa de 20 a 22/10 (cerca de 269 mil linhas), parece um backfill.
- Horário: roda continuamente, em lotes de minuto cheio (ex.: 15:43:00). Diferença entre `sincronizado_em` e `data_atualizacao`: 0 a 12 min (média 10,5), então o ciclo deve ser de 10 a 15 min (inferência).
- `data_atualizacao` = hora em que o chamado mudou no Acelerato. `sincronizado_em` = hora em que a carga gravou a linha. `estatisticas_em` tem o mesmo valor de `sincronizado_em`. Em 1 linha a atualização é 2 s posterior à carga (mudou durante o lote).
- `ticket_key` é único: 292.063 linhas = 292.063 chaves distintas. Que nunca muda: não dá para provar pelo banco.
- Excluídos continuam na tabela: `lixeira=1` em 60.958 linhas, `arquivado=1` em 226.113 linhas. Não foi observada remoção física.
- `estatisticas` é nula em 31.369 linhas (10,7%).

### 2. Campos personalizados (`campos_personalizados`)
- 759 nomes distintos na tabela inteira (inclui muitos `*_LOGIN`).
- Para `tipo_ticket = 'DSPD - SSSC'` são 20 nomes: Urgência:; Impacto:; Complemento do Problema; Este problema já ocorreu nos últimos 90 dias?; Selecione a Filial; Benefícios Quantitativos; Diretoria; Gerência; Tendência; Urgência; Gravidade; Áreas Impactadas; Objetivo Estratégico (Detalhes na Descrição); Objetivos Qualitativos; Selecione os Sistemas; Benefícios Qualitativos; Número do ticket anterior; Caso objetivo estratégico igual a 4, indicar Lei; Informe abaixo:; Público afetado:.
- A lista completa dos 759 nomes pode ser extraída para arquivo se necessário.

### 3. Etapas (`estatisticas.workflow.etapas` e `campos_personalizados_etapa`)
- Uma entrada por etapa, não por passagem. Chaves: `etapaKey`, `tempoSla` (segundos), `descricao`, `tempoSlaHoras` ("HH:MM"), `descricaoWorkflow`, `quantidadeDeVezes`. O número de passagens está em `quantidadeDeVezes` (até 14 em Aguardando Solicitante, até 8 em Em Análise).
- Não há hora de entrada nem de saída. Reabertura por transição não dá para derivar; só existe a contagem de passagens.
- Vale para chamados abertos: sim (ex.: chamado só com "Novo", 12 min). Todos os 6.372 chamados SSSC com `estatisticas` têm etapas (33.310 entradas).
- `tempoSla`: soma das etapas não finais = média de 6.770 min, contra 16.926 min de relógio entre criação e fechamento (cerca de 40%). Compatível com tempo útil descontando pausas, mas o banco não prova a regra. Confirmar com o Acelerato.
- Cuidado: `sla_r_tempo_min` tem média negativa (−55.948). Não usar como tempo decorrido.
- `campos_personalizados_etapa`: lista de `{nome, tipo, valor, obrigatorio, kanbanStatusKey}`, preenchida em 6.086 de 6.904 chamados SSSC. Campos relevantes para S5, S6, S7, S9 e S11 (ocorrências): Motivo de Pendência (451); Previsão de retorno (451); Motivo da Escalação (451); Qual suporte foi acionado? (4.923); Nº do Ticket Terceiros? (4.923); Prioridade ajustada manualmente? (451); Se a prioridade foi ajustada, justifique (451); Classifique o chamado no Tipo de Prioridade corretamente! (477); Avaliação de Problema (450); Motivo de Encerramento (925); Categoria de solução (6.333).

### 4. Prioridade (população SSSC)
- Fila nova: `SSSC - REQUISICAO|INCIDENTE - NORMAL/BAIXA/MEDIA/ALTA/URGENTE` e `SSSC - PADRAO`.
- Fila antiga: `DSPD - INCIDENTE|REQUISICAO - NORMAL/BAIXA/MEDIA/ALTA/URGENTE`.
- Escala P: P1 - CRÍTICO, P2 - ALTO, P3 - MÉDIO, P4 - BAIXO, P5 - PLANEJADO/MUITO BAIXO.
- Outros: DHO - ALTA, CONTABILIDADE - PADRAO, PROJETO NOVA ERA - PADRAO e 29 chamados com prioridade vazia.
- A tabela inteira tem 157 valores, a maioria de outras áreas e de clientes.

### 5. Suspenso e impedido
- Na população SSSC: `suspenso=0` e `impedido=0` em todos os 6.904 chamados. `estatisticas.impedimentos` vem como `{"total":"","usuarios":[]}` nos exemplos.
- Não dá para dizer se pausam o relógio do SLA, porque nada está marcado. Quem administra o Acelerato responde.

### 6. Primeiro comentário
- A tabela guarda só datas e minutos úteis, sem autor nem tipo. Não dá para distinguir comentário automático de humano.
- Indício: 546 de 6.013 chamados (9%) têm primeiro comentário em até 1 min da criação, o que parece automático. 337 chamados não têm comentário. Nenhum primeiro comentário é anterior à criação.

### 7. Registro de Problema (S11)
- Não existe coluna de vínculo. Candidatos: campo "Número do ticket anterior" (17 chamados), "Avaliação de Problema" (campo de etapa, 450) e "Complemento do Problema" (350). Não dá para confirmar qual é o vínculo.

### 8. Aviso de mudança de estrutura
- NÃO SEI. As 50 colunas estão sem comentário.

### 9. Tamanho
- 292.063 linhas no total; a organização "UNIFIQUE - DSPD SUSTENTAÇÃO E PEQUENAS MELHORIAS" tem 5.285 e "UNIFIQUE - DSPD - INTERNO" 1.001; a maior parte é de outras organizações (inclusive clientes externos), cada uma das 36 menores com menos de 300.

## Bloco B: segurança

### 10. Usuário dedicado
- Hoje: a conta usada tem host `'%'` (sem restrição de host). Grants: SELECT e SHOW VIEW apenas em `UNIFIQUE.ACELERATO_CHAMADOS`.
- Não existe view filtrada. Criar usuário ou view exige o DBA.

### 11. TLS
- Servidor com SSL (`have_ssl=YES`). A sessão de teste reportou a cifra `TLS_AES_256_GCM_SHA384`.
- `require_secure_transport = OFF`.
- Não foi possível ver `REQUIRE SSL` do usuário nem obter a CA (sem acesso à tabela de usuários do MySQL). O cliente de teste não validou o certificado.

### 12. Caminho de rede
- NÃO SEI. Endereço na faixa interna 10.x, porta não padrão. O dono deve informar se é rede interna ou VPN.

### 13. Dados de pessoa e texto livre (além de agente, agente_email, solicitante, solicitante_email, solicitantes, titulo, raw e url)
- `raw`: descrição (texto livre), reporter, seguidores, solicitantes (nome, e-mail, usuarioKey).
- `estatisticas.impedimentos.usuarios` pode listar pessoas.
- `campos_personalizados`: "Acelerato - Atendente", "Acelerato - Solicitante", Cargo, Bairro, "Complemento do Problema".
- `campos_personalizados_etapa.valor`: texto livre (ex.: "Inclua um Comentário").
- O texto dos comentários não é armazenado, só as datas.
- Comentários de coluna: todos vazios, sem exemplo de dado real.

### 14. Escopo da tabela
- Não é só DSPD. São dezenas de organizações, inclusive clientes externos.
- O tipo `'DSPD - SSSC'` tem 6.904 linhas, em 6 organizações.

### 15. Limites do usuário
- `max_execution_time = 0` (sem limite), `wait_timeout = 28800` s, `max_connections = 151` (global do servidor).
- Limite por usuário, horário permitido e política de senha: não visível.

### 16. Acesso de terceiros, base legal (LGPD) e retenção
- NÃO SEI.

### 17. Peso da consulta e horário
- Tempo das consultas e índices não medidos.
- O dash faz 3 SELECT só da população SSSC (cerca de 7 mil linhas; uma delas traz a coluna JSON `estatisticas`).
- Horário preferido: NÃO SEI. A carga roda o dia todo; a tabela nunca fica parada.

## Bloco C: sobre o dash

### 18. S5, S6, S7 e S11
- Não existem em nenhuma aba do dash (abas: SLA, Abertos, Reincidência, Aging, Custo).
- Fontes candidatas (ainda não testadas): S5 pendências: Motivo de Pendência, Previsão de retorno; S6 escalação: Motivo da Escalação, "Qual suporte foi acionado?", etapa Aguardando Suporte Terceiros; S7 reclassificação: Prioridade ajustada manualmente?, justificativa; S11 aderência: Avaliação de Problema (o mais incerto).

### 19. Campo "Já ocorreu nos últimos 90 dias?"
- Não é obrigatório para todos: aparece em 171 de 6.350 chamados SSSC não excluídos (2,7%).
- Se é obrigatório para algum tipo específico: não verificado.

## Correções sobre a documentação do dash (`acelerato-dash-atual.md`)
- Separação por fila: o dash usa a organização para separar fila nova e antiga, mas a organização "SUSTENTAÇÃO E PEQUENAS MELHORIAS" também contém prioridades do fluxo antigo (`DSPD - INCIDENTE - NORMAL`, 920 chamados). A separação por organização pode estar misturando os dois fluxos. Conferir antes de reproduzir.
- `sla_r_tempo_min` com média negativa (item 3) também vale para aquele documento.

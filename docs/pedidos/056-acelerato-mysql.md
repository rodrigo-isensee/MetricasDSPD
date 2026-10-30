# Pedido 056: conexão com o Acelerato pela tabela MySQL

- **Modo:** analisar (sobe para planejar ou implementar só com o dono)
- **Objetivo:** "do acelerato eu tenho uma tabela no mysql, quero fazer a conexao tambem" (dono, 2026-10-30)
- **Clareza:** 3 confirmados; 0 suposições; 0 perguntas
- **Depende de:** nenhum (o pedido 052, BusinessMap, segue em paralelo)

## Escopo
- E1. Leitura do Acelerato pela tabela MySQL do dono, só leitura · `confirmado` (dono, "B", 2026-10-30)
- E2. Mudança da regra inviolável do `CLAUDE.md` do projeto que hoje manda ler o Acelerato só pela API pública · `confirmado` (consequência direta da "B")
- E3. Discovery da fonte (o que é a tabela, colunas, dado de pessoa, credencial, usuário só leitor) antes de qualquer código · `técnico` (R-DISCOVERY, R-SEGURANCA)

## Etapas
- E3.0 (tech-lead): worktree `/home/rodrigoisensee/MetricasDSPD-056` e branch `docs/056-acelerato-discovery` a partir da `develop`, com push, sem commit e sem testes (onde a E3.2 e a E3.3 escrevem).
- E3.1 (dono): rodar no terminal a consulta só de estrutura da tabela (nomes e tipos das colunas e total de linhas, sem nenhuma linha de dado) e colar a saída; contar, se quiser, quais painéis o dash atual do Acelerato tem e de onde vem cada número.
- E3.2 (software-architect): com a estrutura colada e o catálogo de métricas de sustentação do briefing, o mapeamento coluna da tabela → métrica (quais saem direto, quais precisam de cálculo, quais faltam), o desenho do coletor MySQL só leitura e incremental e o que muda na ADR 0013, no data-model §4 e no metabase-acelerato-configuracao; lista de perguntas ao time de ciência de dados; em docs, sem commit.
- E3.3 (security-engineer): modelo de ameaças da fonte MySQL (usuário só leitor, credencial no .env, colunas de pessoa barradas na fronteira por lista fechada), em paralelo à E3.2, em docs, sem commit.
- E2.0 (tech-lead): `pnpm install --frozen-lockfile` em prioridade baixa (nice) na worktree `/home/rodrigoisensee/MetricasDSPD-056` e no clone principal, e push da `docs/056-acelerato-discovery` e da `docs/jarvis-2026-10-23` (o pre-push exige as dependências), sem commit novo e sem testes além do pre-push.
- E3.4 (software-architect): atualizar o plano da E3.2 com as decisões D-2 a D-6 do dono e com `docs/integracao/acelerato-dash-atual.md` (o que o dash resolve das perguntas, o que não é reproduzido por ser individual, o que muda na reconciliação), encurtando as perguntas ao time de ciência de dados; em docs, sem commit.
- E3.5 (software-architect): atualizar o plano com as decisões D-7 a D-10 do dono e com `docs/integracao/acelerato-respostas-ciencia-de-dados.md` (filtro na origem por tipo DSPD - SSSC, campos de etapa para S5, S6, S7 e S11, `quantidadeDeVezes`, cobertura de 2,7% do campo dos 90 dias, separação das filas, `sla_r_tempo_min` negativo), marcando o plano como pronto para validação; em docs, sem commit.
- E3.6 (security-engineer): revisar o modelo de ameaças com as respostas (conta com só SELECT e SHOW VIEW na tabela e host aberto, TLS disponível sem CA, colunas e campos de pessoa novos em `raw`, `campos_personalizados`, `campos_personalizados_etapa` e `estatisticas.impedimentos`, clientes externos na tabela), em paralelo à E3.5; em docs, sem commit.
- E2.1 (tech-lead): mudança da regra do CLAUDE.md (Acelerato pela tabela MySQL do time de ciência de dados, só leitura) junto com o commit, o review e o PR dos documentos da E3.2 e da E3.3 para a develop.
- E1.1 (dono): validar o plano; depois dele, as etapas de código (coletor) entram neste pedido.

## Fora do escopo
- Escrever no MySQL ou no Acelerato · `confirmado` (dono, "B": só leitura)
- Misturar Acelerato e BusinessMap em qualquer cálculo · `confirmado` (regra inviolável do CLAUDE.md)

DECISÃO DO DONO (2026-10-30): "B" (pergunta 1, como ler o Acelerato): permitir a leitura da tabela MySQL, só leitura e com usuário de banco só leitor; muda a regra do CLAUDE.md que manda ler o Acelerato só pela API pública. Discovery novo da fonte com o software-architect e o security-engineer antes de qualquer código; credencial só no .env.
DECISÃO DO DONO (2026-10-30): "B" (pergunta 2, o que é a tabela): "o time de ciencia de dados mantem uma tabela com todas as infos que precisamos" (cópia mantida pelo time de ciência de dados, não o banco do próprio Acelerato). Frequência de atualização, guarda de histórico e colunas de pessoa ficam para o discovery, com o time de ciência de dados.
DECISÃO DO DONO (2026-10-30): "A" (pergunta 3, prioridade): o Acelerato entra agora, em paralelo ao 052 (discovery e depois código), sem misturar as fontes; supera, só neste ponto, o "Acelerato e sustentação: pedido seguinte" de 2026-10-29 (pedido 052).
DECISÃO DO DONO (2026-10-30): "sim" (recibo do 056 aceito), com o pedido: "essa e a tabela que tem todos os dados olhe ela e veja como colocar as infos das metricas ai, porque ja tenho um dash que roda em cima so para o acelerato".

## Estrutura da tabela (E3.1, colada pelo dono em 2026-10-30 14:26)
Só nomes e tipos das colunas (saída do SHOW COLUMNS); nenhuma linha de dado. Total de linhas não informado. Nome da tabela e dados de conexão ficam só no .env do dono.

| Coluna | Tipo | Nulo | Chave |
|---|---|---|---|
| ticket_key | bigint | NO | PRI |
| tipo_ticket_key | int | YES | MUL |
| tipo_ticket | varchar(255) | YES | |
| titulo | varchar(1000) | YES | |
| status_key | int | YES | |
| status | varchar(255) | YES | MUL |
| encerrado | tinyint(1) | YES | |
| categoria_key | int | YES | |
| categoria | varchar(500) | YES | |
| organizacao_key | int | YES | |
| organizacao | varchar(255) | YES | |
| equipe_key | int | YES | |
| equipe | varchar(255) | YES | |
| agente_key | int | YES | |
| agente | varchar(255) | YES | |
| agente_email | varchar(255) | YES | |
| solicitante | varchar(255) | YES | |
| solicitante_email | varchar(255) | YES | |
| prioridade | varchar(255) | YES | |
| origem | varchar(100) | YES | |
| data_criacao | datetime | YES | |
| data_atualizacao | datetime | YES | MUL |
| data_pronto | datetime | YES | |
| lixeira | tinyint(1) | YES | |
| arquivado | tinyint(1) | YES | |
| suspenso | tinyint(1) | YES | |
| impedido | tinyint(1) | YES | |
| tempo_vida_dias | int | YES | |
| tempo_ciclico_dias | int | YES | |
| url | varchar(500) | YES | |
| sla_pa_tempo_min | int | YES | |
| sla_pa_saldo_min | int | YES | |
| sla_pa_prazo_min | int | YES | |
| sla_pa_violado | tinyint(1) | YES | |
| sla_pa_status | varchar(50) | YES | |
| sla_r_tempo_min | int | YES | |
| sla_r_saldo_min | int | YES | |
| sla_r_prazo_min | int | YES | |
| sla_r_violado | tinyint(1) | YES | |
| sla_r_status | varchar(50) | YES | |
| data_primeiro_comentario | datetime | YES | |
| primeiro_comentario_min_uteis | int | YES | |
| tempo_workflow_total | varchar(50) | YES | |
| solicitantes | json | YES | |
| campos_personalizados | json | YES | |
| campos_personalizados_etapa | json | YES | |
| estatisticas | json | YES | |
| raw | json | YES | |
| sincronizado_em | datetime | YES | |
| estatisticas_em | datetime | YES | |

## Suposições
- nenhuma

## Histórico
- 2026-10-30: pedido aberto; PERGUNTA 1 (fonte do Acelerato: API, MySQL ou as duas) respondida com "B". Fila: pergunta 2 (o que é a tabela) e pergunta 3 (prioridade em relação ao 052).
- 2026-10-30 13:17: PERGUNTA 2 respondida: tabela mantida pelo time de ciência de dados (opção B). Fila: pergunta 3 (prioridade).
- 2026-10-30 13:21: PERGUNTA 3 respondida com "A". Recibo enviado ao dono.
- 2026-10-30 13:33: o dono gravou as variáveis ACELERATO_MYSQL_* (nomes provisórios) no .env deste computador ("env feito"); o Jarvis não leu o .env. Recibo do 056 ainda sem resposta.
- 2026-10-30 13:40: recibo aceito; o dono pede que o time olhe a tabela e mapeie as métricas (já existe um dash do Acelerato sobre ela). DECISÃO TÉCNICA (Jarvis): o time olha só a estrutura (nomes e tipos das colunas), que o dono roda e cola (E3.1), sem ler linha de dado, por causa das colunas de pessoa (CLAUDE.md) e porque nenhum agente lê o .env; o mapeamento coluna → métrica fica com o software-architect (E3.2). Etapas abertas.
- 2026-10-30 13:54: o dono informa que o dash atual sobre a tabela "mostra o que estava no briefing exatamente" (as métricas de sustentação do briefing). Entra na E3.2 como base do mapeamento; falta a estrutura da tabela (E3.1).
- 2026-10-30 13:54: DECISÃO TÉCNICA (Jarvis): aberta a E3.0 (worktree e branch do discovery com o tech-lead, sem testes, por causa do pedido do dono de reduzir CPU); a E3.2 e a E3.3 começam depois dela, em paralelo, só documentos.
- 2026-10-30 13:56: brief tech-lead-1 (E3.0) aprovado pelo conferente na rodada 1; delegado (o nome docs/* segue o precedente das branches de discovery 052).
- 2026-10-30 13:57: E3.0 entregue em parte pelo tech-lead: worktree /home/rodrigoisensee/MetricasDSPD-056 e branch local docs/056-acelerato-discovery em 11141d7; push recusado pelo pre-push (lint sem node_modules; o brief proibia pnpm install). DECISÃO TÉCNICA (Jarvis): a E3.2 e a E3.3 escrevem na worktree local, sem push; o push vai junto com a E2.1, com pnpm install em prioridade baixa quando o dono liberar CPU. Sem commit, sem conferência de entrega (R-PROVA).
- 2026-10-30 13:59: brief security-engineer-1 (E3.3) aprovado pelo conferente na rodada 1; delegado.
- 2026-10-30 14:03: E3.3 entregue pelo security-engineer: docs/security/056-acelerato-mysql-ameacas.md na worktree 056 (sem commit), M1 a M10, controles e casos de abuso CA-1 a CA-10; lista de colunas barradas provisória até a E3.1. PERGUNTA: 3 ao dono (§6): onde roda a coleta; credencial própria e não a do dash; cálculo em memória se uma métrica depender de pessoa. 9 perguntas ao time de ciência de dados, levadas pelo dono. Sem commit, sem conferência de entrega (R-PROVA).
- 2026-10-30 14:23: DECISÃO DO DONO (pergunta 1 do §6 do modelo de ameaças, onde roda a coleta): "A": a coleta do Acelerato roda só na máquina do dono (credencial no .env local, banco local), como a do BusinessMap (S-3 = Q-4 A do 052); servidor e homologação não tocam o MySQL do time de ciência de dados. Observação do Jarvis: a conexão que funciona hoje usa uma conta de desenvolvimento compartilhada; para olhar a estrutura ela serve, para o coletor fica a recomendação M1 (usuário próprio só com SELECT), pergunta 1 ao time de ciência de dados. Próxima ao dono: pergunta 2 do §6 (credencial do dash).
- 2026-10-30 14:24: DECISÃO DO DONO (pergunta 2 do §6, credencial): "B": o coletor usa por enquanto a conta de desenvolvimento compartilhada que já conecta; risco M1 aceito pelo dono e registrado; troca por usuário próprio só com SELECT quando o time de ciência de dados criar (pendência antes da coleta agendada, como a chave do BusinessMap). Mitigação do time: consulta fixa só SELECT, parametrizada, sem multi-comando nem LOCAL INFILE, TLS verificado, credencial só no .env. Próxima ao dono: pergunta 3 do §6 (cálculo em memória).
- 2026-10-30 14:25: DECISÃO DO DONO (pergunta 3 do §6, métrica que dependa de pessoa): "A": mesmo padrão do BusinessMap (ADR 0020): o dado de pessoa só existe em memória durante a coleta e na base vai só o resultado agregado (contagem, sim ou não), sem identificar ninguém; nenhuma métrica individual. Perguntas do §6 ao dono encerradas. Falta a E3.1 (estrutura da tabela) para a E3.2.
- 2026-10-30 14:26: E3.1 feita pelo dono: estrutura da tabela (50 colunas, só nomes e tipos) gravada na seção "Estrutura da tabela" deste pedido. Segue a E3.2.
- 2026-10-30 14:30: brief software-architect-1 (E3.2) aprovado pelo conferente na rodada 1; delegado.
- 2026-10-30 14:34: E3.2 entregue pelo software-architect: docs/architecture/features/056-acelerato-mysql.md na worktree 056 (proposta, sem commit). 50 colunas classificadas (36 lidas, 3 json só em memória por caminho fixo, 11 barradas); 12 métricas mapeadas (S2, S3 e volume da S12 saem hoje; S1 depois de respostas; S5, S6, S7, S11 dependem do json; S4, S8, S9, S10 pendentes sem intervalos de etapa); coletor incremental paginado por data_atualizacao e ticket_key; ADR nova proposta para substituir o §4 da 0013. D-1 (filtro por agente da T5.1) recusado pelo arquiteto por ferir a regra inviolável e a ADR 0020, sinalizado ao dono. PERGUNTA na fila: D-2 a D-6 ao dono (SLA da ferramenta ou recalculado; tempo de SLA; recorrente e reincidência; o que o dash mostra de fato contra o §3.3; reconciliação de 1%). 18 perguntas de dados ao time de ciência de dados (bloqueantes P-DS-1, 2, 4, 5 e 10). Risco: driver MySQL é dependência nova.
- 2026-10-30 14:36: DECISÃO DO DONO (D-5, o que o dash mostra): "A": o dash atual mostra as 12 métricas de sustentação do briefing (S1 a S12) já calculadas; a §3.3 do briefing (S1 a S12 ainda não existem) está desatualizada nesse ponto. Consequência para a E3.2: o dash vira referência de reconciliação (D-6).
- 2026-10-30 14:37: DECISÃO DO DONO (D-2, veredito de SLA): "A": o veredito vem das colunas da ferramenta (sla_r_status e sla_pa_status, conferidos com *_violado), como no briefing §3.2; a biblioteca só agrega. Próxima: D-3.
- 2026-10-30 14:40: DECISÃO DO DONO (D-3, tempos): "A": MTTA e tempo de resolução calculados pela biblioteca a partir dos instantes, em horas úteis; o relógio da ferramenta (sla_*_tempo_min, primeiro_comentario_min_uteis) só para reconciliação. Próxima: D-4.
- 2026-10-30 14:44: DECISÃO DO DONO (D-4, recorrente na S12): "A": recorrente por categoria (volume alto e repetido na janela de 12 semanas; o limiar exato o dono define na montagem do painel); sem dado de pessoa. A S8 segue pendente do histórico de etapas (P-DS-5, T4.2). Próxima: D-6.
- 2026-10-30 14:46: DECISÃO DO DONO (D-6, referência da reconciliação de 1%): "A": contra o dash atual, com a condição de o dash usar a mesma população do briefing §3.2 (a confirmar na reconciliação). Perguntas D-2 a D-6 encerradas (D-1 recusado pela regra inviolável). Próximos: o software-architect incorpora as decisões ao plano (E3.2, volta) antes da validação do dono (E1.1); a E2.1 (commit, CLAUDE.md, review e PR) precisa de pnpm install na worktree 056 por causa do pre-push.
- 2026-10-30 14:54: o dono colou a documentação do dash atual ("Dashboard Acelerato DSPD-SSSC — como cada métrica é montada"): fonte UNIFIQUE.ACELERATO_CHAMADOS, população (lixeira=0, tipo DSPD - SSSC, equipes SSSC TOTVS/SENIOR/FLUIG), fechado = data_pronto não nulo, datas em BRT fixo, veredito de SLA normalizado de *_status e *_violado, tempo por etapa em estatisticas.workflow.etapas[].tempoSla (segundos), reincidência pelo campo personalizado dos 90 dias, filas nova e antiga pela organização, histórico de SLA congelado até 2026-08 vindo da tabela antiga. O dash tem ranking, filtro e custo por agente, que ferem a regra inviolável de não ter métrica individual e não serão reproduzidos. Guardado como entrada da volta da E3.2 (cópia fora do repositório, no scratchpad da sessão).
- 2026-10-30 14:55: correção: a documentação do dash ficou em docs/integracao/acelerato-dash-atual.md na worktree 056 (sem commit), copiada sem alteração de conteúdo, com aviso no topo sobre os itens por agente que não serão reproduzidos; vai no PR da E2.1.
- 2026-10-30 14:56: DECISÃO DO DONO: "pode agora" (CPU liberada para o pnpm install e o push). Abertas a E2.0 (tech-lead, install em nice e push) e a E3.4 (software-architect, plano com D-2 a D-6 e a doc do dash), em paralelo; depois a validação do dono (E1.1) e a E2.1.
- 2026-10-30 15:00: brief tech-lead-2 (E2.0) aprovado pelo conferente na rodada 1; delegado.
- 2026-10-30 15:01: brief software-architect-2 (E3.4) aprovado pelo conferente na rodada 1; delegado, em paralelo à E2.0.
- 2026-10-30 15:04: E2.0 entregue pelo tech-lead: install (nice 19) na worktree 056 e no clone principal; push da docs/056-acelerato-discovery (11141d7) e da docs/jarvis-2026-10-23 (95ba0fc), pre-push verde, sem commit novo.
- 2026-10-30 15:05: DECISÃO DO DONO: "baixe o uso do computador para eu poder apresentar sem me preocupar". Ação do Jarvis: sessão do Claude em prioridade baixa (nice 10); nenhum agente novo até o dono liberar; ficam só o software-architect (E3.4, só documento) e o conferente que já estavam rodando.
- 2026-10-30 15:05: E3.4 entregue pelo software-architect: plano reescrito (proposta, sem commit) com D-1 a D-6, 10 pontos fechados pela doc do dash, perguntas ao time de ciência de dados de 18 para 9; S2, S3, S12 e a resolução da S1 saem já; S4, S9, S10 presas à D-7. PERGUNTA na fila (quando o dono voltar da apresentação): D-7 (tempoSla da ferramenta como duração de S4, S9, S10, exceção à D-3), D-8 (população do dash com duas organizações e fechado = data_pronto contra o briefing §3.2), D-9 (tirar do SLA os chamados sem agente), D-10 (S8 pelo campo de 90 dias e denominador); a doc do dash não descreve S5, S6, S7 e S11.
- 2026-10-30 15:06: entrega da E2.0 conferida (rodada 1): não cumpriu só pela forma (etapa codigo sem commit; a delegação era de install e push); PQ-1 a PQ-3 cumpriram. DECISÃO TÉCNICA (Jarvis): aceita no mérito; vai à retrospectiva (brief de ambiente marcado como etapa codigo).
- 2026-10-30 15:17: DECISÃO DO DONO (D-7, tempo por etapa de S4, S9 e S10): "A": aceitar o tempoSla da ferramenta (estatisticas.workflow.etapas[]) como duração de cada etapa; percentis, janela e mínimo de 20 continuam na biblioteca; exceção à D-3 registrada e marcada nos gráficos (T2.6). Próxima: D-8.
- 2026-10-30 15:17: DECISÃO DO DONO (D-8, D-9, D-10): "se baseie na descricao que mandei ali e a descricao do painel atual". Leitura do Jarvis, devolvida ao dono para correção: D-8 = população do dash (lixeira = 0, tipo DSPD - SSSC, as 3 equipes SSSC, as duas organizações nova e antiga; fechado = data_pronto preenchida), e o briefing §3.2 fica desatualizado nesse ponto; D-9 = como o dash, o SLA não conta chamados sem agente (o coletor deriva só o booleano com_agente, em memória, sem gravar quem é o agente); D-10 = S8 pelo campo personalizado dos 90 dias, com o denominador do dash (todos os criados no mês), sabendo que isso subestima a taxa. Perguntas do plano 056 encerradas; segue a validação do plano pelo dono (E1.1) depois da atualização do plano.
- 2026-10-30 15:34: o dono vai responder pelo time de ciência de dados ("mande todas de uma vez"); enviadas de uma vez as 9 perguntas de dados (P-DS-1, 4, 5, 8, 12, 14, 16, 17, 18), as 9 de segurança da E3.3 e o pedido sobre S5, S6, S7 e S11, com consultas só de estrutura (nomes de campo, chaves do json, contagens), sem valores de chamado.
- 2026-10-30 16:02: o dono respondeu as 19 perguntas (pelo time de ciência de dados), só com estrutura e contagens; respostas guardadas em docs/integracao/acelerato-respostas-ciencia-de-dados.md na worktree 056 (sem commit), para a próxima atualização do plano (E3.5).
- 2026-10-30 16:08: abertas a E3.5 (software-architect) e a E3.6 (security-engineer), em paralelo, com as respostas do time de ciência de dados e as decisões D-7 a D-10; depois a validação do dono (E1.1) e a E2.1.
- 2026-10-30 16:12: brief security-engineer-2 (E3.6) aprovado pelo conferente na rodada 1; delegado.
- 2026-10-30 16:12: brief software-architect-3 (E3.5) aprovado pelo conferente na rodada 1; delegado, em paralelo à E3.6.
- 2026-10-30 16:16: E3.6 entregue pelo security-engineer: modelo de ameaças revisto (sem commit). M1 de alta para média (a conta só lê a tabela); M3 segue alta (sem CA: pedir a CA ou a impressão SHA-256 do certificado ao DBA; sem nenhuma, a coleta não começa e o caso vai ao dono); M4 com lista fechada atualizada e regra de só gravar valor de domínio fechado, data, booleano ou identificador; M6 com tempo máximo de consulta do lado do coletor; M7 com marca de controle por sincronizado_em; M11 novo (filtro da população no WHERE por causa de clientes externos). 9 perguntas abertas ao DBA e ao time de ciência de dados. MELHORIA vista (security-engineer e software-architect): PQ com espera linhas=1 em grep -c atrapalha a redação; usar linhas>=1 ou contagem.
- 2026-10-30 16:17: E3.5 entregue pelo software-architect: plano fechado com estado pronto-para-validacao (worktree 056, sem commit); D-7 a D-10 na §0; filtro na origem por tipo, equipe e organização; incremental por data_atualizacao com margem de 1 dia e releitura semanal; com_agente calculado no SELECT. PERGUNTA na fila, nenhuma bloqueia a F1: D-11 (fila nova e antiga), D-12 (vocabulários de prioridade), D-13 (primeiro comentário automático no MTTA), D-14 (S9, S10 e quantidadeDeVezes), D-15 (vínculo com Registro de Problema), D-16 (confirmar a D-10 com cobertura de 2,7%). Ao time de ciência de dados: P-DS-19 (tipo e domínio dos campos de etapa, bloqueia S5, S6, S7, S11) e P-DS-20 (versão do MySQL). Segue a validação do dono (E1.1).

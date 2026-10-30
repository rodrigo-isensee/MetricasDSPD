---
tipo: plano-tecnico
contrato: 1
pedido: 056
estado: vigente
ux: n/a (fonte de dados; o painel de sustentação já existe em mock, sem mudança de interface nesta etapa)
adrs: [0013, 0014, 0020]
agentes: [node-backend, qa-engineer, tech-lead, security-engineer]
gatilhos_seguranca: [credencial-externa, dados-pessoais, banco, dependencia-nova]
---

# 056 - Acelerato pela tabela MySQL do time de ciência de dados: mapeamento e coletor

Etapa E3.2 do pedido 056 (2026-10-30), revista na E3.4 (decisões D-2 a D-6 e doc do dash) e fechada na E3.5 com as decisões D-7 a D-10 e com as 19 respostas do time de ciência de dados (`docs/integracao/acelerato-respostas-ciencia-de-dados.md`, citadas daqui em diante como "resp. n"). Outras entradas: `docs/integracao/acelerato-dash-atual.md` ("doc do dash §n"), estrutura da tabela (E3.1, 50 colunas), catálogo de sustentação do briefing (S1 a S12, §3.2 a §3.4, T5.1 a T5.4), `data-model.md` §4 e §6, ADR 0013 §4, `docs/integracao/metabase-acelerato-configuracao.md` e o modelo de ameaças (`docs/security/056-acelerato-mysql-ameacas.md`, M1 a M10, revisto em paralelo na E3.6). Nenhuma linha de dado foi lida; nenhum agente conectou no MySQL nem leu o `.env`.

Estado: **validado pelo dono em 2026-10-30**. As perguntas que sobram (§6) não bloqueiam a fatia F1 (coletor e staging); cada uma bloqueia só as métricas indicadas.

**Conferência com a constituição:** o projeto não tem `docs/constituicao.md`. Conferido contra as regras invioláveis do `CLAUDE.md`: **conforme, com quatro pontos sinalizados**. (1) A regra de leitura do Acelerato só pela API muda pela decisão do dono de 2026-10-30 ("B"); o texto novo é da E2.1. (2) O filtro por agente da T5.1 e os itens por agente do dash não entram (D-1, ADR 0020); o `agente_key` só vira um booleano calculado no próprio MySQL (D-9). (3) O briefing §3.2 (população) e §3.3 (dash) estão desatualizados (D-8, D-5). (4) O tempo por etapa vem do relógio da ferramenta (D-7), exceção à D-3 registrada em `ref_versao_criterio` e marcada nos gráficos (T2.6). O resto: Acelerato só em `dspd_ac`; nenhuma coluna de pessoa ou texto livre na base; staging append-only; percentis, janela e mínimo de 20 só pela biblioteca (T2.5).

## 0. Decisões do dono incorporadas (2026-10-30)

| ID | Decisão | Efeito no plano |
|---|---|---|
| D-1 | filtro por agente da T5.1 recusado (regra inviolável, ADR 0020) | não implementado; §3.4 |
| D-2 | veredito de SLA vem das colunas da ferramenta (`*_status` conferido com `*_violado`); a biblioteca só agrega | normalização da §3.1; S2 sai já |
| D-3 | MTTA e resolução pela biblioteca a partir dos instantes, em horas úteis; relógio da ferramenta só para reconciliação | colunas `*_tempo_min` e `primeiro_comentario_min_uteis` só reconciliação (menos `sla_r_tempo_min`, barrada, §2) |
| D-4 | recorrente na S12 por categoria; limiar do dono na montagem do painel | S12 sai já; limiar é parâmetro versionado (T2.6) |
| D-5 | o dash já mostra S1 a S12; briefing §3.3 desatualizado | dash é referência de conferência (com a ressalva da §3.2: S5, S6, S7, S11 não estão nele, resp. 18) |
| D-6 | reconciliação de 1% da T5.1 contra o dash, com a mesma população | com D-8, a população é a mesma por construção |
| D-7 | `tempoSla` de `estatisticas.workflow.etapas[]` aceito como duração de cada etapa (S4, S9, S10); percentis, janela e mínimo na biblioteca | exceção à D-3: entrada em `ref_versao_criterio` e marca nos gráficos dessas métricas (T2.6) |
| D-8 | seguir o dash: população com `lixeira` = 0, tipo DSPD - SSSC, as 3 equipes SSSC e as duas organizações do DSPD (nova e antiga); fechado = `data_pronto` preenchida | `vw_populacao_sssc` com esses filtros; briefing §3.2 desatualizado nesse ponto (sinalizado ao dono) |
| D-9 | seguir o dash: SLA sem os chamados sem agente | só o booleano `com_agente`, calculado no `SELECT` (o id não sai do MySQL) |
| D-10 | S8 pelo campo dos 90 dias de `campos_personalizados`, denominador = todos os criados (como no dash, que subestima) | S8 sai com a limitação da §3.5 |
| E3.3 §6 | coleta só na máquina do dono; conta compartilhada por enquanto (M1 aceito); pessoa só em memória, agregado na base | §4.1 |

## 1. Leitura da estrutura

- Cópia desnormalizada mantida pelo time de ciência de dados, um chamado por linha (`ticket_key` único: linhas = chaves distintas, resp. 1). Atributos atuais, relógios de SLA da ferramenta e cinco colunas `json`.
- A tabela **não é só do DSPD**: dezenas de organizações, inclusive clientes externos (resp. 9, 14). O tipo DSPD - SSSC tem cerca de 6,9 mil linhas em 6 organizações. Por isso o filtro passa para a origem (§4.2).
- **Atualização contínua e incremental** (resp. 1): lotes de minuto cheio, defasagem de 0 a 12 min entre `data_atualizacao` e `sincronizado_em` (ciclo inferido de 10 a 15 min). `data_atualizacao` é a hora da mudança no Acelerato; `sincronizado_em` é a hora da gravação na cópia; `estatisticas_em` = `sincronizado_em`. Houve um backfill em massa em 2026-10 (resp. 1).
- Excluídos e arquivados ficam na tabela (`lixeira`, `arquivado`); nenhuma remoção física observada. Estabilidade do `ticket_key` não é provável pelo banco: a varredura semanal cobre (§4.3).
- **Sem histórico de transições** (resp. 3): `estatisticas.workflow.etapas[]` tem uma entrada por etapa (não por passagem), com `etapaKey`, `descricao`, `descricaoWorkflow`, `tempoSla` (segundos), `tempoSlaHoras` e `quantidadeDeVezes` (número de passagens). Sem instante de entrada ou saída. Cobre abertos.
- `estatisticas` é nula em parte das linhas (10,7% da tabela; na população SSSC, cerca de 530 de 6,9 mil sem etapas, resp. 1 e 3): esses chamados ficam sem tempo por etapa, contados em `ctl_coleta_contagem`, nunca imputados.
- `tempoSla` somado nas etapas não finais dá cerca de 40% do relógio entre criação e fechamento: compatível com tempo útil sem pausas, regra não provada (resp. 3, P-DS-5b).
- `campos_personalizados`: 759 nomes na tabela, 20 no tipo DSPD - SSSC (resp. 2). `campos_personalizados_etapa`: lista de `{nome, tipo, valor, obrigatorio, kanbanStatusKey}`, onde estão os campos de S5, S6, S7, S9 e S11 (resp. 3).
- `sla_r_tempo_min` tem média negativa: não é tempo decorrido (resp. 3); vale também para a doc do dash.

### 1.1 O que a doc do dash e as respostas fecham

| Pergunta | Resposta | Consequência |
|---|---|---|
| P-DS-1 carga | incremental contínua; `data_atualizacao` = mudança na ferramenta (resp. 1) | incremental por `data_atualizacao` (§4.2) |
| P-DS-2 fuso | horário de Brasília fixo (doc do dash §1) | normalizador aplica -03:00 |
| P-DS-3 tipo | `tipo_ticket` é a fila do recorte; natureza pelo prefixo da categoria (doc do dash §5.1) | filtro de origem por tipo; `natureza` por mapa em `ref_dominio` |
| P-DS-4 nomes de campo | 20 nomes em SSSC; campos de S5 a S11 estão em `campos_personalizados_etapa` (resp. 2, 3, 18) | listas fechadas da §2.1 |
| P-DS-5 etapas | uma entrada por etapa, `quantidadeDeVezes`, sem instantes, cobre abertos (resp. 3) | D-7; §3.6 (o que não sai sem instantes) |
| P-DS-6, 7, 10, 11, 13 | status = etapa atual; categoria com prefixo; fechado = `data_pronto`; `lixeira` exclui; quatro valores de `*_status` (doc do dash) | sem mudança desde a E3.4 |
| P-DS-8 prioridade | três vocabulários na população: prefixo SSSC (fila nova), prefixo DSPD (fila antiga) e escala P1 a P5, mais poucos valores de outras áreas e 29 vazios (resp. 4) | domínio fechado com todos os valores; mapeamento entre vocabulários é D-12 |
| P-DS-12 pausa | `suspenso` e `impedido` = 0 em toda a população SSSC (resp. 5) | atributos sem uso em métrica |
| P-DS-14 primeiro comentário | sem autor nem tipo; 9% em até 1 min da criação (resp. 6) | D-13 |
| P-DS-16 Registro de Problema | sem coluna de vínculo; candidatos de baixa certeza (resp. 7) | conversão da S11 pendente (§3, §6) |
| P-DS-17 aviso de mudança | não sabem (resp. 8) | falha fechado continua sendo a defesa |
| P-DS-18 tamanho | cerca de 292 mil linhas; as duas organizações do DSPD somam cerca de 6,3 mil (resp. 9) | volume do recorte pequeno (§4.4) |
| filas | a organização da fila nova também tem prioridades do fluxo antigo (resp., correções) | separar por organização mistura fluxos: D-11 |

## 2. Coluna a coluna

Legenda: **lida** = entra na consulta e no staging (depois da allow-list); **reconciliação** = lida e gravada só para conferir com o dash e com a ferramenta, nunca como métrica (T2.5, D-3); **derivada no SQL** = o `SELECT` devolve só um booleano, o valor original não sai do MySQL; **memória** = lida, reduzida a valor de domínio fechado ou booleano e descartada antes do staging (ADR 0020); **barrada** = nunca entra no `SELECT`.

| # | Coluna | Tipo | Uso | Destino ou motivo |
|---|---|---|---|---|
| 1 | `ticket_key` | bigint PK | lida | `id_origem` (texto decimal); cursor; link montado no front |
| 2 | `tipo_ticket_key` | int | lida | **filtro de origem** (lista fechada, indexado) |
| 3 | `tipo_ticket` | varchar(255) | lida | fila do recorte; domínio fechado (fora recusa a linha, M4 c) |
| 4 | `titulo` | varchar(1000) | barrada | texto livre (ADR 0020) |
| 5 | `status_key` | int | lida | código do status |
| 6 | `status` | varchar(255) | lida | `status` e `etapa` atual; domínio fechado (fluxo novo e antigo) |
| 7 | `encerrado` | tinyint(1) | lida | só conferência; nunca define fechamento |
| 8 | `categoria_key` | int | lida | chave estável da S12 |
| 9 | `categoria` | varchar(500) | lida | `categoria_sistema` e `natureza` pelo prefixo |
| 10 | `organizacao_key` | int | lida | **filtro de origem** (as duas organizações do DSPD, D-8) |
| 11 | `organizacao` | varchar(255) | lida | `organizacao`; `fila` só depois de D-11 |
| 12 | `equipe_key` | int | lida | **filtro de origem** (as 3 equipes SSSC, D-8); nunca comparação entre times (briefing 7.1) |
| 13 | `equipe` | varchar(255) | lida | `equipe`, domínio fechado |
| 14 | `agente_key` | int | derivada no SQL | só `agente_key IS NOT NULL` como `com_agente` (D-9); o id nunca sai do MySQL |
| 15 | `agente` | varchar(255) | barrada | nome de pessoa |
| 16 | `agente_email` | varchar(255) | barrada | e-mail de pessoa |
| 17 | `solicitante` | varchar(255) | barrada | nome de pessoa |
| 18 | `solicitante_email` | varchar(255) | barrada | e-mail de pessoa |
| 19 | `prioridade` | varchar(255) | lida | valor bruto em domínio fechado com os três vocabulários (resp. 4); vazio é nulo; mapeamento em D-12 |
| 20 | `origem` | varchar(100) | barrada | nenhuma métrica precisa |
| 21 | `data_criacao` | datetime | lida | `aberto_em`; Brasília fixo |
| 22 | `data_atualizacao` | datetime | lida | marca d'água do incremental |
| 23 | `data_pronto` | datetime | lida | `data_finalizado` (D-8); fim do relógio de resolução da S1 |
| 24 | `lixeira` | tinyint(1) | lida | `excluido`; filtrado só na view, nunca na coleta |
| 25 | `arquivado` | tinyint(1) | lida | atributo `arquivado`; nunca filtro |
| 26 | `suspenso` | tinyint(1) | lida | fotografia; sempre 0 na população (resp. 5); sem uso em métrica |
| 27 | `impedido` | tinyint(1) | lida | idem |
| 28 | `tempo_vida_dias` | int | reconciliação | dias inteiros |
| 29 | `tempo_ciclico_dias` | int | reconciliação | idem |
| 30 | `url` | varchar(500) | barrada | redundante com `ticket_key` |
| 31 | `sla_pa_tempo_min` | int | reconciliação | relógio de primeiro atendimento (D-3) |
| 32 | `sla_pa_saldo_min` | int | reconciliação | idem |
| 33 | `sla_pa_prazo_min` | int | reconciliação | conferido contra `ref_alvo_prioridade` |
| 34 | `sla_pa_violado` | tinyint(1) | lida | veredito de primeiro atendimento (D-2) |
| 35 | `sla_pa_status` | varchar(50) | lida | `status_sla_pa`, quatro valores |
| 36 | `sla_r_tempo_min` | int | **barrada** | média negativa (resp. 3): fora de qualquer uso, inclusive reconciliação |
| 37 | `sla_r_saldo_min` | int | reconciliação | relógio de resolução da ferramenta |
| 38 | `sla_r_prazo_min` | int | reconciliação | idem a 33 |
| 39 | `sla_r_violado` | tinyint(1) | lida | veredito de resolução (D-2) |
| 40 | `sla_r_status` | varchar(50) | lida | `status_sla_r`, quatro valores |
| 41 | `data_primeiro_comentario` | datetime | lida | `primeiro_atendimento_em` (MTTA); regra em D-13 |
| 42 | `primeiro_comentario_min_uteis` | int | reconciliação | conferência do MTTA (D-3) |
| 43 | `tempo_workflow_total` | varchar(50) | barrada | sem uso |
| 44 | `solicitantes` | json | barrada | lista de pessoas |
| 45 | `campos_personalizados` | json | memória (por nome) | só os nomes da §2.1; o resto não sai do MySQL |
| 46 | `campos_personalizados_etapa` | json | memória (por nome) | só os nomes da §2.1; `valor` só de campo de lista (texto livre vira booleano) |
| 47 | `estatisticas` | json | lida (caminho fixo) | só `workflow.etapas[]` com `etapaKey`, `descricao`, `descricaoWorkflow`, `tempoSla`, `quantidadeDeVezes` → `stg_etapa`; nunca `impedimentos` (pessoa, resp. 13) |
| 48 | `raw` | json | barrada | payload integral: descrição, reporter, seguidores, solicitantes (resp. 13) |
| 49 | `sincronizado_em` | datetime | lida | frescor da cópia; selo de frescor |
| 50 | `estatisticas_em` | datetime | lida | igual a `sincronizado_em` (resp. 1); guardada só para detectar divergência futura |

Resumo: 35 lidas (8 só para reconciliação), 3 `json` lidas só por caminho ou nome fixo, 1 derivada no SQL (`com_agente`), 11 barradas. Substitui a lista da E3.4; o security-engineer confere a final (E3.6).

### 2.1 Listas fechadas de nomes de campo

Igualdade exata com `ref_dominio` (o dash procura por trecho, frágil). Grau de certeza = quanto a resposta sustenta que o campo mede o que a métrica pede (resp. 18 chama as fontes de "candidatas, ainda não testadas").

| Campo (nome) | Coluna | Métrica | Certeza | Tratamento |
|---|---|---|---|---|
| Este problema já ocorreu nos últimos 90 dias? | 45 | S8 | alta quanto à fonte (D-10); cobertura baixa (§3.5) | domínio sim, não, sem resposta |
| Motivo da Escalação | 46 | S5 | média (nome coincide; domínio de 5 valores do briefing a conferir) | domínio fechado, se o `tipo` for lista |
| Qual suporte foi acionado? | 46 | S5 (apoio) | baixa | domínio fechado, se lista; senão fora |
| Motivo de Encerramento | 46 | S6, S7, S11 | média | domínio fechado (taxa de contorno e "não é incidente" dependem dos valores) |
| Categoria de solução | 46 | S6 (alternativa) | baixa | só se o dono preferir a Motivo de Encerramento |
| Prioridade ajustada manualmente? | 46 | S7 | média | booleano |
| Se a prioridade foi ajustada, justifique | 46 | S7 | média | só `justificativa_informada` (booleano); texto nunca sai da memória |
| Classifique o chamado no Tipo de Prioridade corretamente! | 46 | S7 (tipo) | baixa | domínio fechado, se lista |
| Motivo de Pendência | 46 | S9 | média | domínio fechado, se lista |
| Previsão de retorno | 46 | S9 | média | só se tem previsão (booleano); cumprimento não sai (§3.6) |
| Avaliação de Problema | 46 | S11 | baixa (a mais incerta, resp. 18) | domínio fechado, se lista |
| Número do ticket anterior | 45 | S11 (conversão) | baixa | só booleano `tem_ticket_anterior`, se o dono aceitar como vínculo |

A resp. 18 usa outra numeração (S5 pendências, S6 escalação); vale a do briefing (§3.4 e catálogo), usada acima.

**Nunca na lista (pessoa ou texto livre, resp. 13):** "Acelerato - Atendente", "Acelerato - Solicitante", Cargo, Bairro, "Complemento do Problema", todo nome terminado em `_LOGIN` e todo `valor` de campo de etapa do tipo texto. Esses nomes entram no teste de fronteira como marcadores (fixture), junto com uma coluna desconhecida.

Regras da fronteira (M4, como no BusinessMap): lista de colunas constante; zod `strict` por linha; colunas de código validadas por domínio ou forma; teste com fixture das 50 colunas mais uma desconhecida; nenhuma entrada nova em `COLUNAS_PESSOA`.

## 3. As 12 métricas de sustentação

"Direto" = contagem ou proporção sobre atributo lido. "Cálculo" = durações, percentis 50/85/95 e janela de 12 semanas pela biblioteca (`packages/metricas/src/acelerato`, T2.5). Mínimo de 20 itens sempre na biblioteca. Todas sobre a população da D-8.

| ID | Origem | Forma | Situação |
|---|---|---|---|
| S1 | `data_criacao`, `data_primeiro_comentario`, `data_pronto`, `prioridade` | cálculo (D-3) | resolução sai já; MTTA depois de D-13; por prioridade depois de D-12 |
| S2 | `*_status` e `*_violado` normalizados, `com_agente` | direto (D-2, D-9) | **sai já** (sem agente fora; veredito nulo à parte); quebra por prioridade depois de D-12 |
| S3 | `data_criacao`, `prioridade` | direto | contagem sai já pelo valor bruto; agrupamento depois de D-12; mudança da matriz (T4.3) em `ref_versao_criterio` |
| S4 | etapas N1, N2, N3 e fornecedor em `workflow.etapas[]` | cálculo (D-7) | **sai** com a marca de exceção; regra do nível pela T5.3 |
| S5 | Motivo da Escalação | direto | sai depois de P-DS-19 (tipo e domínio) |
| S6 | Motivo de Encerramento | direto | idem; taxa de contorno depende do domínio |
| S7 | ajuste manual, justificativa informada, tipo de prioridade, encerramento "não é incidente" | direto | idem; prioridade e tipo medidos em separado (T5.4) |
| S8 | campo dos 90 dias / todos os criados (D-10) | direto | **sai** com a limitação da §3.5; meta do briefing (< 5%) não é comparável |
| S9 | tempo em Pendente (`tempoSla`, D-7); Motivo de Pendência | cálculo e direto | tempo sai; motivo depois de P-DS-19; cumprimento da previsão não sai (§3.6, D-14) |
| S10 | tempo em Aguardando atribuição (`tempoSla`, D-7) | cálculo | sai; leitura contra o limite de 15 min em D-14 |
| S11 | Avaliação de Problema, `prioridade`, Motivo de Encerramento | direto | depois de P-DS-19 e D-12; conversão em Registro de Problema pendente (D-15) |
| S12 | `categoria_key`, `categoria` | direto | **volume e recorrentes saem já** (D-4); registro posterior pendente (sem fonte) |

Leitura: com D-7 a D-10, saem já S2, S4, S8, S9 (tempo), S10, S12 (sem registro posterior), a contagem da S3 e a resolução da S1. S5, S6, S7, S11 e o motivo da S9 esperam só o tipo e o domínio dos campos (P-DS-19). Quebras por prioridade esperam D-12.

Mudança no modelo da biblioteca (`Chamado`): `arquivado`, `natureza`, `com_agente`, `reincidente_90d` (sim, não, sem resposta), quatro valores de `status_sla_*`; `fila` só depois de D-11. A duração por etapa entra como insumo pronto (segundos de `tempoSla`): a biblioteca **não** reaplica horas úteis sobre ela (já é relógio da ferramenta), só faz percentis, janela e mínimo.

### 3.1 Veredito de SLA (D-2)

Função pura no normalizador, igual à doc do dash §2.1: status que começa por "realizado" vale como está; senão `*_violado` = 1 é fora do prazo e 0 é dentro; os dois nulos ficam sem veredito (à parte, nunca no denominador). Status bruto fica no staging; divergência entre status e flag vai a `ctl_coleta_contagem`. Chamado com `com_agente` = falso sai do denominador da S2 (D-9) e é contado à parte.

### 3.2 O que o dash cobre

Abas SLA, Abertos, Reincidência, Aging e Custo. Há número para S2, partes de S1, S3, S4, S9, S10, S8 e S12. **S5, S6, S7 e S11 não existem em aba nenhuma** (resp. 18): para elas não há reconciliação contra o dash; a conferência é por consulta de contagem no teste. D-5 vale para as demais.

### 3.3 Diferenças esperadas na reconciliação de 1%

| Diferença | Dash | Aqui | Tratamento |
|---|---|---|---|
| tempos | médias, aging em dias corridos | percentis 50/85/95, janela de 12 semanas | reconciliar contagens e proporções; tempos só por consulta de conferência no teste, nunca publicada |
| período | mês civil | janela móvel de 12 semanas | conferência intermediária por mês |
| população e SLA sem agente | D-8 e D-9 | iguais por construção | diferença aqui é defeito |
| histórico até 2026-08 | SLA congelado da tabela antiga | só a tabela nova | reconciliar só meses depois de 2026-08 |
| mínimo de itens | publica qualquer volume | abaixo de 20 não publica | comparar só onde os dois publicam |
| fila nova e antiga | por organização (mistura fluxos, resp.) | conforme D-11 | se D-11 for pelo prefixo, a quebra por fila difere de propósito |
| `sla_r_tempo_min` | aparece na doc do dash | barrada | nenhum número derivado dela é comparado |
| tempo por etapa | só fechados, sem etapas finais | D-7; classificação de etapa pelo §3.4 do briefing | dois vocabulários de espera no dash; nada unificado sem o dono |

### 3.4 O que do dash não é reproduzido

- **Individual (regra inviolável, ADR 0020):** ranking de agentes, filtro global por agente, custo por agente, agentes ativos e média por agente, coluna e busca por agente, lista de tickets com agente.
- **Fora do catálogo S1 a S12 (pedido próprio):** custo monetário; horas atuando contra aguardando; top 20 ofensores; projeção do SLA do mês; meta por controle deslizante.
- **Texto livre:** título e busca textual.

### 3.5 Limitação da S8 (D-10)

O campo dos 90 dias aparece em 171 de 6.350 chamados SSSC não excluídos (2,7%, resp. 19) e não é obrigatório. Com denominador = todos os criados, a taxa fica limitada a no máximo cerca de 2,7% por construção. O painel publica a taxa com a cobertura do campo ao lado e uma nota fixa de que ela subestima; a meta do briefing (< 5%) não é comparável. O numerador pequeno não impede a publicação (o mínimo de 20 vale sobre o denominador), mas cada mudança de obrigatoriedade do campo vira entrada em `ref_versao_criterio`. Confirmação do dono em D-16.

### 3.6 O que não sai sem instantes de etapa

- Reabertura por transição (Aguardando validação → Em diagnóstico, briefing §2): não deriva; só há `quantidadeDeVezes`.
- Cumprimento da previsão de retorno (S9): precisa da saída de Pendente; não existe.
- Tempo por escalação na S10: `tempoSla` é a soma das passagens; com mais de uma passagem, não há o tempo de cada uma.
- `quantidadeDeVezes` é gravado em `stg_etapa` (inteiro, sem pessoa) e pode virar indicador de retrabalho; nenhum uso em métrica sem decisão do dono (D-14).

## 4. Coletor MySQL (desenho, sem código)

### 4.1 Onde fica
- Módulo `server/src/modulos/acelerato/` (ADR 0013 §2): `config` (`ACELERATO_MYSQL_*` por zod, sem padrão, mensagem fixa); `cliente-mysql.ts` (único que fala com o MySQL); `allow-list.ts`; `staging.ts`; normalizador (§3.1, fuso, natureza, campos por nome) e projetor para `dim_chamado_versao` e `dim_chamado`; tarefa `ac` no worker (trava por fonte, `ctl_coleta`).
- Roda **só na máquina do dono**. Credencial: conta compartilhada (M1 aceito); hoje ela tem só SELECT e SHOW VIEW nesta tabela, com host aberto (resp. 10); usuário próprio e restrição de host antes da coleta agendada (E3.6).
- Dependência nova: driver MySQL para Node (provável `mysql2`), com auditoria de cadeia de suprimentos e parecer do security-engineer.

### 4.2 Consulta (forma, não o texto final)
- Constante no código, versionada em `docs/architecture/fontes/acelerato-mysql.sql`; mudar o SQL é mudança de critério (T2.6) e o SHA-256 vai em `ctl_coleta.parametros`.
- Só `SELECT` das colunas da §2, `agente_key IS NOT NULL` como `com_agente` e extrações por caminho: `workflow.etapas[]` com as cinco chaves da linha 47 e os pares das listas da §2.1. Preferência: `JSON_TABLE` com `WHERE nome IN (...)` para que nome fora da lista não saia do MySQL (exige MySQL 8, a confirmar em P-DS-20); sem isso, descarte em memória antes do staging. Nunca `*`, `estatisticas` inteira, `raw`, `solicitantes`, `titulo`, agente ou solicitante.
- **Filtro de origem (D-8 e clientes externos):** `tipo_ticket_key`, `organizacao_key` e `equipe_key` nas listas fechadas de `ref_dominio`, por placeholder. Linha de outra organização nunca entra na base. `lixeira` filtra só na `vw_populacao_sssc`.
- Incremental por chave composta, sem `OFFSET`: `data_atualizacao >= marca − margem`, ordem (`data_atualizacao`, `ticket_key`), `LIMIT` por página (1.000).
- Marca d'água = maior `data_atualizacao` lida. Margem configurável, sugestão 1 dia: cobre a defasagem de até 15 min da cópia (resp. 1) com folga; o hash do staging deduplica.
- Sessão: transação só leitura, `SET SESSION max_execution_time` próprio (o servidor está sem limite, resp. 15), pool de 1 conexão, TLS exigido pelo cliente (o servidor não obriga, resp. 11; verificação de CA conforme E3.6), sem `multipleStatements` e sem `LOCAL INFILE`.

### 4.3 Histórico sem sobrescrever
- Staging só INSERT (gatilho e GRANT de `dspd_ac`); hash igual ignora, diferente vira versão nova (SCD2); nada é apagado.
- **Releitura semanal do recorte:** lê o recorte inteiro (cerca de 7 mil linhas, o mesmo volume que o dash lê, resp. 17), sem marca d'água. Pega o que a marca perdeu (backfill que regrava linha sem mudar `data_atualizacao`, como o de 2026-10) e o hash absorve o resto.
- **Saída do recorte:** como o filtro agora está na origem, chamado que muda de tipo, equipe ou organização deixaria de ser lido. Na releitura semanal, os ids já conhecidos e não vistos são consultados só por `ticket_key`, `tipo_ticket_key`, `organizacao_key`, `equipe_key`, `lixeira` e `data_atualizacao`: ainda presente fora do recorte vira versão com `fora_do_recorte = true`; ausente vira `ausente_na_extracao = true`. Acima de 5% de ausentes, a coleta para com alerta de recarga suspeita (M7).
- `ctl_coleta.parametros`: hash do host e do banco, tabela, hashes da lista de colunas, das listas de nomes e do SQL, maior `sincronizado_em`. Mudança sem migração recusa a coleta (CA-8).

### 4.4 Frequência
- Uma vez por dia mais a execução manual (`pnpm coleta ac`); carga inicial manual com o dono presente. A cópia é atualizada o dia todo (resp. 17), então o horário é livre; sugestão: início da manhã. Coleta mais frequente não traz ganho a painéis de janela de 12 semanas.
- Volume diário: dezenas a cerca de 1.000 linhas da tabela inteira por dia (resp. 1); no recorte, bem menos.
- `sincronizado_em` sem mudança: sucesso sem novidade; o selo mostra a data da fonte.

### 4.5 Riscos
| Risco | Efeito | Tratamento |
|---|---|---|
| Backfill regravando linhas sem mudar `data_atualizacao` | versão perdida até a releitura | releitura semanal (§4.3) |
| Chamado sai do recorte na origem | some do incremental | consulta dos ids não vistos (§4.3) |
| Recarga com troca de ids | duplicação ou ausência em massa | limiar de ausentes |
| Coluna ou campo novo, inclusive de pessoa | coleta para ou atributo some | falha fechado; contagem de nomes fora do domínio; sem aviso prévio (P-DS-17) |
| `tempoSla` com regra não confirmada | tempo por etapa com semântica errada | D-7 aceita; marca nos gráficos; P-DS-5b |
| `estatisticas` nula em parte dos chamados | S4, S9, S10 com amostra menor | contagem em `ctl_coleta_contagem`; nunca imputar |
| Campo dos 90 dias com 2,7% de cobertura | S8 subestimada | §3.5 |
| Campos de etapa com fonte incerta | S5, S6, S7, S11 medindo outra coisa | grau de certeza da §2.1; validação do dono no primeiro painel |
| Primeiro comentário automático | MTTA curto demais | D-13 |
| Fila por organização mistura fluxos | quebra por fila errada | D-11 |
| Conta compartilhada com host aberto e TLS sem CA | credencial com alcance demais | M1 aceito; E3.6 |

## 5. Propostas de texto para os documentos vigentes (não editados aqui)

### 5.1 ADR 0013 §4
**ADR nova** (provável 0023, "Acelerato pela tabela MySQL do time de ciência de dados") que substitui só o §4 da 0013; na 0013, duas linhas de referência (cabeçalho e Contexto).

Conteúdo: decisão (dono de 2026-10-30, §0 deste plano, consulta constante com lista fechada e filtro de origem, incremental com releitura semanal, coleta na máquina do dono); alternativas (API pública, limitada a 10 resultados por chamada; Metabase; view filtrada do time de ciência de dados, preferida se o DBA criar, M1 b); critério de reversão (a tabela deixa de ser mantida; ou `sincronizado_em` parado mais de 1 dia útil, já que a cópia é contínua; ou a varredura acusa recarga com troca de ids); leituras (este plano, o modelo de ameaças, a doc do dash, as respostas do time de ciência de dados, o pedido 056). Registra também a exceção da D-7.

### 5.2 `data-model.md`
- Linha 5 (origem): tabela MySQL do time de ciência de dados, 1x/dia, só SELECT, na máquina do dono (ADR 0023).
- §4, `stg_chamado`: grão = linha do recorte; só colunas da allow-list, `com_agente` e extrações fixas; nunca `raw`, `titulo`, pessoa, `sla_r_tempo_min`. `CHECK` de `status_sla_*` com quatro valores.
- §4, `stg_etapa`: total por etapa (`etapa_key`, descrição, `descricao_workflow`, segundos de `tempoSla`, `quantidade_vezes`), sem entrada e saída.
- §4, `dim_chamado` e `dim_chamado_versao`: `arquivado`, `natureza`, `com_agente`, `reincidente_90d`, `fora_do_recorte`, veredito normalizado; `excluido` de `lixeira`; `data_finalizado` de `data_pronto`; `fila` só depois de D-11.
- §4, "Ausência": releitura semanal e consulta dos ids não vistos; hashes de SQL, colunas, nomes, host e banco.
- §4, views: `vw_populacao_sssc` com a população da D-8.
- `ref_versao_criterio`: entradas da D-7 (tempo por etapa da ferramenta) e da D-10 (S8 pelo campo dos 90 dias).

### 5.3 `metabase-acelerato-configuracao.md`
Não reescrever; no topo, aviso de **substituído** em 2026-10-30 (pedido 056, ADR 0023). O roteiro novo vira `docs/integracao/acelerato-mysql-configuracao.md`, na fatia de código.

### 5.4 Briefing e doc do dash (sinalização ao dono, não editados)
- Briefing §3.2 (população) e §3.3 (dash) desatualizados (D-8, D-5).
- Doc do dash: a separação de fila por organização mistura fluxos e `sla_r_tempo_min` não é tempo decorrido (correções da resposta).

## 6. Perguntas que ainda faltam

Nenhuma bloqueia a validação do plano nem a F1. Cada uma bloqueia só o que está indicado.

### 6.1 Ao dono (regra de negócio; nenhuma decidida aqui)
- **D-11 (fila nova e antiga):** a organização da fila nova também tem chamados com prioridade do fluxo antigo (resp.). Separar por organização (como o dash) ou pelo prefixo da prioridade (SSSC na nova, DSPD na antiga)? Bloqueia só o atributo `fila`; a população não muda.
- **D-12 (prioridade):** há três vocabulários na população (prefixo SSSC, prefixo DSPD e escala P1 a P5). As quebras por prioridade de S1, S2, S3 e S11 usam um mapa para P1 a P5 (qual) ou uma série por vocabulário? Valores de outras áreas e vazios ficam como "sem prioridade"?
- **D-13 (MTTA):** 9% dos primeiros comentários vêm em até 1 min da criação, com cara de automáticos, e a tabela não distingue. Contar o primeiro comentário como está ou adotar outra regra?
- **D-14 (sem instantes):** aceitar a S9 sem o cumprimento da previsão de retorno e a S10 contra 15 min pelo total da etapa (soma das passagens)? Usar `quantidadeDeVezes` em alguma métrica?
- **D-15 (S11, conversão):** sem vínculo com Registro de Problema; aceitar "Número do ticket anterior" como vínculo ou deixar a conversão fora até haver campo?
- **D-16 (S8):** manter a D-10 sabendo que o campo só aparece em 2,7% dos chamados (taxa limitada a cerca de 2,7%), com a cobertura exibida ao lado?

### 6.2 Ao time de ciência de dados (resposta descritiva, nunca valor de chamado)
- **P-DS-19 (bloqueia S5, S6, S7, S11 e o motivo da S9):** para cada campo da §2.1, o `tipo` e, se for lista, os valores possíveis (só o domínio).
- **P-DS-20:** versão do MySQL (`SELECT VERSION()`), para decidir o `JSON_TABLE` da §4.2.
- **P-DS-5b (não bloqueia):** a regra do `tempoSla` (desconta pausa, usa expediente), com quem administra o Acelerato.
- **P-DS-12 (não bloqueia):** se `suspenso` e `impedido` pausam o SLA.
- **P-DS-17 (não bloqueia):** combinar aviso antes de mudança de estrutura.
- Segurança (rede, CA, usuário próprio, LGPD, retenção): no modelo de ameaças (E3.6).

## 7. Divisão de tarefas (depois da E1.1)

| Ordem | Agente | Tarefa | Paralelo com |
|---|---|---|---|
| 0 | dono | validar o plano (E1.1); responder D-11 a D-16; levar P-DS-19 e P-DS-20 | — |
| 1 | software-architect | ADR 0023 e as edições da §5; listas fechadas de nomes, etapas e prioridades em `ref_dominio` | security-engineer (revisão das listas e da §2) |
| 2 | tech-lead | branch da fatia de coletor; escolha e auditoria do driver | qa-engineer (CA-1 a CA-10, fixture das 50 colunas com os marcadores de pessoa da §2.1, casos da §3.3) |
| 3 | node-backend | F1: config, cliente MySQL, filtro de origem, allow-list, staging, `ctl_coleta`, releitura semanal e saída do recorte | qa-engineer |
| 4 | node-backend | F2: normalizador e projetor; S2, S4, S8, S9 (tempo), S10, S12, contagem da S3 e resolução da S1 com dado real, marcas da D-7 e da D-10; reconciliação de 1% | qa-engineer |
| 5 | node-backend | F3: S5, S6, S7, S11 e motivo da S9 (depois de P-DS-19); quebras por prioridade (D-12); MTTA (D-13); fila (D-11) | qa-engineer |
| 6 | tech-lead, qa-engineer, security-engineer | review, parecer de QA em `docs/qa/` e parecer de segurança por fatia | — |

Front-end: sem mudança nesta etapa; o painel lê a API, com o mesmo seletor real ou mock por painel do 052. As marcas da D-7 e da D-10 nos gráficos usam o mecanismo de `ref_versao_criterio` que o painel já prevê (T2.6).

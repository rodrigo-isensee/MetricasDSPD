# Listas fechadas do coletor do Acelerato (tabela MySQL do time de ciência de dados)

- Data: 2026-10-30 · Autor: `software-architect` (pedido 056, E4.1) · Público: node-backend, security-engineer, qa-engineer.
- Decisão: ADR 0023. Plano: `docs/architecture/features/056-acelerato-mysql.md` (citado como "plano §n"). As fontes que o plano cita são citadas como no plano: "resp. n" = `docs/integracao/acelerato-respostas-ciencia-de-dados.md`, item n; "dash §n" = `docs/integracao/acelerato-dash-atual.md`, seção n.
- Regra: cada item tem a origem. Valor que os documentos não trazem fica **"a preencher na carga inicial com o dono"**, nunca inventado. Nenhuma linha de dado, nome de pessoa, endereço de servidor nem organização cliente aparece aqui.
- Destino: as listas dos §3 a §10 e do §12 vão para `ref_dominio` do `dspd_ac` (arquivo versionado, `ac:ref-sync`), com o campo indicado em cada seção; as dos §1 e §2 são constantes do código (`allow-list.ts` e o SQL versionado). Mudar qualquer lista é mudança de critério (T2.6): novo hash em `ctl_coleta.parametros` e entrada em `ref_versao_criterio`.
- Valor fora da lista: nas colunas de vocabulário (§7 a §9: status, prioridade e etapa), o valor vira nulo com contagem por coluna em `ctl_coleta_contagem`, sem o valor, para a lista ser corrigida com o dono; chamado fora do recorte (§4 a §6: tipo, organização ou equipe) faz a coleta **falhar fechado** com `fora-do-recorte`; **lista de vocabulário vazia em `ref_dominio` (etapa, prioridade, categoria ou descrição do workflow) também faz a coleta falhar fechado** com `listas-vazias` (E4.42; sem isso todo valor cairia fora do domínio em silêncio, como na carga de 2026-11-01), e a projeção falha com `listas-vazias` se o `natureza_prefixo` não tiver nenhum prefixo; nos campos personalizados (§3), o valor vira nulo com contagem em `ctl_coleta_contagem`, sem o valor (M4 d).

## 1. Colunas (constante do código; plano §2)

| Uso | Colunas (número da linha no plano §2) |
|---|---|
| lida (27) | `ticket_key` (1), `tipo_ticket_key` (2), `tipo_ticket` (3), `status_key` (5), `status` (6), `encerrado` (7), `categoria_key` (8), `categoria` (9), `organizacao_key` (10), `organizacao` (11), `equipe_key` (12), `equipe` (13), `prioridade` (19), `data_criacao` (21), `data_atualizacao` (22), `data_pronto` (23), `lixeira` (24), `arquivado` (25), `suspenso` (26), `impedido` (27), `sla_pa_violado` (34), `sla_pa_status` (35), `sla_r_violado` (39), `sla_r_status` (40), `data_primeiro_comentario` (41), `sincronizado_em` (49), `estatisticas_em` (50) |
| reconciliação (8) | `tempo_vida_dias` (28), `tempo_ciclico_dias` (29), `sla_pa_tempo_min` (31), `sla_pa_saldo_min` (32), `sla_pa_prazo_min` (33), `sla_r_saldo_min` (37), `sla_r_prazo_min` (38), `primeiro_comentario_min_uteis` (42) |
| derivada no SQL (1) | `com_agente` = `agente_key IS NOT NULL` (14); o id não sai do MySQL (D-9; ADR 0023 item 4) |
| `json` só por caminho ou nome (3) | `campos_personalizados` (45), `campos_personalizados_etapa` (46), `estatisticas` (47): §2 abaixo |
| barrada (11) | `titulo` (4), `agente` (15), `agente_email` (16), `solicitante` (17), `solicitante_email` (18), `origem` (20), `url` (30), `sla_r_tempo_min` (36), `tempo_workflow_total` (43), `solicitantes` (44), `raw` (48) |

Total: 50 (plano §2, "Resumo"). A allow-list do zod aceita exatamente as 35 lidas mais `com_agente`; qualquer outra chave falha fechado.

## 2. Caminhos `json` (constante do código)

| Coluna | Caminho | Chaves lidas | Origem |
|---|---|---|---|
| `estatisticas` | `$.workflow.etapas[*]` | `etapaKey`, `descricao`, `descricaoWorkflow`, `tempoSla` (segundos), `quantidadeDeVezes` | plano §2 linha 47; resp. 3. Nunca `tempoSlaHoras` (redundante), nunca `impedimentos` (pessoa, resp. 13) |
| `campos_personalizados` | `$[*]` | `nomeCampo`, `valor` | dash §4 (lista de `{nomeCampo, valor}`); plano §2 linha 45 |
| `campos_personalizados_etapa` | `$[*]` | `nome`, `tipo`, `valor` (só de campo de lista; do texto livre, só o booleano "preenchido") | resp. 3 (lista de `{nome, tipo, valor, obrigatorio, kanbanStatusKey}`); plano §2 linha 46. Só na F3 (ADR 0023 item 4) |

## 3. Nomes de campo personalizado (plano §2.1; `ref_dominio` campo `campo_personalizado`)

Igualdade exata de nome. "Fatia" = quando a consulta passa a pedir o nome (ADR 0023 item 4).

| Nome exato | Coluna | Métrica | Tratamento (plano §2.1) | Domínio do valor | Fatia |
|---|---|---|---|---|---|
| Este problema já ocorreu nos últimos 90 dias? | 45 | S8 | sim, não, sem resposta | `SIM` → sim; `NÃO` e `NAO` → não (dash §4); vazio ou ausente → sem resposta (D-10). Outra grafia: a conferir na carga inicial com o dono (contagem de fora do domínio) | F1 |
| Motivo da Escalação | 46 | S5 | domínio fechado, se o `tipo` for lista | a preencher na carga inicial com o dono (P-DS-19) | F3 |
| Qual suporte foi acionado? | 46 | S5 (apoio) | domínio fechado, se lista; senão fora | a preencher na carga inicial com o dono (P-DS-19) | F3 |
| Motivo de Encerramento | 46 | S6, S7, S11 | domínio fechado | a preencher na carga inicial com o dono (P-DS-19) | F3 |
| Categoria de solução | 46 | S6 (alternativa) | só se o dono preferir à Motivo de Encerramento | a preencher na carga inicial com o dono (P-DS-19) | F3 |
| Prioridade ajustada manualmente? | 46 | S7 | booleano | valores que significam sim e não: a preencher na carga inicial com o dono (P-DS-19) | F3 |
| Se a prioridade foi ajustada, justifique | 46 | S7 | só `justificativa_informada` (booleano); o texto nunca sai do MySQL | não se aplica | F3 |
| Classifique o chamado no Tipo de Prioridade corretamente! | 46 | S7 (tipo) | domínio fechado, se lista | a preencher na carga inicial com o dono (P-DS-19) | F3 |
| Motivo de Pendência | 46 | S9 | domínio fechado, se lista | a preencher na carga inicial com o dono (P-DS-19) | F3 |
| Previsão de retorno | 46 | S9 | só se tem previsão (booleano) | não se aplica | F3 |
| Avaliação de Problema | 46 | S11 | domínio fechado, se lista | a preencher na carga inicial com o dono (P-DS-19) | F3 |
| Número do ticket anterior | 45 | S11 (conversão) | só booleano `tem_ticket_anterior`, se o dono aceitar como vínculo (D-15) | não se aplica | F3, depois de D-15 |

Grafia dos nomes: como no plano §2.1 e na resp. 2 e 3. A resp. 3 também cita "Nº do Ticket Terceiros?", que não está na §2.1: fica fora.

**Nunca na lista (marcadores do teste de fronteira; plano §2.1 e resp. 13):** "Acelerato - Atendente", "Acelerato - Solicitante", "Cargo", "Bairro", "Complemento do Problema", todo nome terminado em `_LOGIN`, todo `valor` de campo de etapa do tipo texto. A fixture do teste traz ainda uma coluna desconhecida e uma chave `json` desconhecida (plano §2, "Regras da fronteira").

## 4. Tipo (`ref_dominio` campo `tipo_recorte`)

| Código (`tipo_ticket_key`) | Rótulo (`tipo_ticket`) | Origem |
|---|---|---|
| 23 | DSPD - SSSC | D-8 (plano §0); dash §1 (população base); consulta só leitura de 2026-11-01 (E4.32), 6907 chamados |

## 5. Organizações (`ref_dominio` campo `organizacao_recorte`)

D-8: "as duas organizações do DSPD (nova e antiga)". Só as do próprio DSPD aparecem aqui; nenhuma organização cliente.

| Código (`organizacao_key`) | Rótulo (`organizacao`) | Origem |
|---|---|---|
| 3 | UNIFIQUE - DSPD SUSTENTAÇÃO E PEQUENAS MELHORIAS (fila nova) | dash §1; resp. 9; consulta só leitura de 2026-11-01 (E4.32), 5278 chamados no tipo 23 |

Fila antiga: a consulta de 2026-11-01 (E4.32) procurou, em qualquer tipo, nomes com "SUSTENTACAO", "SUSTENTAÇÃO" e "DPTO SISTEMA" e não achou "UNIFIQUE - DSPD SUSTENTACAO (DPTO SISTEMA PD)"; a única organização que apareceu é a fila nova (chave 3). Decisão do dono (E4.32): entra só a fila nova. A fila nova tem ainda 7 chamados em outros tipos (chaves 26, 36 e 40), que ficam fora porque só o tipo 23 entra. ESCRITORIO DE PROJETO (chave 8, 63 chamados) e INTERNO (chave 13, 1004 chamados) ficam fora por decisão do dono.

A contagem `fora_organizacoes_recorte` da primeira carga (ADR 0023 item 5) mostra, sem nome, quantos chamados SSSC das 3 equipes ficam fora da lista; maior que zero vira pergunta ao dono antes de publicar o painel.

## 6. Equipes (`ref_dominio` campo `equipe`)

Nunca para comparação entre times (briefing 7.1).

| Código (`equipe_key`) | Rótulo (`equipe`) | Origem |
|---|---|---|
| 7 | SSSC TOTVS | dash §1; D-8; consulta de 2026-11-01 (E4.32), 4114 chamados |
| 9 | SSSC SENIOR | dash §1; D-8; consulta de 2026-11-01 (E4.32), 1052 chamados |
| 332 | SSSC FLUIG | dash §1; D-8; consulta de 2026-11-01 (E4.32), 94 chamados |

## 7. Etapas (`ref_dominio` campo `etapa`; vale para `status` e para `estatisticas.workflow.etapas[].descricao`)

Status = etapa atual (plano §1.1, P-DS-6). Nomes observados na doc do dash, fluxo novo e antigo juntos; o dash fala em 20 etapas na `STAGE_ORDER` (dash §5.1), mas a lista abaixo reúne todos os nomes que a doc cita, e a doc não traz a lista completa nem as chaves. **Lista completa, `etapaKey` e `status_key`: a preencher na carga inicial com o dono** (a contagem de nomes fora do domínio da primeira carga mostra o que falta).

| Grupo na origem | Nomes | Origem |
|---|---|---|
| finais (tempo residual pós-resolução) | Concluído, Encerramento, Causa Raiz, Revisão, Encerrado | dash §5.1 (`FINAL_STAGES`) |
| demais nomes citados | Novo Atendimento, Backlog, Em Análise, Novo, Em triagem, Pendente, Em Diagnóstico, Em Classificação, Em Investigação, Em Atendimento N1, Em Atendimento N2, Em Atendimento N3, Em Andamento, Aguardando Solicitante, Aguardando Suporte Terceiros, Aguardando Equipe Interna, Data Acordada, Aguardando Aprovação, Aguardando Janela de Mudança (Deploy Produção), Pronto para Desenvolver, Solicitar RDM, Nova Demanda, Novo Mudança, Retorno, Testes Integrados (Usuários), Aguardando Validação, Aguardando Validação de Prioridade, Aguardando Atribuição, Aguardando Fornecedor, Em Planejamento, Planejamento, Em Validação, Em Aprovação, Encaminhar para Desenvolvimento, Encaminhar para Projeto | dash §3 (`ABERTOS_ANDAMENTO_STAGES`), §5.1 (`WAITING_STAGES`), §5.2 (buckets) |

"Em Atendimento N1/N2/N3" aparece abreviado no dash; a grafia separada acima é a leitura da abreviação e é conferida na carga inicial. A classificação de cada etapa (nível N1 a N3 e fornecedor da S4, Pendente da S9, Aguardando atribuição da S10, totalizadores) não é desta lista: segue o briefing §3.4 e a T5.3, e o que o dash classifica de forma diferente não é unificado sem o dono (dash §6, plano §3.3).

**Preenchido na E4.42 (K-190, 2026-11-01), com os nomes exatos da consulta só leitura E4.40:** 44 nomes distintos de etapa (79 pares de chave e nome; o nome se repete por workflow), com `codigo` e `rotulo` iguais ao nome, na ordem da frequência. Os nomes de `status` da carga (38 chaves) são todos nomes dessa lista, e o mesmo vocabulário vale para `status` e para a etapa. Nenhuma normalização de acento ou caixa: a comparação é por igualdade exata (a causa da carga de 2026-11-01 não era grafia, e sim a lista vazia). A lista está em `docs/architecture/fontes/acelerato-dominio.json`, campo `etapa`.

## 8. Prioridades (`ref_dominio` campo `prioridade`)

Valor bruto em domínio fechado, os três vocabulários juntos (plano §2 linha 19; resp. 4). Vazio é nulo (29 chamados, resp. 4). O mapeamento entre vocabulários é a D-12, pendente: nenhum agrupamento aqui.

| Vocabulário | Valores | Origem |
|---|---|---|
| fila nova | SSSC - REQUISICAO - NORMAL, SSSC - REQUISICAO - BAIXA, SSSC - REQUISICAO - MEDIA, SSSC - REQUISICAO - ALTA, SSSC - REQUISICAO - URGENTE, SSSC - INCIDENTE - NORMAL, SSSC - INCIDENTE - BAIXA, SSSC - INCIDENTE - MEDIA, SSSC - INCIDENTE - ALTA, SSSC - INCIDENTE - URGENTE, SSSC - PADRAO | resp. 4 |
| fila antiga | DSPD - INCIDENTE - NORMAL, DSPD - INCIDENTE - BAIXA, DSPD - INCIDENTE - MEDIA, DSPD - INCIDENTE - ALTA, DSPD - INCIDENTE - URGENTE, DSPD - REQUISICAO - NORMAL, DSPD - REQUISICAO - BAIXA, DSPD - REQUISICAO - MEDIA, DSPD - REQUISICAO - ALTA, DSPD - REQUISICAO - URGENTE | resp. 4 |
| escala P | P1 - CRÍTICO, P2 - ALTO, P3 - MÉDIO, P4 - BAIXO, P5 - PLANEJADO/MUITO BAIXO | resp. 4 |
| outras áreas | DHO - ALTA, CONTABILIDADE - PADRAO, PROJETO NOVA ERA - PADRAO | resp. 4 |

A resp. 4 escreve as duas primeiras linhas de forma abreviada (`SSSC - REQUISICAO|INCIDENTE - NORMAL/BAIXA/MEDIA/ALTA/URGENTE`); a forma expandida acima é a leitura dessa notação e é conferida na carga inicial com o dono (contagem de fora do domínio, sem o valor).

**Preenchido na E4.42 (K-190, 2026-11-01), com os nomes exatos da consulta só leitura E4.40 e a D-12 do dono:** 23 nomes (a escala P com 5 e as quatro famílias com os níveis que existem na carga; 29 chamados sem prioridade ficam nulos). A grafia real tem acento (`REQUISIÇÃO`, `MÉDIA`); as formas sem acento das linhas acima não ocorrem na carga e não entram. `codigo` e `rotulo` iguais ao nome. O mapa para a escala P é do normalizador (`prioridadeDaEscala`), por nome exato e sem normalizar: URGENTE = P1, ALTA = P2, MÉDIA = P3, NORMAL = P4, BAIXA = P5, para SSSC - INCIDENTE, SSSC - REQUISIÇÃO, DSPD - INCIDENTE e DSPD - REQUISIÇÃO (**decisão D-12 do dono, 2026-11-01**); a escala `P<n> - ...` vale como está; vazio e outras áreas (DHO, CONTABILIDADE, PROJETO NOVA ERA) ficam sem prioridade (contagem `prioridade_fora_da_escala_p`). Mudar o mapa é mudança de critério (T2.6).

## 9. Status de SLA (`CHECK` de `status_sla_pa` e `status_sla_r` no staging; plano §5.2)

| Valores | Origem |
|---|---|
| REALIZADO_NO_PRAZO, REALIZADO_APOS_VENCIMENTO, DENTRO_DO_PRAZO, VENCIDO | dash §2.1 e §3; plano §1.1 (P-DS-13, "quatro valores de `*_status`") |

O veredito normalizado (plano §3.1) é função pura no normalizador; nulo fica sem veredito.

## 10. Natureza pelo prefixo da categoria (`ref_dominio` campo `natureza_prefixo`)

| Prefixo de `categoria` | Natureza | Origem |
|---|---|---|
| SSSC-R | requisição | dash §5.1 |
| SSSC-I | incidente | dash §5.1 |
| prefixos da fila antiga | a preencher na carga inicial com o dono | o dash classifica o resto como "outro" (dash §5.1); a natureza da fila antiga não está nos documentos |

**Preenchido na E4.42 (K-190, 2026-11-01), pela decisão (c) do dono:** quatro prefixos, como vieram da consulta E4.40 (a categoria usa hífen ou espaço depois da letra): `SSSC-I-` e `SSSC-I ` = incidente; `SSSC-R-` e `SSSC-R ` = requisição. `codigo` = o prefixo, `rotulo` = `incidente` ou `requisicao`. Ficam sem natureza (fora das duas): SSSC-P, PEQUENA, TESTADE e Outros. A linha "prefixos da fila antiga" acima fica sem valor: a fila antiga não existe no tipo 23 e as organizações fora da 3 não entram (decisão b). Sem nenhum prefixo no `ref_dominio`, a projeção não começa (`listas-vazias`).

## 11. Como o dono preenche as chaves (consulta só de domínio)

Na carga inicial (E4.8), o dono roda no terminal dele, com a mesma conta, uma consulta que devolve só chaves e nomes de domínio, filtrada pelos nomes acima (nenhuma organização cliente sai):

```sql
SELECT 'tipo' AS lista, tipo_ticket_key AS chave, tipo_ticket AS nome, COUNT(*) AS n
  FROM ACELERATO_CHAMADOS WHERE tipo_ticket = 'DSPD - SSSC' GROUP BY tipo_ticket_key, tipo_ticket
UNION ALL
SELECT 'equipe', equipe_key, equipe, COUNT(*)
  FROM ACELERATO_CHAMADOS WHERE tipo_ticket = 'DSPD - SSSC' AND equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG') GROUP BY equipe_key, equipe
UNION ALL
SELECT 'organizacao', organizacao_key, organizacao, COUNT(*)
  FROM ACELERATO_CHAMADOS WHERE tipo_ticket = 'DSPD - SSSC' AND organizacao LIKE 'UNIFIQUE - DSPD%' GROUP BY organizacao_key, organizacao
```

A saída (chaves, nomes do DSPD e contagens) preenche os §4 a §6 por um commit revisado; a escolha da organização antiga (§5) continua sendo do dono. A lista de etapas (§7) sai da primeira coleta, pela contagem de nomes fora do domínio, e é completada com o dono.

## 12. Categoria e descrição do workflow (`ref_dominio` campos `categoria` e `descricao_workflow`; Segurança A5)

Origem: A5 do parecer `docs/security/056-coletor-f1-f2.md` (texto livre só entra por domínio fechado), feito na volta 1 da F2 (E4.12, 3b2f98f). Valores: consulta de valores distintos abaixo, rodada só leitura na máquina do dono em 2026-10-31 (pedido 056, E4.22; saída fora do repositório, sem linha de chamado), e **decisão do dono de 2026-10-31 19:01**: entram todas as 136 categorias devolvidas, inclusive inativas e variantes de grafia, **menos TESTADEV444**, e todas as 19 descrições do workflow. Totais: **135 categorias** e **19 descrições do workflow**, no arquivo versionado `docs/architecture/fontes/acelerato-dominio.json` (campos `categoria` e `descricao_workflow`, na ordem da saída da consulta; a lista não é copiada aqui). Variantes de grafia (por exemplo, hífen e travessão, com e sem acento) e nomes iguais com chaves diferentes ficam como linhas distintas, porque a conferência é por igualdade exata.

| Campo no `ref_dominio` | Valor conferido (origem) | Contagem fora do domínio (`ctl_coleta_contagem`) | Lista vazia ou valor fora dela | Uso |
|---|---|---|---|---|
| `categoria` | coluna `categoria` (plano §2 linha 9) | `fora_dominio_categoria` | o valor vira nulo, com a contagem e sem o valor; lista vazia = a coleta não começa (`listas-vazias`, E4.42; antes toda categoria ficava nula e a natureza sem valor). `categoria_key` continua lida | natureza (§10) e `categoria_sistema` da projeção |
| `descricao_workflow` | `estatisticas.workflow.etapas[].descricaoWorkflow` (§2) | `fora_dominio_workflow` | o valor vira nulo, com a contagem e sem o valor; lista vazia = a coleta não começa (`listas-vazias`, E4.42) | só staging das etapas; nenhuma métrica da F2 o lê |

Formato da linha: `codigo` e `rotulo` são conferidos os dois contra o valor (`referencia.ts`); na `categoria`, `codigo` = `categoria_key` em texto decimal e `rotulo` = o nome exato; na `descricao_workflow`, o próprio texto nos dois. `ordem` = a posição no arquivo. Lista vazia impede a coleta (E4.42; antes só as do recorte, §4 a §6, impediam, e a lista vazia anulava o valor em silêncio); por isso o painel não se publica com `fora_dominio_categoria` maior que zero sem o dono ter visto a contagem.

Consulta de valores distintos, na mesma conta e no terminal do dono: só valores distintos com a contagem, nenhuma linha de dado, no mesmo recorte do §11 (nenhuma organização cliente entra no filtro). A versão com `UNION ALL` das duas metades **falha no servidor com o erro 1271** (mistura ilegal de intercalações no `UNION`: as duas metades devolvem texto com intercalações diferentes, a coluna `categoria` da tabela e a coluna gerada pelo `JSON_TABLE`; observado na E4.22); por isso o texto fica em **duas consultas**, cada uma com o mesmo SQL da metade correspondente, rodadas em separado:

Consulta 12a (categoria):

```sql
SELECT 'categoria' AS lista, categoria_key AS chave, categoria AS nome, COUNT(*) AS n
  FROM ACELERATO_CHAMADOS
 WHERE tipo_ticket = 'DSPD - SSSC' AND equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG') AND organizacao LIKE 'UNIFIQUE - DSPD%'
 GROUP BY categoria_key, categoria
```

Consulta 12b (descrição do workflow):

```sql
SELECT 'descricao_workflow' AS lista, NULL AS chave, e.descricao_workflow AS nome, COUNT(*) AS n
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.estatisticas, '$.workflow.etapas[*]' COLUMNS (descricao_workflow VARCHAR(255) PATH '$.descricaoWorkflow')) e
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG') AND c.organizacao LIKE 'UNIFIQUE - DSPD%'
 GROUP BY e.descricao_workflow
```

O caminho `json` é o mesmo da Q2 (`sql.ts`). Na 12b, `n` conta etapas do workflow (uma linha por etapa do `JSON_TABLE`), não chamados. O dono confere a saída antes do commit: valor que traga nome de pessoa ou de organização cliente fica fora da lista (vira nulo com contagem), não entra no `ref_dominio`. A saída de 2026-10-31 preencheu o arquivo versionado acima (E4.25), que entra por um commit revisado; mudar a lista depois é mudança de critério (T2.6), como as demais. Alternativa equivalente a duas consultas: manter o `UNION ALL` com `COLLATE` explícito na coluna de texto das duas metades; não foi rodada, por isso não é o texto vigente.

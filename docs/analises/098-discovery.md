# 098: discovery do recorte de times (Acelerato e BusinessMap), E1.1

- **Propósito:** discovery de E2 a E4 do pedido 098 (`docs/pedidos/098-acelerato-todos-os-times.md`), a partir da decisão do dono "tanto bm quanto acelerato sao todos os times" (2026-11-11 13:35).
- **Público:** dono, Jarvis, tech-lead, node-backend, react-frontend, qa-engineer, security-engineer.
- **Base lida:** `develop` em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo` (base-sha `ae009a75`). Nada foi lido da base real nem de `.env`. Onde falta dado há consulta só de leitura para o dono rodar (§1); a saída fica no terminal do dono, fora do repositório.
- **Estado:** proposta. Nenhuma linha de código muda por esta análise.

## 0. Conferência com as regras invioláveis
| Regra (CLAUDE.md) | Como o desenho cumpre |
|---|---|
| Sem avaliação individual nem comparação entre times | Time continua só **recorte** (filtro). As consultas do §1 contam chamados e cards para o dono escolher o recorte e conferir cobertura; nenhuma vira painel, ranking ou série por time. |
| BusinessMap e Acelerato nunca se misturam | Dois trilhos separados (§2 Acelerato, §3 e §4 BusinessMap), cada um com sua referência, sua versão de critério e seu filtro. Nenhuma consulta junta as duas bases. |
| Abaixo de 20 itens, não publicar | Nada muda na regra; o §2.4 mostra o efeito (times pequenos filtrados sozinhos não publicam). |
| Cálculo só na biblioteca (T2.5) | Nenhum cálculo novo: o recorte muda a população que entra na biblioteca, não a fórmula. |
| Mudança de critério registrada (T2.6) | §2.3 (Acelerato, com marca) e §4.2 (BusinessMap, correção de nome sem marca). |
| Histórico nunca sobrescrito | Acelerato: releitura só acrescenta versões. BusinessMap: nome novo é vigência nova em `ref_time` (o gatilho `proibir_alteracao_vigencia` só deixa fechar a vigência). |
| Allow-list do Acelerato | **Igual.** Nenhuma coluna nova; nome, e-mail, `usuarioKey`, título e descrição continuam barrados (`acelerato-listas.md` §1). |
| Dúvida de regra vira pergunta | §6, cada pergunta com recomendação. |

## 1. (a) Consultas só de leitura para o dono

Regras comuns: só `SELECT`; só nomes de domínio (tipo, organização do DSPD, equipe, workflow, time) e contagens; nenhuma coluna de pessoa ou texto livre (título, solicitante, agente, e-mail, descrição); a saída não entra no repositório. Antes de copiar qualquer nome para um commit, o dono confere se ele traz nome de pessoa ou de cliente; se trouxer, o nome fica fora e vira rótulo genérico.

### 1.1 MySQL do Acelerato (E2), mesma conta só leitura do coletor

Uma consulta por lista, rodadas em separado: o `UNION ALL` de textos com intercalações diferentes falha com o erro 1271 (visto na E4.22, `acelerato-listas.md` §12). `n_12m` = criados nos últimos 12 meses (período da carga); `n_fech_12s` = concluídos nas últimas 12 semanas (janela dos percentis), para estimar quem passaria da regra de 20.

```sql
-- C-AC1. Tipos de chamado (todas as organizações): só o nome do tipo e contagens.
SELECT tipo_ticket_key AS chave, tipo_ticket AS tipo, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m,
       SUM(data_pronto  >= DATE_SUB(CURRENT_DATE, INTERVAL 84 DAY))   AS n_fech_12s
  FROM ACELERATO_CHAMADOS
 GROUP BY tipo_ticket_key, tipo_ticket
 ORDER BY n DESC;

-- C-AC2a. Organizações do próprio grupo (nome começa por UNIFIQUE): nome e contagens.
SELECT organizacao_key AS chave, organizacao, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m
  FROM ACELERATO_CHAMADOS
 WHERE organizacao LIKE 'UNIFIQUE%'
 GROUP BY organizacao_key, organizacao
 ORDER BY n DESC;

-- C-AC2b. Demais organizações (clientes): SEM nome, só quantas são e quantos chamados têm.
SELECT COUNT(DISTINCT organizacao_key) AS organizacoes, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m
  FROM ACELERATO_CHAMADOS
 WHERE organizacao IS NULL OR organizacao NOT LIKE 'UNIFIQUE%';

-- C-AC3. Equipes por tipo, dentro das organizações do grupo: base das opções (a) e (b) de P-098-1.
SELECT tipo_ticket_key, tipo_ticket, equipe_key, equipe, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m,
       SUM(data_pronto  >= DATE_SUB(CURRENT_DATE, INTERVAL 84 DAY))   AS n_fech_12s
  FROM ACELERATO_CHAMADOS
 WHERE organizacao LIKE 'UNIFIQUE%'
 GROUP BY tipo_ticket_key, tipo_ticket, equipe_key, equipe
 ORDER BY tipo_ticket_key, n DESC;

-- C-AC4. Equipes em todo o Acelerato (opção (c) de P-098-1): equipe é time interno, sem organização na saída.
SELECT equipe_key, equipe, COUNT(*) AS n,
       SUM(data_criacao >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)) AS n_12m,
       SUM(data_pronto  >= DATE_SUB(CURRENT_DATE, INTERVAL 84 DAY))   AS n_fech_12s
  FROM ACELERATO_CHAMADOS
 GROUP BY equipe_key, equipe
 ORDER BY n DESC;
```

Depois da escolha do recorte (P-098-1), o dono roda de novo as consultas 12a e 12b de `acelerato-listas.md` §12 e a do §11, trocando o `WHERE` pelo recorte novo (lista de chaves de tipo, organização e equipe), mais esta, para as listas de vocabulário:

```sql
-- C-AC5. Vocabulário do recorte novo (substituir as três listas de chaves): status e prioridade, só nomes e contagens.
SELECT 'status' AS lista, status AS nome, COUNT(*) AS n FROM ACELERATO_CHAMADOS
 WHERE tipo_ticket_key IN (/*tipos*/) AND organizacao_key IN (/*organizações*/) AND equipe_key IN (/*equipes*/)
 GROUP BY status ORDER BY n DESC;
SELECT 'prioridade' AS lista, prioridade AS nome, COUNT(*) AS n FROM ACELERATO_CHAMADOS
 WHERE tipo_ticket_key IN (/*tipos*/) AND organizacao_key IN (/*organizações*/) AND equipe_key IN (/*equipes*/)
 GROUP BY prioridade ORDER BY n DESC;
```

### 1.2 PostgreSQL (E3 e E4), esquema `dspd_bm`, com a conta do dono

```sql
-- C-BM1 (E4). Os 47 times com nome provisório e o nome do workflow vigente; nome_longo marca o que não cabe em ref_time.nome (80).
SELECT t.time_id, tw.quadro_id, tw.workflow_id, t.nome AS nome_atual, w.nome AS nome_workflow,
       length(w.nome) > 80 AS nome_longo, w.nivel,
       (SELECT count(*) FROM dspd_bm.dim_card c WHERE c.equipe = t.nome) AS cards_projetados
  FROM dspd_bm.ref_time t
  JOIN dspd_bm.ref_time_workflow tw ON tw.time_id = t.time_id AND tw.vigente_ate IS NULL AND tw.situacao = 'time'
  LEFT JOIN dspd_bm.ref_workflow w ON w.quadro_id = tw.quadro_id AND w.workflow_id = tw.workflow_id AND w.vigente_ate IS NULL
 WHERE t.vigente_ate IS NULL AND t.nome LIKE 'Workflow %'
 ORDER BY tw.quadro_id, length(tw.workflow_id), tw.workflow_id;

-- C-BM2 (E4). Nomes de workflow repetidos entre os times (dariam o mesmo id de filtro).
SELECT lower(w.nome) AS nome, count(*) AS times
  FROM dspd_bm.ref_time_workflow tw
  JOIN dspd_bm.ref_workflow w ON w.quadro_id = tw.quadro_id AND w.workflow_id = tw.workflow_id AND w.vigente_ate IS NULL
 WHERE tw.vigente_ate IS NULL AND tw.situacao = 'time'
 GROUP BY lower(w.nome) HAVING count(*) > 1;

-- C-BM3 (E3). Workflows de story vigentes SEM linha na tabela de times: seus cards ficam fora de todo o fluxo (§3).
SELECT w.quadro_id, w.workflow_id, w.nome AS nome_workflow, w.vigente_de
  FROM dspd_bm.ref_workflow w
  LEFT JOIN dspd_bm.ref_time_workflow tw ON tw.workflow_id = w.workflow_id AND tw.vigente_ate IS NULL
 WHERE w.vigente_ate IS NULL AND w.nivel = 'story' AND tw.workflow_id IS NULL
 ORDER BY w.quadro_id, w.workflow_id;

-- C-BM4 (E3). Quadros lidos pela referência e quadros com card na base (só ids e contagens).
SELECT q.quadro_id, (SELECT count(*) FROM dspd_bm.dim_card c WHERE c.quadro_id = q.quadro_id) AS cards
  FROM dspd_bm.ref_quadro q WHERE q.vigente_ate IS NULL ORDER BY q.quadro_id;

-- C-BM5 (E3). Cobertura: stories com e sem time, e quantos times ativos não têm nenhum card (sem listar contagem por time).
SELECT (SELECT count(*) FROM dspd_bm.dim_card WHERE granularidade = 'story' AND equipe IS NOT NULL) AS stories_com_time,
       (SELECT count(*) FROM dspd_bm.dim_card WHERE granularidade IS NULL AND excluido_em IS NULL) AS cards_fora_do_fluxo,
       (SELECT count(*) FROM dspd_bm.ref_time t WHERE t.vigente_ate IS NULL AND t.ativo
           AND NOT EXISTS (SELECT 1 FROM dspd_bm.dim_card c WHERE c.equipe = t.nome)) AS times_sem_card;
```

## 2. (b) Acelerato: o que muda na coleta para o recorte novo

### 2.1 O que existe
- O recorte são três listas fechadas em `ref_dominio` do `dspd_ac` (`tipo_recorte`, `organizacao_recorte`, `equipe`), vindas do arquivo versionado `docs/architecture/fontes/acelerato-dominio.json` pelo `ac:ref-sync`. Hoje: tipo 23 (DSPD - SSSC), organização 3, equipes 7, 9 e 332.
- A Q1 lê só `tipo_ticket_key IN (...) AND organizacao_key IN (...) AND equipe_key IN (...)` por placeholder (`server/src/modulos/acelerato/sql.ts:24`); a releitura confere a saída do recorte pelas mesmas três listas (`coletor.ts:155`).
- Mudar uma lista de recorte muda `recorte_sha256`: a coleta seguinte recusa com `parametros-mudaram` até `pnpm coleta ac --reconhecer-mudanca`, que exige a versão de critério do `ac:ref-sync` e faz a **releitura completa** do recorte (tarefa `varredura`, só leitura, só acrescenta versões; `coletor.ts:212-226`, decisão P-E3-2).

### 2.2 O que muda
| Item | Muda? | Como |
|---|---|---|
| Allow-list de colunas e caminhos `json` | **Não** | Mesmas 35 colunas mais `com_agente`; o teste de fronteira fica como está. |
| Listas de recorte | Sim (só dado) | `acelerato-dominio.json`: **lista explícita** de chaves de tipo, organização e equipe escolhidas pelo dono na saída de C-AC1 a C-AC4. Recomendo **não** criar um "todos" curinga: a lista fechada mantém a falha fechada, o hash de recorte e a recusa de mudança sem reconhecimento. Equipe nova no Acelerato depois disso entra por `ac:ref-sync`, como hoje. |
| Listas de vocabulário | Sim (só dado) | Os outros times trazem etapas, status, prioridades, categorias e descrições de workflow que não estão nas listas do SSSC. Fora da lista o valor vira nulo com contagem (`acelerato-listas.md`, linha 8): sem completar as listas, a natureza (pelo prefixo `SSSC-I`/`SSSC-R`), a prioridade (mapa D-12) e as etapas dos times novos saem nulas e os chamados somem de S1 a S11 sem aviso visível. Por isso o recorte e o vocabulário entram **no mesmo `ac:ref-sync`**, com C-AC5, 12a e 12b rodadas no recorte novo. |
| Regras por time novo | Pergunta ao dono | Natureza (prefixo da categoria de cada time), mapa da prioridade para P1 a P5 (famílias novas) e etapas finais e de espera. São regras de negócio: não se inferem (P-098-3). |
| Código | Pouco | Textos que dizem "SSSC das 3 equipes" (`entradas/coleta.ts:33`, comentários de `coletor.ts:57` e `sql.ts:79`); recorte fixo da consulta de apoio `server/src/apoio/apoio-l9c.ts:14` (passa a ler o recorte de `ref_dominio`); `FAMILIAS_D12` em `normalizador.ts:46` se o dono mapear famílias novas; rótulo do recorte na tela da Sustentação (o e2e `b3-sust-ei-vg.spec.ts:13` espera "SSSC"). |
| Contrato da equipe | Depende do 097 | Hoje a equipe da sustentação é enum fixo das 3 SSSC no contrato, na biblioteca e no front (`097-filtros-plano.md` §2). O lote L7a/L7b do 097 troca por slug do dado. **O 098 só pode ir para a base real depois do L7a/L7b**; antes disso, time novo cai fora do enum. |

### 2.3 Releitura do histórico e versão de critério (T2.6)
- Ordem operacional: (1) arquivo revisto pelo dono e mesclado; (2) `ac:ref-sync` (fecha as vigências das listas, abre as novas, grava versão de critério); (3) `pnpm coleta ac --reconhecer-mudanca` relê **todo** o recorte novo desde `DATA_MINIMA` (os chamados dos times novos entram com o histórico inteiro; os do SSSC ganham versão só se algo mudou); (4) projeção.
- O `ac:ref-sync` registra a versão **sem métrica** (`dominio-acelerato.ts:186`), e versão sem métrica não marca gráfico (`referencia/repositorio.ts:47-53`). Para haver a marca, o lote acrescenta a entrada `098:recorte-todos-os-times` em `CRITERIOS_ACELERATO` (`referencia/criterios-acelerato.ts`) com todas as métricas da sustentação que leem `dim_chamado`, registrada pelo comando `criterios-ac` na data da mudança.
- Volume: a releitura lê página a página (1.000 por página) dentro de uma sessão; o custo cresce com o recorte (C-AC1 a C-AC4 dão o número). Se passar de algumas dezenas de milhares de chamados, o QA mede tempo e memória da `varredura` no ambiente de homologação antes da produção (teto da estação: 8 GB).
- A guarda de recarga suspeita (`coletor.ts:161-164`) só conta ausências novas sobre os conhecidos; ampliar o recorte não a dispara.

### 2.4 Efeito nos percentis e na regra de 20
- **Visão padrão (sem filtro):** a população passa de "SSSC" para "todos os times do recorte". Percentis 50/85/95, SLA e previsões mudam de patamar; a série inteira é recalculada sobre a população nova (a releitura traz o passado dos times novos). A marca T2.6 mostra a data da mudança; a nota da marca diz que a série inteira foi recalculada (como a `066:S8-com-resposta`). Alternativa (série antiga só com SSSC até a data) pede recorte por data no cálculo: mais complexa, não recomendada (P-098-2).
- **Com filtro de time:** cada time pequeno sozinho cai abaixo de 20 e não publica estatística; a regra continua na biblioteca, sem mudança. `n_fech_12s` de C-AC3/C-AC4 mostra antes quais teriam estatística.
- **Misturar times muito diferentes num percentil** é efeito da decisão do dono e não é comparação entre times: o painel não mostra time contra time. Fica o aviso de conjunto consolidado que o filtro múltiplo já tem.

### 2.5 Gatilho de segurança (`R-SEGURANCA`)
- **Dados pessoais (LGPD):** mais chamados entram no staging pela mesma allow-list (sem pessoa). Os pontos novos são **nomes de domínio**: equipe, organização e categoria podem trazer nome de pessoa ou de cliente. Mitigação: C-AC2b não lista nome de cliente; o dono revisa cada nome antes do commit (como na E4.22); a opção (c) de P-098-1 colocaria nomes de organizações clientes em `dim_chamado.organizacao`, por isso não é recomendada.
- **Banco:** nenhuma permissão nova; nenhuma migração no Acelerato.
- O `security-engineer` revisa a lista de nomes e o recorte antes do `ac:ref-sync` na base real; não precisa de modelo de ameaças novo (mesma fronteira, mesma allow-list).

## 3. (c) BusinessMap: por que o dono vê "só SSC"

### 3.1 O que o código mostra
1. **Não existe dicionário de times no `bm:ref-sync`.** O `bm:ref-sync` grava só `campos` e `motivo_bloqueio` de `businessmap-dominio.json` (`entradas/ref-sync-businessmap.ts`). A tabela de times (`ref_time`, `ref_time_workflow`) vem **só** da migração 0019, com 50 times: 3 com nome e 47 como "Workflow <id>". A referência lida da API (`bm:coleta`, `referencia.ts`) grava `ref_workflow` com o **nome real** do workflow, mas nunca toca a tabela de times.
2. **A lista do filtro "Equipe" do Operacional é a tabela de times**, não o dado: `lerTimesAtivos` (`referencia/repositorio.ts:15`) lista os 50 nomes de `ref_time` (base real, `app.ts:121`). Para o dono, a lista tem 47 entradas "Workflow 105" e parecidas e 3 nomes que não são do SSC: nenhum time reconhecível.
3. **Workflow que não está na 0019 fica fora de todo o fluxo.** No projetor, card de story cujo workflow não tem linha em `ref_time_workflow` fica com `granularidade` e `equipe` nulas (nota `workflow_sem_time`, `normalizador.ts:197-204`): não entra em nenhuma métrica do fluxo. Workflow criado no BusinessMap depois de 2026-10-30 cai aqui sem aviso no painel.
4. **Só os quadros de `BUSINESSMAP_QUADROS_IDS` são coletados** (`coleta-comando.ts:99`); a 0019 cobre os quadros 23, 24, 25, 27, 31, 35 e 79. Quadro fora da variável não tem card na base. (A variável está no `.env`, que não li.)
5. **"SSSC" aparece na Sustentação**, não no BusinessMap: o rótulo do recorte e o filtro de equipe do Acelerato são as três SSSC (D-8). No Resumo os dois blocos ficam lado a lado.

### 3.2 Causa provável
O "só SSC" é a soma de (5) com (2): os únicos nomes de time reconhecíveis na tela são os da Sustentação (SSSC), porque no BusinessMap 47 dos 50 times estão com nome provisório. (3) e (4) podem esconder times de verdade e precisam ser confirmados.

### 3.3 Como confirmar
- **Tela:** perguntar ao dono em que tela viu "só SSC" (P-098-4). Se foi na Sustentação ou no Resumo, a causa é (5) e o E1/E2 resolve.
- **C-BM3:** linha devolvida = workflow de story sem time (causa 3). Cada um vira linha nova em `ref_time_workflow` (time ou `fora`), decisão do dono, no mesmo lote do E4.
- **C-BM4:** quadro de `ref_quadro` com 0 card, ou quadro esperado ausente da lista = causa (4); correção é de configuração (`BUSINESSMAP_QUADROS_IDS`, feita pelo dono) e carga inicial do quadro.
- **C-BM5:** `times_sem_card` mostra quantos times do filtro estão vazios; `cards_fora_do_fluxo` mede (3) e (4) juntas.
- **A coleta deve trazer todos os times?** Ela já traz todos os workflows dos quadros configurados. O que falta é (i) o nome dos 47 (E4), (ii) mapear os workflows novos (C-BM3) e (iii) conferir os quadros (C-BM4). Nada disso muda a coleta em si.

## 4. (d) Plano do E4: nome real dos 47 times

### 4.1 Alternativas
| Via | Como | Veredito |
|---|---|---|
| **A. Migração com lista revista** (recomendada) | Migração nova `00NN_bm_nomes_times` com a lista fechada `time_id → nome`, escrita a partir da saída de C-BM1 **revista pelo dono** (nome de pessoa vira rótulo genérico). Para cada time: fecha a vigência atual (`vigente_ate`) e insere a nova com `motivo = 'correcao'`. | O mesmo mecanismo da 0019; reproduzível em demo, homolog e produção; a revisão do dono fica no PR. Nenhum mecanismo novo. |
| B. Comando que copia de `ref_workflow` | Lê o nome vigente do workflow e grava em `ref_time` | Pula a revisão do dono (nome de pessoa entraria direto) e cria comando novo. Rejeitada. |
| C. Dicionário de times no `bm:ref-sync` | Arquivo versionado de times sincronizado com vigência | Útil se os times mudarem com frequência, mas é mecanismo novo sem evidência de necessidade (a tela do 057 já é o caminho previsto para mudança). Fica como critério de reversão. |

### 4.2 Desenho da via A
- **Vigência:** `vigente_de` = data da migração; `motivo = 'correcao'`. Pelo `vigenteEm` (`referencia.ts:361`) a correção vale **desde o início da versão que corrige**, então o nome novo vale para todo o período coletado. Fica registrado quem e quando (`registrado_por` = `correcao-098-E4`, fora da API).
- **Versão de critério (T2.6):** uma linha em `ref_versao_criterio` (`dominio = 'businessmap'`, referência `098-E4:nomes-dos-times`) **sem métrica**: renomear não muda nenhum cálculo, então não marca gráfico, como a de partida da 0019.
- **Reprojeção:** `dim_card.equipe` guarda o **nome** e o id do filtro é `slug(nome)` (risco R2 do 097). Depois da migração, `pnpm --filter @metricas-dspd/server run bm:projetar --reconstruir`: `dim_card` é refeita (é a única tabela limpa, DT-1) e `dim_card_versao` ganha versão nova só nos cards cuja equipe mudou. Sem a reprojeção, o filtro lista o nome novo e os cards têm o antigo: filtro vazio.
- **Validações na migração (falha antes de gravar):** 47 `time_id` existentes e vigentes com nome `Workflow <id>`; nome não vazio, até 80 caracteres (o nome do workflow pode ter até 120: C-BM1 marca `nome_longo`, o dono encurta); `slug(nome)` único entre os 50 times (C-BM2); nenhum nome igual a um dos 3 já nomeados.
- **Desfazer:** o `down` não apaga (o gatilho não deixa e o histórico fica); grava nova correção com o nome provisório, ou falha se já houver vigência posterior.
- **Efeitos:** links e filtros guardados com `equipe=workflow-105` passam a cair no aviso de valor inválido existente. Lista dos times da migração no código, sem nome de pessoa, revista no PR.
- **Gatilho de segurança:** banco (migração em tabela de referência, só INSERT e fechamento de vigência, nenhuma permissão nova) e dados pessoais (nome de workflow pode trazer nome de pessoa: revisão do dono e do `security-engineer` na lista antes do merge).

## 5. (e) Lotes (até 150 linhas cada) e ordem

| Lote | Agente | Escopo | Depende de | Gatilho de segurança |
|---|---|---|---|---|
| D1 | dono | Roda C-AC1 a C-AC4, C-BM1 a C-BM5; responde P-098-1 a P-098-4 | — | não |
| A1 | software-architect | `acelerato-dominio.json`: listas de recorte e vocabulário do recorte novo (depois de C-AC5, 12a, 12b); `acelerato-listas.md` §4 a §6 e §12; ADR nova que revê a D-8 e a população do briefing | D1, P-098-1 e P-098-3 | sim: dados pessoais (nomes) |
| A2 | node-backend | `CRITERIOS_ACELERATO` + `098:recorte-todos-os-times`; textos "SSSC das 3 equipes"; `apoio-l9c` lendo o recorte de `ref_dominio`; `FAMILIAS_D12` se o dono mapear famílias novas; testes | A1; 097 L7a | não (sem coluna nova, sem permissão) |
| A3 | react-frontend | Rótulo do recorte na Sustentação vindo do dado (sem "SSSC" fixo); e2e `b3-sust-ei-vg` | 097 L7b, A2 | não |
| A4 | dono + tech-lead | Operação: `ac:ref-sync`, `criterios-ac`, `coleta ac --reconhecer-mudanca`, projeção; primeiro em homolog com medição do QA | A2, A3 | sim: revisão do `security-engineer` da lista |
| B1 | node-backend | Migração `00NN_bm_nomes_times` (47 nomes revistos) + linhas novas de `ref_time_workflow` para os workflows de C-BM3 que o dono decidir; testes de vigência, unicidade de slug e tamanho | D1 (lista revista) | sim: banco, dados pessoais |
| B2 | dono + tech-lead | `bm:projetar --reconstruir` depois da migração; conferir C-BM1 (`cards_projetados` > 0 com o nome novo) e C-BM5 | B1 | não |

- **Paralelo:** trilho A (Acelerato) e trilho B (BusinessMap) não dependem entre si. node-backend: B1 → A2 (B1 primeiro: não depende do 097). react-frontend: A3 depois do 097 L7b. O QA prepara desde já os casos de B1 (vigência, slug, reprojeção) e de A4 (releitura no recorte maior, marca T2.6, regra de 20 por time).
- **Ordem com o 097:** A2 a A4 só depois de L7a/L7b do 097 na `develop`; B1 não espera o 097, mas B2 roda depois de qualquer deploy que mexa no filtro de equipe, para os nomes já saírem certos.

## 6. Perguntas ao dono
- **P-098-1** (já na fila): recorte novo do Acelerato (a) todos os times do tipo "DSPD - SSSC" nas organizações do DSPD, (b) todos os tipos e times das organizações do DSPD, ou (c) todo o Acelerato? **Recomendação:** decidir com a saída de C-AC1 a C-AC4; entre as três, (b) se os outros tipos forem do DSPD, senão (a). (c) não: traz nomes de organizações clientes para a base e chamados que não são do DSPD.
- **P-098-2:** com o recorte novo, a série histórica da Sustentação é recalculada inteira com todos os times (marca na data da mudança), ou o passado continua só SSSC? **Recomendação:** recalcular inteira, com a marca. É o que a releitura já faz e evita um recorte por data no cálculo.
- **P-098-3:** para cada time novo, qual a natureza (incidente ou requisição) pela categoria, como a prioridade dele vira P1 a P5, e quais etapas são finais, de espera e de fornecedor? **Recomendação:** responder com a saída de C-AC5, 12a e 12b; sem resposta, o time entra com esses campos nulos e a contagem aparece no controle da coleta, mas o painel não se publica com contagem de fora do domínio sem o dono ter visto.
- **P-098-4:** em que tela você viu "só SSC"? **Recomendação:** se foi na Sustentação ou no Resumo, a causa é o recorte do Acelerato (E1/E2); se foi no filtro Equipe do Operacional, são os nomes provisórios (E4) e, se C-BM3 ou C-BM4 devolverem linhas, workflows ou quadros fora da tabela de times.
- **P-098-5:** os workflows de story sem time (C-BM3) entram como time próprio, como time existente ou como `fora`? **Recomendação:** decidir um a um na saída de C-BM3, no mesmo PR do B1.

## 7. Riscos e critérios de reversão
| Id | Risco | Mitigação | Reverter quando (fato observável) |
|---|---|---|---|
| R1 | Vocabulário incompleto zera natureza e prioridade dos times novos em silêncio | Recorte e vocabulário no mesmo `ac:ref-sync`; contagem de fora do domínio vista pelo dono antes de publicar | `fora_dominio_categoria` ou `prioridade_fora_da_escala_p` acima de 5% dos chamados lidos na primeira coleta: voltar a lista de recorte anterior por `ac:ref-sync` até completar o vocabulário |
| R2 | Releitura do recorte maior passa do teto de memória | Medição em homolog antes da produção | `varredura` falha por memória ou passa de 30 min em homolog: paginar a gravação por lote de chamados antes de ir à produção |
| R3 | Renomear sem reprojetar esvazia o filtro (R2 do 097) | B2 logo depois de B1 | Time ativo de `ref_time` com 0 card em C-BM1 depois do B2 |
| R4 | Nome de workflow com nome de pessoa | Revisão do dono e do `security-engineer` | — (bloqueia o merge do B1) |
| R5 | Time renomeado com frequência depois do 098 | Tela do 057 é o caminho previsto | Mais de uma correção de nome de time por mês em dois meses seguidos: dicionário de times versionado no `bm:ref-sync` (via C do §4.1), com ADR |
| R6 | 098 implantado antes do L7a/L7b do 097 | Dependência explícita no §5 | — (A4 não começa sem L7a/L7b na `develop`) |

## 8. Afrouxa alguma regra?
Não. Nenhum texto de `docs/regras/`, de `tests/config.json` ou de controle muda; a allow-list do Acelerato fica igual; nenhum mecanismo novo (a via A usa migração como a 0019, e o recorte usa o `ac:ref-sync` existente). A população "DSPD-SSSC" escrita no briefing muda por decisão do dono: registro em ADR nova (lote A1) e versão de critério com marca (§2.3).

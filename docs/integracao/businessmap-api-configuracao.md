# BusinessMap: configuração da integração real (API v2)

Data: 2026-10-11. Revisado em 2026-10-29 (pedido 052, E1.1, e E1.6 com as decisões do dono de 2026-10-29: Q-2, Q-4, Q-5, Q-7, Q-8 e item 8) contra a ADR 0020 (R-2 = B, migração 0015, revisão 3), a ADR 0022 (proposta) e o código de `server/src/modulos/businessmap`; o plano em fatias da coleta e do webhook está em `docs/architecture/features/052-integracao-businessmap.md`. Complementa `docs/architecture/features/integracao-real.md`. Colunas, seções e tipos de coluna estão em `docs/analises/businessmap-colunas-e-tipos.md` (não repetido aqui).

## 0. Fontes e legenda
Fonte principal: a especificação OpenAPI pública da API v2 (`https://demo.kanbanize.com/openapi/json`, 2,2 MB), lida em blocos de 100 mil caracteres por um resumidor automático. Também `https://businessmap.io/api`. A base de conhecimento (`knowledgebase.businessmap.io`) retorna 403: **artigos oficiais não foram lidos**.

- **[DOC]** consta na especificação OpenAPI lida.
- **[INF]** inferência minha, a confirmar contra o swagger da conta.
- **[NÃO LIDO]** existe indício, mas o trecho não foi acessado.

Limite desta leitura: o resumidor não devolve o texto bruto; trate nomes de parâmetros como confiáveis e descrições longas como paráfrase. Antes de codar o coletor, abrir o swagger da própria conta (Minha conta > API) e conferir os itens marcados.

## 1. Autenticação
- Chave de API alfanumérica enviada em cabeçalho: **`apikey: <chave>`** [DOC]. A especificação também aceita `Authorization` (OAuth 2.0, token que expira em 1 hora) [DOC]. **Decisão para nós: só `apikey`**, sem OAuth (mais simples, sem renovação).
- Onde gerar: no BusinessMap, menu "Minha conta" > "API" [DOC, businessmap.io/api]. Há também `POST /my/apiKey/generate` [DOC; gera nova chave, **invalida a anterior [INF]**, não usar no coletor].
- A chave pertence a um **usuário** e herda as permissões dele [INF]. Não há escopo "somente leitura" na chave [INF, não vi escopos]. Portanto a leitura somente leitura só é garantida **pelo papel do usuário**: o alvo é um usuário de serviço (ex.: `svc-metricas`) com papel de **leitor/visualizador** nos quadros coletados, sem permissão de editar, com a chave gerada nele. **Por ora (Q-5 = B, dono, 2026-10-29) a chave é a do próprio dono**, com poder de escrita; a troca para o usuário de serviço é pendência antes da coleta agendada em produção (§7 item 1). Os caminhos de escrita (`POST/PATCH/PUT/DELETE`) não são usados e o coletor não deve ter cliente que os exponha (testar: o cliente HTTP só aceita GET).
- Permissão mínima necessária [INF]: ver cards, histórico/revisões, bloqueios e estrutura dos quadros listados; ler usuários só por `GET /users` com `user_ids` e `fields=user_id,realname`, para os nomes dos responsáveis (Q-8 = B, §4.9).
- Segredo só em `.env`; nunca em log, erro, URL ou `payload` gravado (redaction do cabeçalho `apikey`).

## 2. Base URL
- Formato: `https://<conta>.kanbanize.com/api/v2` [DOC para o prefixo `/api/v2`; o host da especificação é o da demo]. O host da **sua** conta pode ser `<conta>.kanbanize.com` ou outro domínio da Businessmap [INF]: confirmar na tela "Minha conta > API".
- Resposta de listas: `{ "data": { "pagination": { "all_pages", "current_page", "results_per_page" }, "data": [ ... ] } }` [DOC para `/cards`]. Endpoints de objeto único devolvem `{ "data": {...} }` [INF].

## 3. Limites de taxa, paginação e retry
- Limite por hora (padrão **600**) e por minuto (padrão **30**) [DOC]. Valores da conta: `GET /apiLimits` [DOC]. Existe também `/oldApiLimits` [DOC, legado].
- Cabeçalhos: `X-RateLimit-PerMinute-Remaining` [DOC]; `X-RateLimit-PerHour-Limit/Remaining` e `PerMinute-Limit` [espelho de terceiros, ver análise de colunas].
- Excedeu: HTTP **429** com corpo contendo `retry_after` em segundos [DOC].
- Paginação: `page` e `per_page`. Padrão geral 100/máx. 200 [DOC]; **`GET /cards`: padrão 200, máximo 1000** [DOC].
- Filtros não suportados são **ignorados sem erro** [DOC]: validar a resposta (contar e conferir datas) em vez de confiar no filtro.

Estratégia do coletor:
1. **Orçamento**: 30/min é o gargalo. Cliente com limitador local (ex.: 1 chamada a cada 2,5 s, parametrizável) lendo `PerMinute-Remaining`.
2. **429**: dormir `retry_after` (mais jitter) e repetir; não contar como falha do item.
3. **5xx e erro de rede**: até 3 tentativas com backoff exponencial (1 s, 4 s, 16 s) e timeout por chamada (ex.: 30 s); depois falha do item em `ctl_coleta_falha`, categoria segura (`indisponivel`, `tempo-esgotado`).
4. **401/403**: não repetir; tipo `autenticacao`, interromper a coleta (chave inválida/revogada).
5. Coleta incremental por `last_modified_from` (ver §4.2) reduz o volume: a carga inicial histórica é a única cara. Estimativa: N cards / 1000 por página; o custo real vem de `revisions` por card (1 chamada por card, ver §4.3). Com 30/min, 1.000 cards = cerca de 35 minutos só de revisões: **usar `expand=transitions,block_times` (§4.3) para evitar essa chamada quando bastar**.

## 4. Endpoints para o coletor
Todos GET.

### 4.1 Quadros, workflows e colunas
| Necessidade | Endpoint | Status |
|---|---|---|
| Workflows do quadro | `GET /boards/{board_id}/workflows` (sem parâmetros) | [DOC] |
| Colunas por workflow (tempo de ciclo) | `GET /boards/{board_id}/workflows/{workflow_id}/cycleTimeColumns` e `/effectiveCycleTimeColumns` | [DOC] |
| Estrutura do quadro com colunas/raias (nome, `section`, `flow_type`, `limit`, `position`, `parent_column_id`) | schema `Column` tem esses campos [DOC]; **o endpoint que devolve a árvore (provavelmente `/boards/{board_id}/currentStructure`)** | [NÃO LIDO]: só vi a menção a `currentStructure` na descrição de `/blockReasons`. Confirmar no swagger |
| Listar quadros (`GET /boards`) e filtros | existe `/boards` [INF] | [NÃO LIDO] |
| Mudanças de estrutura | `GET /boards/history` (`board_ids`, `event_types` como `column_created`, `from`, `to`) [DOC] | útil para T2.6 (mudança de critério) |

`flow_type` e `section` da coluna são os campos que alimentam `ref_coluna` (`tipo_coluna`, `papel`); a leitura de significado está na análise de colunas.

**Decisões do dono de 2026-10-30 (H-1, H-8 a H-12; plano 052, §10).** O diagnóstico de estrutura (E1.20) confirmou na resposta os campos `section` (1 a 5), `flow_type` (1 ou 2), `limit`, `parent_column_id` e `workflow_id` da coluna, e o `type` do workflow (0 cards, 1 iniciativas, 2 linha do tempo). Uso no coletor:
- **Nível pelo workflow (H-1):** `type=1` em quadro de coordenador = feature ou pacote; `type=0` = story (menos o tipo Sprint, que não é item, H-2); quadro 35 = projeto. Vai para `ref_workflow.nivel`.
- **Papel na coluna folha (H-8 a H-11):** fila ou execução pelo `flow_type` da folha (2 = fila, 1 = execução); compromisso = primeira entrada na seção 2; entrega = primeira entrada na seção 4; coluna "Descartado" = descarte, mesmo na seção 4. Exceções em arquivo versionado (`ref:sync`), preparado pelo arquiteto e conferido pelo dono.
- **Limite de WIP (H-12):** `ref_coluna.limite_wip` = `limit` de cada coluna; 0 = sem limite. No diagnóstico, só seis colunas têm limite maior que 0 (workflows 63, 65, 191 e 208).
- **Workflows fora e times:** não vêm da API. A tabela de times no banco (`ref_time`, `ref_time_workflow`; decisão de 2026-10-30 16:44) diz quais workflows formam cada time e quais ficam fora: 257, 201, 321, 215, 216 e 196 fora de todo cálculo (H-7); 200, 207, 198, 313 (Kaizen), 203 (RDM/GMUD) e 234 (Acompanhamento Atividades) fora do painel operacional (pedido 057 E3). Workflow fora continua coletado; sai no cálculo.

### 4.2 Cards (listagem) [DOC]
`GET /cards`. Filtros: `card_ids`, `board_ids`, `workflow_ids`, `type_ids`, `custom_ids`, `column_ids`, `lane_ids`, `last_column_ids`, `last_lane_ids`, `sections`, `is_blocked`, `sizes`, `priorities`, `owner_user_ids`, `reason_ids`.
- **`state=active|archived|discarded`**: é assim que se alcançam **arquivados e descartados** (excluir o filtro não garante trazê-los [INF]; fazer uma varredura por estado, três chamadas paginadas).
- Datas (`YYYY-MM-DD HH:mm:ss`; variante `_date` com `YYYY-MM-DD`): `created_from/to`, **`last_modified_from/to`** (base da carga incremental), `first_start_*`, `first_end_*`, `last_start_*`, `last_end_*`, `in_current_position_since_*`, `deadline_*`, `archived_from/to` (com `state=archived`), `discarded_from/to` (com `state=discarded`). **Na carga real (2026-11-01, E2.83):** `archived_from`/`discarded_from` com data pura dão 400; o coletor manda data e hora em UTC (`AAAA-MM-DDT00:00:00Z`, aceito pela API).
- `fields` (restringe colunas) e `expand` [DOC]. Campos selecionáveis relevantes: `card_id`, `title`, `custom_id`, `type_id`, `size`, `priority`, `deadline`, `created_at`, `revision`, `last_modified`, `board_id`, `workflow_id`, `column_id`, `lane_id`, `section`, `last_column_id`, `last_lane_id`, `archived_at`, `reason_id`, `discard_comment`, `discarded_at`, `is_blocked`, `block_reason`, `current_block_time`, `current_cycle_time`, `child_card_stats`, `first_request_time`, `first_start_time`, `first_end_time`, `last_request_time`, `last_start_time`, `last_end_time`.
- `expand` úteis: **`custom_fields`**, **`transitions`**, **`block_times`**, `linked_cards`, `lead_time_per_column`, `subtasks`, `tag_ids`, `initiative_details`.
- **`co_owner_ids` é valor de `expand`, não de `fields`** (enum da OpenAPI v2; em `fields` a API devolve 400 "The query parameters did not pass validation", carga real de 2026-11-01). O coletor pede `owner_user_id` em `fields` e `co_owner_ids` em `expand` (E2.83); os dois seguem só em memória (ADR 0020, 4b e 4c).
- **Evitar** (pessoa e texto livre): `reporter`, `watcher_ids`, `logged_times`, `last_comment`, `comment_count`, `description`, `discard_comment`, `subtasks`. Usar `fields=` com a allow-list fechada da ADR 0020 item 4a (e filtrar de novo no código antes do `INSERT`) para que o dado de pessoa nem chegue à staging (minimização LGPD).
- **Responsáveis** (`owner_user_id`, `co_owner_ids`): pedidos à parte da lista de 4a, lidos **só em memória** e entregues ao projetor na mesma execução, que os grava apenas em `dim_card.responsaveis` e `dim_card_versao.responsaveis` (data-model §9, decisão do usuário de 2026-10-10); nunca em `stg_`. Também alimentam, em memória, `houveTroca` (O26) e a faixa do E8 (ADR 0020 4b e 5). A API do projeto nunca devolve visão por pessoa. **R-1** (reidentificação no E8 e no T14) foi decidida em 2026-10-16 (B, ADR 0020 item 9). Nomes dos responsáveis: §4.9.
- Campos marcados `[NÃO LIDO]` só entram na lista depois do spike da fase 3; campo novo exige alteração da ADR 0020.
- Card individual: `GET /cards/{card_id}` [DOC].
- Exclusão: a API tem `deleteMany`, mas **não há listagem de excluídos** [INF]; usamos a varredura semanal de presença (`stg_card_presenca`, `excluido_detectado`), já no modelo.

### 4.3 Histórico de transições
Duas rotas [DOC], ambas pedem validação no swagger:
- **`GET /cards/{card_id}/revisions`** e **`/revisions/{revision}`**: o schema `CardRevision` tem `card_id`, `board_id`, `column_id`, `lane_id`, `revision`, `created_at`, `replaced_at`, `user_id`, `custom_fields`, `subtasks`, `linked_cards`. Cada revisão guarda a posição do card naquele momento; transição = mudança de `column_id` entre revisões consecutivas [INF]. Mapeia para `stg_revision` e `fato_transicao` (`fonte='revision'`). Custo: 1 chamada por card (e por revisão se não vier em lista [INF]).
- **`expand=transitions` e `expand=block_times` em `GET /cards`**: [DOC] existem como valores de `expand`; **campos de cada item não lidos** [NÃO LIDO]. Se trouxerem coluna e instante de entrada/saída, são a via barata para a carga em lote (poucas chamadas de 1000 cards). Também `lead_time_per_column`. Ação do usuário/Jarvis: chamar um card real com esses `expand` e anexar o JSON (sem dados de pessoa) ao arquivo de análise.
- `user_id` das revisões é pessoa: não entra na `stg_revision` (allow-list fechada, ADR 0020 4c) e não é relido por nenhum cartão; a coluna `fato_transicao.usuario` foi **removida** (decisão R-2 = B do dono em 2026-10-16, migração 0015; data-model §9). Os ids de responsável da revisão são lidos em memória só para o `troca_responsavel` (O26).

### 4.4 Bloqueios
- No card: `is_blocked`, `block_reason`, `current_block_time` [DOC]; histórico por `expand=block_times` [DOC; campos não lidos].
- `GET /cards/{card_id}/blockReason` [DOC]: bloqueio atual.
- Catálogo de motivos: `GET /blockReasons` (`label`, `availability`, `is_enabled`, `expand`) e `GET /blockReasons/{reason_id}/cards` [DOC]; alimenta `ref_dominio.motivo_bloqueio`.
- Histórico de alterações do catálogo (não dos bloqueios dos cards): `GET /blockReasons/history` [DOC].

### 4.5 Pai/filho e vínculos
`GET /cards/{card_id}/parents`, `/children`, `/parentGraph`, `/childGraph`, `/linkedCards`, `/relatives`, `/predecessors`, `/successors` e `/subtasks` [DOC]. Para o coletor: `expand=linked_cards` na listagem [DOC] ou `parents`/`children` por card; popula `stg_vinculo` e `dim_card.card_pai`. **Qual tipo de vínculo o time usa para story, frente e projeto precisa ser confirmado pelo usuário** (não resolver por inferência). `child_card_stats` vem em `fields` [DOC].

### 4.6 Campos customizados
- Definições: `GET /customFields` e `/customFields/{field_id}` [DOC] (o `field_id` é o que entra na configuração do mapeamento para `sistema`, `area_solicitante`, `fornecedor`, `severidade` etc., data-model §3.4).
- Valores do card: `expand=custom_fields` [DOC] ou `GET /cards/{card_id}/customFields`.
- Opções de listas: `/customFields/{field_id}/allowedValues` [DOC, citado na descrição de regra].
- Tipos de card: `GET /cardTypes` [DOC, parâmetros não lidos]; `type_id` vira `tipo_card`. Mapa tipo → item ou não item (Sprint fora, H-2) e → categoria do briefing §4.3 (H-17) em `ref_tipo_card`, pelo arquivo de conferência.
- **Campos fora (E1.22):** o field 36 (ID Acelerato) **não é coletado** (H-16, 2026-10-30): nenhum cálculo liga card do BusinessMap a chamado do Acelerato. O field 42 (Responsável CR, tipo `contributor`) é de pessoa e fica fora (ADR 0020 4c e 4d). Nenhum dos 12 campos do briefing §4.4 existe no quadro (diagnóstico E1.20): O8, O12 e O14 a O18 seguem fictícios até a WS1 criá-los (H-13), e o O6 sai sem classe de serviço (H-15).

### 4.7 Motivos de descarte
`GET /discardReasons/{reason_id}/cards` e histórico `/discardReasons/history` [DOC]; lista `GET /discardReasons` [INF]. Alimenta `motivo_descarte`.

### 4.8 Webhooks
- Gerenciamento por API: `GET/POST /webhooks`, `GET/PATCH/DELETE /webhooks/{webhook_id}`, `GET /webhooks/history` [DOC]. Criação: corpo com `url` (1 a 65000 caracteres, http/https), `board_id` (obrigatório, **um webhook por quadro**), `is_enabled` [DOC].
- **Segredo**: não vai no corpo; é devolvido **na resposta de criação**, uma vez ("guardar com segurança") [DOC]. Guardar em `WEBHOOK_BM_SEGREDO`.
- **[NÃO LIDO / pendente]**: lista de eventos assinados, formato do payload, **como o segredo assina a entrega** (cabeçalho, algoritmo HMAC?) e política de reentrega. A especificação lida não trouxe isso (os "eventos" `created/updated/deleted` do schema são do log de auditoria do próprio webhook). Isso vive na base de conhecimento, que deu 403. **O usuário precisa colar o artigo de webhooks** antes de ligar o receptor; o receptor já existe (`POST /webhooks/businessmap`, `server/src/modulos/businessmap/webhook.ts`) e confere um segredo compartilhado no cabeçalho `x-webhook-secret` (SHA-256 e comparação em tempo constante, antes de ler o corpo); os campos que ele lê do corpo (`evento`, `card`, `anterior`, `timestamp`) são **supostos**. Se o BusinessMap assinar o corpo (HMAC) em vez de enviar o segredo, o receptor muda na fatia F7 do plano 052. Não há consumidor de `bm.webhook.recebido` no worker ainda.
- Requisito de rede: a URL precisa ser alcançável pela internet a partir do BusinessMap (a API do projeto está em `127.0.0.1`): exige reverse proxy/túnel com TLS. **Se isso não for possível, usar só polling** (suficiente: coleta diária às 06:00).
- Recomendação: **polling é a fonte de verdade** (revisions + `last_modified_from` com sobreposição); webhook é acelerador opcional, reconciliado depois (`rec_transicao_par`), como já está no modelo. Formalizado na ADR 0022 (proposta): webhook só depois de URL pública com TLS, formato confirmado e T2.2 pronta (opção C do plano 052, §3).

### 4.9 Usuários (sem expor pessoa)
`GET /users` [DOC] (`user_ids`, `emails`, `usernames`, `fields`, `expand`). Nenhuma métrica usa nome. **Decisão do dono de 2026-10-29 (Q-8 = B):** os responsáveis do card ficam também pelo nome, resolvido por `GET /users`, confirmando a decisão de 2026-10-10 ("nomes" nas tabelas analíticas). Uso permitido, só pelo coletor (ADR 0020 revisão 3): `GET /users?user_ids=<ids de responsável vistos na execução>&fields=user_id,realname`; nunca `emails`, `usernames`, `expand`, nem `GET /users/{id}/lastActivity`; a resposta passa por allow-list (`user_id`, `realname`). Os ids (`owner_user_id`/`co_owner_ids`) continuam em `dim_card.responsaveis` e `dim_card_versao.responsaveis`; os nomes ficam só em colunas de `COLUNAS_PESSOA` (proposta: `dim_responsavel`), fora do GRANT do `dspd_api`, nunca em `stg_` nem em log. Nome do campo `realname` e o efeito real de `fields` a confirmar no spike F1 [INF].

## 5. O que cada endpoint nos dá versus o modelo
| Tabela / contrato | Origem | Endpoint | Observação |
|---|---|---|---|
| `stg_card`, `dim_card_versao`, `dim_card` | card | `GET /cards` (+ `fields`, `expand=custom_fields`) | marcos `first_*`/`last_*` da API são **comparação**; os nossos marcos saem da função única T2.4 sobre transições |
| `evt_card` (`arquivado`, `excluido_detectado`) | `state`, `archived_at`, `discarded_at`; varredura | `GET /cards?state=...` | desarquivado/restaurado inferidos de reaparecer em `active` |
| `stg_revision`, `fato_transicao` | revisões/`transitions` | `/cards/{id}/revisions` ou `expand=transitions` | `coluna_destino_id` = `column_id`; tipo/direção vêm de `ref_coluna` |
| `evt_bloqueio`, `fato_bloqueio` | bloqueios | `expand=block_times` | duração em horas úteis calculada pela biblioteca, nunca em SQL |
| `stg_vinculo`, `card_pai` | vínculos | `parents`/`children`/`linked_cards` | tipo de vínculo a confirmar |
| `ref_quadro`, `ref_workflow`, `ref_coluna` | estrutura | workflows + estrutura do quadro | nível pelo `type` do workflow (H-1), papel e fila × execução pela `section` e pelo `flow_type` da folha mais exceções conferidas (H-8 a H-11), limite de WIP pelo `limit` (H-12); `eh_teste` e as exceções **não vêm da API** (arquivo de conferência) |
| `ref_time`, `ref_time_workflow` | **não vem da API** | n/a | tabela de times no banco, com histórico e marcação T2.6 (decisão de 2026-10-30 16:44, que supera o arquivo da H-6); carga inicial do pedido 057 E3; edição pela tela do 057 |
| `ref_dominio` | campos customizados, tipos, motivos | `customFields`, `cardTypes`, `blockReasons`, `discardReasons` | domínios fechados 4.4 |
| `ctl_coleta*` | nós | n/a | `marca_dagua_ate` = maior `last_modified` visto |
| `ConfigBM` (SLE, alocação acordada, limite de frentes) | **não vem da API** | N-5 decidida (Q-7c = A, 2026-10-29): arquivo versionado no repositório, preenchido pela governança (WS6) | configuração |

## 6. Variáveis do `.env` (nomes, sem valores)
Já existentes: `WEBHOOK_BM_SEGREDO`, `PG_WEBHOOK_URL`, `PG_COLETOR_URL`, `LOG_LEVEL`. **Propostas novas** (em 2026-10-29 nenhuma está em `config.ts`; entram na fatia F0 do plano 052) (o `node-backend` valida com zod na partida, em `server/src/plataforma/config.ts`, e atualiza `.env.example`):
- `BUSINESSMAP_URL_BASE` (ex.: formato `https://<conta>.kanbanize.com/api/v2`, sem barra final)
- `BUSINESSMAP_APIKEY`
- `BUSINESSMAP_QUADROS_IDS` (lista de IDs separados por vírgula; quadros de teste excluídos)
- `BUSINESSMAP_LIMITE_POR_MINUTO` (padrão 30, usar abaixo do real, ex.: 25)
- `BUSINESSMAP_TIMEOUT_MS` (padrão 30000)
- `BUSINESSMAP_PAGINA_TAMANHO` (padrão 200; máx. 1000)
- `WEBHOOK_BM_SEGREDO` (já existe; só se o webhook for ligado)

Mapeamentos de campo customizado (`field_id` para `sistema`, `fornecedor` etc.) são **dado de configuração versionado** (arquivo em `docs/` ou `ref_`), não segredo, e não vão no `.env`.

## 7. Roteiro: o que o usuário precisa entregar ou fazer
1. **Decidido** (dono, 2026-10-29, Q-5 = B: "por enquanto sera o meu, entao B"): por ora a chave é a **do próprio dono** (MCP e coletor), não de um usuário de serviço só leitor; ela tem os poderes do dono e pode alterar o quadro, risco aceito por ele (registrado em `docs/security/052-integracao-businessmap-ameacas.md`). Mitigação: coletor só GET com lista fechada de caminhos; no MCP, só ferramentas de leitura. **Pendência:** criar um usuário de serviço com papel somente de leitura nos quadros da coleta e trocar a chave antes da coleta agendada em produção.
2. **Gerar a apikey** (Minha conta > API) e copiá-la **direto para o `.env` da máquina do dono** (`BUSINESSMAP_APIKEY`); a coleta real roda só ali (Q-4 = A, 2026-10-29; homologação e servidor ficam fora). **Não colar a chave em chat, issue, commit ou documento.**
3. Informar o **host da conta** (o endereço que aparece no navegador e na tela da API) para fixar `BUSINESSMAP_URL_BASE`.
4. Listar os **IDs dos quadros** a coletar e marcar quais são de teste (fora do cálculo, briefing 4.2). O ID aparece na URL do quadro (`/ctrl_board/<id>`) [INF]. **Decidido** (dono, 2026-10-30, "a"): 35, 23, 24, 25, 27, 31 e 79; nenhum quadro de teste entre eles; os workflows de teste ou fora de cálculo saem pela H-7 (257, 201, 321, 215, 216, 196), na tabela de times.
5. Informar **quais campos customizados** representam: tipo de demanda, sistema, área solicitante, fornecedor, objetivo estratégico, severidade, causa raiz, fase de detecção, origem, tamanho (nome e `field_id`, obtidos com `GET /customFields`). **Situação (E1.20 e decisões de 2026-10-30):** nenhum desses campos existe no quadro; o tipo de demanda sai do tipo de card (H-17); as métricas que dependem dos outros seguem fictícias até a WS1 criá-los (H-13), e a classe de serviço espera o campo (H-15).
6. Confirmar o **tipo de vínculo** pai/filho usado para story, frente e projeto (§4.5) e quais **colunas** são fila/execução/compromisso/entrega (ver análise de colunas; é decisão do usuário, não minha). **Colunas decididas** (dono, 2026-10-30): H-8 (`flow_type` da folha, com exceções conferidas), H-9 (compromisso = primeira entrada na seção 2), H-10 (entrega = primeira entrada na seção 4), H-11 (coluna "Descartado" = descarte). A lista de exceções é preparada pelo arquiteto (plano 052, §10) e conferida pelo dono antes da F2.
7. Colar (sem dados de pessoa) um **exemplo de resposta** de um card real com `expand=transitions,block_times,custom_fields` (§4.3) e a página oficial de **webhooks** (eventos e assinatura).
8. **Webhook ou só polling** (§4.8). O dono delegou ao time ("facarecomendacao", 2026-10-29); vale a **recomendação do time C**: polling agora, webhook depois de três fatos (URL pública com TLS disponível, artigo de webhooks lido ou payload real capturado, T2.2 pronta com sete execuções sem falha), no plano 052 §3 e na ADR 0022, mostrada ao dono antes do código. **Polling por comando até nova liberação** (H-20 = C, dono, 2026-10-30): a coleta agendada das 06:00 (Q-7b) fica para depois e a coleta roda por comando manual na máquina do dono (plano 052, F3, "Ordem"). Como a coleta roda só na máquina do dono (Q-4 = A), a topologia da URL pública volta ao dono quando a fatia do webhook for liberada.
9. **Decidido** (dono, 2026-10-10, R-2 = B em 2026-10-16 e Q-8 = B em 2026-10-29; ADR 0020 4b, 4c e revisão 3): `responsaveis` coletados só em memória e gravados em `dim_card`/`dim_card_versao` (ids da API), nunca em `stg_`; os **nomes** dos responsáveis resolvidos por `GET /users` (`fields=user_id,realname`, §4.9) e gravados só em colunas de `COLUNAS_PESSOA`, fora do GRANT do `dspd_api`; `usuario` das transições não é coletado (coluna removida na migração 0015).
10. Rodar os testes de conexão (§8) e entregar o resultado.

## 8. Testar a conexão (somente leitura)
Executar na máquina do dono (a única onde a coleta real roda, Q-4 = A), com a chave carregada do `.env` (nunca digitada no comando nem em log de shell compartilhado). Use um arquivo de cabeçalho para não deixar a chave no histórico:
```bash
# 1) autenticação e limites (o mais barato; não retorna cards)
curl -sS -H "apikey: $BUSINESSMAP_APIKEY" "$BUSINESSMAP_URL_BASE/apiLimits"
# 2) um card, só campos não pessoais
curl -sS -H "apikey: $BUSINESSMAP_APIKEY" \
  "$BUSINESSMAP_URL_BASE/cards?board_ids=<ID>&per_page=1&fields=card_id,title,column_id,section,created_at,last_modified"
# 3) arquivados (confirma o filtro de estado)
curl -sS -H "apikey: $BUSINESSMAP_APIKEY" \
  "$BUSINESSMAP_URL_BASE/cards?board_ids=<ID>&state=archived&per_page=1&fields=card_id,archived_at"
```
Leitura dos resultados: HTTP 200 com `data` = autenticado. 401/403 = chave errada ou sem permissão. 429 = respeitar `retry_after`. **Não testar escrita com a chave do dono** (Q-5 = B): ela pode alterar o quadro, e a tentativa seria uma alteração real. A prova de "escrita negada" só volta quando houver usuário de serviço só leitor (pendência do item 1); até lá, a garantia é o cliente só GET, testado contra servidor falso.

**Diagnóstico da estrutura (WS1, K-185).** Na máquina do dono, `pnpm run bm:diagnostico` (da raiz; carrega o `.env`) imprime no stdout um relatório em Markdown com espaços de trabalho, quadros, workflows, colunas, raias, tipos de card e definições de campos customizados (só `field_id`, nome e tipo). Faz só GET num conjunto fechado de caminhos (`/workspaces`, `/boards`, `/boards/{id}/currentStructure`, `/boards/{id}/workflows`, `/cardTypes`, `/customFields`), em sequência e dentro do limite por minuto. Variáveis: `BUSINESSMAP_URL_BASE` e `BUSINESSMAP_APIKEY` (obrigatórias; faltando, sai com código 2 nomeando a variável), `BUSINESSMAP_QUADROS_IDS` (opcional, ids separados por vírgula), `BUSINESSMAP_LIMITE_POR_MINUTO` (padrão 25) e `BUSINESSMAP_TIMEOUT_MS` (padrão 30000). O relatório não traz cards, usuários, valores permitidos de campo, descrições, e-mails nem a chave; todo campo fora da lista de campos permitidos é descartado, e resposta em formato diferente do esperado aparece como "formato não reconhecido" com as chaves de topo. 401 e 403 interrompem com `autenticacao`; 5xx e erro de rede somam 3 tentativas no total, com espera de 1 s e de 4 s entre elas, e a seção do relatório diz `indisponivel` ou `tempo-esgotado`; o 429 espera o `retry_after` (até 5 vezes por caminho) antes de contar as tentativas, e persistindo diz `limite de 429 esgotado`. `BUSINESSMAP_URL_BASE` exige `https:` (`http:` só em 127.0.0.1, localhost e ::1); redirecionamento é recusado, para a chave não seguir a outro host. O dono confere a saída antes de colar.

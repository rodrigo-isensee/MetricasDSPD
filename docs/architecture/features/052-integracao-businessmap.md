---
tipo: plano-tecnico
contrato: 1
pedido: 052
estado: proposta
ux: docs/ux/integracao-real/05-especificacao.md
adrs: [0014, 0015, 0016, 0020, 0022]
agentes: [node-backend, react-frontend, qa-engineer, tech-lead, security-engineer]
gatilhos_seguranca: [credencial-externa, dados-pessoais, webhook, banco, dependencia-nova]
---

# 052 - Integração real com o BusinessMap: coleta (T2.2) e webhook (T2.3) em fatias

Etapa E1.1 do pedido 052, revisada na E1.6 (2026-10-29) com as decisões do dono de 2026-10-29 (§7). Atualiza o desenho do pedido 006 (`integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`, `data-model.md`) contra o código de `server/src/modulos/businessmap` em `develop` (a6e7543) e as ADRs posteriores a 2026-10-11 (0015 a 0021). Entradas do discovery em paralelo: modelo de ameaças `docs/security/052-integracao-businessmap-ameacas.md` (E1.2, revisão E1.7) e delta de UX `docs/ux/integracao-real/06-delta-2026-10-29.md` (E1.3, revisão E1.8). Decisão nova proposta: ADR 0022.

Este documento é **proposta**: nada de E2 a E6 começa antes da validação do dono (o plano revisado, com a recomendação do item 8) e da E1.4 (apikey no `.env` e WS1 confirmada). As perguntas de regra de negócio da §7 foram todas respondidas pelo dono em 2026-10-29.

**Escopo do painel (decisão "i", 2026-10-29):** E4 é o **painel operacional inteiro** com dado real do BusinessMap: as 18 métricas do FL1 (briefing §FL1) e as complementares O19 a O26. **FL2 e FL3 seguem em mock**, assim como as complementares T e E. Acelerato e sustentação (inclusive a cadência "Sustentação" dentro do `/operacional` e o `EI_SUST`) ficam para o pedido seguinte.

**Conferência com a constituição:** o projeto não tem `docs/constituicao.md`. Conferido contra as regras invioláveis do `CLAUDE.md`: **conforme**. BusinessMap só em `dspd_bm` (Acelerato fora do pedido); nenhuma métrica individual (ids e nomes dos responsáveis só em colunas de `COLUNAS_PESSOA`, ADR 0020 4b e revisão 3, fora da API por GRANT; nenhuma rota, DTO ou tela por pessoa); mínimo de 20 itens mantido na biblioteca; staging append-only e versões em `dim_card_versao` (nada sobrescreve histórico); apikey só no `.env` da máquina do dono; coleta só com GET; as dúvidas de regra de negócio foram perguntadas ao dono (§7), nenhuma foi decidida aqui; ordem WS1 → WS2 → WS3 preservada na sequência das fatias (§4).

## 1. O que o código já cobre (develop a6e7543)

| Peça | Onde | Estado |
|---|---|---|
| Allow-list da fronteira (card, revisão, webhook, campos customizados por domínio) | `modulos/businessmap/allow-list.ts` | Pronta (ADR 0020 4a, 4c). `CAMPOS_REVISAO` e `CAMPOS_WEBHOOK` sem campo de pessoa. |
| Gravação no staging com dedupe por hash e versão anterior | `modulos/businessmap/staging.ts` (`gravarStgCard`, `gravarStgRevision`) | Pronta, com testes. Sem chamador: nenhuma coleta a usa ainda. |
| Responsáveis pela memória do coletor | `modulos/businessmap/responsaveis.ts` (`gravarResponsaveis`) | Pronta (ids). Exige versão do card já projetada na mesma execução. Os nomes (Q-8 = B) ainda não existem. |
| Receptor do webhook | `modulos/businessmap/webhook.ts` (`POST /webhooks/businessmap`, `x-webhook-secret`, 256 KB, 202, outbox `bm.webhook.recebido`) | Pronto, mas o formato do payload é **suposto** (`evento`, `card`, `anterior`, `timestamp`): o artigo da Kanbanize não foi lido (403). |
| Consumidor de `bm.webhook.recebido` | `entradas/worker.ts` | **Não existe.** Eventos recebidos ficariam pendentes na outbox. |
| Worker, agenda, trava por fonte, outbox | `plataforma/worker.ts`, `agenda.ts`, `db/trava.ts`, `eventos/` | Prontos. `tarefas: []`: nenhuma tarefa de coleta registrada. |
| Ciclo de coleta e frescor | `modulos/operacao` (`ctl_coleta`, `fecharColeta`, `GET /fontes/:dominio/estado`, `/coletas`) | Pronto (006). Hoje alimentado pelo seed. |
| Esquema BM | migrações 0001 a 0015 | Todas as tabelas do `data-model.md` §3 e §6 existem. `fato_transicao.usuario` removida (0015). |
| Cliente HTTP do BusinessMap (S-22, ADR 0015) | `plataforma/http.ts` | **Não existe.** Nenhuma variável `BUSINESSMAP_*` em `config.ts`. |
| Rate-limit do webhook (S-21) | `@fastify/rate-limit` | **Não instalado.** |
| Normalizador e projetor (staging → `evt_card`, `fato_transicao`, `fato_bloqueio`, `dim_card`) | n/a | **Não existe.** Hoje `dim_card` e fatos vêm do seed do mock. |
| Biblioteca de cálculo (marcos, percentis, Monte Carlo) | `packages/metricas` | Pronta (T2.5); marcos por card em `businessmap/estado.ts` e `indice.ts`. |
| Front lendo a API real | `HttpFonteMetricas` (web) | Pronto: os painéis já leem a API; o que muda é o conteúdo do banco. |
| Origem dos dados no servidor | `server/src/app.ts:36,74-76` (`fonteDados: 'mock' \| 'real'`) | **Global**: ou tudo do mock ou tudo do banco. Não atende "FL1 real, FL2 e FL3 em mock" (F6). |
| Métricas complementares (O19 a O26, T, E) | `server/src/plataforma/db/extensoes-mock.ts` | Mock hoje, derivadas da base do seed. **O19 a O26 passam a dado real no 052** (decisão "i", fatia F6b); T e E (FL2, FL3) seguem no mock. |

## 2. O que mudou desde 2026-10-15 e afeta o desenho

- **ADR 0020 (proteção de pessoa no coletor), vigente:** allow-list na fronteira; responsáveis nunca em `stg_`, só em `dim_card.responsaveis` e `dim_card_versao.responsaveis` (4b); `fato_transicao.usuario` removida (R-2 = B, migração 0015); campos customizados só por domínio fechado (4c); "Time responsável" de tipo usuário ou texto livre para o cartão e volta ao dono (4d); autor de comentário não entra (4e). **Revisão 3 (2026-10-29, Q-8 = B):** nomes dos responsáveis resolvidos por `GET /users` (`fields=user_id,realname`), só em colunas de `COLUNAS_PESSOA`, fora do GRANT do `dspd_api`. O §7 item 9 do roteiro está **decidido**: este plano só o aplica.
- **ADR 0015:** cliente HTTP S-22 (ky + p-throttle) e S-21 (rate-limit do webhook) decididos, não implementados. Entram na fatia F0.
- **ADR 0016 (SCD2 e identidade por id), proposta:** `mapa.ts` converte id de coluna em nome pelo `ref_coluna` vigente; no quadro real (9 workflows com colunas homônimas, segundo a ADR) isso agrupa colunas diferentes. **U-1 e U-2 decididas pelo dono em 2026-10-29** (Q-6): a F2 está desbloqueada nesse ponto. A ADR cita `docs/integracao/businessmap-estrutura-real.md`, que não existe no repositório (risco R-6).
- **Achados abertos do `k084-coletor-allow-list.md`:** B-K1 (forma das strings), B-K2 (`\u0000` e catch só com código), B-K3 (negado por padrão para `stg_bloqueio`, `stg_custom_field`, `stg_vinculo` e `stg_coluna`; a parte (a), do arquiteto, entra agora na ADR 0022), I-1 (contador de webhooks ignorados), I-2 (`fields=` e "mesma execução" como pronto).
- **Modelo de ameaças E1.2:** A1 a A9 e CA-1 a CA-13 viram critério de pronto das fatias (indicado em cada uma). Pré-condições do §5 dele respeitadas na ordem das fatias.
- **Delta de UX E1.3:** nada muda na especificação validada; P-1 = B, P-4 = A e P-5 = B (dono, 2026-10-29) entram na F6; P-2 resolvida pelo catálogo (§7); P-3 conferida pelo QA cartão a cartão na F6.

## 3. Recomendação do time para o item 8 do roteiro (webhook ou só polling)

Decisão do dono de 2026-10-29: "facarecomendacao". **Vale a recomendação do time (C), marcada como recomendação do time**, mostrada ao dono com este plano antes do código.

| Opção | O que é | Efeito | Custo e risco |
|---|---|---|---|
| A | Só polling, para sempre | T2.2 cumprida; **T2.3 não** (critério de pronto do briefing exige webhook com divergência < 1%). Latência de até 24 h (coleta diária). | Menor superfície. Deixa `webhook.ts` sem uso. |
| B | Polling e webhook na primeira entrega | T2.2 e T2.3 juntas. | Exige URL pública com TLS **antes** da primeira coleta, o artigo de webhooks lido (formato e assinatura), consumidor novo, S-21. Dois caminhos novos com dado real ao mesmo tempo; a semana de operação paralela da T2.3 só faz sentido com a T2.2 estável. |
| **C (recomendação do time, vale pela "facarecomendacao")** | Polling agora (F3 a F5); webhook numa fatia posterior (F7), liberada por três fatos: URL pública com TLS disponível, artigo de webhooks lido (item 7), T2.2 pronta (7 execuções sem falha) | T2.2 primeiro, T2.3 depois, sem retrabalho: o receptor e o modelo (`stg_webhook_evento`, `rec_transicao_par`, `vw_transicao_canonica`) já existem. | Latência de até 24 h até a F7. Nenhum risco de pessoa novo antes da F7. |
| D | Polling mais frequente (por exemplo a cada hora) no lugar do webhook | Reduz latência sem exposição pública. | Não cumpre a T2.3; gasta cota (30/min, 600/h) que a carga inicial e a varredura semanal usam. Pode complementar C se o dono quiser latência menor antes da F7. |

**Base da recomendação C:**
- O briefing põe a T2.3 dependente da T2.2 e mede a T2.3 contra a API ("divergência entre webhook e API abaixo de 1% em uma semana de operação paralela"): sem polling estável não há contra o que medir.
- A revisão (`/cards/{id}/revisions`) é a fonte canônica do instante da transição (`data-model.md` §3.2, N-3); o webhook só antecipa. Nenhum painel perde exatidão sem ele.
- O modelo de ameaças (E1.2, S-2) recomenda só polling na primeira entrega; a API escuta em 127.0.0.1 (ADR 0014), e a coleta real roda só na máquina do dono (Q-4 = A): expor o receptor exigiria túnel com TLS até a máquina do dono, decisão de topologia que fica para a liberação da F7.
- O formato real do payload e o mecanismo de autenticação do webhook não foram lidos (403 na knowledgebase); construir o consumidor agora seria desenhar contra suposição.

Divergência com a segurança: nenhuma. A segurança recomenda A ou C para a primeira entrega; C mantém a T2.3 no horizonte, que é critério de pronto do briefing.

## 4. Fatias

Legenda de dependência: números = itens do roteiro §7 de `businessmap-api-configuracao.md` (1 chave: a do dono por ora, Q-5 = B; 2 apikey no `.env` da máquina do dono, 3 host, 4 IDs dos quadros, 5 campos customizados, 6 vínculos e papel das colunas, 7 exemplo de card e artigo de webhooks, 8 webhook (recomendação do time, C), 9 pessoa (decidido), 10 testes de conexão). "WS1" = configuração do quadro confirmada pelo dono.

**Onde roda (Q-4 = A, 2026-10-29):** toda coleta real (spike, carga inicial, coleta diária, varredura) roda **só na máquina do dono**, com a chave no `.env` local e banco local. Homologação, CI e servidor não recebem a chave nem dado real; neles a coleta é testada só contra servidor falso.

**Chave (Q-5 = B, 2026-10-29):** a chave é a do próprio dono (pode alterar o quadro), risco aceito por ele por ora. Mitigação do time: cliente HTTP só GET com lista fechada de caminhos (F0); no MCP, só ferramentas de leitura. **Pendência:** trocar por usuário de serviço só leitor antes da coleta agendada em produção (qualquer ambiente fora da máquina do dono).

### F0. Fundações sem dado real (pode começar logo após a validação deste plano)
- **O quê:** cliente HTTP S-22 em `plataforma/http.ts` (ADR 0015) com os controles da E1.2: só GET, lista fechada de caminhos (inclui `/users`, só com `fields=user_id,realname` e `user_ids=`, ADR 0020 revisão 3), https com host fixo vindo do `.env` e sem seguir redirect, erro próprio sem `cause` nem corpo, redact da apikey no logger, limitador ≤ 25/min (folga sob 30/min), 429 respeita `retry_after`, 401/403 interrompe a execução sem nova tentativa, teto de páginas por execução. Como a chave do dono pode escrever (Q-5 = B), o "só GET" e a lista fechada de caminhos são a única barreira contra escrita no quadro: teste obrigatório. Variáveis novas em `config.ts` (validadas por Zod, a apikey nunca logada): `BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY`, `BUSINESSMAP_QUADROS_IDS`, `BUSINESSMAP_LIMITE_POR_MINUTO`, `BUSINESSMAP_TIMEOUT_MS`, `BUSINESSMAP_PAGINA_TAMANHO`. B-K1 e B-K2 no coletor (relacionados ao K-086 da E5, que fica para a E5).
- **Depende de:** nada do roteiro. Testes com servidor falso local (sem chamar a API).
- **Pronto:** testes do cliente cobrindo CA da E1.2 aplicáveis (método diferente de GET rejeitado, caminho fora da lista rejeitado, `/users` com `fields` diferente de `user_id,realname` rejeitado, host diferente rejeitado, redirect não seguido, apikey ausente de log e erro, 429, 401).
- **Agente:** node-backend; review tech-lead; QA; leitura do security-engineer (dependência nova: ky e p-throttle, já decididas na ADR 0015).

### F1. Spike de leitura do quadro real (T2.1 e K-087)
- **O quê:** leitura da **forma** do quadro real. Duas ferramentas, com papéis separados (decisão "A" do MCP, 2026-10-29): (a) o **MCP do BusinessMap**, configurado pelo dono, é ferramenta do time para consultar o quadro durante o discovery e o desenvolvimento (K-087 e mapa de campos), **só com ferramentas de leitura**; (b) uma CLI manual (`pnpm` script do server, nunca agendada), na máquina do dono, que chama pela API REST, com a apikey do `.env`, `/boards`, `/workflows`, `/columns`, `/lanes`, `/customFields`, uma página de `/cards` com `expand=custom_fields,transitions,block_times,linked_cards`, `/cards/{id}/revisions` de poucos cards e o caminho de comentários de um card (O22), e **registra só a forma**: chaves, tipos, cardinalidade, contagens. Nos dois casos, nunca valores de campo de texto, nunca nomes, nunca e-mails; **dado de pessoa vindo do MCP não entra em documento**. Saída fica fora do repositório (scratch do dono) até revisão do security-engineer. O coletor do sistema segue pela API REST.
- **Perguntas que o spike responde:**
  - **K-087 (Time responsável):** id, tipo, cardinalidade e `allowedValues` do campo. Se for lista de valores fechada, entra em `ref_dominio` e no mapa de domínios da allow-list (ADR 0020 4c). Se for de tipo usuário ou texto livre, **para** e volta ao dono (ADR 0020 4d).
  - **P-T1 (critério de reversão da ADR 0020):** a troca de responsável gera revisão? Se gerar com dado de pessoa, a allow-list da revisão continua cortando; se não gerar, a memória do coletor (4b) é o único caminho, como já desenhado.
  - Forma de `transitions`, `block_times`, `linked_cards` (`link_type`), dos comentários (O22) e do campo de estado (arquivado, descartado).
  - Forma da resposta de `GET /users` com `fields=user_id,realname` (nome do campo e se `fields` restringe de fato a resposta; filtros não suportados são ignorados sem erro, §3 do roteiro).
  - Número de cards por quadro nos últimos 12 meses (Q-2 = C) e de revisões por card, para dimensionar a carga inicial contra 600/h.
- **Depende de:** 2, 3, 4, 10 e da F0 (o item 1 está resolvido pela Q-5 = B: chave do dono). **Produz:** o item 7 (exemplo de card, em forma) e insumo dos itens 5 e 6.
- **Pronto:** relatório de forma revisado pelo security-engineer; `docs/integracao/businessmap-estrutura-real.md` escrito (fecha o R-6) sem valores de pessoa.
- **Agente:** node-backend executa com o dono presente (a apikey é dele); security-engineer revisa a saída.

### F2. Referência real (apoio à WS1)
- **O quê:** carga de `ref_quadro`, `ref_coluna` (por id, com workflow), `ref_dominio` (valores fechados dos campos customizados aceitos) e do mapa `field_id` → domínio usado pela allow-list. Troca da conversão id → nome em `mapa.ts` pela identidade por id (ADR 0016). Aplicação das decisões U-1 e U-2 (2026-10-29): mudança de papel de coluna por **mudança de processo** gera nova versão com vigência a partir da data e marcação T2.6, e os cards anteriores são medidos "como foi"; **correção de erro de mapeamento** vale para todo o período (`motivo = 'correcao'`); card que muda de workflow ou de tipo conta no time e na granularidade **do instante do evento medido** (entrega para vazão e tempo de ciclo; o dia para WIP e CFD).
- **Depende de:** 4, 5, 6, WS1 confirmada, F1. (U-1 e U-2 decididas em 2026-10-29.)
- **Pronto:** papel de cada coluna (fila, trabalho, concluído, descarte) registrado como versão de critério (T2.6) com data; nenhuma coluna real sem papel; testes de U-1 (versão por processo × correção) e U-2 (card que muda de workflow conta no time do instante do evento).
- **Agente:** node-backend; tech-lead; QA.

### F3. Coleta incremental para o staging (T2.2, parte 1)
- **O quê:** tarefa `bm.coleta.diaria` registrada no worker (**06:00 America/Sao_Paulo**, Q-7b = A, `agenda.ts`), sob `comTravaDaFonte('businessmap')`: abre `ctl_coleta`, lê `/cards` nos três estados (`active`, `archived`, `discarded`) com `last_modified_from` = marca d'água menos a sobreposição (`data-model.md` §6) e `fields=` explícito (I-2), grava cada card por `gravarStgCard` e as revisões novas por `gravarStgRevision`, chama `gravarResponsaveis` na **mesma execução** do projetor (I-2, ADR 0020 4b), resolve os nomes dos responsáveis ainda não conhecidos por `GET /users` (`fields=user_id,realname`, `user_ids=` só dos ids vistos na execução; ADR 0020 revisão 3), registra contagens em `ctl_coleta_contagem` e falhas em `ctl_coleta_falha` (só código e id, B-K2), grava host e hash da lista de quadros em `ctl_coleta` (E1.2) e fecha por `fecharColeta` (publica `coleta.concluida`). Roda na máquina do dono (Q-4 = A).
- **Carga inicial (Q-2 = C, 2026-10-29):** **últimos 12 meses**, a mesma rotina sem marca d'água, só por comando manual com o dono presente (E1.2), **retomável por página** (guarda a última página concluída por estado e quadro em `ctl_coleta`); período mais antigo pode vir depois pela mesma rotina com outra data de início, sem alterar o que já foi gravado.
- **Ordem:** a tarefa agendada só é registrada no worker quando a WS1 estiver confirmada (CLAUDE.md, ordem obrigatória); antes disso, só a carga manual em base de teste.
- **Depende de:** 2, 3, 4, 10; F0, F1, F2.
- **Pronto:** cards arquivados e descartados presentes; nenhuma linha de `stg_` alterada (gatilho `proibir_alteracao`); nenhum campo fora da allow-list (teste estrutural, B-K3 parte b); nenhum nome em `stg_`, log ou `ctl_coleta_falha`; apikey ausente de log; carga inicial interrompida e retomada sem duplicar.
- **Agente:** node-backend; QA prepara os testes com servidor falso em paralelo; security-engineer lê o diff.

### F3b. Allow-lists dos staging restantes (B-K3)
- **O quê:** listas fechadas para `stg_bloqueio`, `stg_vinculo`, `stg_custom_field` e `stg_coluna`, escritas como **revisão 4** da ADR 0020 a partir da forma real vista na F1. Até lá vale o "negado por padrão" da ADR 0022: a coleta **não grava** nessas tabelas. Como o O19 (bloqueios por causa) está no escopo do 052 (decisão "i"), a parte de `stg_bloqueio` é pré-condição da F6b.
- **Depende de:** F1. **Pronto:** revisão 4 da ADR 0020 com leitura do security-engineer; teste estrutural dos INSERT em `stg_` (todo INSERT passa por um `registro*` da allow-list).
- **Agente:** software-architect (ADR), security-engineer (leitura), node-backend (código).

### F4. Normalizador e projetor (T2.4)
- **O quê:** do staging para `evt_card`, `fato_transicao` (fonte `revision`), `evt_bloqueio`, `fato_bloqueio` e `dim_card`/`dim_card_versao` (SCD2, ADR 0016, com U-1 e U-2 decididas), com tempos e marcos calculados só pela biblioteca (`packages/metricas`, T2.5). Idempotente: reprocessar a mesma coleta não duplica nem altera fato já gravado. Grava os nomes dos responsáveis só na tabela de nomes da ADR 0020 revisão 3 (colunas em `COLUNAS_PESSOA`, fora do GRANT do `dspd_api`).
- **Depende de:** F2 e F3 (e F3b para bloqueios e vínculos).
- **Pronto (critério T2.4):** 20 cards sorteados do quadro real com os 4 marcos conferidos pelo dono contra a ferramenta (roteiro de conferência preparado pelo QA); teste de grants: `dspd_api` não lê ids nem nomes de responsável; teste do catálogo LGPD para as colunas novas.
- **Agente:** node-backend; QA; tech-lead; security-engineer lê a migração das colunas de nome.

### F5. Varredura semanal e reconciliação (T2.2, parte 2)
- **O quê:** tarefa semanal de presença (lista ids nos três estados e marca `excluido_detectado` sem apagar nada) e reconciliação de contagem contra a ferramenta em `ctl_reconciliacao`.
- **Depende de:** F3, F4.
- **Pronto (critério T2.2):** sete execuções diárias consecutivas sem falha na máquina do dono, reconciliação de contagem conferida, arquivados presentes. Evidência: linhas de `ctl_coleta` e `ctl_reconciliacao`, não descrição.
- **Agente:** node-backend; QA confere as sete execuções.

### F6. Painel operacional com dado real (E4, WS3): núcleo FL1, origem por métrica e transição
- **O quê:**
  - **Origem por métrica.** Hoje `fonteDados` é global (`app.ts:36,74-76`). O 052 precisa servir, na mesma API, o painel operacional do banco real e FL2, FL3 (e a cadência Sustentação, que é Acelerato) do mock. Proposta: um mapa único `origemDaMetrica(id): 'real' | 'mock'` em `contratos` (padrão do `fonteDaMetrica` da lacuna de valor), que o servidor usa para escolher o contexto (base real ou base do seed, prefixos de schema distintos) e que alimenta o selo "Dados fictícios" de cada cartão e a contagem do cabeçalho (P-1 = B). Nenhum cálculo mistura as duas origens: cada métrica vem inteira de uma. As 18 do FL1 e `EI_FL1` (Espera invisível · Operacional, fonte BusinessMap no catálogo) passam a `real`; O19 a O26 passam a `real` na F6b. Detalhe e nomes finais com o node-backend; vira ADR se o tech-lead julgar no review do plano.
  - A API passa a ler o banco alimentado pela coleta, em base separada da do seed (o seed do mock não roda contra a base real).
  - Janela de calibração do BusinessMap ligada à primeira coleta real: **60 dias corridos, decidida** (Q-7a = A; D3 do 006 deixa de ser provisória). `metricasEmCalibracao` cobrindo também os ids complementares (necessidade da E1.3).
  - Selo de frescor: "Atrasado" quando até **12:00** não houver coleta ok do dia (coleta às 06:00, folga de 6 h; Q-7b = A): `TOLERANCIA_ATRASO_HORAS = 6` em `core/frescor.ts`.
  - **P-1 = B:** selo "Dados fictícios" por cartão mais nota no cabeçalho do painel com a contagem de cartões ainda fictícios (dado: a contagem sai do mapa de origem, por painel). **P-4 = A:** o arquivo exportado leva, por cartão, fonte, "Atualizado em", selo de frescor, "em calibração" e "dados fictícios". **P-5 = B:** faixa "Dados de calibração" e selo de frescor visíveis mesmo com todas as métricas da fonte ocultas (CA-04).
- **Depende de:** F5 pronta.
- **Pronto:** **P-3:** o QA confere cartão a cartão que todo cartão do painel operacional que publica percentil, taxa ou previsão segue "abaixo de 20 não publica" com a mesma mensagem (técnico, decisão de 2026-10-29); teste de que nenhuma métrica é calculada com as duas origens; FL2 e FL3 continuam idênticos ao mock (hash da base inalterado).
- **Agente:** node-backend (mapa de origem, estado da fonte, frescor); react-frontend (nota do cabeçalho, Exportar, preferências × calibração); QA; ux-designer revisa.

### F6b. Complementares operacionais O19 a O26 com dado real (E4, decisão "i")
- **O quê:** **revisão de modelagem da fase 3 do pedido 011** (arquiteto + tech-lead, antes de qualquer migração; `metricas-tambem-disponiveis.md`, "Fase 3"), restrita ao que O19 a O26 usam: `dim_card.primeiro_toque_em`, `stg_comentario_instante` e `ref_conta_automacao` (O22, ADR 0020 4e e 4g); `dim_card.passagens` (O26, `houveTroca` em `coletor/`); instante e motivo nativos de descarte (`discarded_at`, `reason_id`) e o catálogo `/discardReasons` como `ref_` com vigência (O25); `fato_bloqueio` real (O19, depende da F3b); `fato_transicao` (O20 fluxo cumulativo e O21 fluxo reverso); `dim_card` (O24 ordem de chegada); O23 é bloco do O2. O que só FL2 e FL3 usam (`equipe_responsavel` do T14, `stg_vinculo_relacao`, `fato_vinculo`, `agg_conhecimento_sistema` do E8, `data_acordada_original` e `replanejamentos`, se a revisão confirmar que não servem a O19 a O26) **fica fora do 052**. A extensão real substitui `extensoes-mock.ts` só para esses ids.
- **Depende de:** F4 e F3b (O19); spike F1 com a forma de comentários e revisões.
- **Pronto:** cada O19 a O26 lido do banco real, com a mesma regra do mock (decisões do 011 já registradas: O19-pct, O20-destaque, O25(b), R-1, R-2', Q-a e Q-b); guarda `guarda-api.pg.test.ts` e teste de grants no mesmo PR da migração (pré-condição K-085); P-T1 resolvida no spike (se a troca de responsável não gerar revisão, O26 volta ao dono, ADR 0020).
- **Agente:** software-architect e tech-lead (revisão de modelagem); node-backend; security-engineer (migração com coluna de pessoa ou tabela fora da API); QA.

### F7. Webhook de transições (T2.3), condicionado
- **O quê:** confirmar o formato real do payload e a autenticação (ajustar `registroWebhook` e, se a Kanbanize assinar o corpo, trocar o segredo compartilhado pela verificação de assinatura); consumidor de `bm.webhook.recebido` registrado no worker (`stg_webhook_processamento`, `fato_transicao` com fonte `webhook`, `rec_transicao_par`); S-21 (`@fastify/rate-limit`); contador de eventos ignorados (I-1); exposição por túnel com TLS sem abrir a API inteira (só a rota do webhook); Business Rule de mudança de coluna configurada na WS1; retenção de `stg_webhook_evento` (S-4, perguntada ao dono quando a F7 for liberada).
- **Liberação (fatos observáveis):** URL pública com TLS disponível (item 8); artigo de webhooks lido ou payload real capturado (item 7); F5 pronta. Com Q-4 = A, a URL pública chega à máquina do dono: a topologia (túnel até ela ou outro ambiente, o que reabre a Q-4 e a pendência da Q-5) volta ao dono na liberação.
- **Pronto (critério T2.3):** divergência entre webhook e API abaixo de 1% em uma semana de operação paralela, medida por `rec_transicao_par`. Fecha N-3 (tolerância de 120 s) com dado real.
- **Agente:** node-backend; security-engineer (modelo de ameaças A3 a–f da E1.2 antes do código); devops-engineer (túnel, se o dono aprovar a topologia); QA.

### Sequência e paralelismo
F0 → F1 → (F2 ∥ F3b) → F3 → F4 → F5 → F6 → F6b; a revisão de modelagem da F6b pode correr em paralelo com F3 a F5 (é documento). F7 depois de F5, em paralelo com F6 se liberada. Enquanto o dono cumpre os itens 2 a 7 e 10, só a F0 anda.

## 5. Contratos entre front e back
Nenhuma rota nova. Os painéis já leem `GET /metricas/...`, `GET /fontes/:dominio/estado` e `/coletas`; o que muda é a origem dos dados. Com P-1 = B e P-4 = A (dono, 2026-10-29), o estado da fonte (ou o catálogo de cartões) ganha, por painel, a origem de cada métrica e a contagem de cartões ainda fictícios, e o Exportar ganha fonte, "Atualizado em", selo de frescor, "em calibração" e "dados fictícios" por cartão; detalhados pelo node-backend na F6. Nenhum campo de pessoa em nenhum contrato (schemas `.strict()`).

## 6. Riscos
- **R-1 Formato do webhook desconhecido.** `registroWebhook` lê campos supostos; o artigo deu 403. Mitigação: F7 só depois de payload real ou artigo lido.
- **R-2 Time responsável de tipo usuário ou texto.** Para a F2 e volta ao dono (ADR 0020 4d). Mitigação: spike F1 cedo.
- **R-3 Cota da API na carga inicial.** 600/h com revisões por card (e comentários por card, O22) pode exigir horas. Mitigação: carga manual de 12 meses (Q-2 = C) retomável por página; número medido na F1.
- **R-4 Colunas homônimas em 9 workflows.** Sem a ADR 0016 aplicada, o tempo por coluna mistura colunas. Mitigação: F2 aplica a identidade por id com U-1 e U-2 já decididas.
- **R-5 Fictício ao lado de real no mesmo painel e na mesma API.** Com FL1 real e FL2, FL3 em mock, o aviso global de dados fictícios (D5 do 006, `tipo === 'mock'`) deixa de valer, e um mapa de origem errado mostraria número fictício como real. Mitigação: mapa único de origem (F6), selo por cartão e nota do cabeçalho (P-1 = B), teste de que FL2 e FL3 continuam com hash do mock.
- **R-6 Documento citado e ausente.** `businessmap-estrutura-real.md` é citado pela ADR 0016 e não existe; a F1 o escreve.
- **R-7 Dado de pessoa vazando por campo não previsto.** Mitigação: allow-list, negado por padrão (ADR 0022), teste estrutural, leitura da saída do spike pelo security-engineer, levantamento de dados antigos antes da primeira coleta real (k084); dado de pessoa vindo do MCP fora de documento.
- **R-8 Chave do dono com poder de escrita (Q-5 = B, risco aceito pelo dono).** Um bug no cliente ou uma ferramenta de escrita do MCP poderia alterar o quadro real. Mitigação: cliente só GET com lista fechada de caminhos e teste (F0); no MCP, só ferramentas de leitura; nenhum teste de escrita com essa chave (o roteiro §8 deixou de pedir a prova de escrita negada); troca para usuário de serviço só leitor antes da coleta agendada em produção.
- **R-9 Achados B-K1/B-K2 e K-086 (E5) entrelaçados.** Mitigação: B-K1 e B-K2 na F0; K-086, K-088 e K-089 seguem na E5, antes da F3 entrar em `develop` com a tarefa agendada.
- **R-10 Coleta dependente da máquina do dono (Q-4 = A).** Máquina desligada às 06:00 = sem coleta do dia; o selo vira "Atrasado" às 12:00 (Q-7b), como previsto, mas as sete execuções consecutivas do critério T2.2 (F5) só fecham com a máquina ligada sete dias seguidos. Mitigação: a tarefa recupera a coleta perdida ao subir o worker (próxima execução lê desde a marca d'água; nada se perde, só atrasa).
- **R-11 Nomes de pessoa na base (Q-8 = B).** Amplia o dado pessoal guardado (antes só ids). Mitigação: ADR 0020 revisão 3 (só `COLUNAS_PESSOA`, fora do GRANT do `dspd_api`, nunca em `stg_` nem em log, `GET /users` só com `user_ids` vistos e `fields=user_id,realname`), leitura do security-engineer (E1.7) e retenção ligada à I-12 (DPO).

## 7. Decisões do dono (2026-10-29) sobre as perguntas deste plano
Nenhuma pergunta deste plano está aberta. Respostas literais em `docs/pedidos/052-integracao-businessmap.md`, "Decisões do usuário".
- **Q-1 (item 8, webhook).** Decidido pelo dono em 2026-10-29: "facarecomendacao" (vale a recomendação do time). Recomendação do time: **C**, polling agora e webhook depois das três condições da ADR 0022 (§3, F7).
- **Q-2 (carga histórica).** Decidido pelo dono em 2026-10-29: "C": a carga inicial traz os últimos 12 meses; mais antigo pode vir depois (carga retomável). Aplicado na F3.
- **Q-3 (complementares).** Decidido pelo dono em 2026-10-29: "i": E4 é o painel operacional inteiro (18 do FL1 e O19 a O26) com dado real; FL2 e FL3 (e as complementares T e E) seguem em mock. Aplicado na F6 e na F6b.
- **Q-4 (onde roda).** Decidido pelo dono em 2026-10-29: "A" (S-3): a coleta real roda só na máquina do dono (chave no .env local, banco local); homologação e servidor ficam fora. Aplicado no §4.
- **Q-5 (usuário de serviço).** Decidido pelo dono em 2026-10-29: "por enquanto sera o meu, entao B" (S-1): a chave (MCP e coletor) é a do próprio dono; risco aceito por ora; troca para usuário de serviço só leitor é pendência antes da coleta agendada em produção. Aplicado no §4 e no R-8.
- **Q-6 (ADR 0016).** Decidido pelo dono em 2026-10-29: U-1 = "A": mudança de processo no quadro mede os cartões anteriores "como foi", com marcação T2.6 na data; correção de erro de mapeamento vale para todo o período. U-2 = "A": card que muda de workflow (time) ou de tipo (granularidade) conta no time e na granularidade do instante do evento medido (entrega para vazão e tempo de ciclo; o dia para WIP e CFD). Aplicado na F2 e na F4.
- **Q-7 (pendências herdadas do 006).** Decidido pelo dono em 2026-10-29: (a) "A": janela de calibração confirmada em 60 dias corridos (D3 do 006 deixa de ser provisória); (b) "A": coleta diária às 06:00; selo vira "Atrasado" se até 12:00 não houver coleta ok (folga de 6 h); (c) "A" (N-5): SLE, alocação acordada, limites de frentes e fichas de resultado vêm de arquivo versionado no repositório, preenchido pela governança (WS6). Aplicado na F3 e na F6.
- **Q-8 (responsáveis: id ou nome).** Decidido pelo dono em 2026-10-29: "B": os responsáveis do card ficam também pelo nome, resolvido por `GET /users` (`fields=user_id,realname`), confirmando a decisão de 2026-10-10; nomes só em colunas de `COLUNAS_PESSOA`, fora do GRANT do `dspd_api`; nenhuma métrica individual. Aplicado na ADR 0020 (revisão 3), na F0, F3 e F4.
- **P-1 a P-5 da UX.** P-1 = B, P-4 = A, P-5 = B (dono, 2026-10-29), na F6. P-3 é técnico (QA cartão a cartão, F6). **P-2 (fonte de PV1 e EI), conferida no catálogo** (`web/src/content/catalogo-metricas.ts`): `EI_FL1`, `EI_FL2` e `EI_FL3` têm fonte **BusinessMap** (granularidades demanda, frente e projeto); `EI_SUST` tem fonte **Acelerato**; `PV1` tem fonte **"Pesquisa de percepção"**, terceira fonte, no painel de Sustentação (`lacuna-de-valor.md` A1 a A4, papel `dspd_pesquisa` no `data-model.md`). Efeito no 052: só `EI_FL1` entra (painel operacional, BusinessMap); `EI_FL2` e `EI_FL3` seguem em mock com FL2 e FL3; `EI_SUST` e `PV1` ficam fora (sustentação, pedido seguinte; PV1 não é coleta do BusinessMap).
- **S-1 a S-4 da segurança.** S-1 = Q-5 e S-3 = Q-4 (acima); S-2 segue a Q-1; S-4 (retenção do webhook) fica para a liberação da F7.

## 8. Suposições
- O 006 continua válido no que não foi revisado aqui (D1 a D6, contrato `coletas.ts`), salvo D3 (agora decidida) e D5 (aviso global de fictícios, substituído pela origem por métrica da F6). Base: código do módulo `operacao` confere com o plano.
- U-1 e U-2 da ADR 0016 decididas (2026-10-29); U-3 foi superada pela ADR 0020 4b (responsáveis mantidos em `dim_card_versao`).
- "Últimos 12 meses" (Q-2 = C) recorta o **histórico**: cards arquivados e descartados com `last_modified` nos últimos 12 meses, e os cards **ativos todos**, qualquer que seja a idade, porque são o estado atual (WIP e envelhecimento ficariam errados sem eles). Base: briefing T2.2 (arquivados presentes) e a natureza do WIP; a confirmação vai ao dono junto com a validação do plano.
- `EI_FL1` faz parte do "painel operacional inteiro" (decisão "i"). Base: catálogo (`painel: 'operacional'`, fonte BusinessMap).
- A função de marcos por card da biblioteca serve ao projetor sem mudança. Base: `packages/metricas/src/businessmap/estado.ts` e `indice.ts`; confirmação na F4.
- Os limites 30/min e 600/h e o retorno 429 com `retry_after` são os do documento de configuração (2026-10-11), não reconferidos (a knowledgebase dá 403).
- O "Fase 3" de `metricas-tambem-disponiveis.md` fala em carga histórica de 24 meses para medir K1; no 052 vale a Q-2 = C (12 meses).

## 9. Divisão por agente
| Agente | Fatias |
|---|---|
| node-backend | F0, F1 (execução com o dono), F2, F3, F3b (código), F4, F5, F6, F6b, F7 |
| react-frontend | F6 (nota de fictícios no cabeçalho, Exportar com contexto, preferências × calibração) |
| qa-engineer | testes de todas as fatias; roteiro dos 20 cards (F4); conferência das 7 execuções (F5); P-3 cartão a cartão (F6); semana paralela (F7) |
| security-engineer | leitura de F0, saída do spike F1, F3b, diff da F3, migração de nomes (F4), migração da F6b, modelo A3 antes da F7 |
| software-architect | ADR 0022, revisão 3 da ADR 0020 (nomes, feita na E1.6), revisão 4 da ADR 0020 (F3b), revisão de modelagem da F6b, fechamento da ADR 0016 |
| tech-lead | review de toda fatia; revisão de modelagem da F6b; branches |
| devops-engineer | só F7 (túnel), se aprovado |

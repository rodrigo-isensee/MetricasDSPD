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

Etapa E1.1 do pedido 052. Atualiza o desenho do pedido 006 (`integracao-real.md`, `docs/integracao/businessmap-api-configuracao.md`, `data-model.md`) contra o código de `server/src/modulos/businessmap` em `develop` (a6e7543) e as ADRs posteriores a 2026-10-11 (0015 a 0021). Entradas do discovery em paralelo: modelo de ameaças `docs/security/052-integracao-businessmap-ameacas.md` (E1.2) e delta de UX `docs/ux/integracao-real/06-delta-2026-10-29.md` (E1.3). Decisão nova proposta: ADR 0022.

Este documento é **proposta**: nada de E2 a E6 começa antes da validação do dono (as perguntas da §7) e da E1.4 (apikey no `.env` e WS1 confirmada).

**Conferência com a constituição:** o projeto não tem `docs/constituicao.md`. Conferido contra as regras invioláveis do `CLAUDE.md`: **conforme**. BusinessMap só em `dspd_bm` (Acelerato fora do pedido); nenhuma métrica individual (responsáveis só em `dim_card`/`dim_card_versao`, ADR 0020 4b, fora da API por GRANT); mínimo de 20 itens mantido na biblioteca; staging append-only e versões em `dim_card_versao` (nada sobrescreve histórico); apikey só no `.env`; coleta só com GET; as dúvidas de regra de negócio estão na §7 como perguntas, não decididas aqui; ordem WS1 → WS2 → WS3 preservada na sequência das fatias (§4).

## 1. O que o código já cobre (develop a6e7543)

| Peça | Onde | Estado |
|---|---|---|
| Allow-list da fronteira (card, revisão, webhook, campos customizados por domínio) | `modulos/businessmap/allow-list.ts` | Pronta (ADR 0020 4a, 4c). `CAMPOS_REVISAO` e `CAMPOS_WEBHOOK` sem campo de pessoa. |
| Gravação no staging com dedupe por hash e versão anterior | `modulos/businessmap/staging.ts` (`gravarStgCard`, `gravarStgRevision`) | Pronta, com testes. Sem chamador: nenhuma coleta a usa ainda. |
| Responsáveis pela memória do coletor | `modulos/businessmap/responsaveis.ts` (`gravarResponsaveis`) | Pronta. Exige versão do card já projetada na mesma execução. |
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
| Métricas complementares (O19 a O26, T, E) | `server/src/plataforma/db/extensoes-mock.ts` | **Só mock**: derivadas da base do seed, não do banco. Continuam fictícias com dado real até a extração da fase 3 do pedido 011. |

## 2. O que mudou desde 2026-10-15 e afeta o desenho

- **ADR 0020 (proteção de pessoa no coletor), vigente:** allow-list na fronteira; responsáveis nunca em `stg_`, só em `dim_card.responsaveis` e `dim_card_versao.responsaveis` (4b); `fato_transicao.usuario` removida (R-2 = B, migração 0015); campos customizados só por domínio fechado (4c); "Time responsável" de tipo usuário ou texto livre para o cartão e volta ao dono (4d); autor de comentário não entra (4e). O §7 item 9 do roteiro (dados de pessoa) está **decidido**: este plano só o aplica.
- **ADR 0015:** cliente HTTP S-22 (ky + p-throttle) e S-21 (rate-limit do webhook) decididos, não implementados. Entram na fatia F0.
- **ADR 0016 (SCD2 e identidade por id), proposta:** `mapa.ts` converte id de coluna em nome pelo `ref_coluna` vigente; no quadro real (9 workflows com colunas homônimas, segundo a ADR) isso agrupa colunas diferentes. As perguntas U-1 e U-2 dela precisam estar fechadas antes da F2. A ADR cita `docs/integracao/businessmap-estrutura-real.md`, que não existe no repositório (risco R-6).
- **Achados abertos do `k084-coletor-allow-list.md`:** B-K1 (forma das strings), B-K2 (`\u0000` e catch só com código), B-K3 (negado por padrão para `stg_bloqueio`, `stg_custom_field`, `stg_vinculo` e `stg_coluna`; a parte (a), do arquiteto, entra agora na ADR 0022), I-1 (contador de webhooks ignorados), I-2 (`fields=` e "mesma execução" como pronto).
- **Modelo de ameaças E1.2:** A1 a A9 e CA-1 a CA-13 viram critério de pronto das fatias (indicado em cada uma). Pré-condições do §5 dele respeitadas na ordem das fatias.
- **Delta de UX E1.3:** nada muda na especificação validada; P-1 (fictício × real), P-4 (Exportar) e P-5 (Preferências) são do dono; a necessidade de dado "`metricasEmCalibracao` cobrindo os complementares" entra na F6.

## 3. Recomendação do time para o item 8 do roteiro (webhook ou só polling)

Decisão do dono de 2026-10-29: "facarecomendacao". A recomendação é mostrada ao dono antes do código.

| Opção | O que é | Efeito | Custo e risco |
|---|---|---|---|
| A | Só polling, para sempre | T2.2 cumprida; **T2.3 não** (critério de pronto do briefing exige webhook com divergência < 1%). Latência de até 24 h (coleta diária). | Menor superfície. Deixa `webhook.ts` sem uso. |
| B | Polling e webhook na primeira entrega | T2.2 e T2.3 juntas. | Exige URL pública com TLS **antes** da primeira coleta, o artigo de webhooks lido (formato e assinatura), consumidor novo, S-21. Dois caminhos novos com dado real ao mesmo tempo; a semana de operação paralela da T2.3 só faz sentido com a T2.2 estável. |
| **C (recomendada)** | Polling agora (F3 a F5); webhook numa fatia posterior (F7), liberada por três fatos: URL pública com TLS disponível, artigo de webhooks lido (item 7), T2.2 pronta (7 execuções sem falha) | T2.2 primeiro, T2.3 depois, sem retrabalho: o receptor e o modelo (`stg_webhook_evento`, `rec_transicao_par`, `vw_transicao_canonica`) já existem. | Latência de até 24 h até a F7. Nenhum risco de pessoa novo antes da F7. |
| D | Polling mais frequente (por exemplo a cada hora) no lugar do webhook | Reduz latência sem exposição pública. | Não cumpre a T2.3; gasta cota (30/min, 600/h) que a carga inicial e a varredura semanal usam. Pode complementar C se o dono quiser latência menor antes da F7. |

**Base da recomendação C:**
- O briefing põe a T2.3 dependente da T2.2 e mede a T2.3 contra a API ("divergência entre webhook e API abaixo de 1% em uma semana de operação paralela"): sem polling estável não há contra o que medir.
- A revisão (`/cards/{id}/revisions`) é a fonte canônica do instante da transição (`data-model.md` §3.2, N-3); o webhook só antecipa. Nenhum painel perde exatidão sem ele.
- O modelo de ameaças (E1.2, S-2) recomenda só polling na primeira entrega; a API hoje escuta em 127.0.0.1 (ADR 0014), e expor o receptor exige túnel ou proxy com TLS, decisão de topologia que hoje não tem base (S-3: onde a coleta roda).
- O formato real do payload e o mecanismo de autenticação do webhook não foram lidos (403 na knowledgebase); construir o consumidor agora seria desenhar contra suposição.

Divergência com a segurança: nenhuma. A segurança recomenda A ou C para a primeira entrega; C mantém a T2.3 no horizonte, que é critério de pronto do briefing.

## 4. Fatias

Legenda de dependência: números = itens do roteiro §7 de `businessmap-api-configuracao.md` (1 usuário só leitor, 2 apikey no `.env`, 3 host, 4 IDs dos quadros, 5 campos customizados, 6 vínculos e papel das colunas, 7 exemplo de card e artigo de webhooks, 8 webhook, 9 pessoa (decidido), 10 testes de conexão). "WS1" = configuração do quadro confirmada pelo dono.

### F0. Fundações sem dado real (pode começar logo após a validação deste plano)
- **O quê:** cliente HTTP S-22 em `plataforma/http.ts` (ADR 0015) com os controles da E1.2: só GET, lista fechada de caminhos, https com host fixo vindo do `.env` e sem seguir redirect, erro próprio sem `cause` nem corpo, redact da apikey no logger, limitador ≤ 25/min (folga sob 30/min), 429 respeita `retry_after`, 401/403 interrompe a execução sem nova tentativa, teto de páginas por execução. Variáveis novas em `config.ts` (validadas por Zod, a apikey nunca logada): `BUSINESSMAP_URL_BASE`, `BUSINESSMAP_APIKEY`, `BUSINESSMAP_QUADROS_IDS`, `BUSINESSMAP_LIMITE_POR_MINUTO`, `BUSINESSMAP_TIMEOUT_MS`, `BUSINESSMAP_PAGINA_TAMANHO`. B-K1 e B-K2 no coletor (relacionados ao K-086 da E5, que fica para a E5).
- **Depende de:** nada do roteiro. Testes com servidor falso local (sem chamar a API).
- **Pronto:** testes do cliente cobrindo CA da E1.2 aplicáveis (método diferente de GET rejeitado, host diferente rejeitado, redirect não seguido, apikey ausente de log e erro, 429, 401).
- **Agente:** node-backend; review tech-lead; QA; leitura do security-engineer (dependência nova: ky e p-throttle, já decididas na ADR 0015).

### F1. Spike de leitura do quadro real (T2.1 e K-087)
- **O quê:** CLI manual (`pnpm` script do server, nunca agendada) que chama, com a apikey do `.env`, `/boards`, `/workflows`, `/columns`, `/lanes`, `/customFields`, uma página de `/cards` com `expand=custom_fields,transitions,block_times,linked_cards` e `/cards/{id}/revisions` de poucos cards, e **registra só a forma**: chaves, tipos, cardinalidade, contagens. Nunca valores de campo de texto, nunca nomes, nunca e-mails. Saída fica fora do repositório (scratch do dono) até revisão do security-engineer.
- **Perguntas que o spike responde:**
  - **K-087 (Time responsável):** id, tipo, cardinalidade e `allowedValues` do campo. Se for lista de valores fechada, entra em `ref_dominio` e no mapa de domínios da allow-list (ADR 0020 4c). Se for de tipo usuário ou texto livre, **para** e volta ao dono (ADR 0020 4d).
  - **P-T1 (critério de reversão da ADR 0020):** a troca de responsável gera revisão? Se gerar com dado de pessoa, a allow-list da revisão continua cortando; se não gerar, a memória do coletor (4b) é o único caminho, como já desenhado.
  - Forma de `transitions`, `block_times`, `linked_cards` (`link_type`) e do campo de estado (arquivado, descartado).
  - Número de cards por quadro e de revisões por card, para dimensionar a carga inicial contra 600/h.
- **Depende de:** 1, 2, 3, 4, 10 e da F0. **Produz:** o item 7 (exemplo de card, em forma) e insumo dos itens 5 e 6.
- **Pronto:** relatório de forma revisado pelo security-engineer; `docs/integracao/businessmap-estrutura-real.md` escrito (fecha o R-6) sem valores de pessoa.
- **Agente:** node-backend executa com o dono presente (a apikey é dele); security-engineer revisa a saída.

### F2. Referência real (apoio à WS1)
- **O quê:** carga de `ref_quadro`, `ref_coluna` (por id, com workflow), `ref_dominio` (valores fechados dos campos customizados aceitos) e do mapa `field_id` → domínio usado pela allow-list. Troca da conversão id → nome em `mapa.ts` pela identidade por id (ADR 0016).
- **Depende de:** 4, 5, 6, WS1 confirmada, F1, e **U-1 e U-2 da ADR 0016 respondidas** (pergunta Q-6).
- **Pronto:** papel de cada coluna (fila, trabalho, concluído, descarte) registrado como versão de critério (T2.6) com data; nenhuma coluna real sem papel.
- **Agente:** node-backend; tech-lead; QA.

### F3. Coleta incremental para o staging (T2.2, parte 1)
- **O quê:** tarefa `bm.coleta.diaria` registrada no worker (06:00 America/Sao_Paulo, `agenda.ts`), sob `comTravaDaFonte('businessmap')`: abre `ctl_coleta`, lê `/cards` nos três estados (`active`, `archived`, `discarded`) com `last_modified_from` = marca d'água menos a sobreposição (`data-model.md` §6) e `fields=` explícito (I-2), grava cada card por `gravarStgCard` e as revisões novas por `gravarStgRevision`, chama `gravarResponsaveis` na **mesma execução** do projetor (I-2, ADR 0020 4b), registra contagens em `ctl_coleta_contagem` e falhas em `ctl_coleta_falha` (só código e id, B-K2), grava host e hash da lista de quadros em `ctl_coleta` (E1.2) e fecha por `fecharColeta` (publica `coleta.concluida`).
- **Carga inicial:** a mesma rotina sem marca d'água, só por comando manual com o dono presente (E1.2), com profundidade decidida pelo dono (Q-2) e retomável por página.
- **Ordem:** a tarefa agendada só é registrada no worker quando a WS1 estiver confirmada (CLAUDE.md, ordem obrigatória); antes disso, só a carga manual em base de teste.
- **Depende de:** 1, 2, 3, 4, 10; F0, F1, F2. Onde roda: pergunta Q-4 (S-3 da segurança).
- **Pronto:** cards arquivados e descartados presentes; nenhuma linha de `stg_` alterada (gatilho `proibir_alteracao`); nenhum campo fora da allow-list (teste estrutural, B-K3 parte b); apikey ausente de log.
- **Agente:** node-backend; QA prepara os testes com servidor falso em paralelo; security-engineer lê o diff.

### F3b. Allow-lists dos staging restantes (B-K3)
- **O quê:** listas fechadas para `stg_bloqueio`, `stg_vinculo`, `stg_custom_field` e `stg_coluna`, escritas como revisão 3 da ADR 0020 a partir da forma real vista na F1. Até lá vale o "negado por padrão" da ADR 0022: a coleta **não grava** nessas tabelas.
- **Depende de:** F1. **Pronto:** revisão 3 da ADR 0020 com leitura do security-engineer; teste estrutural dos INSERT em `stg_` (todo INSERT passa por um `registro*` da allow-list).
- **Agente:** software-architect (ADR), security-engineer (leitura), node-backend (código).

### F4. Normalizador e projetor (T2.4)
- **O quê:** do staging para `evt_card`, `fato_transicao` (fonte `revision`), `evt_bloqueio`, `fato_bloqueio` e `dim_card`/`dim_card_versao` (SCD2, ADR 0016), com tempos e marcos calculados só pela biblioteca (`packages/metricas`, T2.5). Idempotente: reprocessar a mesma coleta não duplica nem altera fato já gravado.
- **Depende de:** F2 e F3 (e F3b para bloqueios e vínculos).
- **Pronto (critério T2.4):** 20 cards sorteados do quadro real com os 4 marcos conferidos pelo dono contra a ferramenta (roteiro de conferência preparado pelo QA).
- **Agente:** node-backend; QA; tech-lead.

### F5. Varredura semanal e reconciliação (T2.2, parte 2)
- **O quê:** tarefa semanal de presença (lista ids nos três estados e marca `excluido_detectado` sem apagar nada) e reconciliação de contagem contra a ferramenta em `ctl_reconciliacao`.
- **Depende de:** F3, F4.
- **Pronto (critério T2.2):** sete execuções diárias consecutivas sem falha, reconciliação de contagem conferida, arquivados presentes. Evidência: linhas de `ctl_coleta` e `ctl_reconciliacao`, não descrição.
- **Agente:** node-backend; QA confere as sete execuções.

### F6. Painéis com dado real (E4, WS3)
- **O quê:** a API passa a ler o banco alimentado pela coleta, em base separada da do seed (o seed do mock não roda contra a base real). Janela de calibração do BusinessMap ligada à primeira coleta real (D3 do 006, 60 dias, provisória) e `metricasEmCalibracao` cobrindo também os ids complementares (necessidade da E1.3). Complementares continuam no mock com o selo "Dados fictícios" até a extração da fase 3 do 011 (pergunta Q-3).
- **Depende de:** F5 pronta; respostas P-1, P-4, P-5 da UX (dono).
- **Agente:** node-backend, react-frontend (só se P-1 b ou P-4 a forem aprovadas), QA, ux-designer revisa.

### F7. Webhook de transições (T2.3), condicionado
- **O quê:** confirmar o formato real do payload e a autenticação (ajustar `registroWebhook` e, se a Kanbanize assinar o corpo, trocar o segredo compartilhado pela verificação de assinatura); consumidor de `bm.webhook.recebido` registrado no worker (`stg_webhook_processamento`, `fato_transicao` com fonte `webhook`, `rec_transicao_par`); S-21 (`@fastify/rate-limit`); contador de eventos ignorados (I-1); exposição por túnel ou proxy com TLS sem abrir a API inteira (só a rota do webhook); Business Rule de mudança de coluna configurada na WS1; retenção de `stg_webhook_evento` (S-4).
- **Liberação (fatos observáveis):** URL pública com TLS disponível (item 8); artigo de webhooks lido ou payload real capturado (item 7); F5 pronta.
- **Pronto (critério T2.3):** divergência entre webhook e API abaixo de 1% em uma semana de operação paralela, medida por `rec_transicao_par`. Fecha N-3 (tolerância de 120 s) com dado real.
- **Agente:** node-backend; security-engineer (modelo de ameaças A3 a–f da E1.2 antes do código); devops-engineer (túnel/proxy, se o dono aprovar a topologia); QA.

### Sequência e paralelismo
F0 → F1 → (F2 ∥ F3b) → F3 → F4 → F5 → F6; F7 depois de F5, em paralelo com F6 se liberada. Enquanto o dono cumpre os itens 1 a 7 e 10, só a F0 anda.

## 5. Contratos entre front e back
Nenhum contrato novo de API nesta entrega. Os painéis já leem `GET /metricas/...`, `GET /fontes/:dominio/estado` e `/coletas`; o que muda é a origem dos dados. Se o dono aprovar P-1 (b) (nota "N cartões ainda com dados fictícios") ou P-4 (a) (Exportar com contexto), o estado da fonte ganha campos, detalhados pelo node-backend na F6.

## 6. Riscos
- **R-1 Formato do webhook desconhecido.** `registroWebhook` lê campos supostos; o artigo deu 403. Mitigação: F7 só depois de payload real ou artigo lido.
- **R-2 Time responsável de tipo usuário ou texto.** Para a F2 e volta ao dono (ADR 0020 4d). Mitigação: spike F1 cedo.
- **R-3 Cota da API na carga inicial.** 600/h com revisões por card pode exigir horas ou dias. Mitigação: carga manual retomável por página e profundidade decidida pelo dono (Q-2).
- **R-4 Colunas homônimas em 9 workflows.** Sem a ADR 0016 aplicada, o tempo por coluna mistura colunas. Mitigação: F2 bloqueada até U-1 e U-2.
- **R-5 Complementares fictícios ao lado de dado real.** Leitor pode tomar o painel por inteiro real. Mitigação: selo por cartão (já existe) e P-1 da UX.
- **R-6 Documento citado e ausente.** `businessmap-estrutura-real.md` é citado pela ADR 0016 e não existe; a F1 o escreve.
- **R-7 Dado de pessoa vazando por campo não previsto.** Mitigação: allow-list, negado por padrão (ADR 0022), teste estrutural, leitura da saída do spike pelo security-engineer, levantamento de dados antigos antes da primeira coleta real (k084).
- **R-8 Primeira coleta real fora da máquina do dono.** Apikey em outro ambiente amplia exposição. Mitigação: Q-4.
- **R-9 Achados B-K1/B-K2 e K-086 (E5) entrelaçados.** Mitigação: B-K1 e B-K2 na F0; K-086, K-088 e K-089 seguem na E5, antes da F3 entrar em `develop` com a tarefa agendada.

## 7. Perguntas ao dono (regra de negócio; nada disto se decide no código)
- **Q-1 (item 8).** Webhook: (A) só polling; (B) polling e webhook juntos; (C) polling agora e webhook depois, liberado por URL com TLS, artigo lido e T2.2 pronta; (D) polling a cada hora. Recomendação do time: **C** (§3).
- **Q-2 (carga histórica).** Profundidade da carga inicial: (a) todo o histórico dos quadros; (b) a partir de uma data que o dono escolhe; (c) só os últimos 12 meses. Sem recomendação: depende de quanto passado o dono quer nos painéis e do custo de cota que a F1 vai medir.
- **Q-3 (complementares).** Durante o 052 as complementares (O19 a O26, T, E): (a) continuam fictícias com o selo, até a fase 3 do 011 (recomendado: tabelas da fase 3 não existem e estão fora do escopo do 052); (b) entram no 052. Liga com a P-1 da UX.
- **Q-4 (onde roda).** A coleta real: (a) só na máquina do dono (recomendado pela segurança, S-3); (b) num servidor do DSPD (exige ADR de topologia com o devops-engineer).
- **Q-5 (usuário de serviço).** Confirmar S-1 da segurança: apikey de um usuário só leitor dos quadros do DSPD (item 1).
- **Q-6 (ADR 0016).** U-1: papel de coluna "como foi no instante" ou "como é hoje"; U-2: time e granularidade no instante do evento. Precisam de resposta antes da F2.
- **Q-7 (pendências herdadas do 006).** Janela de calibração de 60 dias (D3, provisória): manter ou outro valor; tolerância de "Atrasado" no selo de frescor; N-5 do `data-model.md` §12.
- **Q-8 (responsáveis: id ou nome).** A decisão de 2026-10-10 (`data-model.md` §9) fala em "nomes" nas tabelas analíticas; a ADR 0020 4b grava o que a API devolve no card (`owner_user_id`, `co_owner_ids`, ids), e `/users` não é chamado. Opções: (a) só ids, como a ADR 0020 4b (recomendado: atende o E8 e a O26, que só precisam distinguir pessoas, e não chama `/users`); (b) resolver nome por `GET /users` com `fields=user_id,realname` (exige revisão da ADR 0020 e leitura do security-engineer). Não decidido aqui.
- As perguntas P-1 a P-5 da UX (E1.3) e S-1 a S-4 da segurança (E1.2) seguem nos respectivos documentos; Q-4 e Q-5 repetem S-3 e S-1 para ficarem juntas aqui.

## 8. Suposições
- O 006 continua válido no que não foi revisado aqui (D1 a D6, contrato `coletas.ts`). Base: código do módulo `operacao` confere com o plano.
- O estado de U-1 a U-3 da ADR 0016 é desconhecido (ADR ainda proposta); U-3 já foi superada pela ADR 0020 4b (responsáveis mantidos em `dim_card_versao`).
- A função de marcos por card da biblioteca serve ao projetor sem mudança. Base: `packages/metricas/src/businessmap/estado.ts` e `indice.ts`; confirmação na F4.
- Os limites 30/min e 600/h e o retorno 429 com `retry_after` são os do documento de configuração (2026-10-11), não reconferidos (a knowledgebase dá 403).

## 9. Divisão por agente
| Agente | Fatias |
|---|---|
| node-backend | F0, F1 (execução com o dono), F2, F3, F3b (código), F4, F5, F6, F7 |
| react-frontend | F6, só se P-1 (b) ou P-4 (a) forem aprovadas |
| qa-engineer | testes de todas as fatias; roteiro dos 20 cards (F4); conferência das 7 execuções (F5); semana paralela (F7) |
| security-engineer | leitura de F0, saída do spike F1, F3b, diff da F3, modelo A3 antes da F7 |
| software-architect | ADR 0022, revisão 3 da ADR 0020 (F3b), fechamento da ADR 0016 após Q-6 |
| tech-lead | review de toda fatia; branches |
| devops-engineer | só F7 (túnel/proxy) e Q-4 (b), se aprovados |

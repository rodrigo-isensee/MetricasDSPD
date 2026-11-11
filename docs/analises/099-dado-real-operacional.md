# 099: plano de dado real para os 20 cartões simulados do Operacional (E2.2)

- **Propósito:** dizer, para cada um dos 20 cartões do Operacional que hoje são simulados (12 da Semanal e 8 da Sustentação, varredura `docs/analises/099-varredura-simulado.md` §2.2 e §2.3), de onde vem o dado real, o que falta coletar, projetar ou configurar, como se calcula, como se publica, em que lote e em que ordem. O que não tem dado em nenhuma fonte ou depende de regra sem definição vira pergunta ao dono, com recomendação.
- **Origem:** pedido 099, decisão do dono de 2026-11-11 13:55 (literal): "faca tudo que for preciso para tornar elas com dados reais". ADR 0030 (`docs/architecture/adr/0030-sem-simulado-na-web.md`), que revoga a 0028; ADR 0026 P3 (a métrica entra no mapa real só pelo plano dela).
- **Público:** dono, Jarvis, tech-lead, node-backend, react-frontend, ux-designer, qa-engineer, security-engineer.
- **Base lida:** a `develop` em `/home/rodrigoisensee/Metricas/MetricasDSPD-demo` (base-sha `ae009a75`): `packages/contratos/src/origem.ts`, `packages/metricas/src/{businessmap,acelerato}/`, `server/src/modulos/{businessmap,acelerato}/` (allow-list, normalizador, projetor), `server/migrations/`, `docs/architecture/fontes/`, `docs/tecnica/biblioteca-de-calculo.md`; o briefing (§3.4, §4.2, §4.4, catálogo); e as medições do pedido 064 (`docs/analises/064-lacunas-dado-real.md`, base local de 2026-11-04). **Não li a base real nem `.env` e não rodei nada.** Os números de preenchimento citados são os do 064 (2026-11-04) e podem ter mudado com os pedidos 069 e 075; as consultas do §5 os reconferem.
- **Estado:** proposta. Nenhuma linha de código muda por este plano.

## 0. Resumo para o dono

1. **O cálculo de todos os 20 já existe** na biblioteca compartilhada (`packages/metricas`, T2.5): o mock usava as mesmas funções. O que falta é **dado na base real**, nunca fórmula nova.
2. **Três podem ficar reais logo, só com código**, porque o dado já está na base: **O20** Fluxo cumulativo, **O21** Fluxo reverso e **O25** Descarte (grupo A, §3).
3. **Dois precisam de projeção de dado que a coleta já traz**: **O26** Passagens de mão (troca de responsável nas revisões) e **O18** Entregas com e sem bug (vínculo do bug com a entrega, depois da Q-099-6) (grupo B).
4. **Seis esperam campos do BusinessMap que as pessoas criam (WS1, T1.3)**: O8, O12, O14, O15, O16 e O24. O código para ler campo de lista já existe (pedido 069, L2), vazio até o diagnóstico P-L2-1 (grupo C).
5. **Cinco esperam campos do Acelerato que as pessoas configuram (WS4, P-DS-19)**: S5, S6, S7, S9 e S11. O código já lê os campos (pedido 069, L9-c); faltam os domínios e a ordem das etapas (grupo D).
6. **Quatro dependem de dado que nenhuma fonte tem hoje ou de regra sem definição**: S1, S12, O17 e O22. Viram as perguntas Q-099-4 a Q-099-10 (§6), cada uma com recomendação.
7. **A ordem segue o CLAUDE.md:** configuração (WS1, WS4, pelas pessoas) → coleta e projeção (WS2, WS5) → painel (WS3). O grupo A não depende de configuração e começa já, em paralelo com os lotes L2 a L5 da varredura.

## 1. Conferência com as regras e as ADRs

| Regra ou ADR | Como o plano cumpre |
|---|---|
| BusinessMap e Acelerato nunca se misturam | Cada cartão tem uma fonte só (coluna "Fonte" do §2). O O17 é Acelerato por decisão do dono de 2026-10-11 (`docs/alinhamentos/2026-10-11-decisoes-complementares.md`); a Q-099-7 não junta as duas fontes, só escolhe uma. |
| Cálculo só na biblioteca (T2.5) | As 20 funções `calcular*` já existem e são as mesmas do mock. Nenhum lote cria cálculo fora de `packages/metricas`. Mudança de regra dentro de uma função passa por versão de critério (T2.6). |
| Abaixo de 20 itens, não publicar | Coluna "Mínimo" do §2: é o da biblioteca (`docs/tecnica/biblioteca-de-calculo.md` §5), que devolve `insuficiente`. Nenhum lote mexe nisso. |
| Nunca sobrescrever histórico | As projeções novas (O26, O18) leem o staging append-only e gravam projeção refeita por card, como o projetor de hoje. Nenhuma migração apaga coluna ou linha. |
| Dúvida de regra não se resolve por inferência | Tudo o que pedia escolher regra está no §6. Nenhum lote começa antes da resposta da pergunta dele. |
| Nenhuma métrica individual | Nenhum dos 20 conta pessoa. O O26 usa só o inteiro de passagens por card (ADR 0020); o O22 usa só o instante do primeiro comentário, nunca autor nem texto. |
| Dados de pessoa e texto livre (allow-list) | Os lotes que tocam a fronteira (O22, O26, O12 com campo de data, O17) têm gatilho de segurança (§4). |
| ADR 0026 P3 e ADR 0030 D4 | Uma métrica entra em `METRICAS_ORIGEM_REAL` só depois da consulta só de leitura (§5) mostrar o dado na base, e sai o motivo dela de `MOTIVO_ORIGEM_MOCK`. |
| Afrouxa? | **Não.** Entrar no mapa real pelo plano é o caminho da 0026. Nenhum texto de `docs/regras/` nem item de `tests/config.json` muda. |
| Leitura do Acelerato | O código da `develop` lê a tabela MySQL do time de ciência de dados, só leitura (ADR 0023, CLAUDE.md da `develop`). O CLAUDE.md da branch `docs/jarvis-2026-10-23` ainda fala em "API pública do Acelerato": divergência de texto antiga, registrada no relatório; este plano segue o código e a ADR 0023. |

## 2. Os 20 cartões

Legenda da coluna "Grupo": **A** = dado já na base, falta só o portão; **B** = a coleta já traz, falta projetar; **C** = espera campo do BusinessMap (WS1, pessoas); **D** = espera campo do Acelerato (WS4, pessoas); **P** = depende de pergunta ao dono (§6).

### 2.1 Visão Semanal (BusinessMap)

| # | Cartão | Fonte | De onde vem o dado (tabela e campo) | Situação do dado hoje | O que falta | Cálculo (T2.5) | Mínimo de 20 | Grupo e lotes |
|---|---|---|---|---|---|---|---|---|
| OP-1 | O12 Acordos e vencidos | BusinessMap | `dspd_bm.dim_card.data_acordada` e `.responsabilidade_atraso`; entrega pelas transições | `data_acordada` em 0 de 12633 stories (064, Q05). `responsabilidade_atraso` é coluna de lista do 069, vazia até o P-L2-1. A coluna `data_acordada` é de data e **não** está em `COLUNAS_LISTA` (`server/src/modulos/businessmap/allow-list.ts:64-67`); o campo nativo `deadline` já chega ao staging (`CAMPOS_CARD`) | Campos `data_acordada` e `responsabilidade_atraso` no quadro (WS1, T1.3); caminho de campo customizado de **data** na allow-list e no normalizador; ou o `deadline` nativo, se o dono escolher (Q-099-10) | `calcularO12` | 20 (taxa de vencidos) | C, P · C0, C1, C2, C3 |
| OP-2 | O15 Onde os bugs são encontrados | BusinessMap | `dim_card.fase_deteccao` (lista: Desenvolvimento, Revisão de código, Teste interno, Homologação do negócio, Produção); tipo de bug por `ref_tipo_card` | 0 de 12633 (064, Q05); coluna de lista pronta no código (069 L2), vazia | Campo `fase_deteccao` no quadro com o domínio do briefing §4.4 (WS1); linha no `businessmap-dominio.json` | `calcularO15` | 20 (taxa) | C · C0, C1, C4 |
| OP-3 | O18 Entregas com e sem bug | BusinessMap | `dim_card.origem_bug` (card de origem do bug); bug vinculado até 30 dias da entrega (briefing §4.2) | 0 de 12633 (064, Q05). `origem_bug` **não** é coluna de lista (é vínculo). Os vínculos nativos (`linked_cards`: `card_id` e `link_type`) já chegam ao staging (`allow-list.ts:54-58`, `EXPAND_COLETA`) e não são projetados | Escolha da fonte do vínculo (Q-099-6); projeção do vínculo para `origem_bug` (ou tabela de vínculo) | `calcularO18` | 20 (taxa) | B, P · B3, B4 |
| OP-4 | O8 Tamanho das demandas | BusinessMap | Tempo em execução pelas transições (já real, o mesmo do O3); `dim_card.tamanho_declarado` (P, M, G) para a comparação | Tempo: real. `tamanho_declarado`: 0 de 12633 (064, Q05), coluna de lista pronta e vazia | Campo `tamanho_declarado` no quadro (WS1). Sem ele, só a parte do tempo (Q-099-4) | `calcularO8` (já agrupa "Sem tamanho") | 20 (percentis) | C, P · C0, C1, C5 |
| OP-5 | O22 Primeiro toque | BusinessMap | Instante do primeiro comentário humano de cada card (regra D-9' do pedido 011) | **Nenhuma fonte na base.** A coleta não lê comentários (`allow-list.ts:6`: autor e texto nunca entram); a biblioteca recebe o instante pela extensão `primeiroToque` (`packages/metricas/src/businessmap/extensao.ts:91`), que só o mock preenche | Coleta nova de comentários com allow-list só do instante e de um booleano "humano" calculado na fronteira; como saber "humano" na API é diagnóstico, não inferência (Q-099-4 trata a parte "Também", que é só do mock) | `calcularO22` | 20 (percentis e histograma, por tipo) | B, P · B5, B6, B7, B8 |
| OP-6 | O20 Fluxo cumulativo | BusinessMap | `dspd_bm.vw_transicao_canonica` (`card_id`, `coluna_*`, `tipo_coluna`, `ocorrido_em`) e `ref_coluna.papel` | **Na base:** 107145 transições, 0 sem direção, 18175 cards (064, Q10). 155 de 999 colunas sem papel e 3907 transições sem tipo de coluna (064, M3) | Só o portão e a prova de custo (é varredura diária sobre a vida do card, ADR 0003) | `calcularO20` | 0 (censo) | A · A2 |
| OP-7 | O24 Ordem de chegada | BusinessMap | Inícios pelas transições; `dim_card.classe_servico = 'Padrão'` | Inícios: reais. `classe_servico`: 0 de 12633 (064, Q05; é a mesma lacuna da nota "sem classe" do O6) | Campo `classe_servico` no quadro (WS1). A função só olha a classe Padrão (`o24.ts:44`): sem o campo, a base fica vazia | `calcularO24` | 20 (taxa; percentis por tipo) | C, P · C0, C1, C6 |
| OP-8 | O21 Fluxo reverso | BusinessMap | `vw_transicao_canonica.direcao` (`avanco`, `retorno`); ciclo do O3 | **Na base:** 107145 transições, 0 sem `direcao` (064, Q10) | Só o portão | `calcularO21` | 20 (taxa; 20 em cada grupo do par) | A · A1 |
| OP-9 | O25 Descarte | BusinessMap | `dim_card.motivo_descarte`, `.arquivado_em`, `.excluido_em`; o normalizador já projeta o `discarded_at` nativo (`normalizador.ts:178`, `:228`) | **Na base:** 12471 de 18175 cards com `arquivado_em` (064, Q03); descartados nativos não foram contados (Q-RO-2) | Só o portão, depois da Q-RO-2 mostrar descartados | `calcularO25` (`porMotivo` nulo até ler o catálogo de motivos, CA-44) | 20 (taxa; percentis por tipo) | A · A3 |
| OP-10 | O26 Passagens de mão | BusinessMap | Inteiro `passagens` por card entregue, contado das revisões (`stg_revision.payload.troca_responsavel`, já reduzido a booleano na fronteira, `allow-list.ts:23`, `:120`) | A coleta grava `troca_responsavel` nas revisões; **nenhum projetor conta as passagens**; a biblioteca recebe o inteiro pela extensão `passagens` (`extensao.ts:93`), só no mock. Regra decidida (pedido 011, D-5' = B; Q-a = 1, Q-b = conta) | Projeção do inteiro por card (migração + projetor), leitura no repositório | `calcularO26` | 20 (taxa e P85, por faixa) | B · B1, B2 |
| OP-11 | O14 Origem da demanda | BusinessMap | `dim_card.origem_demanda`, `.area_solicitante`, `.sistema` | 0 de 12633 cada (064, Q05); `ref_dominio` do BusinessMap vazio (064, M6); colunas de lista prontas e vazias | Os três campos no quadro (WS1) e os domínios | `calcularO14` | 20 (taxa) | C · C0, C1, C7 |
| OP-12 | O16 Estoque e idade de bugs | BusinessMap | Bugs por `ref_tipo_card` (Bug interno, Defeito em produção), transições; `dim_card.severidade`; `origem_bug` para a densidade | Bugs e transições: reais (1201 stories de defeito, 064 Q04). `severidade`: 0 (064, Q05) | Campo `severidade` (WS1). Sem ele, entrada × correção e idade já têm dado (Q-099-4) | `calcularO16` (já agrupa "Sem severidade") | 20 (taxa) | C, P · C0, C1, C8 |

### 2.2 Visão Sustentação (Acelerato)

| # | Cartão | Fonte | De onde vem o dado (tabela e campo) | Situação do dado hoje | O que falta | Cálculo (T2.5) | Mínimo de 20 | Grupo e lotes |
|---|---|---|---|---|---|---|---|---|
| OP-13 | S1 Primeiro atendimento e restauração | Acelerato | `dspd_ac.dim_chamado.primeiro_atendimento_em`, `.restaurado_em` (= `data_pronto`), `fato_etapa_chamado` (pendências descontadas); `dspd_ac.ref_alvo_prioridade` (prazos por prioridade) | `restaurado_em`: real. `primeiro_atendimento_em`: não projetado, espera a D-13 do plano 056 (`server/src/modulos/acelerato/normalizador.ts:128`); a tabela tem `data_primeiro_comentario`. `ref_alvo_prioridade`: 0 linhas, sem carregador (064, Q29); a API responde 503 sem ela (`server/src/modulos/metricas/servico.ts:277`) | Definir o alvo (Q-099-5a) e o primeiro atendimento (Q-099-5b); carregador versionado de `ref_alvo_prioridade`; projeção de `primeiro_atendimento_em` | `calcularS1` | 20 (por prioridade) | P · D3, D4 |
| OP-14 | S5 Motivos da escalação | Acelerato | `dim_chamado.motivo_escalacao` (campo de etapa "Motivo da Escalação", lista); `nivel_resolucao` (N2, N3, Fornecedor) | O projetor grava a coluna (`server/src/modulos/acelerato/projetor.ts:24`), mas o domínio `cpe_motivo_escalacao` e a lista `etapa_fluxo` estão vazios em `acelerato-dominio.json`: o valor sai nulo. `nivel_resolucao` vazio em 70% dos fechados (064, M4) | Tipo e domínio do campo (P-DS-19, WS4 e dono); lista `etapa_fluxo` (WS4); `ac:ref-sync` | `calcularS5` | 20 (taxa) | D · D0, D1, D2 |
| OP-15 | S6 Motivos de encerramento | Acelerato | `dim_chamado.motivo_encerramento` ("Motivo de Encerramento", lista) | Como o S5: coluna projetada, domínio `cpe_motivo_encerramento` vazio | P-DS-19 e `etapa_fluxo` | `calcularS6` | 20 (taxa) | D · D0, D1, D2 |
| OP-16 | S7 Reclassificação | Acelerato | `dim_chamado.prioridade_ajustada_manualmente`, `.justificativa_informada`, `.motivo_encerramento` ("Reclassificado, não é incidente"), campo "Classifique o chamado no Tipo de Prioridade" | Colunas projetadas; domínios `cpe_prioridade_ajustada` e `cpe_tipo_prioridade` vazios; interruptor `AJUSTE_PRIORIDADE_COM_FONTE = false` (`origem.ts:63`) | P-DS-19 e `etapa_fluxo`; virar o interruptor com versão de critério `afeta = ['S3', 'S7']` (já previsto no 069, L9-a) | `calcularS7` | 20 (taxa) | D · D0, D1, D2 |
| OP-17 | S9 Tempo em pendência | Acelerato | `fato_etapa_chamado` na etapa `Pendente` com `motivo_pendencia`; `dim_chamado.previsao_retorno` | A etapa `Pendente` é da parametrização do briefing §3.4, **ainda não em produção**; as esperas reais são "Aguardando Solicitante", "Aguardando Suporte Terceiros" e "Aguardando Equipe Interna" (064, Q27). Os intervalos são sintéticos, um por etapa (D-7). `motivo_pendencia` sai nulo (`projetor.ts:107`). `previsao_retorno` é só booleano desde a migração 0035: a data não existe na base | Regra de pendência e de motivo (Q-099-8); a parte "cumprimento da previsão" não tem fonte (vira "sem dado real" na parte, Q-099-4) | `calcularS9` | 20 (percentis por motivo) | P, D · D0, D1, D5 |
| OP-18 | S11 Avaliação de Problema | Acelerato | `dim_chamado.avaliacao_problema`, `.motivo_encerramento` (contorno), `.prioridade` (P1, P2) | Coluna projetada, domínio `cpe_avaliacao_problema` vazio. A conversão em Registro de Problema vem da extensão `registroProblema` (`packages/metricas/src/acelerato/extensao.ts:16`), sem fonte real | P-DS-19 e `etapa_fluxo`; a conversão espera a D-15 (vínculo "Número do ticket anterior") e fica "sem dado real" na parte (Q-099-4) | `calcularS11` | 20 (taxa) | D, P · D0, D1, D6 |
| OP-19 | O17 Defeitos por causa raiz e sistema | Acelerato | Incidentes encerrados (`dim_chamado.natureza`, `data_finalizado`) por `categoria_sistema` (real) e por causa raiz | Sistema: real. Causa raiz: decidida em 2026-10-11 como campo do Acelerato "via Metabase"; desde a ADR 0023 a fonte é a tabela MySQL, e a allow-list (`docs/architecture/fontes/acelerato-listas.md` §1 e §3) não tem campo de causa raiz | Achar a fonte da causa raiz (Q-RO-10, Q-099-7); entrar na allow-list (ADR 0023 item 4) | `calcularO17` (sem causa, `porCausa` vazio e `campoDisponivel = false`) | 0 (contagem) | P · D7, D8 |
| OP-20 | S12 Volume por sistema | Acelerato | `dim_chamado.categoria_sistema`, `aberto_em` (volume, real); `excecao_sla_registro_posterior`; recorrentes pela extensão `reabertoDe` | Volume: real (5032 chamados, 064 Q30). `excecao_sla_registro_posterior`: sem fonte, sempre `false` (064, L9); hoje `calcularS12` devolveria 0% como se fosse real. Recorrentes: sem fonte (D-15) | Publicar o volume e marcar as duas partes sem fonte (Q-099-4); a exceção espera o campo "Exceção de SLA por registro posterior" (WS4) | `calcularS12` (a parte da exceção precisa sair nula, não 0%) | 20 (proporção) | P, D · D9 |

## 3. Lotes (até 150 linhas cada; estimativas, o tech-lead recorta se passar)

Todos os lotes de portão seguem o mesmo molde, que já foi usado no plano 056 (S2, S3, S4, S8, S10) e no pedido 075 (BLOQUEADOS, O5, O19):
1. A consulta só de leitura do §5 mostra o dado na base (o dono roda e cola só as contagens).
2. node-backend: a métrica entra em `METRICAS_ORIGEM_REAL`, sai de `MOTIVO_ORIGEM_MOCK`; a leitura do repositório traz o que a função pede; teste de integração `.pg` com base no formato real que prova (a) número com dado, (b) `insuficiente` abaixo de 20, (c) nenhum campo de pessoa na resposta; `docs/api/metricas.md` atualizado.
3. Se a regra de cálculo ou a fonte mudar, entrada em `ref_versao_criterio` com `afeta` (T2.6), marcada no gráfico.
4. react-frontend: só se o DTO real trouxer parte nova (por exemplo, nota de parte sem fonte); o cartão já desenha o DTO do contrato.
5. qa-engineer: parecer em `docs/qa/`, com a prova de que a G4 (ADR 0030) segue verde e o cartão real mostra o número.

| Lote | Agente | Conteúdo | Depende de | Em paralelo com | Gatilho de segurança |
|---|---|---|---|---|---|
| A1 | node-backend, qa | O21 no mapa real (molde acima) | Q-RO-1 | A2, A3, L2a a L5 da varredura | nenhum |
| A2 | node-backend, qa | O20 no mapa real; medir o custo no `perf-api` com a base real (a varredura diária pode pesar no C1 e no p95 da API, ADR 0003); se passar do orçamento, o lote para e volta ao arquiteto | Q-RO-1 | A1, A3 | nenhum |
| A3 | node-backend, qa | O25 no mapa real; nota "sem divisão por motivo" já existe no DTO (`porMotivo` nulo, CA-44) | Q-RO-2 | A1, A2 | nenhum |
| B1 | node-backend | O26, projeção: migração que acrescenta o inteiro `passagens` por card (coluna em `dim_card` ou tabela própria, a critério do node-backend) e o projetor que conta as trocas das revisões (Q-a = 1, Q-b = conta) | Q-RO-4 | A1 a A3 | **sim:** banco (migração) e dado derivado de pessoa (troca de responsável). security-engineer confere que só o inteiro sai do projetor (ADR 0020) |
| B2 | node-backend, qa | O26 no mapa real: leitura do inteiro no repositório, `calcularO26` sem a extensão do mock; a parte "Também" do mock (`COM_EXTENSAO_MOCK`) não vale na fonte real | B1 | C*, D* | nenhum (leitura de inteiro) |
| B3 | node-backend | O18, projeção do vínculo bug → card de origem, pela fonte que o dono escolher na Q-099-6 (vínculo nativo do staging ou campo `origem_bug`) | Q-099-6, Q-RO-5 | B1 | **sim:** banco (migração, se for tabela de vínculo) |
| B4 | node-backend, qa | O18 no mapa real | B3 | B2 | nenhum |
| B5 | node-backend | O22, diagnóstico (spike): forma da lista de comentários na API do BusinessMap, só contagens e nomes de chave, sem texto nem autor gravados em lugar nenhum; volume de chamadas e limite de taxa para 18 mil cards; como a API distingue comentário humano de automação | Q-099-4 (parte "Também") | B1 a B4 | **sim:** integração externa e dado de pessoa e texto livre na resposta da API |
| B6 | software-architect, security-engineer | O22, revisão da ADR 0020 (allow-list nova: só o instante do primeiro comentário humano e o booleano, calculado na fronteira) com o modelo de ameaças | B5 | | **sim** |
| B7 | node-backend | O22, coleta e projeção do instante (migração, coletor, projetor), incremental e sem sobrescrever | B6 | | **sim:** banco, coletor, pessoa |
| B8 | node-backend, qa | O22 no mapa real | B7 | | nenhum |
| C0 | pessoas (WS1) e dono | Criar no quadro os campos da T1.3 que estes cartões pedem (`tamanho_declarado`, `data_acordada`, `responsabilidade_atraso`, `origem_demanda`, `area_solicitante`, `sistema`, `fase_deteccao`, `severidade`, `classe_servico`) com os domínios do briefing §4.4; o time gera o roteiro, não executa | — | A*, B* | não é código |
| C1 | node-backend | Diagnóstico P-L2-1 e preenchimento de `docs/architecture/fontes/businessmap-dominio.json` e de `TIPOS_SELECAO_UNICA` (`dominio-businessmap.ts:29`), como o 069 desenhou | C0 | | **sim:** fronteira (campo que sai da fonte); parecer de segurança já exigido pelo 069 |
| C2 | node-backend | O12: caminho de campo customizado de **data** (allow-list, normalizador, coluna `data_acordada`), ou leitura do `deadline` nativo se a Q-099-10 for "B" | C1, Q-099-10 | C3 a C8 | **sim:** allow-list (ADR 0020) |
| C3 a C8 | node-backend, qa | Um lote de portão por métrica, depois da Q-RO-6 mostrar o campo preenchido: C3 O12, C4 O15, C5 O8, C6 O24, C7 O14, C8 O16 | C1 (e C2 no O12); Q-099-4 no O8 e no O16; Q-099-9 no O24 | entre si | nenhum |
| D0 | pessoas (WS4) e dono | P-DS-19: tipo e domínio dos campos de etapa (Motivo da Escalação, Motivo de Encerramento, Prioridade ajustada manualmente, Tipo de Prioridade, Motivo de Pendência, Avaliação de Problema) e a lista `etapa_fluxo` (ordem das etapas no desenho do fluxo, `acelerato-listas.md` §13) | — | A*, B*, C* | não é código |
| D1 | node-backend | Domínios `cpe_*` e `etapa_fluxo` em `docs/architecture/fontes/acelerato-dominio.json`, `ac:ref-sync`, reconhecimento da mudança (`pnpm coleta ac --reconhecer-mudanca`, pelo dono) | D0 | | **sim:** vocabulário de fonte externa (A1 e A2 do modelo de ameaças do 069); o dono confere que nenhum valor traz nome de pessoa |
| D2 | node-backend, qa | S6, S5 e S7 no mapa real (um lote cada, se passar de 150 linhas); no S7, `AJUSTE_PRIORIDADE_COM_FONTE = true` com versão de critério `afeta = ['S3', 'S7']` | D1, Q-RO-7 | D6 | nenhum |
| D3 | node-backend | S1: carregador versionado de `ref_alvo_prioridade` (arquivo em `docs/architecture/fontes/`, como o `calendario.json`) com os prazos da Q-099-5a | Q-099-5a | D1 | **sim:** banco (escrita em `ref_` pelo `dspd_ref`, sem GRANT novo) |
| D4 | node-backend, qa | S1: projeção de `primeiro_atendimento_em` pela Q-099-5b; S1 no mapa real | D3, Q-099-5b, Q-RO-11 | D2 | **sim** se a Q-099-5b pedir coluna nova da tabela MySQL (allow-list, ADR 0023) |
| D5 | node-backend, qa | S9 pela regra da Q-099-8; a parte "cumprimento da previsão" sai nula com nota (sem fonte) | D1, Q-099-8, Q-099-4 | D2 | nenhum, salvo se a Q-099-8 pedir campo novo |
| D6 | node-backend, react-frontend, qa | S11 no mapa real; a conversão sai nula com nota, nunca 0% (hoje `taxa(0, 0)` vira "insuficiente", que diz outra coisa) | D1, Q-099-4 | D2 | nenhum |
| D7 | dono | Rodar a Q-RO-10 no MySQL do Acelerato (só nomes de campo e contagens) | Q-099-7 | todos | não é código |
| D8 | node-backend, qa | O17: campo de causa raiz na allow-list e na projeção, pela fonte da Q-099-7; O17 no mapa real | D7, Q-099-7 | | **sim:** allow-list (ADR 0023 item 4) e texto de fonte externa por domínio fechado |
| D9 | node-backend, react-frontend, qa | S12 no mapa real com o volume; `excecaoSla` e a reincidência saem nulas com nota "sem fonte" (a função precisa deixar de devolver 0% sobre `false` padrão: mudança na biblioteca, com versão de critério `afeta = ['S12']`) | Q-099-4 | D2 | nenhum |

**Ordem:** A1, A2, A3 e B1 começam já, em paralelo com os lotes L2a a L5 da varredura (não tocam os mesmos arquivos, salvo `origem.ts`, que o tech-lead serializa: L3 tira `simulavel`, os lotes A e B acrescentam ao mapa). C0 e D0 são das pessoas e correm em paralelo desde já; o time entrega o roteiro. Os lotes C e D de código só começam depois da configuração, pela ordem obrigatória do CLAUDE.md. Os lotes marcados com P esperam a pergunta deles.

**Dono de cada lote:** um agente com um cartão em andamento por vez (CLAUDE.md). O tech-lead revisa todos; o QA dá parecer de todos.

## 4. Gatilhos de segurança (`R-SEGURANCA`)

Percorridos com a lista do security-engineer: autenticação (não), dados pessoais (**sim**: B1, B5 a B7), webhook (não), banco (**sim**: B1, B3, B7, D3), CI (não), Docker (não), dependência nova (não), fronteira da fonte externa (**sim**: B5 a B7, C1, C2, D1, D4, D8).

`gatilhos_seguranca: [dados-pessoais, banco, fronteira-de-fonte-externa]`. O security-engineer dá o modelo de ameaças antes de B1, B5, C2 e D8; C1 e D1 já têm o modelo do pedido 069 (`docs/security/069-modelo-ameacas.md`), que ele confirma. Os lotes A não têm gatilho: só mudam o mapa e a leitura de colunas que a API já lê.

## 5. Consultas só de leitura para o dono

Regras: só contagens, nenhuma coluna de pessoa, nenhum título nem texto livre. As de PostgreSQL rodam no terminal do dono com o papel que ele usou nas consultas do 064 (`docs/analises/064-consultas-dono.sql`). As de MySQL rodam na conta só leitura da ADR 0023. **Antes de o dono rodar, o node-backend confere os nomes de coluna das consultas marcadas com (\*)**, que leem o `payload` do staging; não li o DDL de toda tabela. O dono cola só a saída numérica no pedido.

```sql
-- Q-RO-1 (O20, O21): transições na janela de 84 dias, por direção, e sem tipo de coluna
SELECT direcao, COUNT(*) AS transicoes, COUNT(*) FILTER (WHERE tipo_coluna IS NULL) AS sem_tipo_coluna
  FROM dspd_bm.vw_transicao_canonica
 WHERE ocorrido_em >= now() - interval '84 days'
 GROUP BY direcao;

-- Q-RO-2 (O25): descartados nativos, excluídos e arquivados por tipo, na janela de 84 dias
SELECT tipo,
       COUNT(*) FILTER (WHERE motivo_descarte IS NOT NULL AND arquivado_em IS NOT NULL) AS descartados_nativos,
       COUNT(*) FILTER (WHERE excluido_em IS NOT NULL) AS excluidos,
       COUNT(*) AS encerrados_ou_arquivados
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND COALESCE(excluido_em, arquivado_em) >= now() - interval '84 days'
 GROUP BY tipo;

-- Q-RO-4 (O26) (*): revisões com o booleano de troca de responsável
SELECT COUNT(*) AS revisoes,
       COUNT(*) FILTER (WHERE payload ? 'troca_responsavel') AS com_campo,
       COUNT(*) FILTER (WHERE payload->>'troca_responsavel' = 'true') AS trocas,
       COUNT(DISTINCT card_id) AS cards
  FROM dspd_bm.stg_revision;

-- Q-RO-5 (O18) (*): tipos de vínculo nativo presentes no staging (conta versões, não cards)
SELECT l->>'link_type' AS tipo_vinculo, COUNT(*) AS n
  FROM dspd_bm.stg_card s, jsonb_array_elements(COALESCE(s.payload->'linked_cards', '[]'::jsonb)) l
 GROUP BY 1 ORDER BY 2 DESC;

-- Q-RO-6 (O8, O12, O14, O15, O16, O24): preenchimento dos campos T1.3 nas stories ativas
SELECT COUNT(*) AS stories, COUNT(classe_servico) AS classe, COUNT(tamanho_declarado) AS tamanho,
       COUNT(data_acordada) AS data_acordada, COUNT(responsabilidade_atraso) AS responsabilidade,
       COUNT(origem_demanda) AS origem_demanda, COUNT(area_solicitante) AS area, COUNT(sistema) AS sistema,
       COUNT(fase_deteccao) AS fase_deteccao, COUNT(severidade) AS severidade, COUNT(origem_bug) AS origem_bug
  FROM dspd_bm.dim_card
 WHERE granularidade = 'story' AND excluido_em IS NULL;

-- Q-RO-6b (O12, Q-099-10) (*): cards com o prazo nativo (deadline) no staging
SELECT COUNT(DISTINCT id_origem) AS cards_com_deadline
  FROM dspd_bm.stg_card
 WHERE payload->>'deadline' IS NOT NULL;

-- Q-RO-7 (S5, S6, S7, S9, S11, S1): preenchimento dos campos do chamado na janela de 84 dias
SELECT COUNT(*) AS chamados, COUNT(motivo_escalacao) AS motivo_escalacao, COUNT(motivo_encerramento) AS motivo_encerramento,
       COUNT(avaliacao_problema) AS avaliacao_problema, COUNT(motivo_pendencia_atual) AS motivo_pendencia,
       COUNT(*) FILTER (WHERE previsao_retorno) AS com_previsao, COUNT(*) FILTER (WHERE prioridade_ajustada_manualmente) AS ajuste_prioridade,
       COUNT(nivel_resolucao) AS nivel_resolucao, COUNT(primeiro_atendimento_em) AS primeiro_atendimento
  FROM dspd_ac.dim_chamado
 WHERE fora_do_recorte = false AND aberto_em >= now() - interval '84 days';

-- Q-RO-8 (C1, D1, D3): listas de referência carregadas
SELECT 'bm' AS base, campo, COUNT(*) FROM dspd_bm.ref_dominio WHERE vigente_ate IS NULL AND campo = 'campo_customizado' GROUP BY campo
UNION ALL
SELECT 'ac', campo, COUNT(*) FROM dspd_ac.ref_dominio WHERE vigente_ate IS NULL AND (campo LIKE 'cpe_%' OR campo = 'etapa_fluxo') GROUP BY campo
UNION ALL
SELECT 'ac', 'ref_alvo_prioridade', COUNT(*) FROM dspd_ac.ref_alvo_prioridade;

-- Q-RO-9 (S9, Q-099-8): etapas de espera e de pendência, em intervalos
SELECT etapa, COUNT(*) AS intervalos, COUNT(DISTINCT chamado_id) AS chamados
  FROM dspd_ac.fato_etapa_chamado
 WHERE etapa ILIKE 'Aguardando%' OR etapa ILIKE 'Pendente%'
 GROUP BY etapa ORDER BY 2 DESC;
```

```sql
-- MySQL do Acelerato, conta só leitura (ADR 0023). Só nomes de campo e contagens; nenhum valor de campo.
-- Q-RO-10 (O17, Q-099-7): existe campo de causa raiz?
SELECT f.nome_campo, COUNT(*) AS n
  FROM ACELERATO_CHAMADOS c,
       JSON_TABLE(c.campos_personalizados, '$[*]' COLUMNS (nome_campo VARCHAR(255) PATH '$.nomeCampo')) f
 WHERE c.tipo_ticket = 'DSPD - SSSC' AND c.equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG')
   AND (f.nome_campo LIKE '%ausa%' OR f.nome_campo LIKE '%aiz%')
 GROUP BY f.nome_campo;
-- Rodar também em separado (o UNION dá o erro 1271, acelerato-listas.md §12) com
-- JSON_TABLE(c.campos_personalizados_etapa, '$[*]' COLUMNS (nome_campo VARCHAR(255) PATH '$.nome')).

-- Q-RO-11 (S1, Q-099-5): preenchimento do primeiro comentário e prazos de SLA por prioridade
SELECT prioridade, sla_pa_prazo_min, sla_r_prazo_min, COUNT(*) AS n, COUNT(data_primeiro_comentario) AS com_primeiro_comentario
  FROM ACELERATO_CHAMADOS
 WHERE tipo_ticket = 'DSPD - SSSC' AND equipe IN ('SSSC TOTVS', 'SSSC SENIOR', 'SSSC FLUIG') AND organizacao LIKE 'UNIFIQUE - DSPD%'
 GROUP BY prioridade, sla_pa_prazo_min, sla_r_prazo_min
 ORDER BY prioridade, n DESC;
```

## 6. Perguntas ao dono (só o que nenhuma fonte tem ou que é regra sem definição)

- **Q-099-4. Cartão com parte real e parte sem fonte (O8, O16, S9, S11, S12; e a extensão "Também" do O22 e do O26).** (A) Publicar a parte que tem dado real e mostrar "sem dado real" com o motivo só na parte que falta, como já é no S2 (exceção de SLA) e no S3 (ajustes manuais). (B) Esperar o campo e manter o cartão inteiro em "Sem dado real". **Recomendação: A.** É o que mais aproxima o painel do dado real agora, sem número inventado: a parte sem fonte sai nula, nunca 0. Cada cartão passa pelo UX para a nota da parte.
- **Q-099-5. S1.** (a) **Alvo de cada prioridade:** (A) os prazos da matriz do briefing §3.4 (P1 15 min e 4 h; P2 30 min e 8 h úteis; P3 2 h úteis e 2 dias úteis; P4 4 h úteis e 5 dias úteis; P5 1 dia útil e 10 dias úteis), num arquivo versionado; (B) o prazo gravado em cada chamado (`sla_pa_prazo_min`, `sla_r_prazo_min`). **Recomendação: A**, porque o briefing é a especificação; a Q-RO-11 mostra se os prazos dos chamados batem com a matriz e, se não baterem, o dono decide qual vale. (b) **Primeiro atendimento (D-13 do plano 056):** (A) `data_primeiro_comentario` da tabela; (B) esperar a etapa de triagem da parametrização §3.4 (WS4). **Recomendação: A só se o time de ciência de dados confirmar que a coluna é o primeiro comentário do atendente, e não do solicitante;** senão B.
- **Q-099-6. O18: de onde vem o vínculo do bug com a entrega?** (A) O vínculo nativo do BusinessMap, que a coleta já traz (`linked_cards`), com o tipo de vínculo que o dono indicar depois da Q-RO-5. (B) O campo `origem_bug` da T1.3 (WS1). **Recomendação: A**, porque o dado já está no staging; o tipo de vínculo é escolha do dono, não do time.
- **Q-099-7. O17: de onde vem a causa raiz?** A decisão de 2026-10-11 era "campo do Acelerato via Metabase", e o Metabase deixou de ser a fonte com a ADR 0023. (A) Um campo personalizado da tabela MySQL, se a Q-RO-10 achar. (B) Esperar o campo ser criado no Acelerato (WS4). (C) Usar o campo `causa_raiz` do BusinessMap (briefing §4.4), o que reabre a decisão de 2026-10-11 e muda o cartão de fonte. **Recomendação: A se a Q-RO-10 achar o campo; senão B.** O cartão nunca junta as duas fontes.
- **Q-099-8. S9: o que é "pendência" enquanto a etapa `Pendente` do briefing §3.4 não está em produção?** (A) As esperas reais "Aguardando Solicitante", "Aguardando Suporte Terceiros" e "Aguardando Equipe Interna" contam como pendência, e o motivo é a própria etapa, por um de-para que o dono confirma (proposta: Aguardando solicitante, Aguardando fornecedor, Aguardando área vinculada). (B) Esperar a etapa `Pendente` e o campo "Motivo de Pendência" (WS4). **Recomendação: A**, com o de-para registrado como versão de critério (T2.6); a parte "cumprimento da previsão de retorno" fica sem dado real, porque a base só guarda se há previsão (migração 0035), não a data.
- **Q-099-9. O24 sem classe de serviço.** (A) Esperar o campo `classe_servico` (WS1). (B) Tratar todo card como classe Padrão até lá. **Recomendação: A.** B muda a definição da métrica (a regra FIFO vale só dentro da classe Padrão) e misturaria urgências com o fluxo padrão.
- **Q-099-10. O12: data acordada.** (A) O campo `data_acordada` da T1.3, preenchido no compromisso (WS1). (B) O prazo nativo do card (`deadline`), que a coleta já traz. **Recomendação: A**, porque o briefing define a data acordada no compromisso e a responsabilidade do atraso no vencimento; o `deadline` nativo pode ser mudado a qualquer momento e não diz quando foi acordado. Se o dono escolher B, a Q-RO-6b mostra a cobertura e a mudança entra como critério (T2.6).

## 7. Critério de parada (PAR-P2)

- bloqueia: uma métrica entrar em `METRICAS_ORIGEM_REAL` sem dado na base, publicar 0 onde a fonte não existe, ou um campo de pessoa ou texto livre chegar ao staging por um lote deste plano.
- C1-portao-sem-dado · métrica no mapa real com a consulta do §5 mostrando 0 no campo de que ela depende · oráculo: teste `.pg` do lote com base sem o campo, que espera `insuficiente` ou a parte nula com nota, nunca número
- C2-zero-falso · parte sem fonte publicada como 0 ou 0% (casos S12 `excecaoSla` e S11 `conversao`) · oráculo: teste da biblioteca no lote D6 e D9 que espera `null` com a nota
- C3-pessoa-na-fronteira · autor, nome, e-mail ou texto de comentário no staging ou na projeção (B5 a B7, C2, D8) · oráculo: os testes de fronteira da allow-list (lista de proibidos que não deriva das constantes, `allow-list.ts:7`), estendidos no lote
- C4-mistura-de-fonte · cálculo que lê `dspd_bm` e `dspd_ac` juntos · oráculo: o teste de separação dos repositórios que o 064 conferiu (`server/src/modulos/metricas/repositorio.ts:4-8`), sem exceção nova
- gatilho · oráculo: antes de cada lote de portão, o teste `.pg` dele falha com a métrica no mapa e a base vazia mostrando número; depois, passa.

## 8. Riscos

- **R1. Custo do O20 na base real.** A varredura diária sobre 18 mil cards pode estourar o orçamento da API (ADR 0003). O A2 mede antes do merge e para se passar.
- **R2. Colunas sem papel (064, M3).** 155 colunas sem papel e 3907 transições sem tipo afetam O20 e O21 (faixas por papel). Não impede o portão, mas o cartão deve dizer quantas transições ficaram fora; é correção das pessoas (WS1).
- **R3. `origem.ts` disputado.** O L3 da varredura e os lotes A e B mexem no mesmo arquivo. O tech-lead serializa os PRs.
- **R4. Números do 064 envelhecidos.** As medições são de 2026-11-04, antes do 069 e do 075. Nenhum lote começa só com elas: a consulta do §5 é condição.
- **R5. Grupos C e D dependem de pessoas.** Sem a configuração (WS1, WS4), 11 dos 20 cartões ficam em "Sem dado real" por tempo indeterminado. O plano não contorna isso: é a ordem obrigatória do briefing.

# Histórico do quadro

Append-only. Uma linha por movimento de cartão.

| Data/hora | Cartão | De | Para | Motivo |
|---|---|---|---|---|
| 2026-10-09 17:36 | K-001 | Entrada | Em andamento | Pedido 001 registrado (34e8940); UX acionado ~17:40 |
| 2026-10-09 17:40 | K-002 | Entrada | Em andamento | Arquiteto acionado em paralelo ao UX |
| 2026-10-09 17:47 | K-002 | Em andamento | Pronto | ADR 0001 e plano técnico (f929ed1) — carga retroativa, sem code review (fluxo anterior) |
| 2026-10-09 17:57 | K-001 | Em andamento | Pronto | Especificação UX rev. 1 (bf0baca) — carga retroativa |
| 2026-10-09 17:58 | K-004 | Pronto para fazer | Em andamento | react-frontend fase A acionado |
| 2026-10-09 17:58 | K-003 | Pronto para fazer | Em andamento | qa-engineer: plano de testes |
| 2026-10-09 18:03 | K-003 | Em andamento | Pronto | Plano de testes e esqueleto e2e (c157fdd) — carga retroativa |
| 2026-10-09 18:04 | K-001 | Pronto | Em andamento | Retrabalho: rev. 2 para fechar lacunas do QA e decisões J1/J2 |
| 2026-10-09 18:12 | K-001 | Em andamento | Pronto | Rev. 2 (a60a37a) |
| 2026-10-09 18:12 | K-002 | Pronto | Em andamento | Retrabalho: alinhar plano à rev. 2 |
| 2026-10-09 18:13 | K-002 | Em andamento | Pronto | Rev. 2 (fdb3b1d) |
| 2026-10-09 18:50 | K-005..K-011 | Entrada | Pronto para fazer | Pedido 001 quebrado em cartões; sem upstream (pedido 005) |
| 2026-10-09 18:50 | K-014..K-017 | Entrada | Pronto para fazer | Pedido 002, técnico sem interface: pula upstream |
| 2026-10-09 18:50 | K-018 | Entrada | Pronto para fazer | Pedido 003 |
| 2026-10-09 18:50 | K-012 | Entrada | Em andamento | Checkpoint 001 (pedido 003) |
| 2026-10-09 18:50 | K-013 | Entrada | Em andamento | Kickoff 002 (pedido 003) |
| 2026-10-09 18:50 | K-019 | Entrada | Feito | Quadro populado (pedido 004) |
| 2026-10-09 18:50 | K-020 | Entrada | Em andamento | Commits do pedido 005 |
| 2026-10-09 18:50 | K-021 | Entrada | Em andamento | Auditoria do quadro (pedido 004) |
| 2026-10-09 19:05 | K-005 | Pronto para fazer | Cancelado | Auditoria K-021: code review é coluna, absorvido pelo K-004 |
| 2026-10-09 19:05 | K-006, K-007, K-008, K-009, K-010, K-011, K-017 | Pronto para fazer | Entrada | Auditoria K-021: dependência aberta, volta ao backlog (WIP Pronto 12/5 -> 4/5) |
| 2026-10-09 19:05 | K-022 | Entrada | Pronto para fazer | Divisão de K-004 (fase A grande demais): A2 = shell, filtros e componentes |
| 2026-10-09 19:05 | K-023..K-026 | Entrada | Entrada | Divisão de K-006, K-007 e K-008 (cartões com mais de uma entrega revisável) |
| 2026-10-09 19:05 | K-012, K-013 | Em andamento | Processo | Reunião não é fluxo de entrega; sai do WIP e das métricas (Em andamento 3/3 -> 1/3) |
| 2026-10-09 19:05 | K-021 | Em andamento | Feito | Auditoria concluída |
| 2026-10-09 19:15 | K-012, K-013 | Em andamento | Feito | Ata `docs/alinhamentos/2026-10-09-checkpoint-001-kickoff-002.md` |
| 2026-10-09 19:15 | K-020 | Em andamento | Feito | Commits 6b2b3eb, 9f11794, 43cb7ad, afb6382 |
| 2026-10-09 19:15 | K-018 | Pronto para fazer | Em andamento | Arquiteto: ADR de performance + ADR 0002 |
| 2026-10-09 19:15 | K-015 | Pronto para fazer | Em andamento | Tech-lead: praticas.md |
| 2026-10-09 19:40 | K-015 | Em andamento | Code review | praticas.md entregue (e8ca91a); revisão cruzada com o arquiteto |
| 2026-10-09 19:40 | K-018 | Em andamento | Code review | ADRs 0002 e 0003 entregues; revisão cruzada com o tech-lead |
| 2026-10-09 19:55 | K-015, K-018 | Code review | Revisado, aguardando envio | Parecer aprovado com 3 ajustes não bloqueantes (lint da raiz de `metricas`) |
| 2026-10-09 20:10 | K-022 | Pronto para fazer | Em andamento | Executado na mesma sessão do react-frontend que K-004 (registro tardio) |
| 2026-10-09 20:10 | K-004, K-022 | Em andamento | Code review | Fase A entregue: lint, typecheck, 109 testes e build verdes |
| 2026-10-09 20:16 | — | — | — | **Correção de horários (Jarvis):** as linhas marcadas 19:15, 19:40, 19:55 e 20:10 foram registradas com horário estimado. Horários reais (pelos commits e arquivos): 19:15→18:52 (ata), 19:40→18:59 (ADRs entregues), 19:55→19:02 (parecer e commits 297674f/5fdd24f), 20:10→19:04 (fase A entregue). |
| 2026-10-09 20:16 | K-004, K-022 | Code review | Code review | Agentes de code review e de revisão de UX lançados às 19:04 pararam às 19:06 sem entrega (falha); relançados |
| 2026-10-09 20:18 | — | — | — | **Correção (Jarvis):** os agentes de review não tinham falhado, estavam lentos; o parecer de UX original chegou. As instâncias relançadas são duplicadas. |
| 2026-10-09 20:18 | K-004, K-022 | Code review | Em andamento | Retrabalho: docs/reviews/001-fase-a.md (10 bloqueantes) e 001-fase-a-ux.md (0 crít., 8 altos, 12 médios, 10 baixos) |
| 2026-10-09 20:22 | K-004, K-022 | Em andamento | Bloqueado | Aguardando bugs K-027, K-028, K-029 (política "Bugs e retrabalho"); fora do WIP por exceção de retrabalho; cycle time continua correndo |
| 2026-10-09 20:22 | K-027 | Entrada | Em andamento | Retrabalho (bug, bloqueante): 10 bloqueantes + 4 recomendados de docs/reviews/001-fase-a.md; pai K-004/K-022; encaminhado ao react-frontend às 20:18 |
| 2026-10-09 20:22 | K-028 | Entrada | Em andamento | Retrabalho (bug, alto): 8 altos de docs/reviews/001-fase-a-ux.md (A1 a A8); pai K-004/K-022 |
| 2026-10-09 20:22 | K-029 | Entrada | Em andamento | Retrabalho (ajuste, médio/baixo): 10 médios e 8 baixos de docs/reviews/001-fase-a-ux.md; pai K-004/K-022 |
| 2026-10-09 20:22 | — | — | — | Política "Bugs e retrabalho" publicada na skill kanban-scrum e no KANBAN.md; limites QA 2 e Aguardando 2 alinhados na skill (M-001, D14) |
| 2026-10-09 20:23 | K-028, K-029 | Em andamento | Em andamento | Escopo ampliado com docs/reviews/001-fase-a-ux-adendo.md (itens só da 1ª revisão de UX: 3 altos, 7 médios) |
| 2026-10-09 20:27 | K-027 | Em andamento | Em andamento | Escopo ampliado: parecer final do code review (14 bloqueantes, 19 recomendados) substitui a versão de 10; decisões Q1–Q6 registradas |
| 2026-10-09 20:27 | K-027 | Em andamento | Em andamento | Bug QA 001 (gerador Acelerato importa BusinessMap) vinculado: mesmo achado do code review |
| 2026-10-09 20:46 | K-030 | Entrada | Pronto para fazer | Saída da reunião de melhoria nº 1 (M-004, M-005) |
| 2026-10-09 20:53 | K-034 | Entrada | Empatizar e definir | Pedido 006: discovery de integração real (ux-designer; viabilidade do software-architect depois) |
| 2026-10-09 20:53 | K-035 | — | Entrada | Pedido 006: métricas fora do núcleo |
| 2026-10-09 20:53 | K-036 | — | Entrada | Pedido 006: lacuna de valor na sustentação |
| 2026-10-09 20:53 | K-031 | — | Em andamento | Novo cartão, vaga do software-architect (entrada direta; registro único) |
| 2026-10-09 20:53 | K-032 | — | Em andamento | Novo cartão, vaga do qa-engineer (entrada direta; registro único) |
| 2026-10-09 20:53 | K-033 | — | Em andamento | Novo cartão, vaga do node-backend, no worktree 002 (entrada direta; registro único) |
| 2026-10-09 20:53 | K-037, K-038 | — | Processo | Cartão de processo do pedido 006; reunião de melhoria nº 1 feita (ata em docs/alinhamentos, M-004..M-012, develop e worktree 002 em 84d8f14) |
| 2026-10-09 20:57 | K-033 | Em andamento | Code review | Rascunho do contrato da API commitado no worktree 002 (d93de3d) |
| 2026-10-09 20:57 | K-032 | Em andamento | Code review | Aceitação K-023..K-026 entregue (9dcc9c8) |
| 2026-10-09 21:03 | K-034 | Empatizar e definir | Validação do usuário | Discovery Integração real pronto (ec96623); aguarda validação no fim do 001 (pedido 006) |
| 2026-10-09 21:03 | — | — | — | Decisão do usuário: fase B com 3 instâncias de react-frontend em paralelo (exceção ao WIP 1 por agente) e máxima economia de tokens: K-035/K-036 pausados até o fim do 001; reuniões de melhoria só tech-lead + agile-coach, curtas |
| 2026-10-09 22:09 | K-027, K-028, K-029 | Em andamento | Code review + QA | Retrabalho entregue (a1f9125..252bed4): 162 testes, gate aprovado, O1 427→46 ms, VG ~500→~70 ms; 1ª instância caiu por erro de API e foi relançada (voltas: 1) |
| 2026-10-09 22:09 | K-030 | Pronto para fazer | Em andamento | react-frontend: portão automático + matriz REGRAS_METRICA, em paralelo ao review r2 da fase A |
| 2026-10-09 22:17 | K-027 | Code review | QA | r2 aprovado (docs/reviews/001-fase-a-r2.md, 53b4bc7); aguarda parecer do QA para integrar |
| 2026-10-09 22:17 | — | — | — | Pendências do r2 viram escopo: R5 (inclui O3) no K-030 (Amostra com marca); R9 (O7 saldoAcumulado oculto até decisão de UX) no K-023; R17 (casts da UI) no K-006 |
| 2026-10-09 22:38 | K-027..K-029, K-004, K-022 | QA | Integração | QA aprovado (docs/qa/001-fase-a.md, 5b5fb9b): 0 crítico/alto, axe 0 violações, LCP p95 ≤156 ms, troca de filtro p95 21 ms |
| 2026-10-09 22:38 | K-039 | Entrada | Pronto para fazer | [bug] QA fase A: médios 002 (O4 vazio + insuficiente), 003 (barra de filtros não sticky / A7); baixos 004 (equipes na URL), 005 (alvo 28 px); teste de desempenho instável (O1 208 ms) → K-030. Vai com K-006; voltas: 0 |
| 2026-10-09 22:39 | K-039 | Pronto para fazer | Pronto para fazer | Escopo ampliado: R3 do parecer docs/reviews/001-molde-o4-ux-r1.md (unidade no eixo Y, no GraficoBase); molde O4 aprovado com ressalvas |
| 2026-10-09 22:43 | K-030 | Em andamento | Code review | Entregue (f299912, 09c1e5f, 1ef5360): pronto verde, 354 testes, gate aprovado; P5 achou e corrigiu 4 bugs de ordem |
| 2026-10-09 22:43 | — | — | — | **Desvio de processo (Jarvis):** o merge 7d5bf9f na feature/dashboard-mock incluiu f299912 e 09c1e5f (K-030) antes do code review/QA. Correção: review e QA do K-030 agora; ajustes entram como commits novos e nova integração. Ação para a retro: integrar só por hash conferido contra pareceres |
| 2026-10-09 22:43 | K-016 | Pronto para fazer | Em andamento | react-frontend: extração para packages/ (ADR 0002), em paralelo ao review do K-030 |
| 2026-10-09 22:48 | K-030 | Code review | Em andamento | r1 com ajustes (docs/reviews/001-K-030-r1.md, 1b97144): S4 por prioridade × nível (bloqueante) → K-008; teste de desempenho por mediana de 5 / p95 de 20, sem paralelismo (bloqueante) → K-006; tsconfig.test.json (recomendado) → K-016. Voltas: 1 |
| 2026-10-09 23:03 | K-016 | Em andamento | Code review | Extração entregue (dbbcfb4, 26b0749): 354/354 testes, hash 924448d4 idêntico, gate aprovado |
| 2026-10-09 23:03 | K-039, K-006, K-023 | Pronto para fazer | Em andamento | Fase B instância 1 (react-frontend #1) |
| 2026-10-09 23:03 | K-007, K-024 | Pronto para fazer | Em andamento | Fase B instância 2 (react-frontend #2) |
| 2026-10-09 23:03 | K-008, K-025, K-026 | Pronto para fazer | Em andamento | Fase B instância 3 (react-frontend #3); exceção de WIP aprovada pelo usuário |
| 2026-10-09 23:08 | K-016 | Code review | QA | r1 aprovado com ajustes (docs/reviews/001-K-016-r1.md): bloqueante 2 (typecheck do e2e) → qa-engineer agora; bloqueante 1 (regras de fronteira restantes no ESLint + fixtures) → K-041 após a fase B, antes do PR; recomendados (ciclo metricas↔mock, ADR sem project references, export nominal de estado, node no tsconfig) → K-041 / arquiteto |
| 2026-10-09 23:08 | K-041 | Entrada | Pronto para fazer | [ajuste] Fronteiras ESLint da ADR 0002 restantes + recomendados do K-016 r1; dono react-frontend; bloqueia o PR |
| 2026-10-09 23:35 | K-008, K-025, K-026 | Em andamento | Code review + QA | Instância 3 entregou (e1e4470, a840020, e4ccab7); pronto e gate verdes; decisões F1–F3 registradas |
| 2026-10-09 23:35 | K-007, K-024 | Em andamento | Code review (fila) | Instância 2 entregou; pronto e gate verdes; review e QA após os de B3 (economia de tokens) |
| 2026-10-09 23:35 | K-042 | Entrada | Pronto para fazer | [ajuste] Integração entre painéis: seção EI em Operacional/Tático/Estratégico (CartaoEIFL1/2/3 compactos), params s4/ei_fl1/ei_fl3/ei_sust/e1 em features/filtros/paineis.ts, META_* em @metricas-dspd/contratos, totais de chegadas/saídas do T4 no DTO, base do T9 no formato da spec, mover helpers compartilhados de features/tatico. Após instância 1 |
| 2026-10-09 23:43 | K-039, K-006, K-023 | Em andamento | Code review | Instância 1 entregou (3d65829 + fase B); pronto da raiz verde com as 3 instâncias: 432 testes |
| 2026-10-09 23:43 | K-043 | Entrada | Em andamento | [ajuste] Rodada consolidada: B3 r1 (F2 S5 naoInformado, F3 alerta O10), K-042 (integração entre painéis + recomendados B2), K-041 (fronteiras ESLint), F4 (O7 saldo acumulado), faixa "P85 subiu", O1 hachura acima do limite; react-frontend; voltas: 1 |
| 2026-10-09 23:49 | K-006, K-023 | Code review | QA (fila) | B1 r1 aprovado (docs/reviews/001-B1-r1.md, 567e995); K-039 com 1 bloqueante (typecheck de k039.test.ts) já no escopo do K-043 item 5; recomendados B1 (textoBusca, marcaDoTipo neutra, cast colapsarTodos) entram no K-043; K-030 item b fechado |
| 2026-10-09 23:59 | K-008, K-025, K-026 | QA | Revisão de UX | QA B3 (docs/qa/001-B3.md, bb5b22e): 19/21 E2E, axe 0 violações; S1 P4/P5 em dias úteis vale (L2/J2), SUS-14 do plano desatualizado |
| 2026-10-09 23:59 | K-044 | Entrada | Pronto para fazer | [bug] QA B3: B3-001 (média, Sustentação sem faixa Pede atenção), B3-002 (média, âncora #o12 — reverificar após K-023), B3-003 (baixa, recorte da VG ambíguo); react-frontend após K-043 |
| 2026-10-10 00:02 | K-044 | Pronto para fazer | Pronto para fazer | Escopo ampliado com UX B3 (docs/reviews/001-B3-ux-r1.md): médio S2 rótulo Meta sobre barras; baixos fonte do cabeçalho de /espera-invisivel sem Acelerato, cabeçalho alto a 375 escuro, cartões da VG verticais demais. SUS-14 já decidido (L2/J2). Params ei_* aceitos (spec rev. 4 pendente com o UX) |
| 2026-10-10 00:24 | K-043 | Code review | Em andamento | r1 com 2 bloqueantes (docs/reviews/001-K-043-r1.md, 25ba3e1): O7 saldo acumulado recorta semanas do período + teste de borda → react-frontend após K-044; typecheck de e2e/tests/b3-sust-ei-vg.spec.ts:104 → qa-engineer após B12; adendo ADR 0002 (ciclo metricas→mock em teste) → arquiteto na pré-entrega. Voltas: 2 |
| 2026-10-10 00:41 | K-039, K-006, K-023, K-007, K-024 | QA | Revisão de UX | QA B12 (docs/qa/001-B12.md, 9de6634): 178/181 E2E, axe 0 violações |
| 2026-10-10 00:41 | K-045 | Entrada | Pronto para fazer | [bug] O7 saldo acumulado recortado no período + teste de borda (K-043 r1 #1); B3-002 links de alerta da VG com cadencia=semanal (O12, O10); B12-001 (média) leitura do O2 com coluna errada; B12-003 (baixa) testid metrica-Bloqueados; react-frontend após K-044 |
| 2026-10-10 00:45 | K-046 | Entrada | Pronto para fazer | [bug] UX B12 (docs/reviews/001-B12-ux-r1.md): 2 altos (tabelas cortadas sem rolagem em E3/T7/T4/Bloqueados/O2; rótulos sobrepostos no T7) bloqueiam a entrega + 5 médios (E2 tabela aberta com 35 linhas, Amostra insuficiente repetido no E1, cabeçalho mobile em 3 linhas, rótulo da semana em andamento no O4; B12-001 já no K-045); react-frontend após K-045 |
| 2026-10-10 02:58 | — | — | — | **Reconciliação (agile-coach):** o histórico não recebeu lançamentos entre 00:45 e 02:56 e o quadro estava parado em 2026-10-09 22:09. As linhas abaixo são reconstruídas dos commits (hora do commit, não do movimento real) e dos pareceres. |
| 2026-10-10 00:55 | K-043, K-044, K-045, K-041, K-042 | Code review | QA | Aprovados em docs/reviews/001-K-044-045-r1.md (ac72d0b) |
| 2026-10-10 00:59 | K-046 | Em andamento | Code review | Entregue (7ece131, 58aab8f, 3318ddc); aprovado com recomendações em docs/reviews/001-K-046-r1.md |
| 2026-10-10 01:01 | K-047 | Entrada | Em andamento | [bug] faixa Pede atenção com carregando/erro (dd1be98); aprovado em 001-K-047-048-r1 |
| 2026-10-10 01:21 | K-009 | QA | QA | Parecer final r1 do QA (2088852): REPROVADO por 007 (S7 em mobile) e 008 (CLS/Lighthouse) |
| 2026-10-10 01:43 | K-048 | Entrada | Em andamento | [bug] 007 (84ce0ed) e 008 (45049ff, 01:49); review 001-K-047-048-r1 (02:03): 007 aprovado, 008 com 1 bloqueante (minHeight no estado pronto). voltas 008: 1 |
| 2026-10-10 02:17 | K-048 | QA | Em andamento | QA r2 (b2d1f31): 007 e B12-002 fechados, 008 reaberto em mobile. voltas 008: 2 |
| 2026-10-10 02:21 | K-049 | Entrada | Em andamento | [bug] minHeight só no esqueleto (735c710), bloqueante do review final da branch |
| 2026-10-10 02:37 | K-050 | Entrada | Em andamento | [bug] CLS a 375 px (13d35e6), 008 |
| 2026-10-10 02:42 | K-049, K-050 | Code review | QA | Aprovados em docs/reviews/001-K-049-050-r1.md; branch liberada condicionada ao QA |
| 2026-10-10 02:56 | K-004..K-050 (cartões do 001) | QA | Aguardando sua validação | QA final r3 APROVADO (4811cb9); 008 fechado (voltas: 3); fechados junto com os pais |
| 2026-10-10 02:58 | K-014, K-033 | Code review | Revisado, aguardando envio | Aprovados na r2 (7783107, 697802c), worktree do 002 |
| 2026-10-10 02:58 | K-017 | Entrada | Code review | Parte 1 (migrações, 324b472) entregue; sem review; seed pendente |
| 2026-10-10 02:58 | K-034 | Validação do usuário | Validação do usuário | Reconciliação: segue aguardando o usuário; K-035/K-036 pausados |
| 2026-10-10 02:59 | K-010 | Revisão de UX | Aguardando sua validação | UX final aprovado (docs/reviews/001-ux-final.md): altos da B12 resolvidos; 1 médio (rótulos truncados no T7) e 1 baixo (indício de rolagem) abertos, sem bloqueio |
| 2026-10-10 09:50 | K-001..K-050 (pedido 001) | Aguardando sua validação | Pronto | Usuário mesclou o PR #1 (eff026a); main local sincronizada, develop em ff, feature/dashboard-mock apagada (local e remoto), main integrada na feature/arquitetura-mysql |
| 2026-10-10 10:04 | K-034 | Validação do usuário | Pronto para fazer | Validado com ajustes (docs/alinhamentos/2026-10-10-decisoes-do-usuario.md): painel sempre visível, janela de calibração automática, coleta diária, tela /dados |
| 2026-10-10 10:12 | K-053 | Entrada | Pronto para fazer | [bug] K-017 r1 (docs/reviews/002-K-017-r1.md, b377552): id_origem VARCHAR(32) × hash 64; gravarStgCard com quadro_id/arquivado fixos; + recomendados; node-backend após Docker |
| 2026-10-10 10:12 | K-054 | Entrada | Em andamento | [bug] Timeouts de 15 s nos testes do web sob carga no npm run pronto; react-frontend |
| 2026-10-10 10:12 | K-055 | Entrada | Empatizar e definir | Pedido 007 (preferências de métricas): ux-designer começa; software-architect entra após a documentação técnica |
| 2026-10-10 10:21 | K-055 | Empatizar e definir | Validação do usuário | Discovery 007 pronto (docs/ux/preferencias-metricas/); viabilidade técnica do arquiteto pendente |
| 2026-10-10 10:31 | K-056, K-057 | Entrada | Pronto para fazer | Cobertura 100% (pedido do usuário): baseline 1b9b291 — contratos 0% linhas, metricas 97,1/95,1/83,7/95,6, mock 99,3/100/93,6/97,4, web 91,6/87,1/86,5/89,4. K-056 pacotes, K-057 web; react-frontend após K-054; depois QA liga thresholds |
| 2026-10-10 10:55 | K-034 | Validação do usuário | Pronto para fazer | Reconciliação (agile-coach): spec final e tela /dados em a428edf; implementação futura |
| 2026-10-10 10:55 | K-053 | Pronto para fazer | Code review | Reconciliação: corrigido em 831779d, re-review do tech-lead (pai K-017) |
| 2026-10-10 10:55 | K-017 | Code review | Bloqueado | Testes MySQL dependem de Docker na máquina (usuário); ambiente pronto em fce13e1 |
| 2026-10-10 10:55 | K-054 | Em andamento | Code review | Feito em 937efa1 |
| 2026-10-10 10:55 | K-056, K-057 | Pronto para fazer | Em andamento | Cobertura 100%: react-frontend, 2 instâncias |
| 2026-10-10 10:55 | K-058 | Entrada | Pronto | Reconciliação: documentação técnica do 001 (6428396, 51fdb4c) pronta na develop; segue no PR #2 |
| 2026-10-10 10:55 | PR #2 | — | Aguardando sua validação | develop → main aberto pelo usuário |
| 2026-10-10 10:55 | K-055 | Validação do usuário | Validação do usuário | Viabilidade do arquiteto pronta (780290f); aguarda 5 pontos + D-f, D-g |
| 2026-10-10 11:04 | K-034 | Pronto para fazer | Pronto para fazer | Plano técnico pronto (docs/architecture/features/integracao-real.md): F1–F7 react-frontend após K-056/K-057; B1–B4 node-backend no 002; Q1 QA. Frescor no corpo (EstadoColeta). Pergunta ao usuário: tolerância do 'Atrasado' (provisório 0 h) |
| 2026-10-10 14:56 | K-055 | Validação do usuário | Pronto para fazer | Pedido 007 validado pelo usuário (7 decisões em docs/alinhamentos/2026-10-10-decisoes-do-usuario.md §6) |
| 2026-10-10 14:56 | K-063 | Entrada | Entrada | Pedido 008 (exportar métricas em PDF/imagem) registrado |
| 2026-10-10 14:56 | — | — | — | Usuário decidiu trocar o banco para PostgreSQL (§7) |
| 2026-10-10 14:59 | K-064 | Entrada | Entrada | CI no GitHub Actions (6 etapas: rápida, testes 100%, Postgres em contêiner, build+size, E2E+axe, perf/Lighthouse) + proteção de branch + Dependabot + hook local; decisão do usuário: montar logo após a troca para PostgreSQL/pnpm |
| 2026-10-10 16:33 | K-017 | Bloqueado | Pronto | Docker disponível; banco migrado para PostgreSQL (ADR 0014): migrações, seed e 31 testes pg executados (pedido 009); medição de desempenho do banco no S-11 |
| 2026-10-14 08:10 | K-001..K-064 | (vários) | Arquivo | Quadro reconstruído: os cartões até K-064 estão concluídos (releases #40, #51, #57 e #60 na main); o quadro estava parado desde 2026-10-10 |
| 2026-10-14 08:10 | K-065 | Em andamento | Pronto | Espera invisível nos painéis: #64 na develop (376d997) e #65 na homolog; vai no release #63 |
| 2026-10-14 08:10 | K-066 | Em andamento | Pronto | Front via API: #59 e #61; vai no release #63 |
| 2026-10-14 08:10 | K-067, K-068 | QA | Pronto | Testes intensivos de filtros e sistêmico concluídos |
| 2026-10-14 08:10 | K-069 | Pronto para fazer | Em andamento | Lote de bugs IF e IS (react-frontend) |
| 2026-10-14 08:10 | K-070, K-071 | Entrada | Pronto para fazer | IS-002 (node-backend) e IS-007 (qa-engineer) |
| 2026-10-14 08:10 | K-072 | Pronto para fazer | Em andamento | Sustentação no Operacional, back-end B1 a B3 |
| 2026-10-14 08:10 | K-073, K-074, K-075, K-077 | Entrada | Entrada | Sustentação front; usabilidade U1 a U5; mobile e tablet (010); retrospectiva + melhoria do Forge |
| 2026-10-14 08:10 | K-076 | Pronto para fazer | Em andamento | Documentação .md do discovery para a develop |

- 2026-10-14 15:30 — K-069, K-070, K-071 → Pronto (release #72 na main); K-076 → Pronto (#66); K-072+K-073 → Code review; K-078 (pedido 011) → Validação do usuário.
- 2026-10-14 15:30 — Usuário autorizou 4 agentes. K-077 → Em andamento (agile-coach); K-079 e K-080 abertos em Em andamento.
- 2026-10-14 15:35 — Lançamento de K-077, K-079 e K-080 recusado pelo hook R-TETO (3 agentes ativos na máquina, teto adaptativo 2–3); ficam na fila.
- 2026-10-14 15:50 — K-072+K-073: review reprovado por documentação; pronto verde na 2a rodada (varredura instável sob carga). Volta 1 ao node-backend e ao react-frontend.
- 2026-10-14 15:55 — K-079 concluído (plano 011 §8; ADR 0019 L2 editada, commit pendente com o tech-lead). K-080 (QA) lançado.
- 2026-10-14 16:00 — K-080: plano de QA pronto. UX lançado para os textos e o alerta do review e para A1–A10. K-077 segue na fila do R-TETO.
- 2026-10-14 16:05 — UX: adendo do review gravado (U1 pendente com o usuário; vale (a) até a resposta). K-077 lançado (agile-coach).
- 2026-10-14 16:10 — K-077: retro 002 e proposta ao Forge prontas; 3 PRs do tech-lead aguardando vaga (R-TETO).
- 2026-10-14 16:15 — K-072 (back) volta 1 concluída: 36df612 (M2, L3) e 50de2a0 (L4, M3). Aguarda o front para a volta 2 do review.
- 2026-10-14 16:25 — K-073 front volta 1 concluída (66e3d46, 06fab0c); front aplicando o adendo de UX antes da volta 2 do review. Tech-lead abrindo os 3 PRs do Forge (K-077).
- 2026-10-14 16:30 — Usuário reduziu o teto desta sessão para 3 agentes.
- 2026-10-14 16:45 — K-072+K-073 → Code review (volta 2), depois do adendo de UX no front (6 commits, web 1031/1031, 100%).
- 2026-10-14 17:00 — Plano da Sustentação: tabela 4.5 corrigida pelo architect (sem commit); vai na volta 2.
- 2026-10-14 17:10 — Usuário aceitou as recomendações: D-1' = A (pedido 011) e U1 = (a) (Sustentação).
- 2026-10-14 17:30 — Pedido 011: o usuário aprovou a T14 (participação do meu time no projeto) como métrica nova; D-1' = A e U1 = (a) registradas.
- 2026-10-14 17:45 — T14: discovery de UX e de arquitetura concluídos; triagem das perguntas registrada no pedido 011.
- 2026-10-14 17:50 — K-077: os 3 PRs do Forge ficaram prontos localmente, mas o push foi barrado pelo pre-push (a suíte não roda dentro de sessão Claude). A ação foi para o usuário. Volta 2 do review da Sustentação iniciada.
- 2026-10-14 18:10 — K-072+K-073: volta 2 reprovada só pelo pronto da raiz (V1 a V3); volta 3 com o node-backend e o react-frontend.
- 2026-10-14 18:20 — Usuário ausente: subir recursos de forma equilibrada. Tech-lead abrindo o PR de documentação e do quadro (chore/forge-0.13.0 → develop). Orçamento móvel (K-075, architect) aguarda vaga no R-TETO.
- 2026-10-14 18:40 — K-072+K-073: volta 3 do back concluída (95fdf1a, d4ac4dd), pronto da raiz verde (exit 0). A volta 3 do review espera o tech-lead terminar o PR de docs. Orçamento móvel (K-075) com o architect. Usuário fora: pediu o remote control (não acionável pelo agente) e consumo consciente.
- 2026-10-14 18:50 — K-075: orçamento móvel incluído na ADR 0003 pelo architect (sem commit, no diretório principal; vai num PR de docs depois do atual).
- 2026-10-14 19:00 — PR #73 (docs do 011, adendo, retro e quadro) mesclado na develop (cdb5f8a). K-072+K-073 na volta 3 do review. Abertos K-081 (registro da versão do Forge, ação do usuário) e K-082 (PR da ADR 0003).
- 2026-10-14 20:15 — K-078: protótipo do 011 aprovado → Pronto para fazer. K-082: #74 bloqueado pelo e2e IF-A na CI. K-083 aberto (react-frontend investiga).
- 2026-10-14 20:25 — Usuário definiu a prioridade: back do 011 em paralelo; front K-074 → K-075 → 011.
- 2026-10-14 20:40 — Revisão de desenho do 011: aprovado com ajustes (ata em alinhamentos). Architect aplica A1–A13. B1 (node-backend) aguarda vaga no R-TETO. P-1 com o usuário.
- 2026-10-14 21:00 — Plano do 011 vigente (A1 a A13; ADR 0020 proposta). K-078 → Em andamento: B1 com o node-backend.
- 2026-10-14 21:10 — Usuário ausente (noite). Estado em estado-2026-10-14-noite.md.
- 2026-10-14 21:30 — ADR 0020: segurança aprovada com ressalvas; K-084 aberto; R-1 com o usuário.
- 2026-10-14 22:00 — ADR 0020 atualizada (vigente para a fase 2). Cartões K-085 a K-090 abertos. R-2 com o usuário.
- 2026-10-14 22:20 — K-090 concluído (data-model e configuração da API alinhados à ADR 0020).
- 2026-10-14 23:00 — K-083 → Code review (causa: timeout do E2E na CI).
- 2026-10-14 23:20 — K-083: review aprovado → fila do QA.
- 2026-10-14 23:50 — K-078 B1 pronto (4535089, 4e70af9; pronto da raiz verde). Review incremental do B1 com o tech-lead; B2 (O23) com o node-backend. Nota: o node-backend rodou o pnpm install --offline fora do flock (3,5 s) depois de 38 min na fila; reforçado na delegação do B2.
- 2026-10-15 00:10 — Review do B1: aprovado, com ajustes R1 a R4 para depois do B2.
- 2026-10-15 00:40 — Sustentação: QA aprovado com ressalvas (5 bugs SNO, nenhum alto aberto). Front corrige SNO-002, SNO-004 e o texto da A6; revisão de UX em paralelo.
- 2026-10-15 01:00 — Sustentação: revisão de UX aprovada com ressalvas (D-01 a D-09). D-09 vai para o architect; QA do K-083 na fila (R-TETO com carga 7 e 1,6 GB livres).
- 2026-10-15 01:20 — K-078 B2 (O23) pronto (75837cd; pronto verde). Node-backend nos ajustes R1 a R4 do B1. QA do K-083 lançado. O review do B2 entra no próximo lote com o tech-lead. Na validação, confirmar o limite de 5 dias úteis (U-11).
- 2026-10-15 02:00 — K-083: QA aprovado; o tech-lead integra e destrava o #74. Abertos K-091 (IFA-001), K-092 (IF-U instável) e K-093 (SNO-005).
- 2026-10-15 02:30 — Sustentação: SNO-002, SNO-004 (CLS de 0,125 para 0,0039) e texto da A6 em 8423b19. SNO-001 vai para o K-075. Próximo: as ressalvas de UX D-01 a D-08 (react-frontend) e a D-09 (architect), os dois na fila do R-TETO, com carga 8.
- 2026-10-15 03:00 — K-078 B3 (O19, T10) pronto (69e98e0). Pergunta O19-pct para o usuário. Ressalvas de UX D-01 a D-08 da Sustentação com o react-frontend.
- 2026-10-15 03:40 — K-078 B4 (T12) pronto (f3629a0). O mock não gera ida e volta (k = 0); a extensão do mock é decisão do tech-lead no review (B11). B5 na fila do R-TETO.
- 2026-10-15 04:20 — Sustentação: ressalvas de UX D-01 a D-08 aplicadas (9ab5ece; pronto verde; E2E 133 e 77 verdes; flake do CT-03 sob carga). D-04 e SNO-001 vão para o K-075. Próximo: review e QA do delta 8423b19..9ab5ece, reconferência do UX e D-09 (architect).
- 2026-10-15 04:50 — Sustentação: especificação 5.9.3 corrigida (diff conferido, só a linha e o histórico); reconferência do UX aprovada. Falta o review e o QA do delta 8423b19..9ab5ece, depois o PR. O tech-lead está ocupado com os PRs do K-083 e do #74.
- 2026-10-15 03:10 — A máquina reiniciou, e os agentes do K-083 e do B5 foram interrompidos. O PR #75 (K-083) estava com os checks verdes; o tech-lead retoma o merge do #75 e do #74. O node-backend retoma o B5 a partir do trabalho parcial que ficou sem commit.
- 2026-10-15 03:40 — K-078 B5 (E7 sem R$, E9) pronto (04dd94d). O E9 juntava Iniciativa e Melhoria num P85 só, o que contraria a regra geral 7 da especificação e a Q4 do E1. O Jarvis mandou fazer por tipo (decidido pelo documento, não vai ao usuário). Depois vem o B6 (O25). O E9 dos campos idade e faixa segue a especificação.
- 2026-10-15 04:20 — K-078: ajuste do E9 por tipo (e9085e7) e B6/O25 (ab924c3) prontos. O O25 vai ser ajustado por tipo antes do B7. Pergunta (b) do O25 para o usuário.
- 2026-10-15 05:10 — K-078: O25 por tipo (103105d) e B7/O21 (0c18a5b) prontos, com o pronto verde. Os dados fictícios estão insuficientes: o O21 dá 1,4% de retornos contra os cerca de 25% da especificação, e o O25 não publica nenhum tipo. Vai como decisão prioritária ao tech-lead no review do lote B2 a B7 (B11). B8 em andamento.
- 2026-10-15 06:00 — K-078 B9/O20 pronto (c443888). Dois pontos divergiam da especificação e voltaram ao node-backend: faixas de Backlog a Entregue, e destaque nas últimas 4 semanas. O papel misto vai para o review do tech-lead. O #74 continua com o tech-lead.
- 2026-10-15 06:40 — B9-ajuste (0e426e3): o O20 passa a ter as faixas de Backlog a Entregue. A janela do destaque fica no período do filtro, como a regra da especificação manda. B10 (O24) em andamento.
- 2026-10-15 07:20 — K-078 B10/O24 pronto (2a2f837). O mock dá 86,5% fora de ordem contra os cerca de 25% da especificação; mais um ponto para a decisão do mock no B11. O plano foi atualizado só na cópia da worktree.
- 2026-10-15 08:00 — K-084 pronto (5352a67); review de segurança e releitura da ADR 0020 com o security-engineer. O #74 está verde e ainda não foi mesclado: o tech-lead não concluiu.
- 2026-10-15 09:00 — K-085 (GRANT por coluna) pronto (a4643d8, branch fix/grants-por-coluna). O código de saída do pronto não ficou provado; o review do tech-lead roda o pronto de novo. As tabelas ainda não existem, então a exclusão vale por nome quando elas forem criadas.
- 2026-10-15 09:20 — PR #74 (ADR 0003, orçamento móvel) mesclado na develop; #75 já estava. K-082 e K-083 concluídos. O diretório principal segue na branch local docs/orcamento-movel (já mesclada), com docs sem commit; o tech-lead troca de branch no próximo PR de docs.
- 2026-10-15 11:00 — Sustentação: QA do delta aprovado com ressalvas (E2E 673/673, CLS 0,0039). Pendente o aceite do usuário para SNO-001 e SNO-005.
- 2026-10-15 13:00 — K-085: segurança aprovada em 21dabc0 (2f36a77). Parecer de segurança do K-084 regravado com Write; o conteúdo é idêntico ao commitado, então não há commit novo (a autoria é registrada pelo hash). Pendentes: doc do K-085, depois volta 2 do review e QA; QA do K-084; regravação do parecer de QA da Sustentação.
- 2026-10-15 15:00 — Sustentação: parecer de QA regravado com Write (ae103e3), com aceite_usuario: nao. O forge-check pr reprova só pela falta do aceite do usuário para SNO-001 e SNO-005. K-084: QA aprovado (d0bce7f, 8737be4); falta o tech-lead regravar o review, desatualizado pelos testes novos do QA. QA do K-085 em andamento.
- 2026-10-15 16:00 — 011: review do lote B2 a B10 reprovado, com 6 ajustes bloqueantes; o node-backend corrige. Mock B11a definido com alvos. O UX responde sobre o Backlog como destaque no O20. O tech-lead revalida o review do K-084. QA do K-085 em andamento.
- 2026-10-15 16:40 — K-085: QA aprovado (911140c). Pronto para PR, junto com a pré-condição da fase 3 no plano, que está sem commit na -k085. Quando o tech-lead terminar a revalidação do K-084, ele abre os PRs do K-084 e do K-085.
- 2026-10-15 17:30 — 011: os 6 ajustes que bloqueavam o lote estão resolvidos (12 commits, HEAD 08ae389; pronto da raiz com EXIT=0 e 100%). B11a (mock com alvos) em andamento. O architect ratifica os aceites e corrige A8 e E9 no plano. O tech-lead está nos PRs do K-084 e do K-085.
- 2026-10-15 18:30 — #77 (K-084) aberto, com os checks verdes, mas a branch está atrás da develop. A atualização com a develop invalida os pareceres (só por docs), então o tech-lead atualiza o K-084 e o K-085 e revalida, e o QA e a segurança revalidam em seguida. K-094 aberto (seed.pg instável).
- 2026-10-15 20:00 — K-084 mesclado na develop (#77, 0fe209a); branch e worktree apagadas. K-085 atualizado com a develop (c626cd0). Como o merge trouxe código do K-084, os pareceres de review e de QA precisam de nova volta. Review em andamento.
- 2026-10-15 22:00 — 011: B11a (mock da fase 1) pronto em 1f4d90e, com EXIT=0. Os alvos foram atingidos: O24 23,4%, O21 23,3%, T12 16,9%, O25 9,2%, E9 com 7 projetos; Acelerato intacto. O O23 ficou em 6,7%; o tech-lead decide. Review do lote volta 2 e do B11a com o tech-lead.
- 2026-10-15 23:30 — 011: lote volta 2 aprovado; B11a com 3 ajustes bloqueantes. Tech-lead integra o K-085 e faz a limpeza de branches que o usuário pediu.
- 2026-10-16 00:00 — K-095: a causa é de ambiente (falta de CONNECT, já corrigida, e senha local diferente do .env, que é ação do usuário). Doc em be8a665.
- 2026-10-16 — Decisão do usuário: **corrigir SNO-001 e SNO-005 antes de liberar a Sustentação (C)**. SNO-001 com o react-frontend agora; SNO-005 com o node-backend depois do B11a-ajustes. Depois: review, QA, PR.
- 2026-10-16 — O usuário fechou as 10 decisões pendentes: SNO=C, O20=A, T10=A, O19=B, O25b=B, Q-a/Q-b/Q-E7-1 conforme sugestão, R-1=B, R-2=B, dados antigos=A, P4=A.
- 2026-10-16 14:30 — Pedido do usuário: liberar o PC por 30 min. Os processos de teste em andamento (o pronto do -sust, que segura o lock pesado) foram pausados com SIGSTOP e voltam com SIGCONT às 15:00, por job em segundo plano. Os outros trabalhos pesados esperam o lock. Nenhum agente novo nesse intervalo.
- 2026-10-16 16:30 — Sustentação: volta 6 do review reprovada pelo V6-1 (risco de a API não subir se o aquecimento passar de 10 s). K-098 aberto (recarga depois da coleta).
- 2026-10-16 17:00 — K-096 (coluna usuario removida, 18197f4) e K-097 (levantamento: as stg_ estão com 0 registros em dev e homolog local, nenhum dado de pessoa; db63270) prontos na branch fix/desativa-usuario-transicao. Faltam o review, a segurança e o QA. O node-backend está no V6-1 da Sustentação.
- 2026-10-16 18:30 — 011: QA do B1 ao B11a aprovado (fa5bdfe, 6e0d43f; 0 bugs, 25 mutantes mortos); B11b/T11 pronto (42a8577, EXIT=0). Próximo: B12 (node-backend), depois review e QA do B11b e do B12, PR.
- 2026-10-16 20:00 — C4 do Operacional: o estouro do B12 era erro de medida (composição e carga). O 011 não regride. O architect corrige a ADR 0003 e o node-backend corrige o teste. Ata em alinhamentos/2026-10-16-c4-operacional.md.
- 2026-10-16 22:00 — K-096: review, segurança e QA reassinados no HEAD 726a309 e seguintes (0b88ede); o forge-check na branch sai limpo. Pronto para PR, que fica com o tech-lead depois do review do B11b-1.
- 2026-10-16 23:30 — K-096 e K-097 mesclados na develop (#88). No diretório principal, docs/qa/k096-k097.md e docs/security/k096-k097.md, idênticos aos da develop, bloqueiam o ff; o QA e a segurança apagam na próxima tarefa. O 011 vai precisar de merge da develop (#88) antes do PR.
- 2026-10-17 00:40 — O usuário foi dormir: quer o máximo na homolog. A homolog já tem tudo da develop (#89: Sustentação, K-084/085/095/096/097); o portão 'Homologação' passou. 'Homologação aprovada' e um 'CI' falharam: o devops diagnostica. Durante a noite: 011 (C6 com o architect, QA final), depois merge da develop, PR para a develop e promoção para a homolog.
- 2026-10-17 06:30 — Retomada na sessão do Forge 0.16.0. O #96 (release com a fase 1 do back do 011) foi mesclado na main pelo usuário em 2026-10-16. Saem do quadro, concluídos: K-072+K-073 (#87), K-078 fase 1 (#92), K-079, K-080, K-084 (#77), K-085 (#80), K-094 (#91), K-096 e K-097 (#88). Entram K-102 a K-109 (pedidos 011 e 012).
- 2026-10-17 06:45 — K-104 feito pelo architect: R-1 = B e R-2 = B na ADR 0020, e plano atualizado; sem commit. Nova pergunta ao usuário: Q-T14-10.
- 2026-10-17 06:30 — Decisão do usuário: métricas restantes do 011 por nível, em lotes separados (estratégicas → táticas → operacionais). Registrada no pedido 011.
- 2026-10-17 06:55 — K-105: worktrees -011-back e -demo removidas; branch de docs com review. K-106: homolog-aprovada verde depois do portão; perf do #101 vermelho 3x no C6 (188 a 215 ms, rotas variando), sem regressão; perf não é check exigido na main.
- 2026-10-17 07:30 — K-102: review da volta 2 aprovado (aeacff4). A conferência da entrega deu "etapa fora de ordem": os commits do autor não estão no origin, porque o brief do autor dizia "sem push". O push fica com o tech-lead no PR (pedido 018); os commits não mudam, então o review continua valendo. QA do K-102 em andamento; revisão de UX em conferência.
- 2026-10-17 07:30 — Melhoria do Forge: o prompt-padrão manda "sem push" ao autor, mas a tabela de etapas do conferente exige o commit do autor no remoto antes do review. As duas regras se contradizem.
- 2026-10-17 09:50 — #101 (homolog → main, versão 0.16.0 do Forge) mesclado pelo usuário. K-106 concluído.
- 2026-10-17 09:50 — K-103 entregue pelo node-backend (3297fda E1, 11113d0 E2; pronto rc=0, C4 diária 93→99 ms, semanal 107→115 ms). Conferência: "não cumpriu" só por motivos que não são do autor. (1) Etapa: a pré-condição R-1 = B estava no disco quando o autor conferiu, e o arquivo saiu do diretório principal depois, no commit de docs do tech-lead. (2) Escopo: `regras-metricas.md` e ajustes em testes do O23 e do T11, relatados pelo autor; vão para o review. Não volta ao autor.
- 2026-10-17 10:00 — PR de docs da retomada (#102) mesclado pelo usuário (decisão 1 = A). Diretório principal na develop f81567e. A seção 'Release #101' do parecer de devops ficou no stash@{0} (conflito com a seção do #96, que já entrou); o devops reaplica.
- 2026-10-17 10:50 — K-102: QA aprovado (36975e6; Lighthouse da semanal 0,96 a 0,99, antes 0,77 a 0,79); UX aprovada com ressalvas; review revalidado (0c4c68a) e parecer de UX commitado (06f93c0). O `forge-check` invalidou review e QA de novo por causa do commit em `docs/ux/` (melhoria do Forge registrada). Próximo: merge da develop e revalidação única do review e do QA, depois o PR (pedido 018).
- 2026-10-17 11:45 — K-103: review aprovado nas 3 branches por nível, todas com push e pronto rc=0: feature/011-fase2-estrategicas (3aeaa3d), -taticas (ace8db8) e -operacionais (aab7a46), cada uma saindo da anterior. Pendências: B11-001 (normalização do fornecedor do T10) antes do PR das táticas (cartão novo do node-backend); R2 das táticas (`REGRAS_METRICA.T14` ainda lista a Q-T14-10 como pendente); R1 das estratégicas (o E8 lê `entregas`, trocar por `temEntrega` antes da fase 3); faltam o `exports ./coletor` e o lint de import (fase 3). Próximo: segurança e QA, lote a lote.
- 2026-10-17 12:05 — K-102 mesclado na develop (#103, 48b909a), com os checks exigidos verdes; o job `perf` ficou como skipping nesse PR, então o TBT da semanal fica para o perf-homolog. Conferência: todos os PQ cumpridos; o "escopo fora" é leitura estrita do brief do PR, que não lista os arquivos da branch do K-102. Não volta ao autor.
- 2026-10-17 12:40 — K-103: segurança aprovou os 3 lotes para a fase 2 (pareceres em docs/security/011-fase2-<nível>.md, na worktree, sem commit). Nova pergunta ao usuário: T14-M1 (n − k revela os cards quando os outros times somam uma pessoa), que não bloqueia a fase 2. Próximo: QA, lote 1 (estratégicas).
- 2026-10-17 — Decisão do usuário: T14-M1 = B (fatia do meu time sem o total exato quando 'outros times' está oculto). Registrada no pedido 011; ajuste entra junto com o K-112, antes da fase 3.
- 2026-10-17 — Lote 1 do back da fase 2 (E6, E7 com R$, E8) mesclado na develop (#105, 1607a5f), com os checks verdes; o #104 foi fechado sem merge. A branch das táticas precisa trazer a develop (squash) antes do B11-001, do review e do QA (pedido 022).
- 2026-10-17 — Decisão do usuário: D2 = A, o E7 sem R$, com participação percentual por entregas (revê a D-1' e a Q-E7-1). O Jarvis recusou e sinalizou o uso de horas apontadas (regra 7.1). Pedido 024 e cartão K-114.
- 2026-10-17 — K-109: front do lote 1 (E9, E6, E7 sem R$, E8) pronto em 919554b (pronto rc=0, C6 do /estrategico mediana 181 ms, Lighthouse 0,99, E2E verdes). Próximo: review do tech-lead e revisão de UX em paralelo, depois QA.
- 2026-10-17 20:45 — E3.2 (UX): especificação do 011 alinhada às decisões (E8 sem lista, E7 sem custo, T14-M1 = B, O20/O19/O25/T10/B11-001 com CA próprio, §11 de rastreio) e protótipo ajustado; sem commit, na worktree do front. Grep do custo na especificação: 0. Nova pergunta para a manhã: ordem da T14.
- 2026-10-17 21:30 — K-109: volta 2 do review do front do lote 1 aprovada (ae3ea92); docs de UX commitados (ccb9443). Próximo: reconferência da UX, depois QA.
- 2026-10-17 23:40 — K-103 lote 2 (táticas): QA aprovado (a1c0ee0 teste da P6 com equipe no filtro, B-1 da segurança; parecer 0d9f296; pronto rc=0). O teste novo desatualizou o review: rodada 5 do tech-lead antes do PR (pedido 022).
- 2026-10-17 23:55 — K-109: PR #106 aberto, check e2e vermelho determinístico (SIS-CONS-01 espera 49 linhas no catálogo, recebe 53 com E6–E9). Retrabalho: volta ao react-frontend para atualizar a contagem; depois revalidar review e QA e mesclar (pedido 028). Causa: review e QA rodaram só o spec do lote.
- 2026-10-18 00:30 — K-109: contagem do catálogo corrigida (59dfb37), review volta 5 aprovada (3d2ee5b); QA revalida com a suíte E2E completa. K-103 lote 2: QA conferido (cumpriu), PR das táticas com o tech-lead (pedido 022).
- 2026-10-18 01:20 — K-109: QA revalidou com a suíte E2E completa (704 ok, 1 falha): bug baixo 011F-002, IF-I01 estoura 30 s localmente, pré-existente (CI verde). Decisão técnica: orçamento de tempo próprio no teste (pedido 021); volta ao react-frontend.
- 2026-10-18 02:10 — K-109: IF-I01 com orçamento próprio (357936b). Outros testes instáveis só sob carga local → K-115 (Pronto para fazer). Prova da suíte completa: CI do PR #106. Próximo: review volta 6 e QA.
- 2026-10-18 03:00 — K-103 lote 2 (táticas): PR #107 mesclado na develop (squash 8516ff8), checks verdes, branch apagada. Próximo: lote 3 (operacionais).
- 2026-10-18 04:30 — K-109: QA fechado (4f9f229, 011F-002 fechado); #106 aberto antes dos pareceres finais → refazer o PR (fora de ordem). K-103 lote 3: operacionais refeitas sobre a develop em feature/011-fase2-operacionais-v2 (3d234aa), review rodada 2 aprovado, pronto rc=0. Próximo: segurança, QA, PR (pedido 023).
- 2026-10-18 05:10 — K-103 lote 3: segurança revalidada sobre d5b02d8 (b99ee1f), aprovada. Próximo: QA.
- 2026-10-18 05:40 — K-114 (pedido 024): E7 sem R$ + contratos E8/E9 (janela) e E6 (concluidoEm) com o node-backend, worktree -024. Pedido 024 corrigido: E3 e E4 estavam por engano em Fora do escopo.
- 2026-10-17 — K-114: review rodada 1 reprovou só documentação; node-backend corrigiu A-1 a A-4 e A-6 (8913d54, conferido); A-5 com o arquiteto.
- 2026-10-17 — K-109: #106 fechado (fora de ordem), #108 aberto e verde, mas BEHIND (a develop exige branch atualizada). Ordem: #109 → atualizar #108 e revalidar → #108 → 024.
- 2026-10-17 — K-103: lote 3 (operacionais) mesclado na develop (#109, 5ad02ea); branches apagadas. Os 3 lotes do back da fase 2 estão na develop.
- 2026-10-17 — Usuário: "Depois que você acabar o que está em andamento não comece mais nada quero atualizar a versão da forge". Em andamento: QA do #108 (revalidação) e conferência do brief do merge do #108. Nada novo é delegado depois disso; o merge do #108, o 024 e a promoção esperam a atualização do Forge.
- 2026-10-17 — K-109: QA revalidado sobre 65f46c1 (e850788), aprovado, forge-check limpo. Pausa: nada novo até a atualização do Forge.
- 2026-10-17 (antes de 08:27) — Retomada na sessão do Forge 0.19.0 (PR #113 do usuário, aberto). Teto de dia: 2 agentes. Próximo: merge do #108 (pedido 028, brief 4 em conferência), depois o 024 e a promoção para a homolog (pedido 023).
- 2026-10-17 (antes de 08:27; hora antes estimada, corrigida) — K-109: brief 4 do merge do #108 aprovado pelo conferente, com aviso: a UX não foi reconferida sobre o commit final (075a5a8 e 65fcd72 vieram depois da seção 9). Etapa E1.2 acrescentada ao pedido 028; ux-designer reconfere o delta. O merge espera o veredito.
- 2026-10-17 (antes de 08:27; hora antes estimada, corrigida) — K-109: UX reconferiu o delta do #108 sobre e850788 e aprovou (seção 10, sem commit; ressalvas baixas: "Demais 1 sistema" e teste manual com leitor de tela). Brief 5 do merge (commit da UX, CI, merge) em conferência.
- 2026-10-17 (antes de 08:27; hora antes estimada, corrigida) — K-109: brief 5 aprovado pelo conferente (sha256 b5490b9c688c1ddeb6bc955fa505851141cf09f85c9e8d5f0cacfabaad3013f0, base-sha 5ad02ea4e927c5d6799b5fc7f71e6a37cc39fd92); tech-lead commita a UX, espera a CI e mescla o #108.
| 2026-10-17T08:26:56-03:00 | K-084 | Entrada | Pronto | limpeza: mesclado no #77 (0fe209a), cartão esquecido na Entrada |
| 2026-10-17T08:26:56-03:00 | K-085 | Entrada | Pronto | limpeza: mesclado no #80 (f9d1079), cartão esquecido na Entrada |
| 2026-10-17T08:26:56-03:00 | K-109 | Entrada | Em andamento | merge do #108 com o tech-lead (pedido 028, brief 5) |
| 2026-10-17T08:29:45-03:00 | K-109 | Em andamento | Code review | forge-check pr invalidou review e QA pelo commit de docs da UX (b13dfe6); volta 8 do review |
- 2026-10-17 08:30 — K-109: entrega do brief 5 conferida: não cumpriu (PQ-1 b13dfe6 ok; merge parado pelo forge-check, review e QA desatualizados pelo commit da UX), igual ao bloco Provas. Brief 6 (volta 8 do review) em conferência.
- 2026-10-17 08:35 — K-109: volta 8 do review aprovada (3d48780, cb68ace; 2 commits, o segundo para registrar a autoria pela ferramenta Edit). Sobra só o QA desatualizado. Entrega da volta 8 e brief do QA em conferência.
- 2026-10-17 08:36 — K-109: entrega da volta 8 conferida: PQs cumpridos; escopo fora só pelo diff acumulado da branch (falso positivo, aceito e registrado no pedido 028 e em melhorias). QA revalidando (espera a CI do cb68ace).
| 2026-10-17T08:36:17-03:00 | K-109 | Code review | QA | volta 8 aprovada (cb68ace); QA revalida sobre a CI do PR |
- 2026-10-17 09:07 — K-109: QA revalidou sobre cb68ace (8555520, be2a342; run 39029217011 success); forge-check pr sem pendência. Entrega do QA em conferência; brief 7 do merge pronto.
- 2026-10-17 09:10 — K-109: entrega do QA conferida: cumpriu (ressalvas: delta tinha o próprio parecer anterior do QA, relatado; segundo commit docs(qa) só de autoria). Bate com o bloco Provas. CI do be2a342 em andamento; brief 7 do merge em conferência.
| 2026-10-17T09:45:33-03:00 | K-109 | QA | Pronto | #108 mesclado na develop (d83024b), branch e worktree apagadas |
- 2026-10-17 09:45 — K-109: #108 mesclado na develop (d83024b) pelo tech-lead; branch e worktree apagadas. testes do push falhou uma vez no montecarlo.test.ts (semente 1324607460) e passou ao rerrodar: registrado no K-107. Entrega do merge em conferência. Próximo: pedido 024 (E1.5, tech-lead).
- 2026-10-17 09:46 — K-109: entrega do merge do #108 conferida: cumpriu (PQ-1 a PQ-3), igual ao bloco Provas. Pedido 028 concluído. Brief E1.5 do pedido 024 (tech-lead: commit A-5 e merge da develop) em conferência.
- 2026-10-17 09:50 — K-114: entrega do E1.5 conferida: não cumpriu (PQ-2, merge abortado por conflito em contrato e teste, como o brief manda), igual ao bloco Provas; segue pelo E1.6 (node-backend), brief em conferência. Usuário pediu as pendências uma a uma: começo pelo nome do E7.
- 2026-10-17 09:51 — Decisão do usuário: E7 = "Entregas por sistema" (A). Entra no pedido 024 como E5 (E5.1 node-backend, E5.2 ux-designer, testes no E1.4).
- 2026-10-17 — Usuário pulou a pendência 2 (PR #113, registro do Forge 0.19.0): fica aberta; a promoção para a homolog sai sem o registro, se ele não mesclar antes.
| 2026-10-17T09:52:22-03:00 | K-105 | Em andamento | Pronto | worktree -qa já removida (conferido em 2026-10-17) |
- 2026-10-17 09:55 — K-114: merge da develop no 024 feito (d4c0821, 5 conflitos resolvidos, testes de pacote verdes), push barrado pelo teste do front (E1.4). Conferido; aceito. Próximo: E5.1 (node-backend, nome do E7), depois E1.4 (react-frontend, teste e push).
- 2026-10-17 09:56 — Pendência 3 (melhorias do Forge paradas): o usuário pediu um prompt para repassar à fábrica; prompt gerado com os itens de docs/kanban/melhorias.md e as 3 branches de ~/.forge-contrib. K-077 segue com o usuário.
- 2026-10-17 09:58 — K-114: E5.1 feito (de018c6, nome do E7 no back e na doc técnica, testes de pacote verdes), conferido e aceito (escopo acumulado é falso positivo). Brief do E1.4 (react-frontend) em conferência; brief do E5.2 (UX) pronto.
| 2026-10-17T09:59:09-03:00 | K-077 | Em andamento | Pronto | repassada à fábrica pelo usuário (prompt de melhorias, item A4) |
| 2026-10-17T09:59:09-03:00 | K-081 | Entrada | Pronto | obsoleto: substituído pelo registro da 0.19.0 (PR #113) |
- 2026-10-17 09:59 — Usuário repassou as melhorias à fábrica: K-077 sai para Pronto. K-081 fechado como obsoleto (PR #113). K-093 corrigido no quadro: decisão SNO = C de 2026-10-16. Pendência do usuário que resta: PR #113 (pulada antes).
- 2026-10-17 10:04 — K-114: E1.4 feito (97ddd0b, teste do E7 sem custoConfigurado, nome no catálogo; web 1076 testes ok; branch enviada). E5.2 feito pela UX (3 arquivos em docs/ux, sem commit). Entrega do E1.4 e brief da rodada 2 do review em conferência.
| 2026-10-17T10:09:24-03:00 | K-114 | Em andamento | Code review | rodada 2 do review com o tech-lead (brief 3 aprovado, sha256 849f0815) |
- 2026-10-17 10:09 — K-114: brief da rodada 2 do review aprovado (3 rodadas de conferência; contradição do conferente registrada em melhorias). Review com o tech-lead (opus).
- 2026-10-17 10:15 — K-114: rodada 2 do review reprovada só pelo A-7 (texto do E8 com o nome antigo do E7 na tela); A-8 e A-9 recomendados. UX commitada antes do parecer (092d0d1), parecer 191015e. Entrega conferida: bate com o bloco Provas. Ajustes voltam ao react-frontend (A-7) e ao node-backend (A-8, A-9), em sequência.
- 2026-10-17 10:23 — K-114: A-7 corrigido (19accc9, 83c5f49; web 1077 testes). Tentativa de push forçado barrada pelo hook (registrada). Próximo: node-backend A-8/A-9, em paralelo com a conferência da entrega do A-7 (faixa fixa 191015e..83c5f49).
- 2026-10-17 10:24 — K-114: entrega do A-7 conferida: cumpriu (191015e..83c5f49, sem reescrita no remoto). Node-backend no A-8/A-9.
- 2026-10-17 10:27 — K-114: A-8/A-9 feitos (d0fcb7b), conferidos: cumpriu. Rodada 3 do review com o tech-lead.
- 2026-10-17 10:30 — K-114: rodada 3 do review aprovada (052d9a8, 928dba1; commit revisado d0fcb7b). Próximo: QA (brief em conferência).
- 2026-10-17 10:31 — K-114: entrega da rodada 3 do review conferida: cumpriu. Aguardando a conferência do brief do QA.
| 2026-10-17T10:32:22-03:00 | K-114 | Code review | QA | rodada 3 do review aprovada (928dba1); QA com a CI do push |
- 2026-10-17 10:33 — K-114: QA parou em 3 lacunas de teste (G1 a G3), sem bugs. Decisão técnica: o QA escreve os testes (E1.7), rodada 4 do review só neles (E1.8), depois o parecer.
- 2026-10-17 10:41 — K-114: testes G1 a G3 feitos pelo QA (8a4a5a7; metricas 1082, contratos 161, web 1078). Entrega em conferência; brief da rodada 4 pronto.
- 2026-10-17 10:42 — K-114: entrega dos testes G1 a G3 conferida: cumpriu. Aguardando a conferência do brief da rodada 4.
- 2026-10-17 10:46 — K-114: rodada 4 do review aprovada (3daf896, 4fb04ad; commit revisado 8a4a5a7). Entrega em conferência; brief do parecer do QA pronto.
- 2026-10-17 10:47 — K-114: entrega da rodada 4 conferida: cumpriu. QA esperando a CI para o parecer final.
- 2026-10-17 10:54 — K-114: CI do 4fb04ad vermelha (format:check em e8.test.ts, bug 024-001). Correção pelo QA (E1.9), rodada 5 do review (E1.10), depois o parecer.
- 2026-10-17 11:00 — K-114: formatação corrigida (b390b0c; format:check e lint verdes; 1082 testes). Entrega em conferência; brief da rodada 5 pronto.
- 2026-10-17 — K-114: entrega do E1.9 (b390b0c) conferida: PQ-1 e PQ-4 cumpridos, escopo ok no intervalo 4fb04ad..b390b0c; "escopo: fora" só pelo diff acumulado (aceito). Word-diff confirma só formatação; o registro do bug diz "git diff -w vazio", o que é impreciso (fica como ressalva baixa para o QA no parecer). Brief da rodada 5 corrigido (registro do bug citado no E1.9; word-diff no lugar de -w).
- 2026-10-17 11:06 — K-114: rodada 5 do review aprovada (781e171, commit revisado b390b0c). Entrega em conferência; QA esperando a CI do b390b0c ou posterior para o parecer final.
- 2026-10-17 11:07 — K-114: entrega da rodada 5 conferida: cumpriu.
- 2026-10-17 11:20 — K-114: QA aprovado (4dff3a2, e240673; run 39039285614 success; e2e só roda no PR). Ressalva baixa R-1 pede aceite do usuário; o QA marcou aceite_usuario: sim sem o aceite (erro, apontado ao usuário). Entrega em conferência.
- 2026-10-17 11:21 — Decisão do usuário: aceita a R-1 do QA do 024 (A). Próximo: PR do 024 (pedido 029, tech-lead), depois da conferência da entrega do QA.
- 2026-10-17 11:21 — K-114: entrega do parecer do QA conferida: cumpriu (achado do aceite resolvido pela decisão do usuário). Brief do PR (pedido 029) em conferência.
| 2026-10-17T12:45:29-03:00 | K-114 | QA | Pronto | #114 mesclado na develop (ed6ba46), branch e worktree apagadas |
- 2026-10-17 12:45 — K-114: #114 mesclado na develop (ed6ba46). Entrega em conferência. Próximo: promoção develop → homolog (pedido 023), brief em preparo.
- 2026-10-17 12:46 — K-114: entrega do #114 conferida; dois falsos positivos (escopo acumulado e forge-check pós-merge), entrega aceita e registrada no pedido 029. Pedido 029 concluído.
- 2026-10-17 12:48 — Pedido 023: conferente reprovou duas vezes o brief da promoção (pede parecer próprio, que a R-FLUXO não exige). Decisão técnica registrada no pedido 023, com base no CLAUDE.md, na R-FLUXO e no precedente; brief volta para confirmação.
- 2026-10-17 12:51 — Decisão do usuário: "A regra do projeto nunca passa sobre a fábrica" → promoção com parecer próprio de review e QA (opção B). Pareceres vão por um PR só de documentação para a develop antes da promoção.
- 2026-10-17 12:54 — Pedido 023: review da promoção aprovado (2a69655), push barrado pelo pre-push (worktree sem node_modules). Tech-lead instala as dependências e reenvia.
- 2026-10-17 12:57 — Pedido 023: parecer de review da promoção enviado (2a69655, branch docs/023-pareceres-promocao; pnpm install na worktree, pre-push verde). Entrega em conferência; QA gravando o parecer da promoção.
- 2026-10-17 12:58 — Pedido 023: entrega do review da promoção conferida: cumpriu. Brief do PR de documentação dos pareceres (E1.5) pronto.
- 2026-10-17 12:59 — Pedido 023: parecer de QA da promoção aprovado (4284b36; CI da develop em ed6ba46 success, run 39046337856; R-1 do 024 com aceite do dono). Entrega e brief do PR dos pareceres em conferência.
- 2026-10-17 13:00 — Pedido 023: entrega do QA conferida (PQs ok); o forge-check acusa falta de registro de autoria do parecer de review (tech-lead), que bloqueia o PR. Brief do E1.5 corrigido: o tech-lead regrava o parecer pela ferramenta Edit antes do PR.
- 2026-10-17 14:03 — Pedido 023: PR #115 (pareceres da promoção) mesclado na develop (0cad9f3). Brief da promoção atualizado para 0cad9f3 e para a opção B; vai à conferência junto com a entrega do #115.
- 2026-10-17 14:04 — Pedido 023: brief da promoção aprovado na 4ª rodada (com a opção B). Tech-lead abre o PR develop → homolog e acompanha o portão.
- 2026-10-17 14:05 — Pedido 023: entrega do #115 conferida: cumpriu. Worktree -023 limpa; a remoção fica com o tech-lead depois da promoção.
- 2026-10-17 15:17 — Pedido 030 aberto: PRs do Dependabot (#110 a #112) abertos contra a main por falta de target-branch no dependabot.yml. Troca de base pelo tech-lead e configuração pelo devops, pelo fluxo normal.
- 2026-10-17 15:19 — Pedido 030: os 3 PRs do Dependabot agora apontam para a develop (nenhum PR aberto contra a main). Entrega em conferência; brief do devops (dependabot.yml) pronto.
- 2026-10-17 15:20 — Pedido 030: entrega do E1.1 conferida; estado correto, reprovação só de forma (aceita e registrada). Brief do devops vai à conferência.
- 2026-10-17 15:22 — HOMOLOG: #116 mesclado (087a220), portão verde (run 39056114632). Leva #102, #103, #105, #107, #108, #109, #114 e #115. Entrega em conferência; próximo: PR de release homolog → main pronto para o dono.
- 2026-10-17 15:24 — Pedido 023: entrega da promoção conferida e aceita (falsos positivos de Base-sha e escopo). #113 mesclado pelo dono na develop; fica para a próxima promoção. Brief do PR de release homolog → main vai à conferência.
- 2026-10-17 15:25 — Pedido 030: feature/030-dependabot-develop enviada (523372c: target-branch develop + parecer de devops). Entrega em conferência; próximo: parecer de segurança.
- 2026-10-17 15:26 — Pedido 031 aberto (develop com o que está pronto, limpeza de branches, nova promoção e PR para a main). Brief 8 do 023 (release) substituído. Pedido 030: entrega do devops conferida.
- 2026-10-17 15:27 — Pedido 031: dono escolheu A (tag de arquivo e apagar), só depois de conferir que o conteúdo das seis branches já está na develop.
| 2026-10-20T21:20:07-03:00 | K-116 | Entrada | Em andamento | pedido 035, E3.1 |
| 2026-10-20T21:20:07-03:00 | K-117 | Entrada | Pronto para fazer | pedido 035, E4, depois do K-116 |
| 2026-10-20T21:30:53-03:00 | K-091 | Entrada | Em andamento | pedido 036, E2 |
| 2026-10-20T21:30:53-03:00 | K-118 | Entrada | Em andamento | pedido 036, E1 |
| 2026-10-20T21:30:53-03:00 | K-103 | Em andamento | Pronto | 3 lotes na main; quadro estava desatualizado |
| 2026-10-20T21:31:18-03:00 | K-091 | Em andamento | Pronto para fazer | R-WIP: mesmo agente do K-118, entra depois |
| 2026-10-20T21:34:41-03:00 | K-118 | Em andamento | Bloqueado | Aguardando o dono: libs de sistema do Chromium (libnspr4.so), precisa de sudo |
| 2026-10-20T21:39:22-03:00 | K-119 | Entrada | Em andamento | pedido 036, E3.2 |
| 2026-10-20T21:51:40-03:00 | K-118 | Bloqueado | Em andamento | dono instalou as libs do Chromium; reteste delegado |
| 2026-10-20T21:58:26-03:00 | K-120 | Entrada | Pronto para fazer | melhoria vista (QA, pedido 036) |
| 2026-10-20T21:59:27-03:00 | K-118 | Em andamento | Pronto | FA-006 não reproduz (f3a2995) |
| 2026-10-20T21:59:27-03:00 | K-091 | Pronto para fazer | Em andamento | pedido 036, E2.1 |
| 2026-10-20T22:09:48-03:00 | K-119 | Em andamento | Code review | pedido 036, E1.3 |
| 2026-10-20T22:09:48-03:00 | K-091 | Em andamento | Code review | pedido 036, E1.3 |
| 2026-10-20T22:20:52-03:00 | K-116 | Em andamento | Pronto | #132 mesclado (bbbc70c) |
| 2026-10-20T22:22:46-03:00 | K-121 | Entrada | Pronto para fazer | melhoria vista (review 036) |
| 2026-10-20T22:24:40-03:00 | K-119 | Code review | QA | review aprovado (fc9ecf2) |
| 2026-10-20T22:24:40-03:00 | K-091 | Code review | QA | review aprovado (fc9ecf2) |
| 2026-10-20T22:33:09-03:00 | K-113 | Entrada | Em andamento | pedido 037, E1.5 (#131) |
| 2026-10-20T22:55:03-03:00 | K-113 | Em andamento | Em andamento | E2.2 delegado ao react-frontend (Worker da ADR 0021), S0 conferida eeb59fa |
| 2026-10-20T23:11:40-03:00 | K-110 | Entrada | Pronto para fazer | recibo do pedido 025 aceito (sim) |
| 2026-10-20T23:13:58-03:00 | K-110 | Pronto para fazer | Em andamento | E1.1 delegado ao react-frontend (2ª instância), worktree MetricasDSPD-025 |
| 2026-10-20T23:16:34-03:00 | K-091 | QA | Pronto | #133 na develop (568ea48) |
| 2026-10-20T23:16:34-03:00 | K-119 | QA | Pronto | #133 na develop (568ea48) |
| 2026-10-20T23:35:35-03:00 | K-113 | Em andamento | Em andamento | E2.2 relançado após interrupção por limite de uso (trabalho parcial sem commit na -037) |
| 2026-10-20T23:35:35-03:00 | K-110 | Em andamento | Em andamento | E1.1 relançado após interrupção por limite de uso (trabalho parcial sem commit na -025) |
| 2026-10-21T10:03:25-03:00 | K-122 | Entrada | Em andamento | pedido 038 aberto; E1.1 ao tech-lead |
| 2026-10-21T10:03:25-03:00 | K-113 | Em andamento | Em andamento | retomada em 2026-10-21 (sessão Forge 0.27.0) |
| 2026-10-21T10:03:25-03:00 | K-110 | Em andamento | Em andamento | retomada em 2026-10-21 (sessão Forge 0.27.0) |
| 2026-10-21T10:11:08-03:00 | K-122 | Em andamento | Aguardando o dono | hook: so o dono altera .forge/versao |
| 2026-10-21T11:56:52-03:00 | K-122 | Aguardando o dono | Pronto | dono mesclou o 134 na develop (794b982); falta limpeza da branch |
| 2026-10-21T13:10:44-03:00 | K-123 | — | Entrada | melhoria vista no E2.2 do 037 |
| 2026-10-21T13:12:49-03:00 | K-124 | Entrada | Em andamento | pedido 039 aberto |
| 2026-10-21T13:21:15-03:00 | K-124 | Em andamento | Pronto | limpeza feita; 2 branches do 011 mantidas (K-125) |
| 2026-10-21T13:21:15-03:00 | K-125 | — | Entrada | decisão A do pedido 039 |
| 2026-10-21T13:39:53-03:00 | K-113 | Em andamento | Code review | E2.2 conferida 0bde5eb; E2.3 QA e review em paralelo |
| 2026-10-21T14:04:05-03:00 | K-110 | Em andamento | Code review | E1.1 conferida 32a509f; review e segurança em paralelo |
| 2026-10-21T14:06:32-03:00 | K-126 | — | Entrada | achados recomendados A1/A2 do review 037 |
| 2026-10-21T14:06:32-03:00 | K-127 | — | Entrada | achados recomendados A3/A4 do review 037 |
| 2026-10-21T14:16:48-03:00 | K-128 | — | Entrada | review 025 A1 |
| 2026-10-21T14:16:48-03:00 | K-129 | — | Entrada | review 025 A2 |
| 2026-10-21T14:16:48-03:00 | K-130 | — | Entrada | segurança 025: API da T14 |
| 2026-10-21T14:18:04-03:00 | K-110 | Code review | QA | review e segurança aprovados e conferidos (b6c7673); QA espera o QA do 037 |
| 2026-10-21T16:14:57-03:00 | K-131 | — | Entrada | D1 do QA 037 |
| 2026-10-21T16:14:57-03:00 | K-132 | — | Entrada | D2 do QA 037 |
| 2026-10-21T18:40:12-03:00 | K-133 | — | Entrada | L2T-003, decisão A do dono |
| 2026-10-21T20:07:14-03:00 | K-134 | — | Entrada | melhoria vista QA 025 |
| 2026-10-21T20:07:14-03:00 | K-135 | — | Entrada | melhoria vista 037 |
| 2026-10-22T04:13:13-03:00 | K-110 | Em andamento | Em andamento | QA ajusta D1 no parecer (qa-5) |
| 2026-10-22T04:18:09-03:00 | K-113 | Em andamento | Em andamento | E2.4b: tech-lead corrige review, PR novo e merge na develop |
| 2026-10-22T04:23:07-03:00 | K-110 | Em andamento | Em andamento | E1.3 incremental e E1.7: tech-lead review, PR e merge na develop |

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

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

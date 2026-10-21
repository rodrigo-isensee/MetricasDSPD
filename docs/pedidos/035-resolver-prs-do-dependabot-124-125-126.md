# Pedido 035 — Resolver os PRs do Dependabot #124, #125 e #126

- **Data:** 2026-10-20
- **Origem:** usuário: "estou com tres prs o 124,125 e 126 com problemas reoslva".
- **Modo:** implementar.
- **Clareza:** alta; recibo aceito e ampliado pelo dono.

## Diagnóstico (2026-10-20)
- #124 (actions, 2 atualizações, base develop): sem conflito; BLOCKED por checks ainda rodando e pela falta de review, segurança e QA.
- #126 (produção, 2 atualizações, base develop): sem conflito; BLOCKED pelo mesmo motivo.
- #125 (dev-dependencies, 8 atualizações, base develop): sem conflito, mas `build`, `rapida` e `testes` falham: traz eslint 10 (com @eslint/js 10) e TypeScript 7, versões maiores que o dono mandou separar (pedido 033, decisão B).

## Escopo
- E1. #125: pedir ao Dependabot que ignore as versões maiores de `typescript`, `eslint` e `@eslint/js` (comentários `@dependabot ignore <dependência> major version`), para o grupo ficar só com as cinco correções listadas na decisão B do pedido 033; os majors seguem como cartões próprios. · `confirmado` (decisão B do pedido 033)
- E2. #124, #125 (depois do E1) e #126: pareceres de segurança, review e QA, gravados numa branch de documentação saída da develop (sem editar as branches do Dependabot), e merge por squash na develop com os checks verdes. · `confirmado`

- E3. Levar à develop a documentação pendente do Jarvis (branch `docs/jarvis-2026-10-17-tarde`, commit 1e6e52a, e os arquivos do pedido 034 e deste pedido), por PR só de documentação. · `confirmado`
- E4. Promover a develop para a homolog (merge commit, portão verde, com parecer próprio de review e de QA da promoção, decisão do dono do pedido 023) e abrir o PR de release homolog → main, sem mesclar: o dono mescla. · `confirmado`

## Etapas
- E1.1 (forge:tech-lead): comentários `@dependabot ignore` no #125 e conferir que o grupo foi refeito só com as cinco correções.
- E1.2 (forge:tech-lead): no #129 (que substituiu o #125), `@dependabot ignore` para o TypeScript 6 e, se preciso, `@dependabot recreate`, até o grupo ficar sem versão maior (decisão do dono de 2026-10-21, opção A).
- E2.1 (forge:security-engineer): parecer de segurança dos três PRs.
- E2.2 (forge:tech-lead): review dos três PRs.
- E2.3 (forge:qa-engineer): QA dos três PRs.
- E2.4 (forge:tech-lead): PR de documentação com os pareceres e merge dos três PRs na develop.
- E3.1 (forge:tech-lead): PR só de documentação do Jarvis para a develop, mesclado.
- E4.1 (forge:tech-lead): parecer de review da promoção, promoção develop → homolog e PR de release aberto.
- E4.2 (forge:qa-engineer): parecer de QA da promoção.
- E4.3 (dono): validar e mesclar o PR de release na `main`.

## Decisões do usuário
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios). A contagem "6" foi corrigida pelo dono em 2026-10-20 (opção A, abaixo): são 5.
- 2026-10-20 — DECISÃO DO DONO: opção A (entram as 5 correções da lista: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10, @eslint/js 10 e TypeScript 7 ficam de fora, como cartões próprios).
- 2026-10-21 — DECISÃO DO DONO: opção A (no #129, tirar o TypeScript 6, versão maior, com o mesmo tratamento do 7; aceitar jsdom 30.1.3 e @axe-core/playwright 4.14.0).
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- 2026-10-17 — DECISÃO DO DONO (pedido 023): "A regra do projeto nunca passa sobre a fábrica". Para esta promoção vale a tabela de etapas da fábrica: opção B (parecer de review e de QA próprios da promoção antes do PR develop → homolog). A decisão técnica anterior deste pedido (promoção sem parecer próprio) fica revogada.

## Fora do escopo
- eslint 10, @eslint/js 10, TypeScript 7 e react-router 8 (cartões próprios, decisões do dono no pedido 033); mexer na `main` (R-MAIN); o PR #127 (Forge 0.26, do dono).

## Andamento
- 2026-10-20 — Recibo ao usuário: vou fazer: no #125, mandar o Dependabot ignorar as versões maiores (eslint 10 e TypeScript 7) para ele ficar só com as 6 correções; depois, segurança, review e QA dos três PRs e merge na develop; não vou fazer: entrar com eslint 10, TypeScript 7 nem nada na main.
- 2026-10-20 — Usuário: "isso suba tudo que tem para develop depois para homlog para dai eu subir para main". Recibo aceito.
- ESCOPO+: 2026-10-20 — Entram E3 (documentação pendente do Jarvis na develop) e E4 (promoção develop → homolog e PR de release aberto para o dono), pelo pedido do dono. O #127 (Forge 0.26) segue com o dono; se for mesclado antes da promoção, entra nela.
- 2026-10-20 — Usuário: "depois de reoslver isso dai continue a listagem de pendencias que tem": ao fim deste pedido, o Jarvis retoma as pendências uma a uma.
- NAO-ENTENDI: 2026-10-20 — A decisão B do pedido 033 diz "só as 6 correções", mas lista cinco pacotes (vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test); das 8 atualizações do grupo, saem as 3 versões maiores e sobram 5. Erro de contagem do Jarvis no texto da pergunta; vale a lista. Achado do conferente no brief 1.
- PERGUNTA: 2026-10-20 — Confirmar que a decisão B do pedido 033 vale pela lista: entram as cinco correções (vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test), e não seis. O conferente pediu a confirmação do dono, por ser regra decidida por ele.
- 2026-10-20 — DECISÃO DO DONO: opção A (entram as 5 correções da lista: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10, @eslint/js 10 e TypeScript 7 ficam de fora, como cartões próprios).
- 2026-10-20 — O dono mesclou na develop, à mão: #127 (Forge 0.26, 23:44Z), #126 (produção, 23:54Z) e #124 (actions, 23:55Z). A develop está no Forge 0.26.0. Os #124 e #126 entraram sem os pareceres de segurança, review e QA do E2 (ato do dono; a CI da develop é a prova). Resta o #125 (E1 e E2). Usuário: "eu consegui subir alguams manualmente tenho so a 125 la agora".
- 2026-10-21 — O Dependabot aceitou os três "ignore" (23:56Z), fechou o #125 às 23:59Z ("updatable in another way") e abriu o #129 às 00:00Z, com 8 atualizações: as 5 da lista (coverage-v8 e vitest agora 5.0.5) mais jsdom 30.1.3 (correção), @axe-core/playwright 4.14.0 (menor) e TypeScript 6.0.3 (versão maior: o "ignore" pegou só a 7.x). O dono abriu o #128 (develop → homolog) às 23:59Z.
- PERGUNTA: 2026-10-21 — No #129: A tirar o TypeScript 6 (versão maior, mesmo tratamento do 7) e aceitar jsdom 30.1.3 e @axe-core/playwright 4.14.0 (correção e versão menor); B tirar os três que não estavam na lista; C aceitar como está. Recomendação: A.
- 2026-10-21 — DECISÃO DO DONO: opção A (no #129, tirar o TypeScript 6, versão maior, com o mesmo tratamento do 7; aceitar jsdom 30.1.3 e @axe-core/playwright 4.14.0).
- 2026-10-21 — E1.2: `ignore typescript major version` no #129 (00:04Z, aceito para 6.x) e `@dependabot recreate` (00:07Z); o Dependabot fechou o #129 e abriu o #130 (00:08Z, base develop) com 7 atualizações, sem versão maior: @vitest/coverage-v8 5.0.5, typescript-eslint 8.71.2, vitest 5.0.5, @testing-library/user-event 14.6.8, jsdom 30.1.3, @axe-core/playwright 4.14.0, @playwright/test 1.64.1. O E2 passa a valer para o #130 (o #124 e o #126 já foram mesclados pelo dono).
- 2026-10-21 — E2.1: parecer de segurança do #130 aprovado, sem achados (`docs/security/035-dependabot-130.md`, sem commit): só devDependencies; dois transitivos subiram de versão maior (`obug` 3.0.0, `@asamuzakjp/dom-selector` 10.0.4), risco de compatibilidade para o QA; lacuna: sem `pnpm audit`, recomenda a varredura da CI verde antes do merge.
- 2026-10-20 — Brief do review do #130 (`docs/briefs/035-resolver-prs-do-dependabot-124-125-126-tech-lead-3.md`, sha256 2dffa13fb20ff74a5684f7bad3530774886d4844dc5bc8dedd644c74b190973e) aprovado pelo conferente na rodada 3, ainda não delegado. A sessão rodava o Forge 0.19 (plugin carregado antes da instalação da 0.26); o dono vai reabrir a sessão. Retomada: delegar esse brief ao forge:tech-lead (E2.2), depois QA (E2.3), PR de documentação com pareceres e docs do Jarvis (E2.4 e E3.1), merge do #130, promoção (E4).
- 2026-10-20 — Sessão reaberta no Forge 0.26.0 (plugin de usuário e de projeto em 0.26.0, `forge-check` do cache 0.26.0). Usuário: "quero que voce continue o trabalho mas garantindo que todos os agentes e tudo esta rodando da versao 26". O brief 3 do tech-lead passou de novo no `forge-check brief` 0.26 (mesmo sha256).
- 2026-10-20 — O dono mesclou o #130 na develop à mão (00:19Z, 12018de). O review (E2.2, brief 3) e o QA (E2.3) do #130 antes do merge perderam o objeto e não serão delegados; o conteúdo do #130 é revisado e testado na promoção (E4.1 e E4.2). O E2 fica cumprido por ato do dono, como no #124 e no #126. Próximo: E3.1 (PR de documentação, levando também o parecer de segurança do #130), depois E4.

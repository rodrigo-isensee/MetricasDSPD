# Pedido 033 — Arquivar os PRs do Dependabot em conflito e refazer as atualizações sem conflito

- **Data:** 2026-10-17
- **Origem:** usuário: "arquive e faca de novo para nao ter conflitos" (sobre os PRs #112 e #120, em conflito com a `main`).
- **Modo:** implementar.
- **Clareza:** alta; recibo aceito e escopo decidido pelo dono (opções B e B).

## Escopo
- E1. Fechar os PRs #112 (react-router 7.18.4 → 8.4.0) e #120 (grupo dev-dependencies, 8 atualizações), guardando cada branch numa tag `arquivo/<nome>` antes de fechar. · `confirmado`
- E2. Refazer, numa branch do time saída da `develop` atual (`feature/033-deps-dev`), só as correções do #120: vitest 5.0.4, @vitest/coverage-v8 5.0.4, typescript-eslint 8.71.2, @testing-library/user-event 14.6.8 e @playwright/test 1.64.1; com segurança, review, QA e PR para a `develop` (squash). · `confirmado`

## Etapas
- E1.1 (forge:tech-lead): tags `arquivo/<nome>` e fechamento dos PRs #112 e #120.
- E2.1 (forge:node-backend): as cinco correções de dev-dependencies na `feature/033-deps-dev`, com `pnpm run pronto` verde.
- E2.2 (forge:security-engineer): parecer de segurança (dependência nova, R-SEGURANCA).
- E2.3 (forge:tech-lead): review.
- E2.4 (forge:qa-engineer): QA.
- E2.5 (forge:tech-lead): PR para a develop, mesclado.

## Fora do escopo
- Mexer na `main` (R-MAIN).
- react-router 8 (cartão próprio, decisão do dono); eslint 10 com @eslint/js 10 e TypeScript 7 (cartões próprios, decisão do dono).

## Andamento
- 2026-10-17 — Recibo ao usuário: vou fazer: fechar os PRs #112 e #120 guardando as branches em tags `arquivo/`, e refazer as mesmas atualizações em duas branches nossas a partir da develop, com review e QA, e PR para a develop; não vou fazer: mandar nada direto para a main. "arquive" lido como fechar o PR e guardar a branch em tag (outra leitura: só fechar). O #112 é versão maior do react-router (7 → 8) e pode exigir ajuste de código.
- PERGUNTA: 2026-10-17 — Confirmar o recibo; o react-router 8 entra agora ou fica para depois (só as dev-dependencies agora)?
- 2026-10-17 — DECISÃO DO DONO: opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- ESCOPO-: 2026-10-17 — O react-router 8 (#112) sai do E2 e vira cartão próprio (decisão do dono, opção B). O #112 continua sendo fechado e arquivado no E1.
- NAO-ENTENDI: 2026-10-17 — Correção do Jarvis: eu disse que as dev-dependencies eram "rápido e sem risco", mas o #120 traz duas versões maiores: eslint e @eslint/js 9 → 10, e TypeScript 5.9 → 7.0. As outras seis são correções (vitest, coverage-v8, typescript-eslint, user-event, playwright).
- PERGUNTA: 2026-10-17 — Nas dev-dependencies: A todas as 8 agora, com eslint 10 e TypeScript 7; B só as 6 correções agora, e eslint 10 e TypeScript 7 viram cartões próprios. Recomendação: B.
- 2026-10-17 — DECISÃO DO DONO: opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios).
- ESCOPO-: 2026-10-17 — eslint 10 (com @eslint/js 10) e TypeScript 7 saem do E2 e viram cartões próprios (decisão do dono, opção B).
- 2026-10-17 — Usuário: "pare os desenvolvimentos ate amanha. Quero subir uma nova versao do forge mais rapida". Nenhuma delegação nova; o E1.1 (já em andamento) termina; o E2 recomeça amanhã.
- 2026-10-17 — E1.1: #112 e #120 fechados com comentário; tags anotadas `arquivo/dependabot/npm_and_yarn/react-router-8.4.0` (12d9ea0) e `arquivo/dependabot/npm_and_yarn/dev-dependencies-9563116876` (ace9377) no origin. Os heads arquivados são os atuais, diferentes dos citados no brief (o Dependabot refez as branches depois); as branches do Dependabot ainda existiam no origin logo após o fechamento.
- 2026-10-17 — Conferência da entrega do E1.1: cumpriu (tags anotadas nos heads finais dos PRs, 12d9ea0 e ace9377; os dois fechados, nada mesclado, nenhum commit do agente). Os heads citados no brief já não existiam (o Dependabot refez as branches às 19:18Z e 19:21Z, depois da leitura do Jarvis).

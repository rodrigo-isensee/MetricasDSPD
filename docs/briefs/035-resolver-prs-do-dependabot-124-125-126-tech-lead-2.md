Agente destino: forge:tech-lead
Pedido: docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md
Branch: dependabot/npm_and_yarn/develop/dev-dependencies-68b947f138 (PR #129; ato só no GitHub)   Base: develop   Base-sha: bfe0cb6311bfafb0a40b1a8254e3bae4af09a549

## Objetivo
O Dependabot fechou o #125 e abriu o #129, que ainda traz o TypeScript 6.0.3 (versão maior: o "ignore" anterior pegou só a 7.x). Etapa E1.2 do pedido 035: tirar o TypeScript 6 do grupo, mantendo jsdom 30.1.3 e @axe-core/playwright 4.14.0 (decisão do dono de 2026-10-21, opção A). Ato só no GitHub, a partir de `/home/rodrigoisensee/MetricasDSPD`, sem worktree.

## Ler
- `docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md` (Etapas, Decisões do usuário e as últimas linhas de Andamento).

## Entregar
- (E1) Comentar no #129 `@dependabot ignore typescript major version` (`gh pr comment 129 --body '<texto>'`) e conferir a resposta do Dependabot.
- (E1) Se, depois de cerca de 3 minutos, o #129 continuar aberto com o TypeScript 6 no corpo, comentar `@dependabot recreate` no #129. Se o Dependabot fechar o #129 e abrir outro PR do grupo `dev-dependencies` contra a `develop`, acompanhar o novo (até cerca de 20 min no total, conferindo a cada poucos minutos com `gh pr list --state open` e `gh pr view <n> --json state,body,baseRefName`) e relatar o número, a base e a lista de atualizações.
- (E1) Se o Dependabot recusar, se o PR final ainda trouxer versão maior (TypeScript, eslint ou @eslint/js) ou se apontar para outra base que não a `develop`, relate e pare; você não fecha PR e não edita a branch à mão.

## Fora do escopo
- "E1.1 (forge:tech-lead): comentários `@dependabot ignore` no #125 e conferir que o grupo foi refeito só com as cinco correções." · etapa do mesmo papel em outro momento, já feita (o #125 foi fechado pelo Dependabot e substituído pelo #129).
- "E2.1 (forge:security-engineer): parecer de segurança dos três PRs.", "E2.3 (forge:qa-engineer): QA dos três PRs." e "E4.2 (forge:qa-engineer): parecer de QA da promoção." · etapas de outro papel; vêm depois.
- "E2.2 (forge:tech-lead): review dos três PRs.", "E2.4 (forge:tech-lead): PR de documentação com os pareceres e merge dos três PRs na develop.", "E3.1 (forge:tech-lead): PR só de documentação do Jarvis para a develop, mesclado." e "E4.1 (forge:tech-lead): parecer de review da promoção, promoção develop → homolog e PR de release aberto." · etapas do mesmo papel em outro momento, citadas literalmente de `## Etapas`; nada é cortado: vêm em briefs próprios.
- "E4.3 (dono): validar e mesclar o PR de release na `main`." · etapa do dono.
- Mesclar ou aprovar qualquer PR; o PR #128 (develop → homolog, aberto pelo dono); commitar ou fazer push nas branches do Dependabot; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 035, 2026-10-20): "estou com tres prs o 124,125 e 126 com problemas reoslva".
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios). A contagem "6" foi corrigida pelo dono em 2026-10-20 (opção A, abaixo): são 5.
- 2026-10-20 — DECISÃO DO DONO: opção A (entram as 5 correções da lista: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10, @eslint/js 10 e TypeScript 7 ficam de fora, como cartões próprios).
- 2026-10-21 — DECISÃO DO DONO: opção A (no #129, tirar o TypeScript 6, versão maior, com o mesmo tratamento do 7; aceitar jsdom 30.1.3 e @axe-core/playwright 4.14.0).
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- 2026-10-17 — DECISÃO DO DONO (pedido 023): "A regra do projeto nunca passa sobre a fábrica". Para esta promoção vale a tabela de etapas da fábrica: opção B (parecer de review e de QA próprios da promoção antes do PR develop → homolog). A decisão técnica anterior deste pedido (promoção sem parecer próprio) fica revogada.
- R-MAIN: nada na `main`. R-VERIFY: sem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (cmd): `gh pr list --state open --search 'dev-dependencies in:title' --json number,baseRefName -q '.[].baseRefName'` · espera: igual 'develop'
- PQ-2 (cmd): `gh pr list --state open --search 'dev-dependencies in:title' --json body -q '.[].body' | grep -c -E '\[typescript\]|\[eslint\]|@eslint/js'` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md
Branch: docs/jarvis-2026-10-17-tarde   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Abrir o PR só de documentação da branch `docs/jarvis-2026-10-17-tarde` para a `develop` e mesclá-lo, fechando o E3.1 do pedido 035 (cartão K-116). A branch já tem o parecer de review (3d7b90b, `docs/reviews/035-docs-jarvis.md`) e o de QA (0f830bc, `docs/qa/035-docs-jarvis.md`, entrega conferida) e está enviada.

## Ler
- `docs/reviews/035-docs-jarvis.md` e `docs/qa/035-docs-jarvis.md` (pareceres da branch).
- `git log --oneline origin/develop..docs/jarvis-2026-10-17-tarde`.

## Entregar
- (E3) PR da `docs/jarvis-2026-10-17-tarde` para a `develop`, só de documentação. O PR leva os commits da branch: 1e6e52a (documentação do Jarvis dos pedidos 030, 031 e 033, citado no E3 do pedido: "branch `docs/jarvis-2026-10-17-tarde`, commit 1e6e52a"), os merges da develop (236df86, 504b401), 387da84 (documentação dos pedidos 034 e 035) 3d7b90b (parecer de review) e 0f830bc (parecer de QA). Antes de abrir: `forge-check pr 035-resolver-prs-do-dependabot-124-125-126 --ref docs/jarvis-2026-10-17-tarde --base origin/develop` sem saída (a `develop` local está atrás da origin; use `origin/develop`); o parecer de review cobre o 387da84; se o `forge-check pr` pedir parecer também do 1e6e52a, acrescente ao mesmo `docs/reviews/035-docs-jarvis.md` a revisão desse commit (só `.md`, sem segredo nem dado de pessoa) num commit só desse arquivo, com push.
- (E3) Checks verdes (`gh pr checks`) e merge por squash na `develop`; depois do merge, apagar a branch remota (R-FLUXO, "Depois do merge"); voltar o diretório principal para a `develop` atualizada (`git switch develop && git pull --ff-only`) e apagar a branch local. Se o `git switch` recusar por arquivo do Jarvis não commitado, pare e relate (não use stash, reset nem checkout de arquivo).

## Fora do escopo
- "E3.2 (forge:qa-engineer): parecer de QA da branch de documentação (`pnpm run docs:check`), antes do PR: o `forge-check pr` exige QA também para diff só de `.md`." · etapa de outro papel, já cumprida (0f830bc).
- "E4.1 (forge:tech-lead): parecer de review da promoção, promoção develop → homolog e PR de release aberto." · etapa do mesmo papel em outro momento, em brief próprio.
- "E4.2 (forge:qa-engineer): parecer de QA da promoção." e "E4.3 (dono): validar e mesclar o PR de release na `main`." · etapas de outro papel ou do dono.
- "E1.1 (forge:tech-lead): comentários `@dependabot ignore` no #125 e conferir que o grupo foi refeito só com as cinco correções.", "E1.2 (forge:tech-lead): no #129 (que substituiu o #125), `@dependabot ignore` para o TypeScript 6 e, se preciso, `@dependabot recreate`, até o grupo ficar sem versão maior (decisão do dono de 2026-10-21, opção A).", "E2.2 (forge:tech-lead): review dos três PRs." e "E2.4 (forge:tech-lead): PR de documentação com os pareceres e merge dos três PRs na develop." · etapas do mesmo papel já cumpridas (E1) ou cumpridas por ato do dono (E2: o dono mesclou #124, #126 e #130; ver Andamento).
- "E2.1 (forge:security-engineer): parecer de segurança dos três PRs." e "E2.3 (forge:qa-engineer): QA dos três PRs." · etapas de outro papel (a de segurança já gravada; a de QA cumprida por ato do dono).
- Arquivos não commitados do diretório principal (pedido 036, briefs novos, quadro): são do Jarvis e não entram neste PR; o #128 (develop → homolog), que é do E4.

## Decisões e restrições
- Pedido do usuário (pedido 035, 2026-10-20): "isso suba tudo que tem para develop depois para homlog para dai eu subir para main".
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios). A contagem "6" foi corrigida pelo dono em 2026-10-20 (opção A, abaixo): são 5.
- 2026-10-20 — DECISÃO DO DONO: opção A (entram as 5 correções da lista: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10, @eslint/js 10 e TypeScript 7 ficam de fora, como cartões próprios).
- 2026-10-21 — DECISÃO DO DONO: opção A (no #129, tirar o TypeScript 6, versão maior, com o mesmo tratamento do 7; aceitar jsdom 30.1.3 e @axe-core/playwright 4.14.0).
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- 2026-10-17 — DECISÃO DO DONO (pedido 023): "A regra do projeto nunca passa sobre a fábrica". Para esta promoção vale a tabela de etapas da fábrica: opção B (parecer de review e de QA próprios da promoção antes do PR develop → homolog). A decisão técnica anterior deste pedido (promoção sem parecer próprio) fica revogada.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio (hook, check vermelho, proteção da develop) não se contorna; vira relato.

## Pronto quando
- PQ-1 (merge): `gh pr list --head docs/jarvis-2026-10-17-tarde --base develop --state merged --json number -q length` · espera: igual '1'
- PQ-2 (sha): `git log -1 --format=%h origin/develop` · espera: o hash do commit de squash do PR de documentação.
- PQ-3 (cmd): `git ls-remote origin refs/heads/docs/jarvis-2026-10-17-tarde` · espera: linhas=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD branch --show-current` · espera: igual 'develop'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

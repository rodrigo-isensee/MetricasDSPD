Agente destino: forge:tech-lead
Pedido: docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md
Branch: dependabot/npm_and_yarn/develop/dev-dependencies-9563116876   Base: develop   Base-sha: aef6595cb0b54d5c88f563087169f5ca1a2e6d86

## Objetivo
O PR #125 do Dependabot falha em `build`, `rapida` e `testes` porque traz eslint 10 (com @eslint/js 10) e TypeScript 7, versões maiores que o dono mandou separar. Etapa E1.1 do pedido 035: mandar o Dependabot ignorar essas versões maiores para o grupo ficar só com as cinco correções listadas na decisão B do pedido 033 (confirmado pelo dono em 2026-10-20, opção A). Ato só no GitHub, a partir de `/home/rodrigoisensee/MetricasDSPD`, sem worktree.

## Ler
- `docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md` (Diagnóstico, Escopo e Decisões do usuário).

## Entregar
- (E1) Comentar no #125, um comentário por dependência: `@dependabot ignore typescript major version`, `@dependabot ignore eslint major version` e `@dependabot ignore @eslint/js major version` (`gh pr comment 125 --body '<texto>'`).
- (E1) Aguardar o Dependabot refazer o PR (até cerca de 20 min, conferindo a cada poucos minutos com `gh pr view 125 --json state,body,headRefOid`) e relatar a lista final de atualizações do corpo do PR. Se o Dependabot recusar o comando, se ele mesmo fechar o PR ou se as versões maiores continuarem, relate a resposta dele e pare; você não fecha o PR e não edite a branch à mão.

## Fora do escopo
- "E2.1 (forge:security-engineer): parecer de segurança dos três PRs.", "E2.3 (forge:qa-engineer): QA dos três PRs." e "E4.2 (forge:qa-engineer): parecer de QA da promoção." · etapas de outro papel; vêm depois.
- "E2.2 (forge:tech-lead): review dos três PRs.", "E2.4 (forge:tech-lead): PR de documentação com os pareceres e merge dos três PRs na develop.", "E3.1 (forge:tech-lead): PR só de documentação do Jarvis para a develop, mesclado." e "E4.1 (forge:tech-lead): parecer de review da promoção, promoção develop → homolog e PR de release aberto." · etapas do mesmo papel em outro momento, citadas literalmente de `## Etapas`; nada é cortado: vêm em briefs próprios.
- "E4.3 (dono): validar e mesclar o PR de release na `main`." · etapa do dono.
- Mesclar ou aprovar qualquer PR; commitar ou fazer push nas branches do Dependabot; o PR #127 (Forge 0.26, do dono); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 035, 2026-10-20): "estou com tres prs o 124,125 e 126 com problemas reoslva".
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios). A contagem "6" foi corrigida pelo dono em 2026-10-20 (opção A, abaixo): são 5.
- 2026-10-20 — DECISÃO DO DONO: opção A (entram as 5 correções da lista: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10, @eslint/js 10 e TypeScript 7 ficam de fora, como cartões próprios).
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- 2026-10-17 — DECISÃO DO DONO (pedido 023): "A regra do projeto nunca passa sobre a fábrica". Para esta promoção vale a tabela de etapas da fábrica: opção B (parecer de review e de QA próprios da promoção antes do PR develop → homolog). A decisão técnica anterior deste pedido (promoção sem parecer próprio) fica revogada.
- R-MAIN: nada na `main`. R-VERIFY: sem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (cmd): `gh pr view 125 --json body -q .body` · espera: contém '@vitest/coverage-v8'
- PQ-2 (cmd): `gh pr view 125 --json body -q .body | grep -c -E 'typescript\]|\[eslint\]|@eslint/js'` · espera: igual '0'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

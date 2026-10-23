Agente destino: forge:qa-engineer
Pedido: docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md
Branch: docs/jarvis-2026-10-17-tarde   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Parecer de QA da branch só de documentação `docs/jarvis-2026-10-17-tarde` (etapa E3.2 do pedido 035, cartão K-116), exigido pelo `forge-check pr` antes do PR para a `develop`. A branch está no diretório principal `/home/rodrigoisensee/MetricasDSPD`, com o parecer de review já commitado (3d7b90b).

## Ler
- `git diff --stat origin/develop...docs/jarvis-2026-10-17-tarde`.
- Modelo de frontmatter: um parecer em `docs/qa/` do projeto.

## Entregar
- (E3) Conferir que o diff contra `origin/develop` é só documentação (`.md` em `docs/` e `KANBAN.md`) e rodar `pnpm run docs:check` na raiz do diretório principal.
- (E3) Gravar o parecer em `docs/qa/035-docs-jarvis.md`, frontmatter no padrão do projeto (`pedido: 035-resolver-prs-do-dependabot-124-125-126`, `branch: docs/jarvis-2026-10-17-tarde`, `commit:` o sha40 do head revisado, `parecer:`), com o resultado do `docs:check` copiado; um commit só desse arquivo, com `git add` explícito, mensagem conforme a seção de commits do `docs/engineering/praticas.md`; push da branch.

## Fora do escopo
- "E3.1 (forge:tech-lead): PR só de documentação do Jarvis para a develop, mesclado, com a limpeza da branch depois do merge (R-FLUXO, "Depois do merge")." · etapa de outro papel, depois desta.
- "E4.1 (forge:tech-lead): parecer de review da promoção, promoção develop → homolog e PR de release aberto." e "E4.3 (dono): validar e mesclar o PR de release na `main`." · etapas de outro papel ou do dono.
- "E4.2 (forge:qa-engineer): parecer de QA da promoção." · etapa do mesmo papel em outro momento.
- "E2.3 (forge:qa-engineer): QA dos três PRs." · etapa do mesmo papel cumprida por ato do dono (o dono mesclou #124, #126 e #130; ver Andamento).
- "E1.1 (forge:tech-lead): comentários `@dependabot ignore` no #125 e conferir que o grupo foi refeito só com as cinco correções.", "E1.2 (forge:tech-lead): no #129 (que substituiu o #125), `@dependabot ignore` para o TypeScript 6 e, se preciso, `@dependabot recreate`, até o grupo ficar sem versão maior (decisão do dono de 2026-10-21, opção A).", "E2.1 (forge:security-engineer): parecer de segurança dos três PRs.", "E2.2 (forge:tech-lead): review dos três PRs." e "E2.4 (forge:tech-lead): PR de documentação com os pareceres e merge dos três PRs na develop." · etapas de outro papel, já cumpridas ou cumpridas por ato do dono.
- Editar qualquer outro arquivo; PR; merge; testes de navegador (não há código no diff).

## Decisões e restrições
- Pedido do usuário (pedido 035, 2026-10-20): "isso suba tudo que tem para develop depois para homlog para dai eu subir para main".
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios). A contagem "6" foi corrigida pelo dono em 2026-10-20 (opção A, abaixo): são 5.
- 2026-10-20 — DECISÃO DO DONO: opção A (entram as 5 correções da lista: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10, @eslint/js 10 e TypeScript 7 ficam de fora, como cartões próprios).
- 2026-10-21 — DECISÃO DO DONO: opção A (no #129, tirar o TypeScript 6, versão maior, com o mesmo tratamento do 7; aceitar jsdom 30.1.3 e @axe-core/playwright 4.14.0).
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- 2026-10-17 — DECISÃO DO DONO (pedido 023): "A regra do projeto nunca passa sobre a fábrica". Para esta promoção vale a tabela de etapas da fábrica: opção B (parecer de review e de QA próprios da promoção antes do PR develop → homolog). A decisão técnica anterior deste pedido (promoção sem parecer próprio) fica revogada.
- Arquivos não commitados do diretório principal (pedido 036, briefs novos, quadro) são do Jarvis: não adicionar. R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`.

## Pronto quando
- PQ-1 (sha): `git log -1 --format=%h docs/jarvis-2026-10-17-tarde` da branch · espera: o hash do commit do parecer de QA.
- PQ-2 (push): `git ls-remote origin refs/heads/docs/jarvis-2026-10-17-tarde` igual ao head local.
- PQ-3 (cmd): `forge-check pr 035-resolver-prs-do-dependabot-124-125-126 --ref docs/jarvis-2026-10-17-tarde --base origin/develop` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

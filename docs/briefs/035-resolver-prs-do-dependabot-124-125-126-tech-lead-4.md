Agente destino: forge:tech-lead
Pedido: docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md
Branch: docs/jarvis-2026-10-17-tarde   Base: develop   Base-sha: 12018deb8e35a7b473d6e8c1b7a693795a80c1ac

## Objetivo
Levar à develop, por um PR só de documentação, a documentação pendente do Jarvis e o parecer de segurança do #130 (E3.1 do pedido 035), para que a promoção develop → homolog (E4, em brief próprio) já a leve. Cartão K-116. Trabalho no diretório principal `/home/rodrigoisensee/MetricasDSPD`, na branch `docs/jarvis-2026-10-17-tarde` (já com o commit 1e6e52a e o merge 236df86 da develop).

## Ler
- `docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md`, seções Escopo e Andamento (as duas últimas linhas).
- `git status --short` no diretório principal.

## Entregar
- (E3) Trazer a develop atual (12018de, com o #130) para a branch com `git merge origin/develop` (sem rebase, sem force).
- (E3) Um commit só de documentação, com `git add` explícito por caminho, destes arquivos: `docs/briefs/034-subir-a-main-para-navegar-devops-engineer-1.md`, `docs/briefs/035-resolver-prs-do-dependabot-124-125-126-security-engineer-1.md`, `docs/briefs/035-resolver-prs-do-dependabot-124-125-126-tech-lead-1.md`, `docs/briefs/035-resolver-prs-do-dependabot-124-125-126-tech-lead-2.md`, `docs/briefs/035-resolver-prs-do-dependabot-124-125-126-tech-lead-3.md`, `docs/briefs/035-resolver-prs-do-dependabot-124-125-126-tech-lead-4.md`, `docs/kanban/conferencias.md`, `docs/kanban/historico.md`, `KANBAN.md`, `docs/pedidos/034-subir-a-main-para-navegar.md`, `docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md` e `docs/security/035-dependabot-130.md`. Mensagem conforme a seção de commits do `docs/engineering/praticas.md`.
- (E3) Revisar o commit de documentação (só `.md`, sem segredo nem dado de pessoa, nada fora da lista acima) e gravar o parecer de review em `docs/reviews/035-docs-jarvis.md`, frontmatter no padrão do projeto (`tipo: review`, `pedido: 035-resolver-prs-do-dependabot-124-125-126`, `branch: docs/jarvis-2026-10-17-tarde`, `commit:` o sha40 do commit revisado, `parecer:`), commitado na mesma branch, só esse arquivo (R-REVIEW; QA isento por ser só documentação).
- (E3) Push da branch, num push só com os dois commits. Sem PR nem merge nesta delegação: o PR para a `develop` e o merge vêm no brief seguinte, depois de o parecer estar commitado e enviado.

## Fora do escopo
- PR para a `develop`, merge e limpeza da branch: mesma etapa E3.1, no brief seguinte (fila do mesmo papel), depois deste.
- "E4.1 (forge:tech-lead): parecer de review da promoção, promoção develop → homolog e PR de release aberto." · etapa do mesmo papel em outro momento, em brief próprio.
- "E4.2 (forge:qa-engineer): parecer de QA da promoção." e "E4.3 (dono): validar e mesclar o PR de release na `main`." · etapas de outro papel ou do dono.
- "E1.1 (forge:tech-lead): comentários `@dependabot ignore` no #125 e conferir que o grupo foi refeito só com as cinco correções.", "E1.2 (forge:tech-lead): no #129 (que substituiu o #125), `@dependabot ignore` para o TypeScript 6 e, se preciso, `@dependabot recreate`, até o grupo ficar sem versão maior (decisão do dono de 2026-10-21, opção A).", "E2.2 (forge:tech-lead): review dos três PRs." e "E2.4 (forge:tech-lead): PR de documentação com os pareceres e merge dos três PRs na develop." · etapas do mesmo papel já cumpridas (E1) ou cumpridas por ato do dono (E2: o dono mesclou #124, #126 e #130; ver Andamento).
- "E2.1 (forge:security-engineer): parecer de segurança dos três PRs." e "E2.3 (forge:qa-engineer): QA dos três PRs." · etapas de outro papel (a de segurança já gravada; a de QA cumprida por ato do dono).
- Qualquer arquivo fora de `docs/` e `KANBAN.md` (o parecer de review é o único arquivo novo do autor); o #128 (develop → homolog), que é do E4; editar o conteúdo dos pedidos, briefs ou do quadro (são do Jarvis; só commitar).

## Decisões e restrições
- Pedido do usuário (pedido 035, 2026-10-20): "isso suba tudo que tem para develop depois para homlog para dai eu subir para main".
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios). A contagem "6" foi corrigida pelo dono em 2026-10-20 (opção A, abaixo): são 5.
- 2026-10-20 — DECISÃO DO DONO: opção A (entram as 5 correções da lista: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10, @eslint/js 10 e TypeScript 7 ficam de fora, como cartões próprios).
- 2026-10-21 — DECISÃO DO DONO: opção A (no #129, tirar o TypeScript 6, versão maior, com o mesmo tratamento do 7; aceitar jsdom 30.1.3 e @axe-core/playwright 4.14.0).
- 2026-10-17 — DECISÃO DO DONO (pedido 033): opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- 2026-10-17 — DECISÃO DO DONO (pedido 023): "A regra do projeto nunca passa sobre a fábrica". Para esta promoção vale a tabela de etapas da fábrica: opção B (parecer de review e de QA próprios da promoção antes do PR develop → homolog). A decisão técnica anterior deste pedido (promoção sem parecer próprio) fica revogada.
- R-MAIN: nada na `main`. R-VERIFY: nunca `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio (hook, check vermelho, proteção da develop) não se contorna; vira relato.

## Pronto quando
- PQ-1 (sha): `git log -1 --format=%h docs/jarvis-2026-10-17-tarde` da branch · espera: o hash do commit do parecer de review.
- PQ-2 (push): `git ls-remote origin refs/heads/docs/jarvis-2026-10-17-tarde` igual ao head local.
- PQ-3 (cmd): `git ls-tree --name-only docs/jarvis-2026-10-17-tarde docs/security/035-dependabot-130.md docs/pedidos/035-resolver-prs-do-dependabot-124-125-126.md docs/briefs/035-resolver-prs-do-dependabot-124-125-126-tech-lead-4.md docs/reviews/035-docs-jarvis.md` · espera: linhas=4
- PQ-4 (cmd): `git show docs/jarvis-2026-10-17-tarde:docs/reviews/035-docs-jarvis.md | grep -c '^parecer: '` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

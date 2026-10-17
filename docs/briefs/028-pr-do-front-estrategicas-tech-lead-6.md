Agente destino: forge:tech-lead
Pedido: docs/pedidos/028-pr-do-front-estrategicas.md
Branch: feature/011-front-estrategicas   Base: develop   Base-sha: 5ad02ea4e927c5d6799b5fc7f71e6a37cc39fd92

## Objetivo
Volta 8 do code review do PR #108 (front do lote 1 do 011), só sobre o commit b13dfe68b696e6622b6d5661ad82e56de2678cd8 (`docs(ux)`, seção 10 da reconferência de UX). Esse commit, posterior ao parecer, fez o `forge-check pr` marcar o review e o QA como desatualizados (R-REVIEW, R-QA). Etapa E1.3 do pedido 028, cartão K-109. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- `docs/pedidos/028-pr-do-front-estrategicas.md`, seções "Etapas" e "Decisões técnicas do time" (a última linha).
- Na worktree: `git show b13dfe68b696e6622b6d5661ad82e56de2678cd8` e o topo de `docs/reviews/011-front-estrategicas.md` (frontmatter e "Volta 7").

## Entregar
- (E1) Acrescentar a "Volta 8 (2026-10-17)" ao parecer `docs/reviews/011-front-estrategicas.md`: escopo só b13dfe68b696e6622b6d5661ad82e56de2678cd8 (documentação de UX, sem código), veredito; o frontmatter `commit:` passa a `b13dfe6`.
- (E1) Commit próprio (`docs(review): ...`, `git add` só desse caminho), push sem `--force`.
- (E1) Rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas --base develop` de dentro da worktree e copiar a saída: deve sobrar só a linha do QA desatualizado.

## Fora do escopo
- "E1.4 (forge:qa-engineer): revalidação do QA sobre o head depois da volta 8, com a CI do PR como prova da suíte" · etapa de outro papel; continua no pedido.
- "E1.1 (forge:tech-lead): PR do front do lote 1, mesclado na develop." · vem depois do QA, por outro brief.
- O merge do #108; o pedido 024; a promoção para a homolog (pedido 023); o nome do E7 (pendente de confirmação do usuário); a data "Volta 6 (2026-10-18)" do parecer (registro histórico, não se reescreve); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Decisão técnica do time (pedido 028, 2026-10-17): não contornar o `forge-check`; volta 8 do review e revalidação do QA só sobre o commit da UX, depois o merge.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: código, testes, `docs/qa/`, `docs/ux/`, `.github/`, o diretório principal, as worktrees `-011-fase2` e `-024`.
- Teto: 2 agentes de dia (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` local nem E2E; a CI do PR é o portão.

## Pronto quando
- PQ-1 (sha): commit `docs(review)` da volta 8 na branch, só com `docs/reviews/011-front-estrategicas.md`.
- PQ-2 (push): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas ls-remote origin refs/heads/feature/011-front-estrategicas` igual ao head local.
- PQ-3 (cmd): `grep -c '^commit: b13dfe6' /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/reviews/011-front-estrategicas.md` · espera: igual '1'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

Agente destino: forge:qa-engineer
Pedido: docs/pedidos/028-pr-do-front-estrategicas.md
Branch: feature/011-front-estrategicas   Base: develop   Base-sha: 5ad02ea4e927c5d6799b5fc7f71e6a37cc39fd92

## Objetivo
Revalidar o parecer de QA do PR #108 (front do lote 1 do 011) sobre o head cb68ace76cfd3b741e94759990c10886455f926c, depois da volta 8 do review. Desde o seu parecer (frontmatter `commit: 65f46c1`), só entraram três commits de documentação: b13dfe68b696e6622b6d5661ad82e56de2678cd8 (`docs(ux)`, seção 10), 3d48780e0ab4d6a25059fb2854c61019ade97f43 e cb68ace76cfd3b741e94759990c10886455f926c (`docs(review)`, volta 8), sem código nem teste. Etapa E1.4 do pedido 028, cartão K-109. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- `docs/pedidos/028-pr-do-front-estrategicas.md`, seções "Etapas" e "Decisões técnicas do time" (a última linha).
- Na worktree: `git diff --stat 65f46c1dc0fec8fc855592d2cd3eeedca3057606 cb68ace76cfd3b741e94759990c10886455f926c` e o topo de `docs/qa/011-front-estrategicas.md`.
- `gh pr checks 108`.

## Entregar
- (E1) Confirmar que o delta desde 65f46c1dc0fec8fc855592d2cd3eeedca3057606 só toca `docs/ux/` e `docs/reviews/`; se tocar outra coisa, pare e relate.
- (E1) Esperar a CI do PR #108 no head cb68ace76cfd3b741e94759990c10886455f926c terminar; com testes, rapida, e2e e banco verdes, acrescentar ao parecer `docs/qa/011-front-estrategicas.md` a revalidação de 2026-10-17 sobre cb68ace76cfd3b741e94759990c10886455f926c (delta só de docs; prova da suíte = run da CI, com o link), mantendo `parecer: aprovado`; o frontmatter `commit:` passa ao sha curto de cb68ace76cfd3b741e94759990c10886455f926c. Check vermelho: pare e relate (rerrodar só uma vez se for ruído).
- (E1) Commit próprio (`docs(qa): ...`, `git add` só desse caminho), push sem `--force`; rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas --base develop` na worktree e copiar a saída.

## Fora do escopo
- "E1.1 (forge:tech-lead): PR do front do lote 1, mesclado na develop." · etapa de outro papel; vem depois, por outro brief.
- Rodar E2E ou `pronto` local; mudar código, testes, `docs/reviews/`, `docs/ux/`; o pedido 024; o K-115; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Decisão técnica do time (pedido 028, 2026-10-17): não contornar o `forge-check`; volta 8 do review e revalidação do QA só sobre o commit da UX, depois o merge.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: o diretório principal, as worktrees `-011-fase2` e `-024`, `.github/`.
- Teto: 2 agentes de dia (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): a CI do PR é a prova da suíte.

## Pronto quando
- PQ-1 (run): run da CI do PR #108 no head cb68ace76cfd3b741e94759990c10886455f926c com conclusão `success`.
- PQ-2 (sha): commit `docs(qa)` da revalidação na branch, só com `docs/qa/011-front-estrategicas.md`.
- PQ-3 (push): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas ls-remote origin refs/heads/feature/011-front-estrategicas` igual ao head local.
- PQ-4 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas && forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas --base develop | grep -c desatualizado` · espera: igual '0'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (link do run, sha, saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

## Objetivo
Destravar o PR #108 (front do lote 1 do pedido 011, estratégicas), que está verde mas `BEHIND`: a develop exige a branch atualizada e já tem o #107 (táticas, 8516ff8) e o #109 (operacionais, 5ad02ea). Pela decisão técnica do time de 2026-10-17 (pedido 028), traga a develop para a branch e revalide o review sobre o que o merge trouxe. Pedido 028, cartão K-109. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (4f9f229).

## Ler
- `docs/pedidos/028-pr-do-front-estrategicas.md`, seção "Decisões técnicas do time".
- Na worktree: o seu parecer `docs/reviews/011-front-estrategicas.md` (volta 6).

## Entregar
- (E1) `git fetch` e `git merge origin/develop` na branch (merge commit, sem rebase nem `--force`); se houver conflito, resolva a favor da develop nos arquivos do back e a favor da branch nos do front, e registre cada um no parecer; `pnpm run typecheck` e os testes do `web` e do `packages/contratos` (os pacotes que o merge pode afetar no front) da raiz da worktree, com `uptime` antes (load abaixo de 4); push.
- (E1) Revalidar o review sobre o merge: volta 7 no parecer (`commit:` para o commit do merge), olhando só o que o merge trouxe para o front (contratos de E6 a E9 e o catálogo de cartões; os lotes 2 e 3 do back já foram revisados nos PRs deles); gravada com a ferramenta Write do começo ao fim; commit só do parecer, `git add` por caminho, push; rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` e copiar a saída.
- Fora do escopo, Retira do escopo original desta entrega (não do pedido): trecho do pedido 028, E1 "mesclado com os checks verdes; branch e worktree apagadas"; motivo: o merge da develop muda o head e o QA precisa revalidar antes do merge (R-QA); consequência: o merge do #108 e a limpeza saem numa delegação seguinte do mesmo pedido, depois do QA; decisão: decisão técnica do time de 2026-10-17 (pedido 028, "Decisões técnicas do time") dentro da instrução do usuário "Vou dormir toque tudo que puder até a homolog" (pedido 023, "Decisões do usuário").
- Fora do escopo: a revalidação do QA (depois desta); o pedido 024; a promoção para a homolog (pedido 023); o nome do E7; o K-115.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Decisão técnica do time (pedido 028, 2026-10-17): ordem #109 → atualizar o #108 e revalidar → merge do #108 → pedido 024.
- R-REVIEW: o parecer de review é do tech-lead, com Write. R-VERIFY: sem `--no-verify` nem `--force`. R-MAIN.
- NÃO tocar: o código do front fora de conflito, `.github/`, a `main`, o diretório principal, as worktrees `-011-fase2` e `-024`, o parecer do QA.
- Teto: 2 agentes de dia e 3 à noite (agora, noite: 3), uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só typecheck e testes unitários; o E2E é a CI do PR.

## Pronto quando
- PQ-1 (push): commit do merge da develop e commit da volta 7 do review em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas merge-base --is-ancestor 5ad02ea origin/feature/011-front-estrategicas && echo contem` · espera: igual 'contem'
- PQ-3 (cmd): `pnpm run typecheck` da raiz da worktree · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito da volta 7); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha do merge, conflitos, testes, saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

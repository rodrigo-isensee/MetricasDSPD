Agente destino: forge:tech-lead
Pedido: docs/pedidos/028-pr-do-front-estrategicas.md
Branch: feature/011-front-estrategicas   Base: develop   Base-sha: 5ad02ea4e927c5d6799b5fc7f71e6a37cc39fd92

## Objetivo
Mesclar o PR #108 (front do lote 1 do pedido 011, estratégicas: E9, E6, E7 sem R$, E8) na develop. A branch já tem a develop (merge a9c23480f0d056d29854d1441b6177efe5543847, com os lotes 2 e 3 do back), a volta 7 do review aprovou a branch sobre esse merge (frontmatter `commit: a9c2348` de `docs/reviews/011-front-estrategicas.md`; o parecer foi gravado no commit 65f46c1dc0fec8fc855592d2cd3eeedca3057606) e o QA revalidou sobre 65f46c1dc0fec8fc855592d2cd3eeedca3057606 (frontmatter `commit: 65f46c1` de `docs/qa/011-front-estrategicas.md`; o parecer foi gravado no commit e8507885737e23579591cf4259de3c30ba88e677, o head atual). A UX reconferiu o delta de interface sobre o head e8507885737e23579591cf4259de3c30ba88e677 e aprovou (seção 10 de `docs/ux/revisao-011-front-estrategicas.md`, gravada na worktree, sem commit; etapa E1.2 do pedido). Pedido 028, cartão K-109. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`. Substitui o brief 4, que não previa o commit da UX.

## Ler
- `docs/pedidos/028-pr-do-front-estrategicas.md`, seções "Etapas" e "Decisões técnicas do time".
- Na worktree, `git diff docs/ux/revisao-011-front-estrategicas.md` (só a seção 10).
- `gh pr view 108 --json mergeStateStatus,mergeable,statusCheckRollup,headRefOid`.

## Entregar
- (E1) Commitar a seção 10 da UX num commit próprio (`docs(ux): ...`, `git add` só desse caminho), rodar `pnpm run docs:check` e enviar a branch (push sem `--force`).
- (E1) Esperar a CI do novo head ficar verde; se o `forge-check pr` passar a pedir revalidação de review ou QA só por esse commit de docs, pare e relate (não regrave pareceres).
- (E1) Rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` de dentro da worktree; se acusar algo, pare e relate.
- (E1) Com os checks exigidos verdes no head novo e o PR fora de `BEHIND`, mesclar por squash, usando o nome da branch no `gh pr merge` (exigência do hook `parecer`). Se a develop tiver avançado e o PR voltar a `BEHIND`, pare e relate, sem trazer a develop.
- (E1) Depois do merge: apagar a branch local e a remota e remover a worktree `-011-front-estrategicas` (R-FLUXO, "Depois do merge").

## Fora do escopo
- O pedido 024 (traz a develop depois deste merge); a promoção para a homolog (pedido 023); o nome do E7 (pendente de confirmação do usuário); o comentário "49 linhas" em `CatalogoPage.tsx` (ressalva baixa); o K-115; os lotes 2 e 3 do front; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021).
- Decisão técnica do time (pedido 028, 2026-10-17): ordem #109 → atualizar o #108 e revalidar → merge do #108 → pedido 024.
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato. Check vermelho por ruído só se rerroda uma vez.
- NÃO tocar: o código e os outros pareceres da branch, `.github/`, o diretório principal, as worktrees `-011-fase2` e `-024`.
- Teto: 2 agentes de dia e 3 à noite (agora, dia: 2), uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): sem `pronto` local; o portão é a CI do PR.

## Pronto quando
- PQ-1 (sha): commit `docs(ux)` da seção 10 na branch, com só `docs/ux/revisao-011-front-estrategicas.md`.
- PQ-2 (merge): PR #108 mesclado na `develop`.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin feature/011-front-estrategicas` · espera: linhas=0
- PQ-4 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha do commit da UX, checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

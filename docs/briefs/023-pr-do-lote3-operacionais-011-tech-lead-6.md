Agente destino: forge:tech-lead
Pedido: docs/pedidos/023-pr-do-lote3-operacionais-011.md
Branch: docs/023-pareceres-promocao   Base: develop   Base-sha: ed6ba46f39ed98fa76972c9fffe12c982f223e7f

## Objetivo
Levar à develop, por um PR só de documentação, os dois pareceres da promoção develop → homolog (review 2a696559edc6eef36b79c1bc282e3cf0956f73f2 e o de QA, na mesma branch), para que o PR de promoção tenha os pareceres que a tabela de etapas da fábrica exige (decisão do dono de 2026-10-17). Etapa E1.5 do pedido 023. Worktree `/home/rodrigoisensee/MetricasDSPD-023`, branch `docs/023-pareceres-promocao`.

## Ler
- `docs/pedidos/023-pr-do-lote3-operacionais-011.md`, seções "Etapas" e "Andamento".
- Na worktree: `git log --oneline origin/develop..HEAD` (deve ter só os dois commits de parecer) e os frontmatters de `docs/reviews/023-pr-do-lote3-operacionais-011.md` e `docs/qa/023-pr-do-lote3-operacionais-011.md`.

## Entregar
- (E1) Registrar a autoria do seu parecer de review: o `forge-check pr` acusa "autoria: sem registro de que o papel `tech-lead` gravou esta versão" em `docs/reviews/023-pr-do-lote3-operacionais-011.md`. Regrave o arquivo com a ferramenta Edit (mudança mínima, sem alterar o veredito nem a tabela), um commit `docs(review): registra a autoria ...` só desse arquivo e push sem `--force` (`docs/reviews/` não invalida o parecer de QA).
- (E1) Rodar `forge-check pr 023-pr-do-lote3-operacionais-011 --ref docs/023-pareceres-promocao --base develop` na worktree; se acusar algo, pare e relate.
- (E1) Abrir o PR `docs/023-pareceres-promocao` → `develop` (corpo: os dois pareceres da promoção, o motivo, que é a decisão do dono de 2026-10-17, e as linhas de atribuição da sessão); com os checks exigidos verdes e o PR fora de `BEHIND`, mesclar por squash usando o nome da branch no `gh pr merge`.
- (E1) Depois do merge: apagar a branch local e a remota. A worktree `-023` fica (a promoção usa o diretório principal; remova a worktree só depois de conferir que nada nela ficou sem commit).

## Fora do escopo
- "E1.4 (forge:qa-engineer): parecer de QA da promoção em `docs/qa/023-pr-do-lote3-operacionais-011.md`, na mesma branch, com a CI da develop como prova" · etapa de outro papel, feita antes deste brief.
- "E1.2 (dono): merge do release homolog → main." · etapa do dono.
- Abrir ou mesclar o PR de promoção develop → homolog (vem depois, por outro brief); mudar o conteúdo dos pareceres (veredito, tabela, frontmatter); o PR #113; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica"; para esta promoção vale a tabela de etapas da fábrica (opção B).
- Squash na `develop` (`CLAUDE.md` do projeto). R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: o diretório principal, a worktree `-011-fase2`, `.github/`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nenhuma tarefa pesada nesta etapa (as dependências da worktree já foram instaladas no E1.3).

## Pronto quando
- PQ-1 (pr): PR `docs/023-pareceres-promocao` → `develop` aberto.
- PQ-2 (merge): PR mesclado na `develop` por squash.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin docs/023-pareceres-promocao` · espera: linhas=0
- PQ-5 (sha): commit `docs(review): registra a autoria ...` na branch, só com `docs/reviews/023-pr-do-lote3-operacionais-011.md`, antes do PR.
- PQ-4 (arquivo): `git -C /home/rodrigoisensee/MetricasDSPD fetch -q origin` e depois `git -C /home/rodrigoisensee/MetricasDSPD show origin/develop:docs/qa/023-pr-do-lote3-operacionais-011.md` mostra o parecer de QA.

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, checks, sha do merge); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

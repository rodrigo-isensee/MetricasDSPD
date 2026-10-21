Agente destino: forge:tech-lead
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: feature/030-dependabot-develop   Base: develop   Base-sha: 00a634f6774120e314b9edf36c4efd3711183a35

## Objetivo
Levar à `develop` a mudança do pedido 030 (`target-branch: develop` no `.github/dependabot.yml`), com review, segurança, devops e QA aprovados. Etapa E2.5 do pedido 030. Worktree `/home/rodrigoisensee/MetricasDSPD-030`, branch `feature/030-dependabot-develop` (head 11f71ee4bc94df439806892e6eddfe63cf0b8c78, no remoto).

## Ler
- `docs/pedidos/030-prs-do-dependabot-para-develop.md` (Etapas e as linhas de Andamento sobre E2.1 a E2.4 e E2.1b).

## Entregar
- (E2) Na worktree: `git fetch origin develop:develop` (só avanço rápido) e `forge-check pr 030-prs-do-dependabot-para-develop --ref feature/030-dependabot-develop --base develop` (deve sair com rc=0).
- (E2) Se o GitHub exigir a branch atualizada com a develop, fazer merge da `origin/develop` na branch (sem rebase, sem `--force`) e enviar; se houver conflito, pare e relate.
- (E2) Abrir o PR `feature/030-dependabot-develop` → `develop` (`--base develop`), com corpo que cite os quatro pareceres (`docs/devops/`, `docs/security/`, `docs/reviews/`, `docs/qa/030-…`) e a pendência E2.6; mesclar por squash com os checks exigidos verdes; apagar a branch remota e local e a worktree `/home/rodrigoisensee/MetricasDSPD-030` (R-FLUXO, "Depois do merge").

## Fora do escopo
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono.
- "E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar.", "E3.1 (forge:tech-lead): comentar `@dependabot rebase` nos PRs #110 e #112 e conferir que ficam sem conflito; sem mesclar e sem editar a branch do Dependabot à mão.", "E3.2 (forge:tech-lead): comentar `@dependabot recreate` nos PRs #110 e #112 (decisão do dono, opção A) e conferir que ficam sem conflito, sem mesclar." e "E2.3 (forge:tech-lead): review." · etapas de outro momento, já feitas.
- Promover para a `homolog` ou abrir release; mexer nos PRs do Dependabot (pedido 033); o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- DECISÃO DO DONO (pedido 030, 2026-10-17): opção A (`@dependabot recreate` nos #110 e #112; o merge manual das branches é descartado). Já executada; não muda esta etapa.
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-FLUXO: squash na develop, depois do merge apagar branch remota, local e worktree; nunca `develop`, `homolog` nem `main`. R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify`, `--force` nem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024).

## Pronto quando
- PQ-1 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-030 && forge-check pr 030-prs-do-dependabot-para-develop --ref feature/030-dependabot-develop --base develop` · espera: rc=0
- PQ-2 (merge): PR `feature/030-dependabot-develop` → `develop` mesclado por squash, com número e sha do merge no relatório.
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin feature/030-dependabot-develop` · espera: linhas=0
- PQ-4 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-030 && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, sha do merge, checks); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

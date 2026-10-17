Agente destino: forge:tech-lead
Pedido: docs/pedidos/031-develop-limpa-homolog-e-release.md
Branch: docs/jarvis-quadro-2026-10-17-noite   Base: develop   Base-sha: 6b3db45c0bff84802f0b5eb12b0cdb24ba3a659f

## Objetivo
Levar à develop o que está pronto (a branch só de documentação do quadro, `docs/jarvis-quadro-2026-10-17-noite`) e apagar as branches já incorporadas ou conferidas, pelo pedido do usuário de 2026-10-17 ("atualize tudo que esta pronto na develop e apague as branchs"). Etapas E1.1, E2.1 e E3.2 do pedido 031. A partir de `/home/rodrigoisensee/MetricasDSPD`.

## Ler
- `docs/pedidos/031-develop-limpa-homolog-e-release.md` (Inventário, Escopo e Fora do escopo).

## Entregar
- (E1) O Jarvis já commitou o quadro nessa branch (no diretório principal; você não mexe em `KANBAN.md` nem em `docs/kanban/`). Envie a branch (`git push origin docs/jarvis-quadro-2026-10-17-noite`, sem `--force`; se o pre-push recusar, pare e relate). Depois: `git fetch origin develop:develop` (só avanço rápido), conferir que `git diff --name-only origin/develop...origin/docs/jarvis-quadro-2026-10-17-noite` traz só arquivos `.md`, abrir o PR `docs/jarvis-quadro-2026-10-17-noite` → `develop` com `--base develop` e mesclar por squash com os checks exigidos verdes; apagar a branch remota. A branch local fica (é a do diretório principal; o Jarvis troca depois).
- (E2) Apagar as branches já incorporadas: remotas `forge/upgrade-0.15.1`, `forge/upgrade-0.16.0` e `forge/upgrade-0.19.0`; locais `forge/upgrade-0.15.1`, `forge/upgrade-0.16.0`, `forge/upgrade-0.19.0` e `chore/forge-0.13.0-versao`; e a worktree `/home/rodrigoisensee/MetricasDSPD-023` (`git worktree remove`, só se `git status` dela estiver limpo).

- (E3) Para cada uma das seis branches locais `feature/011-metricas-tambem-back`, `ref/c6-cede-por-metrica`, `ref/c6-gerador-em-fases`, `test/qa-intensivo-main`, `tmp/taticas-sobre-develop` e `feature/011-fase2-back`: conferir, por conteúdo e não só por hash, se tudo o que ela muda já está na `origin/develop` (por exemplo `git diff origin/develop <branch> -- <arquivos que a branch tocou desde a base dela>` e `git cherry`/`git range-diff`). Só a branch inteira contida na develop recebe a tag `arquivo/<nome>` (local e enviada ao remoto) e é apagada (local, e remota se existir; para a `feature/011-fase2-back`, também a worktree `-011-fase2`, se estiver limpa). A que tiver qualquer mudança fora da develop não se toca: relate a lista do que falta, por arquivo, para o dono decidir.

## Fora do escopo
- "E3.1 (dono): decidir o destino das seis branches com trabalho fora da develop (pergunta em Andamento)." · etapa do dono, já decidida (opção A com a condição de conferir antes; ver o item E3 do Entregar).
- "E4.2 (forge:qa-engineer): parecer de QA da nova promoção." e "E4.4 (dono): validar a homolog e mesclar o PR de release na `main`." · etapas de outro papel; a promoção e o PR de release vêm depois, por outros briefs.
- A worktree `-030` e a branch `feature/030-dependabot-develop` (pedido 030, em andamento); os PRs do Dependabot.
- Nunca apagar `develop`, `homolog` nem `main`.

## Decisões e restrições
- Pedido do usuário (pedido 031, 2026-10-17): "atualize tyudo que esta pronto na develop e apague as branchs. Depois atualize a hml e deixe o pr aberto para main".
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-FLUXO: depois do merge, limpe tudo; nunca apague `develop`, `homolog` nem `main`. R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado.

## Pronto quando
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote origin refs/heads/docs/jarvis-quadro-2026-10-17-noite` igual ao head local da branch antes do PR (o conferente confere pelo head do PR).
- PQ-1 (merge): PR `docs/jarvis-quadro-2026-10-17-noite` → `develop` mesclado por squash.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin forge/upgrade-0.15.1 forge/upgrade-0.16.0 forge/upgrade-0.19.0 docs/jarvis-quadro-2026-10-17-noite` · espera: linhas=0
- PQ-3 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-023 && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, sha do merge, branches apagadas); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

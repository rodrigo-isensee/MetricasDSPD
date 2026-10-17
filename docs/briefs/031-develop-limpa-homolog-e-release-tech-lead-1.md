Agente destino: forge:tech-lead
Pedido: docs/pedidos/031-develop-limpa-homolog-e-release.md
Branch: docs/jarvis-quadro-2026-10-17-noite   Base: develop   Base-sha: 6b3db45c0bff84802f0b5eb12b0cdb24ba3a659f

## Objetivo
Levar à develop o que está pronto (a branch só de documentação do quadro, `docs/jarvis-quadro-2026-10-17-noite`) e apagar as branches já incorporadas, pelo pedido do usuário de 2026-10-17 ("atualize tudo que esta pronto na develop e apague as branchs"). Etapas E1 e E2 do pedido 031. A partir de `/home/rodrigoisensee/MetricasDSPD`.

## Ler
- `docs/pedidos/031-develop-limpa-homolog-e-release.md` (Inventário, Escopo e Fora do escopo).

## Entregar
- (E1) Antes, o Jarvis commita e envia o que falta do quadro nessa branch (você não mexe em `KANBAN.md` nem em `docs/kanban/`). Depois: `git fetch origin develop:develop` (só avanço rápido), conferir que `git diff --name-only origin/develop...origin/docs/jarvis-quadro-2026-10-17-noite` traz só arquivos `.md`, abrir o PR `docs/jarvis-quadro-2026-10-17-noite` → `develop` com `--base develop` e mesclar por squash com os checks exigidos verdes; apagar a branch remota. A branch local fica (é a do diretório principal; o Jarvis troca depois).
- (E2) Apagar as branches já incorporadas: remotas `forge/upgrade-0.15.1`, `forge/upgrade-0.16.0` e `forge/upgrade-0.19.0`; locais `forge/upgrade-0.15.1`, `forge/upgrade-0.16.0`, `forge/upgrade-0.19.0` e `chore/forge-0.13.0-versao`; e a worktree `/home/rodrigoisensee/MetricasDSPD-023` (`git worktree remove`, só se `git status` dela estiver limpo).

## Fora do escopo
- As seis branches com trabalho fora da develop (E3: esperam a resposta do dono) e a worktree `-011-fase2`.
- A worktree `-030` e a branch `feature/030-dependabot-develop` (pedido 030, em andamento); os PRs do Dependabot.
- A promoção para a homolog e o PR de release (E4: vêm depois, por outros briefs).
- Nunca apagar `develop`, `homolog` nem `main`.

## Decisões e restrições
- Pedido do usuário (pedido 031, 2026-10-17): "atualize tyudo que esta pronto na develop e apague as branchs. Depois atualize a hml e deixe o pr aberto para main".
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-FLUXO: depois do merge, limpe tudo; nunca apague `develop`, `homolog` nem `main`. R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado.

## Pronto quando
- PQ-1 (merge): PR `docs/jarvis-quadro-2026-10-17-noite` → `develop` mesclado por squash.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --heads origin forge/upgrade-0.15.1 forge/upgrade-0.16.0 forge/upgrade-0.19.0 docs/jarvis-quadro-2026-10-17-noite` · espera: linhas=0
- PQ-3 (cmd): `test -d /home/rodrigoisensee/MetricasDSPD-023 && echo existe || echo removida` · espera: igual 'removida'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, sha do merge, branches apagadas); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

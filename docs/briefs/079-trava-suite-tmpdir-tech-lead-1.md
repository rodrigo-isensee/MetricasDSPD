Agente destino: forge:tech-lead
Pedido: 079-trava-suite-tmpdir
Tipo: codigo
Branch: feature/079-trava-suite-tmpdir   Base: develop   Base-sha: 718d46beb4be314dd6d1f1c55454e64e62e4fe7d
Etapa: review   Cobre: E1.2

## Objetivo
Review da E1.1 do pedido 079 (K-201): a trava de `scripts/suite-unica.sh` sai do `/tmp` fixo para `/tmp/claude-<uid>/metricas-dspd-suite.lock`, na ponta 61cafba2e287808c570be923193739ba5d3088ad (parecer de devops em d3832481f3c2fcf90bb8a4c3de78924fa72a94b6, entrega conferida). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/079-trava-suite-tmpdir`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff 718d46beb4be314dd6d1f1c55454e64e62e4fe7d...d3832481f3c2fcf90bb8a4c3de78924fa72a94b6`.
- docs/pedidos/079-trava-suite-tmpdir.md: só `## Escopo`, `## Suposições` e, do `## Histórico`, a linha da entrega da E1.1.

## Entregar
- "E1.2 (tech-lead): review." (E1.2)
- (E1) (E1.2) Foco: a trava continua única entre as worktrees e entre os agentes e o dono no terminal (o caminho por usuário em vez do `TMPDIR`, motivo no parecer de devops); `METRICAS_DSPD_SUITE_LOCK` e a recusa de link simbólico (arquivo e diretório) mantidos; o `mkdir -m` e o SC2174 apontado pelo shellcheck; o caso novo em `scripts/suite-unica.test.sh`; nada fora de `scripts/` e `docs/devops/`. Parecer em `docs/reviews/079-trava-suite-tmpdir.md` gravado inteiro pela ferramenta Write (sem editar depois), com `pedido: 079-trava-suite-tmpdir`, `branch: feature/079-trava-suite-tmpdir`, `commit: 61cafba2e287808c570be923193739ba5d3088ad`, veredito e bloco `## Achados` só com linhas de achado (cite regra só pelo ID; achado com até 300 caracteres); commit só do parecer com `Cartão: K-201` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-tl-079.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin feature/079-trava-suite-tmpdir`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/079-trava-suite-tmpdir`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20 do 075); sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 06:28).
- Recursos: regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez; antes do push, confira com `ps -eo pid,etime,args` se há outro `git push` rodando e, se houver, espere.
- O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh, e também comandos que citem `flock` ou `$?`: use caminhos literais e leia o script com a ferramenta Read. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: o script, o teste, o parecer de devops, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (devops-engineer): implementação em `scripts/suite-unica.sh` e no teste do script, com parecer de devops em docs/devops/." · etapa de outra delegação; feita
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva do pedido 079." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/feature/079-trava-suite-tmpdir:docs/reviews/079-trava-suite-tmpdir.md` · espera: contém 'commit: 61cafba2e287808c570be923193739ba5d3088ad'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:devops-engineer
Pedido: 079-trava-suite-tmpdir
Tipo: codigo
Branch: feature/079-trava-suite-tmpdir   Base: develop   Base-sha: 718d46beb4be314dd6d1f1c55454e64e62e4fe7d
Etapa: codigo   Cobre: E1.1

## Objetivo
K-201 (pedido 079): o `pnpm run pronto` e o `pnpm test` não rodam no sandbox dos agentes porque `scripts/suite-unica.sh` abre a trava em `/tmp/metricas-dspd-suite.lock` fixo; a trava passa a um caminho que o sandbox grava, sem perder a exclusão de uma suíte por vez entre as worktrees. Worktree `/home/rodrigoisensee/MetricasDSPD-052g` (livre: a branch antiga já foi mesclada), branch nova `feature/079-trava-suite-tmpdir` a partir da develop.

## Ler
- docs/pedidos/079-trava-suite-tmpdir.md: só `## Escopo`, `## Etapas`, `## Fora do escopo` e `## Suposições`.
- Na worktree: `scripts/suite-unica.sh`, `scripts/suite-unica.test.sh` e as linhas de `package.json` que chamam o script.

## Entregar
- "E1.1 (devops-engineer): implementação em `scripts/suite-unica.sh` e no teste do script, com parecer de devops em docs/devops/." (E1.1)
- (E1) (E1.1) Preparar a worktree: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g status --short` vazio, `git -C /home/rodrigoisensee/MetricasDSPD-052g fetch origin develop`, depois `git -C /home/rodrigoisensee/MetricasDSPD-052g switch -c feature/079-trava-suite-tmpdir 718d46beb4be314dd6d1f1c55454e64e62e4fe7d` (não apagar a branch antiga).
- (E1) (E1.1) Confirmar a suposição do pedido (o caminho que o sandbox grava e se ele é o mesmo para todos os agentes e para o dono no terminal) e escolher o caminho da trava: o padrão continua sendo uma trava única por estação; `METRICAS_DSPD_SUITE_LOCK` continua trocando o arquivo; a recusa de link simbólico continua; se não houver caminho comum, pare e relate as opções (vira decisão).
- (E1) (E1.1) Implementar em `scripts/suite-unica.sh` (e no comentário do topo, que cita o caminho) e acrescentar ao `scripts/suite-unica.test.sh` o caso do caminho novo; rodar `bash scripts/suite-unica.test.sh` e `pnpm run test:trava` verdes; parecer de devops em `docs/devops/079-trava-suite-tmpdir.md` pela ferramenta Write (sem editar depois), com `pedido: 079-trava-suite-tmpdir`, `branch: feature/079-trava-suite-tmpdir`, `commit:` do commit do script, veredito, o motivo da escolha do caminho e o bloco `## Achados` (achado com até 300 caracteres; regra citada só pelo ID).
- (E1) (E1.1) Commits com `Cartão: K-201` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-devops-079.txt` e `git commit -F` com esse caminho literal), `git add` explícito por caminho, o parecer num commit separado; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse --abbrev-ref HEAD` = feature/079-trava-suite-tmpdir e enviar em primeiro plano com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/079-trava-suite-tmpdir`, com o comando puro (sem pipe nem variável); se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20 do 075); sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 06:28).
- Recursos: regra da noite do dono (075, 2026-11-07 00:07): até 3 agentes e 1 git push por vez, escalonados pelo Jarvis; antes do push, confira com `ps -eo pid,etime,args` se há outro `git push` rodando e, se houver, espere.
- O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos literais. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: `.github/`, `.githooks/`, a CI, o `package.json` (salvo se o caminho novo exigir, e então só a linha do script, relatado), o código do produto, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.5 (agile-coach): retrospectiva do pedido 079." · etapa de outra delegação; continua no pedido
- K-175 e mudanças na CI ou no pre-push (`## Fora do escopo` do pedido).

## Pronto quando
- PQ-1 (cmd): `bash /home/rodrigoisensee/MetricasDSPD-052g/scripts/suite-unica.test.sh` · espera: rc=0
- PQ-2 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-052g/docs/devops/079-trava-suite-tmpdir.md`
- PQ-3 (push): `git ls-remote origin refs/heads/feature/079-trava-suite-tmpdir` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse HEAD`)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

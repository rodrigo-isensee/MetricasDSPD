Agente destino: forge:tech-lead
Pedido: 082-conflito-pr-256
Tipo: codigo
Branch: dependabot/npm_and_yarn/develop/producao-d435e0b6dd   Base: develop   Base-sha: bc78a3b859d89628e2128638f74cc0c1462be0d2
Etapa: codigo   Cobre: E1.1

## Objetivo
Tirar o conflito do PR 256 do Dependabot (grupo producao: `@fastify/swagger` 9.9.2 → 9.9.3, `fastify` 5.12.7 → 5.12.8, `@tanstack/react-query` 5.105.0 → 5.105.3) com a develop, a pedido do dono, mantendo as três versões e com a CI verde. O conflito está em `pnpm-lock.yaml`, `server/package.json` e `web/package.json`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/082-conflito-pr-256.md` (inteiro, curto).

## Entregar
- "E1.1 (tech-lead): resolver o conflito: primeiro pedir ao Dependabot que refaça o PR sobre a develop (comentário `@dependabot recreate` no PR 256); se ele não refizer, atualizar a branch com a develop e regerar o `pnpm-lock.yaml` com `pnpm install`, sem mudar versão além das três do PR." (E1.1)
- (E1) (E1.1) Comentar no PR 256 com `gh pr comment 256 --repo rodrigo-isensee/MetricasDSPD --body "@dependabot recreate"` (`api.github.com` e `github.com` em `allowed_domains`). Esperar, por chamadas curtas de `gh pr view 256 --repo rodrigo-isensee/MetricasDSPD --json headRefOid,mergeable,mergeStateStatus`, até 15 minutos, o head mudar e `mergeable` deixar de ser `CONFLICTING`.
- (E1) (E1.1) Se em 15 minutos o Dependabot não refizer, ou se ele recusar: na worktree `/home/rodrigoisensee/MetricasDSPD-052g` (livre, o 079 já está na develop; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g status --short` vazio), `git -C /home/rodrigoisensee/MetricasDSPD-052g fetch origin develop dependabot/npm_and_yarn/develop/producao-d435e0b6dd`, `git -C /home/rodrigoisensee/MetricasDSPD-052g switch -c dependabot/npm_and_yarn/develop/producao-d435e0b6dd origin/dependabot/npm_and_yarn/develop/producao-d435e0b6dd`, `git -C /home/rodrigoisensee/MetricasDSPD-052g merge origin/develop`; resolver `server/package.json` e `web/package.json` ficando com as versões da develop mais só as três do PR, e regerar o lockfile com `pnpm install --lockfile-only` na raiz da worktree (`registry.npmjs.org` em `allowed_domains`), sem resolver o `pnpm-lock.yaml` à mão; `git add` explícito por caminho; commit do merge com a mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-tl-082.txt` e `git commit -F` com esse caminho literal; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/dependabot/npm_and_yarn/develop/producao-d435e0b6dd`, em primeiro plano, com o comando puro; push ou pre-push com mais de 15 minutos está preso: pare e relate.
- (E1) (E1.1) Nos dois caminhos: conferir com `git diff origin/develop...<head> -- server/package.json web/package.json` que só as três versões mudam; esperar a CI do PR no head novo, por chamadas curtas, e relatar cada check; sem merge do PR.

## Decisões e restrições
- 2026-11-07 12:01: DECISÃO DO DONO (literal): "resolva os conflitos do pr 256 os demais eu ja fiz merge". Pedido aberto (Jarvis). Recibo ao dono: vou fazer: o tech-lead faz o Dependabot refazer o PR 256 sobre a develop (ou atualiza a branch e regera o lockfile), mantendo as três versões, com a CI verde e o parecer de segurança; não vou: trocar versões, mexer em código nem mesclar outros PRs de dependência. Gatilho de segurança: dependência de produção.
- 2026-11-07 12:01: DECISÃO TÉCNICA (Jarvis): primeiro o comentário @dependabot recreate (o Dependabot refaz o lockfile sobre a develop, sem commit nosso na branch dele); se não refizer em 15 minutos, o tech-lead atualiza a branch com a develop e regera o pnpm-lock.yaml.
- O agente não abre, lê nem edita arquivos `.env*`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, outros PRs (o 255 inclusive), o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (security-engineer): parecer de segurança das três atualizações (dependência de produção, R-SEGURANCA)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): conferir a CI verde e deixar o PR pronto; o merge na develop segue o fluxo da noite." · etapa de outra delegação; continua no pedido
- "E1.4 (agile-coach): retrospectiva curta junto com as do 079 e do 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view 256 --repo rodrigo-isensee/MetricasDSPD --json mergeable --jq .mergeable` · espera: igual 'MERGEABLE'
- PQ-2 (cmd): `gh pr view 256 --repo rodrigo-isensee/MetricasDSPD --json files --jq '[.files[].path]|length'` · espera: igual '3'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

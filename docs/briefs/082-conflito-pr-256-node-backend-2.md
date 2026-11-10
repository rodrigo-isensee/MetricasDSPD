Agente destino: forge:node-backend
Pedido: 082-conflito-pr-256
Tipo: codigo
Branch: dependabot/npm_and_yarn/develop/producao-d435e0b6dd   Base: develop   Base-sha: bc78a3b859d89628e2128638f74cc0c1462be0d2
Etapa: codigo   Cobre: E1.5
Volta-de: docs/briefs/082-conflito-pr-256-node-backend-1.md sha256 1c6ea42f21ee0cda5fbbf3b3469c4a364b2941b0bb387f383e0dcdae5b902e8e

## Objetivo
Terminar o merge da develop na branch do PR 256 do Dependabot (grupo producao: `@fastify/swagger` 9.9.3, `fastify` 5.12.8, `@tanstack/react-query` 5.105.3), a pedido do dono: regerar o `pnpm-lock.yaml`, commitar o merge e enviar, com a CI verde. O tech-lead deixou o merge em andamento na worktree `/home/rodrigoisensee/MetricasDSPD-052g` (conflito só no lockfile, os dois `package.json` já mesclados com só as três versões).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/082-conflito-pr-256.md` (inteiro, curto).

## Entregar
- "E1.5 (node-backend): regerar o `pnpm-lock.yaml` do merge da develop na branch do PR 256, commitar e enviar (o hook só deixa papel de dev rodar `pnpm install`; DECISÃO TÉCNICA de 12:09)." (E1.5)
- (E1) (E1.5) Pela DECISÃO TÉCNICA de 2026-11-07 12:33 deste pedido: na worktree `/home/rodrigoisensee/MetricasDSPD-052g`, `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin dependabot/npm_and_yarn/develop/producao-d435e0b6dd` (traz o parecer de segurança 313c3961); fazer o `pnpm-lock.yaml` resolver `@tanstack/react-query` e `@tanstack/query-core` em 5.105.3 (hoje 5.107.1), sem mudar o `^5.105.3` do `web/package.json` nem outra dependência (por exemplo `pnpm --filter web update @tanstack/react-query@5.105.3 --lockfile-only` na raiz da worktree, `registry.npmjs.org` em `allowed_domains`); se o comando mudar o `web/package.json`, desfaça só essa linha para `^5.105.3`; conferir com `git -C /home/rodrigoisensee/MetricasDSPD-052g diff -- pnpm-lock.yaml` que só as entradas de react-query e query-core mudam e com `grep -n "react-query@\|query-core@" pnpm-lock.yaml` que a versão é 5.105.3; `git add` explícito; commit com a mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-nb-082-v2.txt` (assunto `chore(deps): lockfile com @tanstack/react-query 5.105.3 do PR 256`) e `git -C /home/rodrigoisensee/MetricasDSPD-052g commit -F` com esse caminho literal; enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/dependabot/npm_and_yarn/develop/producao-d435e0b6dd`, em primeiro plano, com o comando puro; push ou pre-push com mais de 15 minutos está preso: pare e relate; esperar a CI do PR 256 no head novo e relatar cada check; sem merge.

## Decisões e restrições
- 2026-11-07 12:01: DECISÃO DO DONO (literal): "resolva os conflitos do pr 256 os demais eu ja fiz merge". Pedido aberto (Jarvis). Recibo ao dono: vou fazer: o tech-lead faz o Dependabot refazer o PR 256 sobre a develop (ou atualiza a branch e regera o lockfile), mantendo as três versões, com a CI verde e o parecer de segurança; não vou: trocar versões, mexer em código nem mesclar outros PRs de dependência. Gatilho de segurança: dependência de produção.
- 2026-11-07 12:09: DECISÃO TÉCNICA (Jarvis): pela divisão de papéis do hook, quem regera o lockfile é um agente de dev: o node-backend termina o merge na 052g (pnpm install --lockfile-only, git add dos três arquivos, commit, push) e espera a CI; o tech-lead não repete o comando.
- 2026-11-07 12:33: DECISÃO TÉCNICA (Jarvis): o recibo ao dono prometeu as três versões do PR; o lockfile volta a resolver @tanstack/react-query (e query-core) em 5.105.3, sem mudar o ^5.105.3 do web/package.json; volta ao node-backend (node-backend-2); depois, a segurança confere o lockfile novo.
- O agente não abre, lê nem edita arquivos `.env*`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, testes, outros PRs (o 255 inclusive), o pedido, `KANBAN.md`, as worktrees além da 052g, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): resolver o conflito: primeiro pedir ao Dependabot que refaça o PR sobre a develop (comentário `@dependabot recreate` no PR 256); se ele não refizer, atualizar a branch com a develop e regerar o `pnpm-lock.yaml` com `pnpm install`, sem mudar versão além das três do PR." · etapa de outra delegação; feita até o lockfile (o resto é esta E1.5)
- "E1.2 (security-engineer): parecer de segurança das três atualizações (dependência de produção, R-SEGURANCA)." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): conferir a CI verde e deixar o PR pronto; o merge na develop segue o fluxo da noite." · etapa de outra delegação; continua no pedido
- "E1.4 (agile-coach): retrospectiva curta junto com as do 079 e do 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr view 256 --repo rodrigo-isensee/MetricasDSPD --json mergeable --jq .mergeable` · espera: igual 'MERGEABLE'
- PQ-2 (cmd): `gh pr view 256 --repo rodrigo-isensee/MetricasDSPD --json files --jq '[.files[].path]|length'` · espera: igual '3'
- PQ-3 (push): `git ls-remote origin refs/heads/dependabot/npm_and_yarn/develop/producao-d435e0b6dd` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-052g rev-parse HEAD`)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

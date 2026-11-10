Agente destino: forge:node-backend
Pedido: 082-conflito-pr-256
Tipo: codigo
Branch: dependabot/npm_and_yarn/develop/producao-d435e0b6dd   Base: develop   Base-sha: bc78a3b859d89628e2128638f74cc0c1462be0d2
Etapa: codigo   Cobre: E1.5

## Objetivo
Terminar o merge da develop na branch do PR 256 do Dependabot (grupo producao: `@fastify/swagger` 9.9.3, `fastify` 5.12.8, `@tanstack/react-query` 5.105.3), a pedido do dono: regerar o `pnpm-lock.yaml`, commitar o merge e enviar, com a CI verde. O tech-lead deixou o merge em andamento na worktree `/home/rodrigoisensee/MetricasDSPD-052g` (conflito só no lockfile, os dois `package.json` já mesclados com só as três versões).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/082-conflito-pr-256.md` (inteiro, curto).

## Entregar
- "E1.5 (node-backend): regerar o `pnpm-lock.yaml` do merge da develop na branch do PR 256, commitar e enviar (o hook só deixa papel de dev rodar `pnpm install`; DECISÃO TÉCNICA de 12:09)." (E1.5)
- (E1) (E1.5) Na worktree `/home/rodrigoisensee/MetricasDSPD-052g`: conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g branch --show-current` = dependabot/npm_and_yarn/develop/producao-d435e0b6dd e que o merge está em andamento (`git -C /home/rodrigoisensee/MetricasDSPD-052g status` mostra "All conflicts fixed but you are still merging" ou o lockfile como único pendente); se não, pare e relate. Rodar `pnpm install --lockfile-only` na raiz da worktree (`registry.npmjs.org` em `allowed_domains`), sem editar o `pnpm-lock.yaml` à mão; conferir com `git -C /home/rodrigoisensee/MetricasDSPD-052g diff origin/develop -- server/package.json web/package.json` que só as três versões mudam; `git -C /home/rodrigoisensee/MetricasDSPD-052g add pnpm-lock.yaml server/package.json web/package.json`; commit do merge com a mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-nb-082.txt` (assunto `chore(deps): merge da develop no PR 256 e lockfile regerado`, corpo com o pedido 082) e `git -C /home/rodrigoisensee/MetricasDSPD-052g commit -F` com esse caminho literal; enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/dependabot/npm_and_yarn/develop/producao-d435e0b6dd`, em primeiro plano, com o comando puro (`github.com` em `allowed_domains`); se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate. Esperar a CI do PR 256 no head novo, por chamadas curtas de `gh pr checks 256 --repo rodrigo-isensee/MetricasDSPD` (`api.github.com` em `allowed_domains`), e relatar cada check; sem merge do PR.

## Decisões e restrições
- 2026-11-07 12:01: DECISÃO DO DONO (literal): "resolva os conflitos do pr 256 os demais eu ja fiz merge". Pedido aberto (Jarvis). Recibo ao dono: vou fazer: o tech-lead faz o Dependabot refazer o PR 256 sobre a develop (ou atualiza a branch e regera o lockfile), mantendo as três versões, com a CI verde e o parecer de segurança; não vou: trocar versões, mexer em código nem mesclar outros PRs de dependência. Gatilho de segurança: dependência de produção.
- 2026-11-07 12:09: DECISÃO TÉCNICA (Jarvis): pela divisão de papéis do hook, quem regera o lockfile é um agente de dev: o node-backend termina o merge na 052g (pnpm install --lockfile-only, git add dos três arquivos, commit, push) e espera a CI; o tech-lead não repete o comando.
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

Agente destino: forge:security-engineer
Pedido: 082-conflito-pr-256
Tipo: codigo
Branch: dependabot/npm_and_yarn/develop/producao-d435e0b6dd   Base: develop   Base-sha: bc78a3b859d89628e2128638f74cc0c1462be0d2
Etapa: seguranca   Cobre: E1.2

## Objetivo
Parecer de segurança das três atualizações de produção do PR 256 (Dependabot, grupo producao: `@fastify/swagger` 9.9.2 → 9.9.3, `fastify` 5.12.7 → 5.12.8, `@tanstack/react-query` 5.105.0 → 5.105.3), agora sem conflito com a develop (head cb440b3d6afc04a799c9824c4c20bb3a84f4313f, entrega conferida). O merge na develop só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `dependabot/npm_and_yarn/develop/producao-d435e0b6dd`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/082-conflito-pr-256.md` (inteiro, curto).
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff origin/develop...cb440b3d6afc04a799c9824c4c20bb3a84f4313f -- server/package.json web/package.json` e o trecho do `pnpm-lock.yaml` dessas três dependências e das transitivas que mudaram.

## Entregar
- "E1.2 (security-engineer): parecer de segurança das três atualizações (dependência de produção, R-SEGURANCA)." (E1.2)
- (E1) (E1.2) Foco: só as três versões mudam nos `package.json`; o que mudou de transitiva no lockfile (pacote novo, removido ou com versão maior), com origem no registro público; notas de versão e avisos de segurança conhecidos das três (fastify e @fastify/swagger: rotas e schemas expostos na API; react-query: só no web); se `osv-scanner` ou `pnpm audit` rodarem no sandbox (`registry.npmjs.org` e `api.osv.dev` em `allowed_domains`), registre o resultado; se não rodarem, registre como lacuna. Parecer em `docs/security/082-conflito-pr-256.md` gravado inteiro pela ferramenta Write (sem editar depois), com `pedido: 082-conflito-pr-256`, `branch: dependabot/npm_and_yarn/develop/producao-d435e0b6dd`, `commit: cb440b3d6afc04a799c9824c4c20bb3a84f4313f`, veredito e o bloco `## Achados` só com linhas de achado (até 300 caracteres; regra citada só pelo ID); commit só do parecer (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-sec-082.txt` e `git -C /home/rodrigoisensee/MetricasDSPD-052g commit -F` com esse caminho literal, `git -C /home/rodrigoisensee/MetricasDSPD-052g add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-052g pull --ff-only origin dependabot/npm_and_yarn/develop/producao-d435e0b6dd`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-052g branch --show-current` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/dependabot/npm_and_yarn/develop/producao-d435e0b6dd`, em primeiro plano, com o comando puro (`github.com` em `allowed_domains`); se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate; sem PR nem merge.

## Decisões e restrições
- 2026-11-07 12:01: DECISÃO DO DONO (literal): "resolva os conflitos do pr 256 os demais eu ja fiz merge". Pedido aberto (Jarvis). Recibo ao dono: vou fazer: o tech-lead faz o Dependabot refazer o PR 256 sobre a develop (ou atualiza a branch e regera o lockfile), mantendo as três versões, com a CI verde e o parecer de segurança; não vou: trocar versões, mexer em código nem mesclar outros PRs de dependência. Gatilho de segurança: dependência de produção.
- O agente não abre, lê nem edita arquivos `.env*`. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O hook do Forge recusa variáveis de shell (`$X`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. R-VERIFY: nunca `--no-verify`, `--force` nem `--admin`.
- NÃO tocar: código, `package.json`, `pnpm-lock.yaml`, outros PRs, o pedido, `KANBAN.md`, as worktrees além da 052g, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (tech-lead): resolver o conflito: primeiro pedir ao Dependabot que refaça o PR sobre a develop (comentário `@dependabot recreate` no PR 256); se ele não refizer, atualizar a branch com a develop e regerar o `pnpm-lock.yaml` com `pnpm install`, sem mudar versão além das três do PR." · etapa de outra delegação; feita
- "E1.5 (node-backend): regerar o `pnpm-lock.yaml` do merge da develop na branch do PR 256, commitar e enviar (o hook só deixa papel de dev rodar `pnpm install`; DECISÃO TÉCNICA de 12:09)." · etapa de outra delegação; feita
- "E1.3 (tech-lead): conferir a CI verde e deixar o PR pronto; o merge na develop segue o fluxo da noite." · etapa de outra delegação; continua no pedido
- "E1.4 (agile-coach): retrospectiva curta junto com as do 079 e do 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/dependabot/npm_and_yarn/develop/producao-d435e0b6dd:docs/security/082-conflito-pr-256.md` · espera: contém 'commit: cb440b3d6afc04a799c9824c4c20bb3a84f4313f'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:tech-lead
Pedido: docs/pedidos/042-forge-0-30-3-e-retomada.md
Tipo: codigo
Branch: forge/upgrade-0.30.3   Base: develop   Base-sha: e342a2cd71c46df5acf60b756637ebf5a6c84709

## Objetivo
Etapa E1.2 do pedido 042 (cartão K-140): levar ao GitHub a branch `forge/upgrade-0.30.3`, criada pelo dono com `forge-upgrade` (commit 67f57e1, só `.forge/versao` = 0.30.3), abrir o PR para a develop e dar o parecer de review. Worktree `/home/rodrigoisensee/MetricasDSPD-upgrade`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-upgrade show --stat 67f57e1`.
- `/home/rodrigoisensee/MetricasDSPD/docs/engineering/praticas.md`, seção de commits e de PR.
- CHANGELOG do Forge entre 0.28.0 e 0.30.3, só essas entradas: `git -C /home/rodrigoisensee/Forge show v0.30.3:CHANGELOG.md`, para ver se a versão pede ajuste no projeto.

## Entregar
- (E1.2) Push da branch `forge/upgrade-0.30.3` e PR para a `develop` (título `chore(forge): registra versão 0.30.3`), corpo com o resumo do que muda na fábrica entre 0.28.0 e 0.30.3 e o rodapé exigido.
- (E1.2) Parecer de review em `docs/reviews/042-forge-0-30-3.md` (frontmatter do projeto), commitado na própria branch, com `git add` explícito; ajuste de projeto pedido pelo CHANGELOG vira item do parecer (não implemente aqui).
- (E1.2) Não toque em `.forge/versao` (só o dono altera) e não mescle: o merge espera o parecer de QA.
- (E2, E3) Ambiente e fila do 041: não nesta delegação.

## Fora do escopo
- "E1.1 (dono): no terminal, na raiz do projeto: `forge-upgrade` (cria a branch `forge/upgrade-0.30.3` com o commit da versão; nada vai ao GitHub)." · feito pelo dono (67f57e1)
- "E1.3 (forge:qa-engineer): parecer de QA (CI do PR verde e `pnpm run pronto`)." · etapa de outra delegação
- "E2.1 (dono): Docker Engine no WSL (sudo; decisão A do 040), `cp .env.example .env`, Node 24 pelo nvm, `sudo` das dependências do Chromium (`pnpm exec playwright install-deps chromium`), `forge doutor` no terminal (proteção do git e branch homolog) e `/sandbox`." · do dono
- "E2.2 (forge:tech-lead): `pnpm install --frozen-lockfile` e `pnpm exec playwright install chromium`." · outra delegação, em paralelo
- "E2.3 (forge:devops-engineer): banco (db:up, db:migrate, db:seed) e consulta de prova." · etapa de outra delegação (o Docker ainda não responde a esta sessão)
- "E3.1 (forge:software-architect): E2.3 do 041 (ADR 0003, regra do F4), sem depender do ambiente." · já entregue
- "E3.2 (forge:qa-engineer, forge:devops-engineer, forge:tech-lead): o resto do 041 na ordem do pedido 041, depois do E2." · etapas de outra delegação
- "E3.3 (forge:tech-lead): PR de docs do Jarvis, PRs do dependabot (#145, #146, #147) e K-125, depois do E2." · etapa de outra delegação
- Merge, homolog, main.

## Decisões e restrições
- DECISÃO DO DONO (2026-10-27): "talvez precise atualizar algo no banco ja quetroquei de maquina" (coberto pelo E2.3: banco recriado do zero, migrações e seed).
- DECISÃO DO DONO (2026-10-27): "pode usar o poder computacional disponivl para paralelizar" (lido como: agentes em paralelo até o teto de R-TETO desta máquina; suítes de teste limitadas pela memória medida, 7 GB visíveis).
- DECISÃO DO DONO (2026-10-27): pedido de origem acima (atualizar para 0.30.3 por branch e PR para a develop; retomar a fila).
- ADR 0003 (citada no pedido): orçamento de performance; esta entrega não muda limite nem medição.
- A main é do dono (CLAUDE.md); nunca `--force` nem `--no-verify` (R-VERIFY).

## Pronto quando
- PQ-1 (push): `git ls-remote origin refs/heads/forge/upgrade-0.30.3` igual a `git -C /home/rodrigoisensee/MetricasDSPD-upgrade rev-parse HEAD`
- PQ-2 (pr): `gh pr list --head forge/upgrade-0.30.3 --base develop --json number --jq length` · espera: igual '1'
- PQ-3 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-upgrade/docs/reviews/042-forge-0-30-3.md`
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-upgrade diff e342a2cd71c46df5acf60b756637ebf5a6c84709 --name-only` · espera: linhas=2

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

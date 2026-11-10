Agente destino: forge:react-frontend
Pedido: 080-testes-instaveis-web
Tipo: codigo
Branch: feature/080-testes-instaveis-web   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: codigo   Cobre: E1.1

## Objetivo
Pedido 080 (K-173 e K-192): tirar a instabilidade de dois testes da web que já derrubaram checks sem mudança de código, sem afrouxar regra, timeout ou retry. Worktree `/home/rodrigoisensee/MetricasDSPD-056d` (HEAD destacado e limpa), branch nova `feature/080-testes-instaveis-web` a partir da develop.

## Ler
- docs/pedidos/080-testes-instaveis-web.md: só `## Escopo`, `## Fora do escopo` e `## Suposições`.
- Na worktree, depois de preparar: o teste do O20 que lê o SVG (procurar onde ele está hoje: `operacionais.test.tsx:177` era o local no 026) e `e2e/tests/operacional-lote3.spec.ts` (L3-01) com o componente do `leia-junto-o15`.

## Entregar
- "E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque)." (E1.1)
- (E1) (E1.1) Preparar a worktree: conferir `git -C /home/rodrigoisensee/MetricasDSPD-056d status --short` vazio, `git -C /home/rodrigoisensee/MetricasDSPD-056d fetch origin develop`, depois `git -C /home/rodrigoisensee/MetricasDSPD-056d switch -c feature/080-testes-instaveis-web 852b9406f019223acd82563cd21fc3a3d42a493a` e `pnpm install --frozen-lockfile` nela.
- (E1) (E1.1) K-173: confirmar se o teste do O20 ainda lê o SVG antes de a renderização terminar; se sim, fazer o teste esperar a renderização (por `findBy`/`waitFor` do Testing Library) e rodá-lo 20 vezes seguidas sem falha; se o teste já não existe ou já espera, registrar a evidência (arquivo e linha) no relatório, sem código.
- (E2) (E1.1) K-192: confirmar o alvo de toque do `leia-junto-o15` contra o axe target-size (24x24, WCAG 2.5.8) nas larguras 1280 e 375; corrigir o tamanho ou o espaçamento do alvo na tela (não a regra do axe, não o timeout, não retry); o E2E L3-01 roda localmente se o Chromium estiver disponível, senão a prova é a CI do push.
- (E1) (E1.1) eslint, `tsc -b` e os testes dos arquivos tocados com no máximo 2 workers verdes, cobertura de 100% nos arquivos tocados; teto de 150 linhas de código e teste contado pela saída literal de `git diff --numstat --no-renames 852b9406f019223acd82563cd21fc3a3d42a493a...HEAD`; commits com `Cartão: K-173` ou `Cartão: K-192` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-rf-080.txt` e `git commit -F` com esse caminho literal), `git add` explícito por caminho; conferir `git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse --abbrev-ref HEAD` = feature/080-testes-instaveis-web e enviar em primeiro plano com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/080-testes-instaveis-web`, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20 do 075); esperar a CI do push com `gh run watch <id literal> --exit-status` e relatar; sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 07:38).
- O hook do Forge recusa variáveis de shell (`$X`, `$?`, `${...}`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`; npm: `registry.npmjs.org`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: regras do axe, timeouts e retries de teste, `server/`, `packages/`, a CI, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 080." · etapa de outra delegação; continua no pedido
- K-174 e K-120 (`## Fora do escopo` do pedido).

## Pronto quando
- PQ-1 (cmd): `gh run list --repo rodrigo-isensee/MetricasDSPD --branch feature/080-testes-instaveis-web --event push --limit 1 --json conclusion` · espera: contém '"success"'
- PQ-2 (push): `git ls-remote origin refs/heads/feature/080-testes-instaveis-web` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse HEAD`)
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d diff --name-only 852b9406f019223acd82563cd21fc3a3d42a493a -- server packages .github` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

Agente destino: forge:qa-engineer
Pedido: 080-testes-instaveis-web
Tipo: codigo
Branch: feature/080-testes-instaveis-web   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: qa   Cobre: E1.3

## Objetivo
QA da E1.1 do pedido 080 (K-173 e K-192), código em 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82 (só `gap-y-1` em `LeiaJunto.tsx`; o K-173 fechou sem código), review aprovado (58b866d728b4e73815b29531156602d0998f3f3c, conferido) e revisão de interface aprovada (`docs/ux/080-revisao-leia-junto.md`, sem commit). O PR só sai depois do seu parecer. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/080-testes-instaveis-web`.

## Ler
- docs/pedidos/080-testes-instaveis-web.md: só `## Escopo` e, do `## Histórico`, as linhas da entrega, do review e da revisão de interface.
- Na worktree: `docs/reviews/080-testes-instaveis-web.md` e `docs/ux/080-revisao-leia-junto.md` (achados).

## Entregar
- "E1.3 (qa-engineer): QA." (E1.3)
- (E1) (E1.3) K-173: confirmar a evidência (o teste do O20 em `web/src/features/complementares/operacionais.test.tsx` espera a renderização antes de ler o SVG) e rodar esse arquivo 5 vezes com no máximo 2 workers.
- (E2) (E1.3) K-192: medir o alvo de toque do `leia-junto-o15` nas larguras 1280 e 375 (achado da revisão de interface) e rodar o E2E L3-01 (`e2e/tests/operacional-lote3.spec.ts`) localmente se o Chromium estiver disponível (registre quantas vezes rodou e quantas passou); se não estiver, registre e use a CI; conferir que nenhuma regra do axe, timeout ou retry mudou e que `server/`, `packages/` e `.github` não têm diferença contra a base.
- (E1) (E1.3) Escrever o parecer `docs/qa/080-testes-instaveis-web.md` pela ferramenta Write (sem editar depois, nem com sed), com `pedido: 080-testes-instaveis-web`, `branch: feature/080-testes-instaveis-web`, `commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82`, veredito e o bloco `## Achados` só com linhas de achado (achado com até 300 caracteres; regra citada só pelo ID); commit só do parecer com `Cartão: K-192` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-qa-080.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho; não incluir nem apagar `docs/ux/080-revisao-leia-junto.md`); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/080-testes-instaveis-web`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/080-testes-instaveis-web`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 08:26 deste pedido); sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 07:38).
- O hook do Forge recusa variáveis de shell (`$X`, `$?`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos e ids literais. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os pareceres de review e de interface, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque)." · etapa de outra delegação; feita
- "E1.2 (tech-lead): review." · etapa de outra delegação; feita
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." · etapa de outra delegação; feita
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/MetricasDSPD-056d/docs/qa/080-testes-instaveis-web.md`
- PQ-2 (cmd): `grep -c '^commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82' /home/rodrigoisensee/MetricasDSPD-056d/docs/qa/080-testes-instaveis-web.md` · espera: igual '1'
- PQ-3 (push): `git ls-remote origin refs/heads/feature/080-testes-instaveis-web` igual ao head local (`git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse HEAD`)

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

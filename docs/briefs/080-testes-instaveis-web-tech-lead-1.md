Agente destino: forge:tech-lead
Pedido: 080-testes-instaveis-web
Tipo: codigo
Branch: feature/080-testes-instaveis-web   Base: develop   Base-sha: 852b9406f019223acd82563cd21fc3a3d42a493a
Etapa: review   Cobre: E1.2

## Objetivo
Review da E1.1 do pedido 080 (K-173 e K-192), na ponta 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82, com a CI do push verde: o K-173 fechou sem código (o teste do O20 já espera a renderização) e o K-192 não reproduziu; a entrega só acrescenta `gap-y-1` em `LeiaJunto.tsx` como endurecimento. Worktree `/home/rodrigoisensee/MetricasDSPD-056d`, branch `feature/080-testes-instaveis-web`. A revisão de interface corre em paralelo e não toca a branch.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056d diff 852b9406f019223acd82563cd21fc3a3d42a493a...6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82`.
- docs/pedidos/080-testes-instaveis-web.md: só `## Escopo`, `## Fora do escopo` e, do `## Histórico`, a linha da entrega da E1.1.

## Entregar
- "E1.2 (tech-lead): review." (E1.2)
- (E1, E2) (E1.2) Foco: a evidência do K-173 (o teste já espera a renderização; nada a mudar) basta para fechar o cartão; o K-192 sem reprodução (72 de 72 execuções, alvos de 24 e 44 px) e o `gap-y-1` como endurecimento: aceite como está ou peça outra coisa; nenhuma regra do axe, timeout ou retry mexidos; cobertura do arquivo tocado (o autor mediu 86% só em duas pastas; a CI passou); `server/`, `packages/` e `.github` sem diff. Parecer em `docs/reviews/080-testes-instaveis-web.md` gravado inteiro pela ferramenta Write (sem editar depois), com `pedido: 080-testes-instaveis-web`, `branch: feature/080-testes-instaveis-web`, `commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82`, veredito e bloco `## Achados` só com linhas de achado (cite regra só pelo ID; achado com até 300 caracteres); commit só do parecer com `Cartão: K-192` (mensagem gravada por Write em `/tmp/claude-1000/-home-rodrigoisensee-Metricas-MetricasDSPD/73d03d2b-ba9f-4d84-b635-cabe917583a2/scratchpad/msg-tl-080.txt` e `git commit -F` com esse caminho literal, `git add` explícito pelo caminho); antes do commit, `git -C /home/rodrigoisensee/MetricasDSPD-056d pull --ff-only origin feature/080-testes-instaveis-web`; conferir `git -C /home/rodrigoisensee/MetricasDSPD-056d rev-parse --abbrev-ref HEAD` e enviar com `git -C /home/rodrigoisensee/MetricasDSPD-056d push origin HEAD:refs/heads/feature/080-testes-instaveis-web`, em primeiro plano, com o comando puro; se o rc não for 0, conferir `git ls-remote` antes de repetir; push ou pre-push com mais de 15 minutos está preso: pare e relate (o Jarvis avisa o dono e refaz; DECISÃO TÉCNICA de 2026-11-07 01:20 do 075); sem PR.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`; foi aberto pela autonomia de melhoria técnica do projeto (Histórico, 07:38).
- O hook do Forge recusa variáveis de shell (`$X`, `$?`), crases e `$(...)` em comandos com commit, push ou gh: use caminhos literais. GitHub: `github.com` e `api.github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, o pedido, `KANBAN.md`, outras worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (react-frontend): implementação de E1 e E2 num lote só (mesmo papel, arquivos de teste da web e o alvo de toque)." · etapa de outra delegação; feita
- "E1.3 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.4 (ux-designer): revisão de interface, só se o alvo de toque mudar a tela." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva do pedido 080." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056d show origin/feature/080-testes-instaveis-web:docs/reviews/080-testes-instaveis-web.md` · espera: contém 'commit: 6b7b3f5ee780e077efe3cc7bed7dfb0c3d933c82'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

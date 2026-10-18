## Objetivo
Fazer os cartões E9, E6, E7 e E8 aparecerem no painel Estratégico: falta a entrada deles no `CATALOGO_CARTOES`, que a seção "Mais métricas" usa. Você já testou o patch localmente. Continuação do E1.1 do pedido 021 (cartão K-109), na worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (4c5d6f5).

## Ler
- O seu relatório anterior: o patch do catálogo (E9 antes do E4; E6 depois do E5; seção nova com E7 e E8; E1 com E9 em `leiaJunto`) e os 7 testes de contagem afetados.
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` §4 (seções e mapa de cartões).

## Entregar
- (E1) Aplicar o patch em `packages/contratos/src/cartoes.ts` e atualizar os testes de contagem do catálogo na mesma mudança; mover as quatro de `COMPLEMENTARES_011` para `COMPLEMENTARES` em `web/src/content/catalogo-metricas.ts`, se for o caminho que o catálogo pede.
- (E1) O título da seção nova segue a especificação §4; se a especificação disser "custo" e o E7 não mostra mais custo (D2 = A), use o título da especificação e relate a divergência, sem inventar texto.
- (E1) Medir o C6 e o Lighthouse do Estratégico (ADR 0003) e rodar o E2E do Estratégico uma vez.
- (E1) Commits na branch, `git add` por caminho, push.
- Fora do escopo, etapas seguintes do pedido 021 (citadas de "## Etapas"): "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1."; "E1.3 (forge:qa-engineer): QA do front do lote 1."
- Fora do escopo: os lotes 2 e 3 do front (pedidos 025 e 026); o back (pedidos 011 e 024); o PR.

## Decisões e restrições
- Decisões do usuário (pedido 011): R-1 = B (E8 sem nomes de sistema); D2 = A (E7 sem R$, participação percentual por entregas); métricas por nível em lotes separados.
- Liberação técnica do time (2026-10-17): nesta delegação você pode tocar `packages/contratos/src/cartoes.ts` e os testes de contagem do catálogo, e só isso em `packages/`. O review do tech-lead cobre essa mudança.
- Regras invioláveis do `CLAUDE.md`. Orçamento de performance: ADR 0003.
- NÃO tocar: `server/`, o resto de `packages/` (métricas, mock e os demais contratos), `.github/`, a `main`, o diretório principal e a worktree `-011-fase2`. Sem `--no-verify`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): `pronto`, E2E e perf em sequência, com `uptime` e `free -m` antes e load abaixo de 4. Chromium no WSL: `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.

## Pronto quando
- PQ-1 (push): commit do catálogo em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `pnpm run pronto`, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `grep -c -E "E6|E7|E8|E9" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/packages/contratos/src/cartoes.ts` · espera: linhas>=1
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (C6, Lighthouse e E2E do Estratégico); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

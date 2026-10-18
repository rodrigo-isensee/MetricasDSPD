## Objetivo
Front do lote 1 do pedido 011 (estratégicas: E9, E6, E7, E8), primeiro dos 3 lotes por nível que o usuário pediu. O back dessas métricas está na develop (fase 1 no #92, lote 1 da fase 2 no #105, 1607a5f). Cartão K-109, pedido 021. Crie a worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas` com a branch `feature/011-front-estrategicas` a partir da `origin/develop` (1607a5f).

## Ler
- `docs/pedidos/021-front-do-011-por-nivel.md`.
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §3 (regras transversais), §4 (seções e mapa de cartões), §5 só E6, E7, E8 e E9, §6 (estados), §9 (microcopy) e os CAs de §10 desses quatro.
- O protótipo em `/home/rodrigoisensee/MetricasDSPD-local/prototipos/metricas-tambem-disponiveis/03-prototipo/` (só a parte do Estratégico).
- `docs/api/metricas.md`: os contratos do E6, E7, E8 e E9.
- `docs/tecnica/arquitetura-front.md` §10 (fila de montagem dos gráficos, K-102).

## Entregar
- (E1) Os cartões E9, E6, E7 e E8 no painel Estratégico, como na especificação e no protótipo, lendo a API pelo `HttpFonteMetricas` e pelo mock (`ctx.tambem = gerarExtensaoTambemMock(base)`, como o back avisou), com os estados de §6 (incluindo abaixo de 20 itens, sem estatística) e testes de componente.
- (E1) O E7 mostra a participação percentual de cada sistema pelas entregas do período (ex.: "Fluig: 23% das entregas"), com "k de n" abaixo de 20 entregas, e **nenhum valor em R$**, mesmo que a API ainda devolva os campos de custo (o back tira o R$ no pedido 024).
- (E1) O E8 mostra só a contagem de sistemas com 1 pessoa, sem nomear sistemas.
- (E1) Documentação afetada na mesma entrega; commits na branch, `git add` por caminho, push da branch.
- Fora do escopo, etapas seguintes do pedido 021 (citadas de "## Etapas"): "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1."; "E1.3 (forge:qa-engineer): QA do front do lote 1."
- Fora do escopo: os lotes 2 e 3 do front (pedidos 025 e 026); o back (pedidos 011 e 024); o PR.

## Decisões e restrições
- Decisões do usuário (pedido 011): R-1 = B (E8 sem nomes de sistema); D2 = A (E7 sem R$, participação percentual por entregas; revê a D-1' e a Q-E7-1); métricas por nível em lotes separados.
- Regras invioláveis do `CLAUDE.md`: nada de avaliação individual, nem comparação entre times; abaixo de 20 itens, sem estatística; BusinessMap e Acelerato nunca juntos. Orçamento de performance: ADR 0003 (C6 e Lighthouse do Estratégico); use a fila de montagem dos gráficos (K-102).
- NÃO tocar: `server/`, `packages/` (contratos, mock e métricas), `.github/`, a `main`, o diretório principal e a worktree `-011-fase2`. Sem `--no-verify`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): `pronto` e E2E uma vez cada, com `uptime` e `free -m` antes e load abaixo de 4. Para o Chromium abrir no WSL: `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.

## Pronto quando
- PQ-1 (push): branch `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `pnpm run pronto`, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0
- PQ-4 (cmd): `grep -r -n -F -e 'R$' -e custoPorDemanda -e custoRateado /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/web/src/features` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (C6 e Lighthouse do Estratégico); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

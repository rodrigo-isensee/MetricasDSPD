## Objetivo
Code review do front do lote 1 do pedido 011 (estratégicas: E9, E6, E7 sem R$, E8), antes do QA. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`, commits 4c5d6f5 e 919554b sobre a develop 1607a5f.

## Ler
- `docs/pedidos/021-front-do-011-por-nivel.md` (inclui a decisão técnica sobre `packages/contratos/src/cartoes.ts`).
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas diff 1607a5f..919554b`.
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: §5 do E6, E7, E8 e E9.
- `docs/engineering/praticas.md`, seções 2, 4 e 5.

## Entregar
- (E1) Review contra a especificação e as regras invioláveis. Pontos que o autor deixou: (a) a mudança em `packages/contratos/src/cartoes.ts` e `cartoes.test.ts` (liberação do time registrada no pedido); (b) os arquivos fora do brief que dependiam do catálogo: `docs/contratos/metricas/E6` a `E9` (gerados por `docs:gerar`), os E2E `complementares.spec.ts` e `lacuna-de-valor.spec.ts` e `CartaoE2.tsx`; (c) a remoção do fallback para `COM_EXTENSAO_MOCK` em `CartaoComplementar.tsx`; (d) o E7 não lê nem exibe os campos de custo (D2 = A), e o E8 não nomeia sistemas (R-1 = B).
- (E1) Parecer em `docs/reviews/011-front-estrategicas.md` (`pedido: 011-front-estrategicas`), gravado com a ferramenta Write (nunca por script), commit na branch, `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1 já feita): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)." (em paralelo a este review); "E1.3 (forge:qa-engineer): QA do front do lote 1."
- Fora do escopo: o PR (pedido a abrir depois do QA); os lotes 2 e 3 (pedidos 025 e 026).

## Decisões e restrições
- Decisões do usuário (pedido 011): R-1 = B (E8 sem nomes de sistema); D2 = A (E7 sem R$, participação percentual por entregas); métricas por nível em lotes separados.
- Regras invioláveis do `CLAUDE.md`. Orçamento de performance: ADR 0003.
- NÃO tocar: o código da branch (ajuste volta ao autor), `.github/`, a `main`, o diretório principal e as outras worktrees. Sem `--no-verify` nem `--force`.
- Teto reduzido a 2 agentes a pedido do usuário (2026-10-17): sem `pronto` local, que o autor já rodou (rc=0).

## Pronto quando
- PQ-1 (push): commit do parecer de review em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `grep -n -E "^parecer:" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/reviews/011-front-estrategicas.md` · espera: linhas=1

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ajustes ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

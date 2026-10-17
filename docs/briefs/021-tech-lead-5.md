## Objetivo
Volta 5 do review do front do lote 1 (estratégicas): o check `e2e` do PR #106 falhou no SIS-CONS-01 (catálogo com 53 linhas, teste esperava 49) e o react-frontend corrigiu a contagem no commit 59dfb37, o que desatualiza o seu parecer (volta 4, d542aa9). Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (59dfb37).

## Ler
- Na worktree: o seu parecer `docs/reviews/011-front-estrategicas.md` (volta 4).
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas diff 89b755c..59dfb37 -- e2e web packages server`.

## Entregar
- (E1) Antes, `git pull --ff-only`. Revisar o diff (só `e2e/tests/intensivo-sistemico.spec.ts`; nenhum código de produção); registrar a volta 5 no parecer (`commit:` para 59dfb37), com uma nota sobre por que o furo passou (review e QA rodaram só o spec do lote) e sobre o comentário desatualizado "49 linhas" em `web/src/features/catalogo/CatalogoPage.tsx:10` (apontado pelo react-frontend; decida se bloqueia ou fica como ressalva baixa). Grave o parecer com a ferramenta Write do começo ao fim (nunca `sed`, Edit parcial nem script), commit só do parecer, `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1, E1.2 e E1.3 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."; "E1.3 (forge:qa-engineer): QA do front do lote 1." (o QA revalida o parecer dele sobre 59dfb37 depois desta volta).
- Fora do escopo: o merge do PR #106 (pedido 028); o nome do E7 (pendente de confirmação do usuário); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não aplicar.
- R-REVIEW: o parecer de review é do tech-lead, com Write.
- NÃO tocar: o código e os testes da branch, `.github/`, a `main`, o diretório principal e as outras worktrees; o parecer do QA. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local; a CI do PR #106 roda a suíte E2E completa.

## Pronto quando
- PQ-1 (push): commit da volta 5 do review em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `grep -n -E "^commit: 59dfb37" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/reviews/011-front-estrategicas.md` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

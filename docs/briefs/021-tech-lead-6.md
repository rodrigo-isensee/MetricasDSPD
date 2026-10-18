## Objetivo
Volta 6 do review do front do lote 1 (estratégicas): o QA abriu o bug 011F-002 (IF-I01 estoura 30 s na suíte E2E completa local) e o react-frontend deu ao IF-I01 um orçamento de tempo próprio no commit 357936b, o que desatualiza o seu parecer (volta 5, 59dfb37). Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (357936b).

## Ler
- Na worktree: o seu parecer `docs/reviews/011-front-estrategicas.md` (volta 5).
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas diff 3d2ee5b..357936b -- e2e web packages server`.

## Entregar
- (E1) Revisar o diff (só `e2e/tests/intensivo-filtros.spec.ts`, `test.setTimeout(120_000)` no IF-I01, no padrão do IF-A do K-083; nenhum código de produção); registrar a volta 6 no parecer (`commit:` para 357936b). Grave o parecer com a ferramenta Write do começo ao fim (nunca `sed`, Edit parcial nem script), commit só do parecer, `git add` por caminho, e push. A worktree tem PNGs de `docs/qa/evidencias/` regenerados pela suíte E2E, sem commit: não os inclua no commit nem os altere (o QA os restaura na etapa dele).
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1, E1.2 e E1.3 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."; "E1.3 (forge:qa-engineer): QA do front do lote 1." (o QA revalida o parecer dele depois desta volta).
- Fora do escopo: o K-115 (outros testes instáveis só sob carga local); o merge do PR #106 (pedido 028); o nome do E7; os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não aplicar.
- Decisões técnicas do time (pedido 021, 2026-10-18): 011F-002 pela saída (a), orçamento de tempo próprio no IF-I01, sem skip; a instabilidade sob carga local vira o K-115, fora deste PR, e a prova da suíte completa é o check `e2e` da CI do PR #106.
- R-REVIEW: o parecer de review é do tech-lead, com Write.
- NÃO tocar: o código e os testes da branch, `docs/qa/` (inclusive as evidências), `.github/`, a `main`, o diretório principal e as outras worktrees; o parecer do QA. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local nem E2E.

## Pronto quando
- PQ-1 (push): commit da volta 6 do review em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `grep -n -E "^commit: 357936b" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/reviews/011-front-estrategicas.md` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short -- docs/reviews e2e web packages server` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

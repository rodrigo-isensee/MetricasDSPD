## Objetivo
Volta 3 do review do front do lote 1 (estratégicas): o autor corrigiu o bug 011F-001 do QA (anúncio da troca de tipo do E9 ao leitor de tela) e os seus recomendados R-4 a R-6, no commit c5e379b sobre 9465709. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- Na worktree: o seu parecer `docs/reviews/011-front-estrategicas.md` (volta 2, R-4 a R-6) e o bug `docs/qa/bugs/011F-001-troca-de-tipo-do-e9-sem-anuncio.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas diff 9465709..c5e379b`.

## Entregar
- (E1) Revisar o diff: a prop opcional `anuncio` do `SeletorLocal` (região `role="status"` e `aria-live="polite"`, só quando passada, sem mudar os outros usos), o teste novo e R-4 a R-6; registrar a volta 3 no parecer (`commit:` para c5e379b), gravado com a ferramenta Write do começo ao fim (nunca `sed` nem script), commit, `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1 e E1.2 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."; "E1.3 (forge:qa-engineer): QA do front do lote 1." (reconfere o 011F-001 depois desta).
- Fora do escopo: o PR; o nome do E7 (pendente de confirmação do usuário); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não aplicar.
- R-REVIEW: o parecer de review é do tech-lead, com Write.
- NÃO tocar: o código da branch (ajuste volta ao autor), `.github/`, a `main`, o diretório principal e as outras worktrees. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local, que o autor rodou (rc=0).

## Pronto quando
- PQ-1 (push): commit da volta 3 do review em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `grep -n -i "volta 3" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/reviews/011-front-estrategicas.md` · espera: linhas>=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ajustes ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

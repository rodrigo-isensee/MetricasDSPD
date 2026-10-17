## Objetivo
Revalidar o review do front do lote 1 (estratégicas) sobre os ajustes do autor (8d6999c), que tratam os bloqueantes B-1 e B-2 e os achados da UX; e commitar na branch os documentos de UX que ficaram sem commit (a especificação alinhada às decisões e o parecer de revisão de UX), para o QA receber tudo no mesmo commit. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- Na worktree: o seu parecer `docs/reviews/011-front-estrategicas.md` (B-1, B-2, R-1 a R-3).
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas diff 515714c..8d6999c`.
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short -- docs/ux` (os arquivos de UX sem commit).

## Entregar
- (E1) Revalidar B-1 e B-2 e conferir o diff dos ajustes (título e id da seção `concentracao-do-parque`, E9 ordenado, limite de 10 sistemas no E7, R-2 e R-3); registrar a volta 2 no parecer, gravado com a ferramenta Write; o A-4 do E6 ficou em parte (o contrato do E6 não traz a data de conclusão): diga se aceita a ordem por deslize até o back expor a data.
- (E1) Commitar, com `git add` por caminho, os arquivos de UX sem commit da worktree: `docs/ux/metricas-tambem-disponiveis/02-especificacao.md` e `docs/ux/revisao-011-front-estrategicas.md` (gravados pelo ux-designer com Write), num commit `docs(ux)` separado do parecer de review; push.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1 e E1.2 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)." (reconfere depois); "E1.3 (forge:qa-engineer): QA do front do lote 1."
- Fora do escopo: o PR; o R-1 do review (pedido 024); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B e D2 = A (pedido 011); título da seção = A (pedido 021). O nome do E7 ("Entregas por sistema") ainda depende de confirmação do usuário: não aplicar.
- R-REVIEW: o parecer de review é do tech-lead, com Write (nunca por script).
- NÃO tocar: o código da branch (ajuste volta ao autor), `.github/`, a `main`, o diretório principal e as outras worktrees. Sem `--no-verify` nem `--force`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem `pronto` local, que o autor rodou (rc=0).

## Pronto quando
- PQ-1 (push): commits da volta 2 do review e dos documentos de UX em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0
- PQ-3 (cmd): `grep -n -i "volta 2" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/reviews/011-front-estrategicas.md` · espera: linhas>=1

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ajustes ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

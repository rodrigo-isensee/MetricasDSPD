## Objetivo
Revalidar o seu parecer do front do lote 1 (estratégicas) sobre d542aa9, o commit que já contém a sua asserção nova no ET-06, para o PR sair com review e QA no mesmo commit. O `forge-check pr 011-front-estrategicas` acusa o parecer do QA como desatualizado (o teste mudou depois do `commit: 0a75f63`) e sem registro de autoria. O review já foi revalidado sobre d542aa9 (volta 4). Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- Na worktree: o seu parecer `docs/qa/011-front-estrategicas.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas log --oneline -4`.

## Entregar
- (E1) Antes, `git pull --ff-only` (o tech-lead acabou de enviar a volta 4 do review).
- (E1) Regravar o parecer inteiro com a ferramenta Write (nunca `sed`, `cp` nem script), com `commit: d542aa9` e uma nota de que d542aa9 só acrescenta a asserção do ET-06 sobre o que você testou em 0a75f63; o veredito e o `aceite_usuario: nao` não mudam; commit só do parecer, `git add` por caminho, e push; rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` e copiar a saída.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1, E1.2 e E1.4 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."
- Fora do escopo: o PR (pedido 028); o nome do E7 (pendente de confirmação do usuário); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não reprovar por isso.
- R-QA: o parecer do QA é gravado pelo QA, com Write.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal, o parecer de review e as outras worktrees. Sem `--no-verify`.

## Pronto quando
- PQ-1 (push): commit da revalidação do parecer em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `grep -n -E "^commit: d542aa9" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/qa/011-front-estrategicas.md` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

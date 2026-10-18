## Objetivo
Revalidar o seu parecer do front do lote 1 (estratégicas) depois da correção que barrou o PR #106: o check `e2e` da CI falhou no SIS-CONS-01 (`e2e/tests/intensivo-sistemico.spec.ts`, catálogo com 53 linhas, teste esperava 49), o react-frontend corrigiu a contagem em 59dfb37 e o tech-lead revisou na volta 5. O seu parecer (`commit: d542aa9`) ficou desatualizado. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- Na worktree: o seu parecer `docs/qa/011-front-estrategicas.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas diff 89b755c..origin/feature/011-front-estrategicas -- e2e web packages server`.

## Entregar
- (E1) Antes, `git pull --ff-only`. Rodar a suíte E2E completa uma vez (o furo passou porque só o spec do lote foi rodado), com `uptime` antes e load abaixo de 4; se algum teste falhar, registre o bug com passos e volte ao autor, sem corrigir código.
- (E1) Regravar o parecer inteiro com a ferramenta Write (nunca `sed`, `cp`, Edit parcial nem script), com `commit:` apontando para o commit testado e uma nota da correção do SIS-CONS-01 e do resultado da suíte completa; o `aceite_usuario: nao` não muda; commit só do parecer, `git add` por caminho, e push; rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` e copiar a saída.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1, E1.2 e E1.4 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."
- Fora do escopo: o merge do PR #106 (pedido 028); o nome do E7 (pendente de confirmação do usuário); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não reprovar por isso.
- R-QA: o parecer do QA é gravado pelo QA, com Write.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal, o parecer de review e as outras worktrees. Sem `--no-verify`.
- Pré-condição de ambiente: Chromium no WSL com `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): a suíte E2E é a única tarefa pesada desta etapa.

## Pronto quando
- PQ-1 (push): commit da revalidação do parecer em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): suíte E2E completa, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (totais da suíte, saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

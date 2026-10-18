## Objetivo
Fechar o QA do front do lote 1 (estratégicas): o react-frontend corrigiu o seu bug 011F-002 (IF-I01 com `test.setTimeout(120_000)`, commit 357936b) e o tech-lead revisou na volta 6. O seu parecer (`commit: 3d2ee5b`, `bugs_baixos: 1`) ficou desatualizado e o `forge-check pr` acusa o baixo aberto. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- Na worktree: o seu parecer `docs/qa/011-front-estrategicas.md` e o bug `docs/qa/bugs/011F-002-if-i01-estoura-30s-na-suite-completa-local.md`.
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas diff 3d2ee5b..origin/feature/011-front-estrategicas -- e2e web packages server`.
- `docs/pedidos/021-front-do-011-por-nivel.md`, seção "Decisões técnicas do time" (as duas de 2026-10-18).

## Entregar
- (E1) Antes, `git pull --ff-only` e restaurar os PNGs de `docs/qa/evidencias/` que a suíte E2E regenerou sem commit (`git checkout -- docs/qa/evidencias`; você já fez isso na rodada anterior). Se o comando for negado, pare e relate, sem contornar.
- (E1) Reteste do 011F-002: `pnpm exec playwright test tests/intensivo-filtros.spec.ts -g "IF-I01" --repeat-each=3` de `e2e/`, com `uptime` antes e load abaixo de 4. Prova da suíte completa: o check `e2e` da CI do PR #106 sobre 357936b ou depois (`gh pr checks 106`); se ainda estiver rodando, espere; se vermelho, registre e pare.
- (E1) Fechar o 011F-002 no arquivo do bug; regravar o parecer inteiro com a ferramenta Write (nunca `sed`, `cp`, Edit parcial nem script), `commit:` apontando para o commit testado, `bugs_baixos: 0` se fechou, `aceite_usuario: nao` (só muda com aceite do usuário), nota do K-115 (IF-U-operacional e CA-19 axe instáveis só sob carga local, pré-existentes, fora deste PR pela decisão técnica); commit só do parecer e do bug, `git add` por caminho, e push; rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` e copiar a saída.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1, E1.2 e E1.4 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."
- Fora do escopo: o K-115; o merge do PR #106 (pedido 028); o nome do E7; os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não reprovar por isso.
- Decisões técnicas do time (pedido 021, 2026-10-18): 011F-002 pela saída (a), sem pedir aceite do usuário; instabilidade sob carga local no K-115; a prova da suíte completa é o check `e2e` da CI do PR #106.
- R-QA: o parecer do QA é gravado pelo QA, com Write.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal, o parecer de review e as outras worktrees. Sem `--no-verify`.
- Pré-condição de ambiente: Chromium no WSL com `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): sem a suíte E2E completa local.

## Pronto quando
- PQ-1 (push): commit do parecer e do bug fechado em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `pnpm exec playwright test tests/intensivo-filtros.spec.ts -g "IF-I01" --repeat-each=3`, de `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/e2e` · espera: rc=0
- PQ-3 (cmd): `gh pr checks 106` · espera: contém 'e2e	pass'
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (reteste, check da CI, saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

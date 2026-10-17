## Objetivo
Revalidar o seu parecer do front do lote 1 (estratégicas) depois que o tech-lead trouxe a develop (com os lotes 2 e 3 do back, #107 e #109) para a branch do PR #108 e revisou o merge (volta 7). O seu parecer (`commit: 79c3df5`) ficou anterior ao novo head. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- Na worktree: o seu parecer `docs/qa/011-front-estrategicas.md`.
- `docs/pedidos/028-pr-do-front-estrategicas.md`, seção "Decisões técnicas do time".
- `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas log --oneline -4` (o merge e a volta 7).

## Entregar
- (E1) Antes, `git pull --ff-only`. Prova da suíte completa sobre o novo head: o check `e2e` da CI do PR #108 (`gh pr checks 108`); se ainda estiver rodando, espere; se vermelho, registre o bug com passos e pare, sem corrigir código. Localmente, só o `estrategico-011-lote1.spec.ts` (`pnpm exec playwright test tests/estrategico-011-lote1.spec.ts` de `e2e/`), com `uptime` antes e load abaixo de 4; restaure os PNGs de `docs/qa/evidencias/` que o E2E regenerar (`git checkout -- docs/qa/evidencias`; se for negado, pare e relate).
- (E1) Regravar o parecer inteiro com a ferramenta Write (nunca `sed`, `cp`, Edit parcial nem script), `commit:` apontando para o commit testado, com uma nota do merge da develop; `aceite_usuario: nao`; commit só do parecer, `git add` por caminho, e push; rodar `forge-check pr 011-front-estrategicas --ref feature/011-front-estrategicas` e copiar a saída.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1, E1.2 e E1.4 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."
- Fora do escopo: o merge do PR #108 (pedido 028); o pedido 024; o nome do E7; o K-115; os lotes 2 e 3 do front.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não reprovar por isso.
- Decisões técnicas do time: a prova da suíte completa é o check `e2e` da CI do PR (pedido 021); instabilidade sob carga local no K-115; ordem de merge #109 → atualizar o #108 → merge do #108 → 024 (pedido 028).
- R-QA: o parecer do QA é gravado pelo QA, com Write.
- NÃO tocar: código, testes, `.github/`, a `main`, o diretório principal, o parecer de review e as outras worktrees. Sem `--no-verify`.
- Pré-condição de ambiente: Chromium no WSL com `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.
- Teto: 2 agentes de dia e 3 à noite (agora, noite: 3), uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só o spec do lote local.

## Pronto quando
- PQ-1 (push): commit da revalidação do parecer em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `gh pr checks 108` · espera: contém 'e2e	pass'
- PQ-3 (cmd): `pnpm exec playwright test tests/estrategico-011-lote1.spec.ts`, de `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/e2e` · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (veredito); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (check da CI, spec local, saída do `forge-check pr`); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

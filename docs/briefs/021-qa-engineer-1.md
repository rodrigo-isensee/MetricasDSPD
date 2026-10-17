## Objetivo
QA do front do lote 1 do pedido 011 (estratégicas: E9, E6, E7 sem R$, E8), portão obrigatório antes do PR (R-QA). Review aprovado (volta 2, ae3ea92) e UX aprovada com ressalvas baixas (reconferência). Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas`.

## Ler
- `docs/pedidos/021-front-do-011-por-nivel.md`.
- `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`: os CAs de §10 do E6, E7, E8 e E9 (incluindo os novos CA-46 e as revogações CA-18, CA-25 e CA-35).
- Na worktree: `docs/reviews/011-front-estrategicas.md` (volta 2) e `docs/ux/revisao-011-front-estrategicas.md` (seção 9, Reconferência, e os itens "verificar no navegador").

## Entregar
- (E1) Antes de testar, commitar a seção de reconferência da UX que ficou sem commit (`docs/ux/revisao-011-front-estrategicas.md`, gravada pelo ux-designer), com `git add` por caminho, num commit `docs(ux)` próprio, e push (decisão técnica registrada no pedido 021: quem roda a etapa seguinte commita os arquivos de UX).
- (E1) QA do lote: `pnpm run pronto`; os E2E do Estratégico (incluindo axe); os CAs do E6, E7, E8 e E9 da especificação; o E7 sem nenhum valor em R$ e o E8 sem nome de sistema; os itens que a UX deixou para o navegador (foco visível e aria-live do seletor do E9, reflow a 360 px, `aria-hidden` do ícone `info`); o perf do `/estrategico` (C6 e Lighthouse, ADR 0003).
- (E1) Parecer em `docs/qa/011-front-estrategicas.md` (`pedido: 011-front-estrategicas`), gravado com a ferramenta Write (nunca por script), commit na branch, `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.1, E1.2 e E1.4 já feitas): "E1.1 (forge:react-frontend): front do lote 1 numa branch a partir da develop."; "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."
- Fora do escopo: corrigir código (bug volta ao autor); o nome do E7, que depende do usuário; o PR; os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 (E8 sem nomes) e D2 = A (E7 sem R$, participação percentual) (pedido 011); título da seção = A (pedido 021); "Renomear o E7 = sim" (pedido 021, leitura do Jarvis da resposta "E3 pode renomear", a confirmar com o usuário): até a confirmação, o E7 mantém o nome da especificação e o QA não reprova por isso.
- Regras invioláveis do `CLAUDE.md`: abaixo de 20 itens, sem estatística; nada de pessoa. Orçamento de performance: ADR 0003. R-QA: no máximo 3 voltas por bug.
- NÃO tocar: `web/src`, `server/`, `packages/` (só testes E2E, se precisar), `.github/`, a `main`, o diretório principal e as outras worktrees. Sem `--no-verify`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário). O node-backend roda o `pronto` na worktree `-011-fase2`: espere ele terminar antes do seu `pronto`, do E2E e do perf, e confira `uptime` e `free -m` (load abaixo de 4). Chromium no WSL: `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`. Os E2E reescrevem evidências em `docs/qa/evidencias/`: restaure com `git checkout` o que não for do seu parecer.

## Pronto quando
- PQ-1 (push): commits do parecer do QA e da reconferência da UX em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `pnpm run pronto`, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `grep -n -E "^parecer:" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/docs/qa/011-front-estrategicas.md` · espera: linhas=1
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado (aprovado, aprovado com ressalvas ou reprovado); o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (rc do pronto, E2E, CAs, C6 e Lighthouse); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

## Objetivo
Corrigir o bug baixo 011F-001 do QA do front do lote 1 (estratégicas): a troca de tipo do E9 não é anunciada ao leitor de tela. Corrigir agora evita deixar um bug aberto à espera do aceite do usuário. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (9465709).

## Ler
- Na worktree: `docs/qa/bugs/011F-001-troca-de-tipo-do-e9-sem-anuncio.md` e o parecer `docs/qa/011-front-estrategicas.md` (riscos).
- O `SeletorLocal` (componente compartilhado) e o E9 em `web/src/features/complementares/estrategicas.tsx`.

## Entregar
- (E1) Anunciar a troca de tipo do E9 ao leitor de tela (região `aria-live` educada ou o padrão de abas com `tabpanel`, o que o componente compartilhado comportar sem mudar o comportamento dos outros usos), com teste de componente; conferir que os outros usos do `SeletorLocal` continuam iguais.
- (E1) Os recomendados baixos R-4 a R-6 da volta 2 do review, se forem só comentário, texto ou docs (`docs/api/metricas.md:157` com o título novo da seção).
- (E1) `pnpm run pronto` verde e o E2E `estrategico-011-lote1.spec.ts` uma vez; commits por assunto, `git add` por caminho, push.
- Fora do escopo, etapas seguintes do pedido 021 (citadas de "## Etapas"): "E1.4 (forge:tech-lead): code review do front do lote 1." (revalida o diff); "E1.3 (forge:qa-engineer): QA do front do lote 1." (reconfere o 011F-001 e corrige o `aceite_usuario` do parecer); "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."
- Fora do escopo: o nome do E7 (depende do usuário); a tabela inline do CA-16 (decisão da UX); os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não aplicar.
- Regras invioláveis do `CLAUDE.md`. Orçamento de performance: ADR 0003.
- NÃO tocar: `server/`, `packages/` (exceto `packages/contratos/src/cartoes.ts` e os testes de contagem do catálogo, pela decisão técnica do pedido 021, se precisar), `.github/`, a `main`, o diretório principal, os pareceres de review, QA e UX e as outras worktrees. Sem `--no-verify`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário). O node-backend roda o `pronto` na worktree `-011-fase2`: espere ele terminar, e confira `uptime` e `free -m` (load abaixo de 4). Chromium no WSL: `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.

## Pronto quando
- PQ-1 (push): commit da correção do 011F-001 em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `pnpm run pronto`, da raiz da worktree · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência; riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

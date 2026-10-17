## Objetivo
Corrigir o bug 011F-002 que trava o PR #106 (front do lote 1, estratégicas): o IF-I01 de `e2e/tests/intensivo-filtros.spec.ts` estoura o teto de 30 s (clique em `prioridade-opcao-p5`) na suíte E2E completa local, 3 de 3 com workers padrão; sozinho passa em 15,5 s, e a CI em 3d2ee5b passou. É pré-existente, mas o parecer do QA não fecha com ele aberto. Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (3330f03).

## Ler
- `docs/qa/bugs/011F-002-if-i01-estoura-30s-na-suite-completa-local.md` (na worktree).
- `e2e/tests/intensivo-filtros.spec.ts`: o IF-I01 e o IF-A (linha 410, `test.setTimeout(120_000)`, o padrão do K-083).

## Entregar
- (E1) Dar ao IF-I01 um orçamento de tempo próprio, no mesmo padrão do IF-A (`test.setTimeout`), sem `skip`, sem afrouxar asserção e sem mexer em outros testes; se achar uma espera fixa ou um seletor lento que seja a causa, corrija só isso no teste e relate.
- (E1) Rodar o `intensivo-filtros.spec.ts` inteiro com os workers padrão, com `uptime` antes (load abaixo de 4), e o IF-I01 com `--repeat-each=3`; commit só do teste, `git add` por caminho, e push.
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.2, E1.3 e E1.4 já feitas, e voltam depois desta correção para revalidar): "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."; "E1.3 (forge:qa-engineer): QA do front do lote 1."
- Fora do escopo: fechar o bug e o parecer do QA (são do QA); o comentário "49 linhas" em `CatalogoPage.tsx` (ressalva baixa do review, fica para o próximo toque); o merge do PR #106 (pedido 028); o nome do E7; os lotes 2 e 3.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não aplicar.
- Decisão técnica do time (pedido 021, 2026-10-18): 011F-002 pela saída (a), orçamento de tempo próprio para o IF-I01 nesta branch, sem skip; não pede aceite do usuário.
- NÃO tocar: código de produção (`web/src`, `server/`, `packages/`, inclusive `packages/contratos/src/cartoes.ts`, liberado pela decisão técnica de 2026-10-17 só para os cartões do lote e sem relação com este bug), os pareceres e os bugs em `docs/`, `.github/`, a `main`, o diretório principal e as outras worktrees. Sem `--no-verify` nem `--force`.
- Pré-condição de ambiente: Chromium no WSL com `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): só esse spec, sem a suíte completa.

## Pronto quando
- PQ-1 (push): commit da correção do IF-I01 em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `pnpm run e2e -- tests/intensivo-filtros.spec.ts`, da raiz da worktree (workers padrão) · espera: rc=0
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (totais do spec e do repeat-each, sha); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

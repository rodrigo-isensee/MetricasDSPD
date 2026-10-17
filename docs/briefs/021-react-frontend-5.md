## Objetivo
Corrigir o furo que barrou o PR #106 (front do lote 1, estratégicas): o check `e2e` da CI (run 38994292634) falhou de forma determinística no SIS-CONS-01, `e2e/tests/intensivo-sistemico.spec.ts:70`, que espera `toHaveLength(49)` e recebe 53, porque a branch acrescentou E6 a E9 ao `CATALOGO_CARTOES` sem atualizar essa contagem (o título do teste ainda diz "46 linhas"). Cartão K-109, pedido 021. Worktree `/home/rodrigoisensee/MetricasDSPD-011-front-estrategicas`, branch `feature/011-front-estrategicas` (89b755c).

## Ler
- `e2e/tests/intensivo-sistemico.spec.ts`, o bloco do SIS-CONS-01 (em volta da linha 70).
- `packages/contratos/src/cartoes.ts`: as entradas E6 a E9 que você acrescentou.

## Entregar
- (E1) Confirmar que cada uma das 53 linhas do catálogo leva a um cartão existente e atualizar o SIS-CONS-01 para 53, com o título coerente; procurar com `grep -rn "toHaveLength(49)\|46 linhas\|49 linhas" e2e web packages` outras contagens do catálogo que a entrega também deixou para trás e corrigir só as do catálogo.
- (E1) Rodar o spec afetado localmente (`intensivo-sistemico.spec.ts`) e o `estrategico-011-lote1.spec.ts`; commit só do teste, `git add` por caminho, e push na branch (o PR #106 já está aberto e precisa do commit no origin para a CI rodar de novo).
- Fora do escopo, outras etapas do pedido 021 (citadas de "## Etapas"; E1.2, E1.3 e E1.4 já feitas, e voltam depois desta correção para revalidar): "E1.4 (forge:tech-lead): code review do front do lote 1."; "E1.2 (forge:ux-designer): revisão da interface implementada do lote 1 (inclui propor o título da seção nova, que fala em custo, e o E7 não mostra mais custo pela D2 = A)."; "E1.3 (forge:qa-engineer): QA do front do lote 1."
- Fora do escopo: o merge do PR (pedido 028); o nome do E7 (pendente de confirmação do usuário); os lotes 2 e 3 do front.

## Decisões e restrições
- Decisões do usuário: R-1 = B de 2026-10-16 e D2 = A (pedido 011); título da seção = A (pedido 021); renomear o E7 está pendente de confirmação do usuário (pedido 021): não aplicar.
- Decisão técnica do time (pedido 021, 2026-10-17): o react-frontend pode tocar `packages/contratos/src/cartoes.ts` e os testes de contagem do catálogo, e só isso em `packages/`.
- NÃO tocar: código de produção (`web/src`, `server/`, `packages/` fora dos testes de contagem), os pareceres em `docs/`, `.github/`, a `main`, o diretório principal e as outras worktrees. Sem `--no-verify` nem `--force`.
- Pré-condição de ambiente: Chromium no WSL com `LD_LIBRARY_PATH=/home/rodrigoisensee/.local/chromium-libs/root/usr/lib/x86_64-linux-gnu`.
- Teto: no máximo 3 agentes e uma tarefa pesada por vez (pedido do usuário): só os dois specs, sem `pronto` completo; `uptime` antes, load abaixo de 4.

## Pronto quando
- PQ-1 (push): commit da correção do teste em `feature/011-front-estrategicas` no origin.
- PQ-2 (cmd): `grep -n "toHaveLength(53)" /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas/e2e/tests/intensivo-sistemico.spec.ts` · espera: linhas>=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-011-front-estrategicas status --short` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída dos dois specs, sha); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

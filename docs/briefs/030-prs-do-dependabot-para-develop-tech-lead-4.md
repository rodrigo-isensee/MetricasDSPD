Agente destino: forge:tech-lead
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: dependabot/npm_and_yarn/dev-dependencies-b7fd4cc0f7 e dependabot/npm_and_yarn/react-router-8.4.0 (ato só no GitHub)   Base: develop   Base-sha: 93b2ab1b815baaa2980f57632553f99bdcfed3a2

## Objetivo
Destravar o conflito dos PRs do Dependabot #110 e #112 com a `develop`: o `@dependabot rebase` foi recusado (as branches têm um merge manual), e o dono escolheu a opção A, `@dependabot recreate`. Etapa E3.2 do pedido 030. Ato só no GitHub, a partir de `/home/rodrigoisensee/MetricasDSPD`, sem worktree.

## Ler
- `docs/pedidos/030-prs-do-dependabot-para-develop.md` (Etapas e as últimas linhas de Andamento).

## Entregar
- (E3) Comentar `@dependabot recreate` nos PRs #110 e #112 (`gh pr comment <n> --body '@dependabot recreate'`), para o Dependabot refazer cada branch do zero sobre a `develop`, descartando o merge manual (decisão do dono).
- (E3) Aguardar o Dependabot (confira com `gh pr view <n> --json mergeable,mergeStateStatus,headRefOid` a cada poucos minutos, até cerca de 20 min) e relatar o estado final e o novo head de cada PR. Se o Dependabot recusar, fechar o PR ou o conflito continuar, relate a mensagem dele e pare; não edite a branch à mão.

## Fora do escopo
- "E3.1 (forge:tech-lead): comentar `@dependabot rebase` nos PRs #110 e #112 e conferir que ficam sem conflito; sem mesclar e sem editar a branch do Dependabot à mão." · etapa de outro momento, já feita (recusada pelo Dependabot).
- "E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar." · etapa de outro momento, já feita em 2026-10-17.
- "E2.3 (forge:tech-lead): review.", "E2.4 (forge:qa-engineer): QA." e "E2.5 (forge:tech-lead): PR para a develop, mesclado." · etapas de outro momento do pedido 030, sobre a branch `feature/030-dependabot-develop`.
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono.
- Mesclar, aprovar ou avaliar o conteúdo das atualizações (o #112 é versão maior do react-router); commitar ou fazer push nas branches do Dependabot; fechar PRs; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "estou com duas branchs com conflito resolva".
- DECISÃO DO DONO (pedido 030, 2026-10-17): opção A (`@dependabot recreate` nos #110 e #112; o merge manual das branches é descartado).
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: nada na `main`. R-VERIFY: sem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Se o `gh pr comment` falhar no cliente por falta de escopo do token, pode usar `gh api repos/rodrigo-isensee/MetricasDSPD/issues/<n>/comments -f body='@dependabot recreate'`; se o GitHub recusar, pare e relate.

## Pronto quando
- PQ-1 (cmd): `gh pr view 110 --json mergeable -q .mergeable` · espera: igual 'MERGEABLE'
- PQ-2 (cmd): `gh pr view 112 --json mergeable -q .mergeable` · espera: igual 'MERGEABLE'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (links dos comentários, novos heads dos PRs); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

Agente destino: forge:tech-lead
Pedido: docs/pedidos/023-pr-do-lote3-operacionais-011.md
Branch: homolog   Base: main   Base-sha: e24f9b71a6fe8583ebc7ec4129105f9b9af2a58f

## Objetivo
Deixar pronto para o dono o PR de release `homolog` → `main`, sem mesclar: a homolog recebeu a promoção #116 (merge commit 087a220bffd488d28765422a7cbc1cf40e9ecba2) e o portão da homologação está verde (run 39056114632). Pedido do usuário de 2026-10-17: "deixa o pr pronto para mim fazer para main". Etapa E1.6 do pedido 023. Sem worktree: só `gh`, a partir de `/home/rodrigoisensee/MetricasDSPD`.

## Ler
- `docs/pedidos/023-pr-do-lote3-operacionais-011.md` (Etapas e Andamento).
- `docs/engineering/fluxo-homologacao.md`, a parte do PR de release homolog → main e do check `homolog-aprovada`.
- `git log --oneline origin/main..origin/homolog`.

## Entregar
- (E1) Abrir o PR `homolog` → `main` com o corpo: o que entra (#102, #103, #105, #107, #108, #109, #114, #115 e a promoção #116, uma linha cada), o link do portão verde, o que mudou na interface para validar à mão (os cartões E9, E6, E7 e E8 no Estratégico; o E7 sem R$ e com o nome "Entregas por sistema"; a visão semanal mais leve) e as linhas de atribuição da sessão. Não mesclar, não aprovar, não usar `--admin`.
- (E1) Esperar os checks do PR terminarem (inclusive `homolog-aprovada`) e relatar o estado de cada um; vermelho por ruído só se rerroda uma vez; vermelho de verdade: relate, sem mexer no código.

## Fora do escopo
- "E1.2 (dono): merge do release homolog → main." · etapa do dono.
- Mesclar o PR; o PR #113; os PRs do Dependabot; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica"; para esta promoção vale a tabela de etapas da fábrica (opção B).
- Pedido do usuário (2026-10-17, pedido 030): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main".
- R-MAIN: a `main` é do dono; o PR de release só ele mescla. R-VERIFY: sem `--no-verify` nem `--force`; sem `--admin`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado; só `gh`.

## Pronto quando
- PQ-1 (pr): PR `homolog` → `main` aberto e não mesclado.
- PQ-2 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state open --base main --head homolog --json number --jq length` · espera: igual '1'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (número do PR, estado de cada check); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

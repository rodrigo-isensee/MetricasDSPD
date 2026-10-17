Agente destino: forge:tech-lead
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: develop   Base: develop   Base-sha: 0cad9f3c66c072bbf9f488c166a8ca796cc4d720

## Objetivo
Tirar da `main` os três PRs abertos do Dependabot (#110, #111, #112), trocando a base para `develop`, porque o processo do projeto não aceita PR de trabalho direto para a `main` (pedido do usuário de 2026-10-17). Etapa E1.1 do pedido 030. Sem worktree: só `gh`, a partir de `/home/rodrigoisensee/MetricasDSPD`. Outra instância do tech-lead está com a promoção develop → homolog; não mexa nela.

## Ler
- `docs/pedidos/030-prs-do-dependabot-para-develop.md` (Escopo e Etapas).
- `gh pr view 110 --json baseRefName,headRefName,mergeStateStatus` (e o mesmo para 111 e 112).

## Entregar
- (E1) `gh pr edit 110 --base develop`, `gh pr edit 111 --base develop` e `gh pr edit 112 --base develop`; sem mesclar, aprovar, fechar ou atualizar as branches. Se o GitHub recusar a troca, pare e relate a mensagem.
- (E1) Comentar em cada um dos três PRs: "Base trocada para develop pelo time (pedido 030): neste projeto nenhum PR de trabalho vai direto para a main; a atualização passa por develop → homolog → main."

## Fora do escopo
- "E2.1 (forge:devops-engineer): `target-branch: develop` no `.github/dependabot.yml`, numa branch `feature/030-dependabot-develop`, com parecer em `docs/devops/`." · etapa de outro papel.
- "E2.2 (forge:security-engineer): parecer de segurança da mudança em `docs/security/`." e "E2.4 (forge:qa-engineer): QA." · etapas de outro papel.
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono.
- Avaliar ou mesclar as atualizações de dependência; o PR de promoção develop → homolog; o PR #113; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: nada na `main`. R-FLUXO: nada pula degrau. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): nada pesado; só chamadas `gh`.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state open --base main --json number --jq length` · espera: igual '0'
- PQ-2 (cmd): `gh pr view 112 --repo rodrigo-isensee/MetricasDSPD --json baseRefName --jq .baseRefName` · espera: igual 'develop'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída dos `gh pr edit` e das consultas); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

Agente destino: forge:tech-lead
Pedido: docs/pedidos/030-prs-do-dependabot-para-develop.md
Branch: feature/030-dependabot-develop   Base: develop   Base-sha: 0cad9f3c66c072bbf9f488c166a8ca796cc4d720

## Objetivo
Enviar a branch `feature/030-dependabot-develop` (head 523372c3777ac254aae7d1b4e13e1dc36c068585, com o `target-branch: develop` no `.github/dependabot.yml` e o parecer de devops), que o devops commitou mas não conseguiu enviar: o pre-push precisa das dependências e o hook de conformidade não deixa o devops rodar `pnpm install`. Conclui o push da etapa E2.1 do pedido 030. Worktree `/home/rodrigoisensee/MetricasDSPD-030`. Outra instância do tech-lead está com a promoção develop → homolog; não mexa nela.

## Ler
- `docs/pedidos/030-prs-do-dependabot-para-develop.md`, a última linha de "Andamento".

## Entregar
- (E2) Na worktree, `pnpm install --frozen-lockfile` (sem mudar `package.json` nem `pnpm-lock.yaml`) e `git push origin feature/030-dependabot-develop`, deixando o pre-push rodar lint e typecheck. Sem novo commit.

## Fora do escopo
- "E1.1 (forge:tech-lead): trocar a base dos PRs #110, #111 e #112 para `develop` (`gh pr edit <n> --base develop`), sem mesclar." · já feita (os três PRs estão com base `develop`); nada a fazer aqui.
- "E2.2 (forge:security-engineer): parecer de segurança da mudança em `docs/security/`." e "E2.4 (forge:qa-engineer): QA." · etapas de outro papel; vêm depois.
- "E2.3 (forge:tech-lead): review." e "E2.5 (forge:tech-lead): PR para a develop, mesclado." · vêm depois, por outros briefs.
- "E2.6 (dono): a mudança só vale para o Dependabot quando chegar à `main` (ele lê a configuração da branch padrão); entra na próxima release homolog → main, que é do dono." · etapa do dono.
- Mudar o yml ou o parecer; abrir PR; o PR de promoção; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 030, 2026-10-17): "segundo processo voce sempre leva pra develop, depois joga a develop da homolog e depois deixa o pr pronto para mim fazer para main. Corrija tudo".
- Decisão técnica do Jarvis (pedido 030, 2026-10-17): o tech-lead instala as dependências e envia, porque o devops não pode rodar `pnpm install`.
- R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; se o pre-push falhar por outro motivo, pare e relate a saída. R-MAIN: nada na `main`.
- NÃO tocar: o diretório principal, as worktrees `-011-fase2` e `-023`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): o `pnpm install` é a única tarefa pesada deste momento.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-030 ls-remote origin refs/heads/feature/030-dependabot-develop` igual a 523372c3777ac254aae7d1b4e13e1dc36c068585.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-030 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do pre-push, ls-remote); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

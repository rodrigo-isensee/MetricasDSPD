Agente destino: forge:tech-lead
Pedido: docs/pedidos/033-refazer-atualizacoes-do-dependabot.md
Branch: dependabot/npm_and_yarn/react-router-8.4.0 e dependabot/npm_and_yarn/dev-dependencies-9563116876 (ato só no GitHub e tags)   Base: develop   Base-sha: 00a634f6774120e314b9edf36c4efd3711183a35

## Objetivo
Arquivar os dois PRs do Dependabot em conflito com a `main` (#112, react-router 8, e #120, dev-dependencies), pelo pedido do usuário de 2026-10-17: "arquive e faca de novo para nao ter conflitos". Etapa E1.1 do pedido 033. A partir de `/home/rodrigoisensee/MetricasDSPD`, sem worktree.

## Ler
- `docs/pedidos/033-refazer-atualizacoes-do-dependabot.md` (Escopo, Etapas e Andamento).

## Entregar
- (E1) Para cada PR: `git fetch origin <branch>` e criar a tag anotada `arquivo/<branch>` no head atual do PR (#112: `dependabot/npm_and_yarn/react-router-8.4.0`, head esperado 4c0a77309c9160873ee806f1f75f621fcb48d661; #120: `dependabot/npm_and_yarn/dev-dependencies-9563116876`, head esperado 6e9791616d68bcc4f92e41742ff0406957b549a5), com a mensagem `arquivado a pedido do dono (pedido 033)`, e enviar as duas tags (`git push origin refs/tags/arquivo/<branch>`).
- (E1) Fechar os PRs #112 e #120 com um comentário curto (`gh pr close <n> --comment 'Arquivado em arquivo/<branch> (pedido 033); a atualização será refeita a partir da develop.'`). Se o fechamento for negado no cliente ou pelo GitHub, pare e relate; não contorne.

## Fora do escopo
- "E2.1 (forge:node-backend): as cinco correções de dev-dependencies na `feature/033-deps-dev`, com `pnpm run pronto` verde.", "E2.2 (forge:security-engineer): parecer de segurança (dependência nova, R-SEGURANCA).", "E2.4 (forge:qa-engineer): QA." · etapas de outro papel; vêm depois.
- "E2.3 (forge:tech-lead): review." e "E2.5 (forge:tech-lead): PR para a develop, mesclado." · etapas do mesmo papel em outro momento (depois do E2.1 e do E2.2), citadas literalmente de `## Etapas`; nada do E2 é cortado: vem em briefs próprios.
- Apagar as branches do Dependabot à mão (o Dependabot apaga a branch ao fechar o PR); mesclar qualquer coisa; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- Pedido do usuário (pedido 033, 2026-10-17): "arquive e faca de novo para nao ter conflitos".
- DECISÃO DO DONO (pedido 033, 2026-10-17): opção B (só as dev-dependencies agora; o react-router 8 vira cartão próprio). Recibo aceito.
- DECISÃO DO DONO (pedido 033, 2026-10-17): opção B (só as 6 correções agora: vitest, @vitest/coverage-v8, typescript-eslint, @testing-library/user-event, @playwright/test; eslint 10 com @eslint/js 10 e TypeScript 7 viram cartões próprios).
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica".
- R-MAIN: nada na `main`. R-VERIFY: sem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD ls-remote --tags origin refs/tags/arquivo/dependabot/npm_and_yarn/react-router-8.4.0 refs/tags/arquivo/dependabot/npm_and_yarn/dev-dependencies-9563116876` · espera: linhas=2
- PQ-2 (cmd): `gh pr view 112 --json state -q .state` · espera: igual 'CLOSED'
- PQ-3 (cmd): `gh pr view 120 --json state -q .state` · espera: igual 'CLOSED'

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (tags e heads arquivados, links dos comentários); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

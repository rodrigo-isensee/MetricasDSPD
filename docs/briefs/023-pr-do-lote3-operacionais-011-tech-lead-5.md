Agente destino: forge:tech-lead
Pedido: docs/pedidos/023-pr-do-lote3-operacionais-011.md
Branch: docs/023-pareceres-promocao   Base: develop   Base-sha: ed6ba46f39ed98fa76972c9fffe12c982f223e7f

## Objetivo
Enviar a branch `docs/023-pareceres-promocao` com o seu parecer de review da promoção (2a696559edc6eef36b79c1bc282e3cf0956f73f2), que o pre-push barrou porque a worktree `/home/rodrigoisensee/MetricasDSPD-023` não tem as dependências instaladas. Conclui a etapa E1.3 do pedido 023 (o push que faltou).

## Ler
- `docs/pedidos/023-pr-do-lote3-operacionais-011.md`, a última linha de "Andamento" (a decisão técnica do push).

## Entregar
- (E1) Na worktree, `pnpm install --frozen-lockfile` (usa o cache local do pnpm; sem mudar `package.json` nem `pnpm-lock.yaml`), depois `git push -u origin docs/023-pareceres-promocao`, deixando o pre-push rodar lint e typecheck.

## Fora do escopo
- "E1.4 (forge:qa-engineer): parecer de QA da promoção em `docs/qa/023-pr-do-lote3-operacionais-011.md`, na mesma branch, com a CI da develop como prova" · etapa de outro papel; vem depois.
- "E1.5 (forge:tech-lead): PR só de documentação dos dois pareceres para a develop (squash), antes do PR de promoção" e "E1.1 (forge:tech-lead): PR do lote 3 (operacionais), mesclado na develop, e promoção para a homolog." · vêm depois, por outro brief.
- "E1.2 (dono): merge do release homolog → main." · etapa do dono.
- Novo commit, mudar o parecer, abrir PR, rodar `pronto` ou E2E; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 023, 2026-10-17): "A regra do projeto nunca passa sobre a fábrica"; para esta promoção vale a tabela de etapas da fábrica (opção B).
- Decisão técnica do Jarvis (pedido 023, 2026-10-17): instalar as dependências na worktree e reenviar; empurrar de outro diretório está vetado (o hook checaria outra árvore).
- R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; se o pre-push falhar por outro motivo, pare e relate a saída. R-MAIN: nada na `main`.
- NÃO tocar: o diretório principal, a worktree `-011-fase2`, `.github/`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): o `pnpm install` é a única tarefa pesada deste momento.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-023 ls-remote origin refs/heads/docs/023-pareceres-promocao` igual a 2a696559edc6eef36b79c1bc282e3cf0956f73f2.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-023 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (saída do pre-push, ls-remote); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

# Estado em 2026-10-21 (noite): pausa para atualizar o Forge para a 0.28.0

Pedido do dono: atualizar o Forge para a 0.28.0 e reabrir o Jarvis na versão nova. Deixar terminar os agentes que estão rodando, sem lançar outros, e salvar o trabalho.

## Agentes que ficaram rodando na pausa (resultado ainda não conferido)
- **037, `forge:qa-engineer`** (brief `docs/briefs/037-pr-131-release-com-falhas-qa-engineer-7.md`, aprovado na rodada 3, sha256 02b509c5eeff5180181265a1ac9532bc82ba402cffc9fdd44471a89cc25e7e2f). Worktree `/home/rodrigoisensee/MetricasDSPD-037`, head antes do agente: 7700366. Entrega esperada: as 4 specs e a paridade do Worker no head, parecer de QA aprovado com `commit: 35bfd72`, gravado com Write/Edit, `pronto` uma vez, um commit e push.
- **025, `forge:qa-engineer`** (brief `docs/briefs/025-front-do-011-lote2-qa-engineer-4.md`, aprovado na rodada 3, sha256 87c15f9a9bb5ba86b41f853480e9c514b352977d3b65ba308e161d5df3509b2c). Worktree `/home/rodrigoisensee/MetricasDSPD-025`, head antes do agente: 03d514f. Entrega esperada: correção do TS18048 em `e2e/tests-api/tatico-011-lote2.spec.ts:169-170`, typecheck dos E2E com rc=0, spec rodado, commit do spec, parecer com `commit:` do spec, commit do parecer, **sem push**.

Ao retomar: ver o `git log` das duas worktrees; se houver commit novo, mandar ao `forge:conferente` no modo `entrega` (o `Desde` vem do `## Histórico` de cada pedido: 037 → 35bfd72ab8d4a66fd4237000e6e83c3619a17bf4; 025 → b6c76731f21cfddd320cb3a75a4490f11df688c7). Se a sessão fechou com o agente no meio, conferir worktree suja e processo órfão (`pgrep -af 'playwright|vitest'`) antes de relançar.

## Fato novo que precisa ser conciliado
- **O PR #136 (homolog → main) foi mesclado pelo dono em 2026-10-21 às 13h10 (horário de Brasília), merge 17fee180dbb798955eaaed9517e371652f7ca9ce**, enquanto o 037 registrava a decisão "esperar o 037". O pedido 037 ainda tem E2.5 (mesclar o #136), E2.6 e E2.7 (promoção develop → homolog com o Worker) como pendentes. Ao retomar: atualizar o pedido 037 (E2.5 feito pelo dono; a correção do C6 vai numa próxima release) e perguntar ao dono só se o efeito mudar o escopo (por exemplo, se a `main` ficou com o C6 de /operacional acima de 200 ms).

## Próximos passos (ordem)
1. **037**: conferir a entrega do QA; brief do E2.4b ao `forge:tech-lead` (atualizar o PR #137: D1 como W037-001 corrigido, só o D2 como pendência; merge com todos os checks verdes, incluindo `e2e`, que é a condição da decisão do dono sobre o D1); fechar o K-131 depois do merge; depois E2.6/E2.7 (promoção para a homolog) e uma nova release homolog → main para o dono.
2. **025**: conferir a entrega do QA; review incremental do `forge:tech-lead` sobre o commit do spec (e regravar o `commit:` do parecer de review se o `forge-check pr` pedir); E1.6 revisão de UX; E1.7 PR para a develop. L2T-003 é pendência no PR (K-133); D1 não se aplica; D2 é pendência (K-132).
3. Retrospectivas com o `forge:agile-coach` dos pedidos 037, 025, 038 e 039; tabela pedido × entregue.
4. Cartões K-123 a K-135 (achados de review e segurança, D2, L2T-003, K-134 typecheck dos E2E fora do `pronto`, K-135 helper de "painel pronto").
5. Pedido 026 (operacionais), depois a fase 3 (integrações oficiais), na ordem do dono (pedido 036).
6. Decisões abertas com o dono: ordem do T14, proteção da develop, sessões da conta do GitHub, levar o prompt de melhorias (`/home/rodrigoisensee/prompt-jarvis-forge-2026-10-21.md`, F1 a F10) ao Forge.

## Lições da sessão (para o Jarvis)
- O conferente quer a linha `modo:` na primeira linha da mensagem; notas do Jarvis vão depois de `BRIEF>>>`.
- Em delegação nova, o conferente (haiku) erra fatos de git quando roda fora da worktree; contestar com o comando e o resultado.
- Pareceres gravados por script não registram autoria: os briefs exigem Write/Edit.
- O `pnpm run pronto` não roda o typecheck dos E2E (K-134).

Agente destino: forge:react-frontend
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Ajustar o front à branch do pedido 024 e enviá-la: o teste do E7 ainda lê `custoConfigurado`, que o 024 removeu (barra o typecheck do pre-push), e o E7 passa a se chamar "Entregas por sistema" (decisão do dono de 2026-10-17, pedido 021). Etapa E1.4 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head local de018c635661c484599b3e0e7cc5b19603fec2df, com o merge da develop e o nome novo no back, ainda sem push; remoto em df75e29d2b6d3ebe8920fb5fbb175c60a5a7ce52).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`, seções "Escopo" (E1 e E5) e "Etapas".
- `web/src/features/complementares/estrategicas.test.tsx` (linhas 120 a 160) e `web/src/content/catalogo-metricas.ts` (linha 534).
- O contrato vigente do E7: `packages/contratos/src/tambem.ts`, bloco do E7.

## Entregar
- (E1) Tirar `custoConfigurado` do teste do E7 em `estrategicas.test.tsx`; o teste continua cobrindo que nenhum valor em R$ aparece e que a participação só sai com 20 ou mais entregas por sistema ("k de n" abaixo disso).
- (E5) Trocar "Capacidade por sistema" por "Entregas por sistema" em `web/src/content/catalogo-metricas.ts` e no `describe` do teste; procurar o nome antigo também em `e2e/` e atualizar o teste que o citar.
- (E1, E5) Rodar da raiz da worktree `pnpm --filter @metricas-dspd/web typecheck`, `pnpm --filter @metricas-dspd/web lint` e `pnpm --filter @metricas-dspd/web test` (cobertura do web mantida); um commit (`fix(web): ...`, `git add` por caminho) e push da branch sem `--force` (o pre-push roda o typecheck de todos os pacotes).

## Fora do escopo
- "E5.2 (forge:ux-designer): nome novo na especificação do 011 (§5 E7) e na revisão de UX." · etapa de outro papel; `docs/ux/` não se toca.
- "E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6." · já feita (de018c635661c484599b3e0e7cc5b19603fec2df).
- "E1.2 (forge:tech-lead): review." e "E1.3 (forge:qa-engineer): QA." · etapas de outro papel.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR." · já feita.
- "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." e "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feitas; o front ordenar o E6 por `concluidoEm` não entra aqui.
- Mudar `packages/`, `server/` ou o layout do cartão; E2E completo local; o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas; regra 7.1 do briefing (horas apontadas não entram).
- Decisão técnica do time (pedido 024, 2026-10-17): o react-frontend ajusta esse teste na branch do 024, depois de trazer a develop com o #108, antes do QA.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: `packages/`, `server/`, `docs/ux/`, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só os comandos do web acima; sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (sha): commit `fix(web)` na branch, só com caminhos de `web/` e, se houver, `e2e/`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 grep -n -e 'Capacidade por sistema' -e 'custoConfigurado' -- web e2e | wc -l` · espera: igual '0'
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-024 --filter @metricas-dspd/web typecheck` · espera: rc=0
- PQ-4 (push): `git -C /home/rodrigoisensee/MetricasDSPD-024 ls-remote origin refs/heads/feature/024-e7-sem-reais` igual ao head local.
- PQ-5 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, testes e cobertura do web, push); riscos. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

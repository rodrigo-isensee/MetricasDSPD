Agente destino: forge:node-backend
Pedido: docs/pedidos/024-e7-sem-reais-participacao.md
Branch: feature/024-e7-sem-reais   Base: develop   Base-sha: d83024ba35763c0b56bebf8184cdbdf1d8da26e0

## Objetivo
Renomear o E7 de "Capacidade por sistema" para "Entregas por sistema" no back e na documentação técnica, pela decisão do dono de 2026-10-17 (pedido 021, opção A). Etapa E5.1 do pedido 024, cartão K-114. Worktree `/home/rodrigoisensee/MetricasDSPD-024`, branch `feature/024-e7-sem-reais` (head local d4c0821a5c28023a62dc12c3817b450b0fc87ac1, o seu merge da develop, ainda sem push por causa do teste do front do E1.4).

## Ler
- `docs/pedidos/024-e7-sem-reais-participacao.md`, seções "Escopo" (E5) e "Etapas".
- `git -C /home/rodrigoisensee/MetricasDSPD-024 grep -n 'Capacidade por sistema' -- packages docs/api docs/contratos docs/architecture`.

## Entregar
- (E5) Trocar o nome em `packages/contratos/src/cartoes.ts` (linha do E7), no comentário de `packages/contratos/src/tambem.ts`, em `docs/api/metricas.md` e em `docs/architecture/features/metricas-tambem-disponiveis.md` (tabela e título da seção do E7); regenerar `docs/contratos/` pelo gerador do projeto (não editar à mão o que é gerado) e rodar `pnpm run docs:check`.
- (E5) Rodar `pnpm --filter @metricas-dspd/contratos test` e `pnpm --filter @metricas-dspd/metricas test` da raiz da worktree; snapshot de contrato que mudar só pelo nome: atualize e cite no relatório.
- (E5) Um commit (`refactor(contratos): ...` ou `docs: ...`, `git add` por caminho), **sem push**: o push sai no E1.4, depois que o react-frontend corrigir o teste do front que hoje barra o pre-push.

## Fora do escopo
- "E5.2 (forge:ux-designer): nome novo na especificação do 011 (§5 E7) e na revisão de UX." · etapa de outro papel; `docs/ux/` não se toca.
- "E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado` e os testes que citam o título do E7 (E5)" · etapa de outro papel; `web/` não se toca (inclui `web/src/content/catalogo-metricas.ts`).
- "E1.2 (forge:tech-lead): review." e "E1.3 (forge:qa-engineer): QA." · etapas de outro papel.
- "E2.1 (forge:software-architect): plano §2 E7 e ADR." · já feita (2de5d80838da8284db9f8ec91c00a5bf3f2bbd7e e df75e29d2b6d3ebe8920fb5fbb175c60a5a7ce52); aqui só o nome muda no plano.
- "E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo." · já feita (7e92cd9c9eba973156595de9760892957c979597); nada novo.
- "E4.1 (forge:node-backend): `concluidoEm` no contrato do E6." · já feita (beb71c64b4a043e7845eace5cf41effe586a3c58); nada novo.
- O registro histórico de `packages/metricas/src/core/criterios.ts` (entrada datada da mudança de critério; o nome não muda o cálculo e o histórico não se reescreve, regra T2.6); os pareceres em `docs/qa/` e `docs/reviews/` (registros históricos); o PR; o quadro (`KANBAN.md`), que é do Jarvis.

## Decisões e restrições
- DECISÃO DO DONO (pedido 021, 2026-10-17): o E7 passa a se chamar "Entregas por sistema" (opção A).
- Decisão do usuário D2 = A (pedido 011): E7 sem R$, participação percentual por entregas.
- O id `E7` e a rota `/api/v1/metricas/E7` não mudam; só o nome exibido. Renomear não é mudança de critério de cálculo.
- R-MAIN: nada na `main`. R-VERIFY: sem `--no-verify` nem `--force`. R-CONFORMIDADE: bloqueio não se contorna; vira relato.
- NÃO tocar: `web/`, `docs/ux/`, `.github/`, o diretório principal, a worktree `-011-fase2`.
- Teto: 2 agentes de dia, uma tarefa pesada por vez (restrição do usuário de 2026-10-17, pedido 024, "Restrições do usuário"): só testes de pacote e `docs:check`; sem `pronto` nem E2E local.

## Pronto quando
- PQ-1 (sha): commit do E5.1 na branch, local, só com caminhos de `packages/contratos`, `docs/api`, `docs/contratos` e `docs/architecture`.
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 grep -c 'Capacidade por sistema' -- packages/contratos docs/api docs/contratos docs/architecture | wc -l` · espera: igual '0'
- PQ-3 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-024 run docs:check` · espera: rc=0
- PQ-4 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-024 status --porcelain` · espera: linhas=0

## Relatório
Até 8 linhas: estado; o que precisa do usuário; suposições (com a base); o que foi feito, com evidência (sha, arquivos, testes de pacote); riscos e mudanças de contrato. Depois, o bloco `Provas:` com uma linha por PQ-n e a saída copiada, ou "não cumprido" e o motivo.

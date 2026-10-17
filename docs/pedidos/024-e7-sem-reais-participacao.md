# Pedido 024 — E7 sem R$: participação percentual por entregas

- **Data:** 2026-10-17
- **Origem:** decisão do usuário D2 = A (pedido 011): o E7 mostra a participação percentual de cada sistema pelas entregas do período, sem valor em dinheiro. Revê a D-1' e a Q-E7-1. Horas apontadas não entram (regra 7.1 do briefing).
- **Modo:** implementar. O lote 1, com o E7 em R$, já está na develop (#105, 1607a5f).

## Escopo
- E1. back: tirar o custo em R$ do E7 (`custoRateado`, `custoPorDemanda`, configuração de custo e fixtures) e publicar a participação percentual por sistema (entregas do sistema ÷ entregas do período), com o mínimo de 20 entregas por sistema ("k de n" abaixo disso); contrato, OpenAPI, `docs/api`, `regras-metricas`, registro da mudança de critério com data (T2.6). · `confirmado`
- E3. os contratos do E8 e do E9 dizem que o filtro de período atua, mas o back usa janela fixa; alinhar o contrato à janela que o cálculo usa. (acrescentado em 2026-10-17, R-1 do review do front; correção 2026-10-17: estava por engano sob "Fora do escopo"). · `técnico`
- E4. o contrato do E6 passa a trazer a data de conclusão de cada projeto (`concluidoEm`), para o front ordenar por data; até lá, o front ordena por deslize (aceito como provisório no review). (acrescentado em 2026-10-17, A-4 do review do front do lote 1). · `técnico`
- E2. documentação: plano do 011 (§2 E7) e ADR afetada, sem R$; CA da especificação do E7. · `confirmado`

## Etapas
- E1.1 (forge:node-backend): E7 sem R$, com participação percentual.
- E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo.
- E4.1 (forge:node-backend): `concluidoEm` no contrato do E6.
- E1.5 (forge:tech-lead): commitar a correção A-5 do arquiteto (plano, linha 301) e trazer a develop, já com o #108, para a branch, por merge (acrescentada em 2026-10-17: pré-condição do E1.4 e da rodada 2 do review).
- E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado`, depois de trazer a develop com o #108 (acrescentada em 2026-10-17, risco do review rodada 1).
- E1.2 (forge:tech-lead): review.
- E1.3 (forge:qa-engineer): QA.
- E2.1 (forge:software-architect): plano §2 E7 e ADR.
- E2.2 (forge:ux-designer): CA do E7 na especificação.

## Decisões técnicas do time
- 2026-10-17 — Documentos do E2.1 (software-architect, sem Bash): o arquiteto grava as mudanças nos arquivos da worktree `-024`, sem commit; o tech-lead, no review (E1.2), commita esses documentos num commit próprio (`docs(architecture): ...`), roda o `docs:check` e revisa junto. Base: o arquiteto não tem a ferramenta Bash; mesma prática usada com os documentos de UX no pedido 021.
- 2026-10-17 — Review rodada 1 (d2295e8) reprovado só por documentação: A-1 a A-4 e A-6 (`regras-metricas.md`, `docs/tecnica/biblioteca-de-calculo.md`, `docs/api/metricas.md`) voltam ao node-backend; A-5 (linha 301 do plano, `participacao` anulável) volta ao software-architect; os dois em paralelo, em arquivos diferentes. Base: parecer de review `024-e7-sem-reais.md` na branch.
- 2026-10-17 — O teste `estrategicas.test.tsx` da branch do front (PR #108) usa `custoConfigurado`, que este pedido remove: a branch do 024 traz a develop depois do merge do #108 e o react-frontend ajusta esse teste na branch do 024, antes do QA. Base: risco apontado no review rodada 1.

## Restrições do usuário
- 2026-10-17: "deminua um pouco o uso da maquina": teto de 2 agentes de dia e 3 à noite, uma tarefa pesada (`pronto`, E2E, medição) por vez.

## Andamento
- 2026-10-17 — E2.2 já coberta: a especificação do 011 foi alinhada à D2 = A pelo ux-designer no E3.2 do pedido 011 (§5 E7, CA-13, CA-35, selo retirado), commit ccb9443 na branch `feature/011-front-estrategicas` (PR #108, pedido 028). Entra na develop com esse PR; nada novo a fazer na especificação.

- 2026-10-17 — E2.1 (software-architect): plano do 011 alinhado à D2 = A (commit 2de5d80 pelo tech-lead). ADR: nenhuma ADR guarda o custo do E7 (relatório do arquiteto; busca por `ref_custo`, "custo total do DSPD" e "E7" em `docs/architecture/adr/` só acha a 0003, tempo de cálculo, e a 0020, sem E7); nenhuma ADR muda neste pedido.

## Fora do escopo
- O front do E7 (pedido 021, lote 1, já segue a regra nova).
- O PR (pedido a abrir depois do QA).

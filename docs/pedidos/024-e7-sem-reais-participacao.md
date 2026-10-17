# Pedido 024 — E7 sem R$: participação percentual por entregas

- **Data:** 2026-10-17
- **Origem:** decisão do usuário D2 = A (pedido 011): o E7 mostra a participação percentual de cada sistema pelas entregas do período, sem valor em dinheiro. Revê a D-1' e a Q-E7-1. Horas apontadas não entram (regra 7.1 do briefing).
- **Modo:** implementar. O lote 1, com o E7 em R$, já está na develop (#105, 1607a5f).

## Escopo
- E1. back: tirar o custo em R$ do E7 (`custoRateado`, `custoPorDemanda`, configuração de custo e fixtures) e publicar a participação percentual por sistema (entregas do sistema ÷ entregas do período), com o mínimo de 20 entregas por sistema ("k de n" abaixo disso); contrato, OpenAPI, `docs/api`, `regras-metricas`, registro da mudança de critério com data (T2.6). · `confirmado`
- E3. os contratos do E8 e do E9 dizem que o filtro de período atua, mas o back usa janela fixa; alinhar o contrato à janela que o cálculo usa. (acrescentado em 2026-10-17, R-1 do review do front; correção 2026-10-17: estava por engano sob "Fora do escopo"). · `técnico`
- E4. o contrato do E6 passa a trazer a data de conclusão de cada projeto (`concluidoEm`), para o front ordenar por data; até lá, o front ordena por deslize (aceito como provisório no review). (acrescentado em 2026-10-17, A-4 do review do front do lote 1). · `técnico`
- E2. documentação: plano do 011 (§2 E7) e ADR afetada, sem R$; CA da especificação do E7. · `confirmado`
- E5. renomear o E7 de "Capacidade por sistema" para "Entregas por sistema" em cartões, catálogo, contratos, documentação, especificação e testes · `confirmado` (acrescentado em 2026-10-17, decisão do dono no pedido 021, opção A).

## Etapas
- E1.1 (forge:node-backend): E7 sem R$, com participação percentual.
- E3.1 (forge:node-backend): contrato do E8 e do E9 alinhado à janela do cálculo.
- E4.1 (forge:node-backend): `concluidoEm` no contrato do E6.
- E1.5 (forge:tech-lead): commitar a correção A-5 do arquiteto (plano, linha 301) e trazer a develop, já com o #108, para a branch, por merge (acrescentada em 2026-10-17: pré-condição do E1.4 e da rodada 2 do review).
- E1.6 (forge:node-backend): concluir o merge da develop na branch, resolvendo os 5 conflitos (docs/api/metricas.md, docs/architecture/regras-metricas.md, docs/contratos/metricas/E9.md, docs/tecnica/biblioteca-de-calculo.md, packages/metricas/src/fase2.regras.test.ts) (acrescentada em 2026-10-17: o E1.5 parou no conflito de contrato e teste, como o brief mandava).
- E5.1 (forge:node-backend): nome "Entregas por sistema" no cartão do E7 (`packages/contratos`), contratos e documentação gerada, depois do E1.6.
- E5.2 (forge:ux-designer): nome novo na especificação do 011 (§5 E7) e na revisão de UX.
- E1.4 (forge:react-frontend): ajustar o teste do front que lê `custoConfigurado` e os testes que citam o título do E7 (E5), depois de trazer a develop com o #108 (acrescentada em 2026-10-17, risco do review rodada 1).
- E1.2 (forge:tech-lead): review.
- E1.3 (forge:qa-engineer): QA.
- E1.7 (forge:qa-engineer): testes das lacunas G1 a G3 achadas no QA (nome do E7 no catálogo, no cartão e na tela; VERSAO_CRITERIO_E7_SEM_REAIS nos critérios do E7; E8 sem efeito do período), num commit só de testes, antes da rodada 4 do review (acrescentada em 2026-10-17).
- E1.8 (forge:tech-lead): rodada 4 do review, só sobre os testes do E1.7 (acrescentada em 2026-10-17).
- E1.9 (forge:qa-engineer): corrigir a formatação de `e8.test.ts` (bug 024-001, Prettier na linha 119), sem mudar o que o teste afirma, com `format:check` e `lint` verdes, e o registro do bug em `docs/qa/bugs/024-001-e8-test-fora-do-prettier.md` no mesmo commit (acrescentada em 2026-10-17; o registro entrou no texto da etapa em 2026-10-17, apontado pelo conferente).
- E1.10 (forge:tech-lead): rodada 5 do review, só sobre a correção de formatação do E1.9 (acrescentada em 2026-10-17).
- E2.1 (forge:software-architect): plano §2 E7 e ADR.
- E2.2 (forge:ux-designer): CA do E7 na especificação.

## Decisões técnicas do time
- 2026-10-17 — Documentos do E2.1 (software-architect, sem Bash): o arquiteto grava as mudanças nos arquivos da worktree `-024`, sem commit; o tech-lead, no review (E1.2), commita esses documentos num commit próprio (`docs(architecture): ...`), roda o `docs:check` e revisa junto. Base: o arquiteto não tem a ferramenta Bash; mesma prática usada com os documentos de UX no pedido 021.
- 2026-10-17 — Review rodada 1 (d2295e8) reprovado só por documentação: A-1 a A-4 e A-6 (`regras-metricas.md`, `docs/tecnica/biblioteca-de-calculo.md`, `docs/api/metricas.md`) voltam ao node-backend; A-5 (linha 301 do plano, `participacao` anulável) volta ao software-architect; os dois em paralelo, em arquivos diferentes. Base: parecer de review `024-e7-sem-reais.md` na branch.
- 2026-10-17 — O teste `estrategicas.test.tsx` da branch do front (PR #108) usa `custoConfigurado`, que este pedido remove: a branch do 024 traz a develop depois do merge do #108 e o react-frontend ajusta esse teste na branch do 024, antes do QA. Base: risco apontado no review rodada 1.
- 2026-10-17 — Merge da develop (com o #108) conflita em contrato do E9 e no teste da fase 2, por causa do E3 (janela do cálculo do E8/E9). Decisão técnica do Jarvis: o node-backend, autor do E3, resolve o merge (E1.6); o tech-lead revisa na rodada 2. Base: relatório do tech-lead no E1.5 (df75e29, merge abortado) e a regra "pare e relate" do brief.
- 2026-10-17 — DECISÃO DO DONO (pedido 021): E7 = "Entregas por sistema". ESCOPO+: E5 (renomear), etapas E5.1 e E5.2; entra neste pedido antes da rodada 2 do review.
- 2026-10-17 — Conferência da entrega do E1.6: PQ-1, PQ-2 e PQ-5 cumpridos; PQ-4 (push) não cumprido, barrado pelo pre-push no teste do front do E1.4, como o relatório diz. "Escopo: fora" vem dos commits anteriores da branch (E1, E3, E4) e o "corte E5" vem do E5 acrescentado ao pedido depois da aprovação do brief. Decisão técnica do Jarvis: entrega aceita; o push sai no E1.4. Base: relatório do node-backend e conferência.
- 2026-10-17 — Conferência da entrega do E5.1 (de018c6): PQ-1, PQ-2 e PQ-4 cumpridos; desde o head inicial d4c0821 só os 6 arquivos do Entregar. O "escopo: fora" é o mesmo falso positivo do diff acumulado desde a base (commits anteriores já conferidos nas suas etapas). Decisão técnica do Jarvis: entrega aceita.
- 2026-10-17 — Conferência da entrega do E1.4 (97ddd0b): PQ-1, PQ-2 e PQ-4 cumpridos; PQ-5 falhou só pelos 3 arquivos de docs/ux que a UX (E5.2) gravou depois, na mesma worktree, quando o Jarvis disparou as duas em paralelo; o relatório do react-frontend mostra status limpo no fim da entrega dele. Decisão técnica do Jarvis: entrega aceita; não conta como retrabalho do autor.
- 2026-10-17 — A-7 corrigido (19accc9, 83c5f49). O react-frontend relatou ter TENTADO amend com push forçado para ajustar o próprio commit; o hook (R-VERIFY) bloqueou e ele seguiu com commit novo. Nenhum histórico foi reescrito no remoto. Causa próxima: o PQ-3 do brief contava linhas do texto e o título do teste o repetia (brief do Jarvis). Registrado em melhorias.
- 2026-10-17 — QA parou antes do parecer por 3 lacunas de teste (G1 nome do E7 sem asserção; G2 versão de critério T2.6 sem teste; G3 E8 sem teste de que o período não muda o resultado); sem bugs. Decisão técnica do Jarvis: opção (a), cobrir com testes; quem escreve é o próprio QA (E1.7), num commit só de testes; depois rodada 4 do review só sobre esses testes (E1.8) e o parecer do QA. Aceitar as lacunas (b) foi descartado: G2 toca regra inviolável (T2.6). Base: relatório do QA e sequência proposta em melhorias.md (teste → review → parecer).
- 2026-10-17 — A CI do head 4fb04ad falhou na `rapida`: `format:check` reprova `e8.test.ts` (teste G3 do E1.7), bug 024-001 (médio). Causa: o brief do E1.7 (Jarvis) mandou rodar só os testes, não `format:check` nem `lint`. Decisão técnica do Jarvis: o QA corrige a formatação (E1.9), rodada 5 do review só nela (E1.10), depois o parecer. Base: relatório do QA, run 39037889777.

## Restrições do usuário
- 2026-10-17: "deminua um pouco o uso da maquina": teto de 2 agentes de dia e 3 à noite, uma tarefa pesada (`pronto`, E2E, medição) por vez.

## Andamento
- 2026-10-17 — E2.2 já coberta: a especificação do 011 foi alinhada à D2 = A pelo ux-designer no E3.2 do pedido 011 (§5 E7, CA-13, CA-35, selo retirado), commit ccb9443 na branch `feature/011-front-estrategicas` (PR #108, pedido 028). Entra na develop com esse PR; nada novo a fazer na especificação.

- 2026-10-17 — E2.1 (software-architect): plano do 011 alinhado à D2 = A (commit 2de5d80 pelo tech-lead). ADR: nenhuma ADR guarda o custo do E7 (relatório do arquiteto; busca por `ref_custo`, "custo total do DSPD" e "E7" em `docs/architecture/adr/` só acha a 0003, tempo de cálculo, e a 0020, sem E7); nenhuma ADR muda neste pedido.

## Fora do escopo
- O front do E7 (pedido 021, lote 1, já segue a regra nova).
- O PR (pedido a abrir depois do QA).
- PERGUNTA: 2026-10-17 — Aceite da ressalva baixa R-1 do QA (o registro do bug 024-001 diz "git diff -w vazio", o que é impreciso; sem efeito em código). O parecer do QA (e240673) já traz `aceite_usuario: sim` sem que o usuário tenha aceitado: o Jarvis apontou o erro e pergunta ao usuário. Opções: A aceitar como está; B corrigir a frase do registro num commit novo. Recomendação: A.
- 2026-10-17 — DECISÃO DO DONO: aceita a ressalva baixa R-1 do QA como está (opção A). O campo `aceite_usuario: sim` do parecer (e240673) passa a ser verdadeiro a partir desta resposta; o parecer não precisa de novo commit.

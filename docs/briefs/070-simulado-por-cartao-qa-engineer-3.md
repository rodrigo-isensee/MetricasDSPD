Agente destino: forge:qa-engineer
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: qa   Cobre: E1.6

## Objetivo
QA da volta 1 do 070 (os sete achados) e da resolução do merge da develop, na ponta 3fc35abd548067b3d2d76b19223e84403f96d6ac (pedido 070, E1.6, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff abc07cc1d58a6810f3c57dd3eadc4c9ab5043fb6..518ae82b00bdb8f1735a87818578fd8f264768d7 -- web` (a volta 1, os sete achados) e `git -C /home/rodrigoisensee/MetricasDSPD-052f show 3fc35abd548067b3d2d76b19223e84403f96d6ac` (a resolução do merge da develop); os achados de origem: `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao.md`, `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/070-l2.md` e `/home/rodrigoisensee/MetricasDSPD-052f/docs/qa/070-l2.md`.

## Entregar
- "E1.6 (qa-engineer): QA." (E1.6)
- (E1, E2, E3) (E1.6) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao`; rodar com no máximo 2 workers o vitest do server e dos pacotes com cobertura, `pnpm exec prettier --check web packages tools` e `pnpm run docs:check`; rodar também o vitest do web com cobertura e `npx eslint .` com cwd em `web/`; conferir que a API nunca devolve número simulado, que nenhum cartão real mostra o selo, que faixas, Resumo, Visão geral e exportação ignoram o simulado, que o cartão simulado não mostra dentro/fora da meta e que os testes de S2 e S3 do L9-a seguem verdes depois do merge; registrar no parecer que os testes pg não rodam no sandbox e ficam para a CI do PR; parecer em `docs/qa/070-v1.md` com o resultado real; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-simulado-por-cartao`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 00:54: Develop trazida para o 070 (E1.9): o tech-lead trouxe a develop (27ab546, L9-a) para a branch do 070 em 3fc35abd548067b3d2d76b19223e84403f96d6ac, conflito só em packages/contratos/src/origem.test.ts resolvido mantendo os dois describe; contratos 208 testes, web 1468 testes com cobertura 100%, eslint, prettier e docs:check verdes. DECISÃO TÉCNICA (Jarvis): review, QA e revisão de interface ao mesmo tempo sobre 3fc35abd548067b3d2d76b19223e84403f96d6ac, conferindo a volta 1 (diff 9605ead..518ae82 em web) e a resolução do merge; pareceres no nome 070-v1 (review e QA na branch; o de interface em docs/ux/070-selo-simulado/revisao-v1.md no clone principal, fora da branch); depois o PR do 070 (E1.8), com o status da ADR 0028 em aceita.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 070-simulado-por-cartao`, `branch: feature/070-simulado-por-cartao`, `commit: 3fc35abd548067b3d2d76b19223e84403f96d6ac`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052f add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/070-simulado-por-cartao:docs/qa/070-v1.md` · espera: contém 'commit: 3fc35abd548067b3d2d76b19223e84403f96d6ac'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
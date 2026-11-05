Agente destino: forge:tech-lead
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-simulado-por-cartao   Base: develop   Base-sha: 97ec7af9055f247297ecdedda910cbac54562d72
Etapa: merge-integracao   Cobre: E1.8

## Objetivo
PR do 070 (selo Simulado por cartão, lotes L1 e L2 com as voltas 1 e 2) para a develop e merge por squash com a CI verde, incluídos o test:pg e o e2e (pedido 070, E1.8, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-simulado-por-cartao`.

## Ler
- Os pareceres na branch: `docs/reviews/070-v2.md`, `docs/qa/070-v2.md`; as revisões de interface em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao.md`, `revisao-v1.md` e `revisao-v2.md`.

## Entregar
- "E1.8 (tech-lead): PR para a develop e merge." (E1.8)
- (E1, E2, E3) (E1.8) começar só depois da promoção da release 068 para a homolog: conferir com `gh pr list --repo rodrigo-isensee/MetricasDSPD --base homolog --head develop --state merged --json number --limit 1` (deve trazer o PR 228) e esperar em laços curtos até 60 minutos; sem o merge, pare e relate; `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-simulado-por-cartao`; `forge-check pr 070-simulado-por-cartao --ref origin/feature/070-simulado-por-cartao --base origin/develop` limpo; PR para a develop com título citando o pedido 070, corpo pelo `--body-file` num arquivo escrito pela ferramenta Write, com o resumo, os pareceres (review e QA 070-v2, as três revisões de interface), as dívidas (A-12 da interface, A1 e A2 do QA para o L3, a ADR 0028 a aceita em PR de documentação) e a linha `teto: excedido, 1482 linhas, um comportamento só (o selo Simulado por cartão em cerca de 45 cartões, com os testes T-W1 a T-W8), aceito no review 070-l2 e mantido no 070-v2`; se a develop andou, `gh pr update-branch feature/070-simulado-por-cartao --repo rodrigo-isensee/MetricasDSPD` e esperar de novo; esperar os checks por laço com pausa (sem `--watch`), cada chamada abaixo de 2 minutos, conferindo que o job dos testes pg e o e2e rodaram e ficaram verdes; com todos verdes, `gh pr merge feature/070-simulado-por-cartao --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <sha literal do head do PR>`, sem `--admin`; se um check falhar, o forge-check pedir parecer novo ou o hook recusar, pare e relate a mensagem literal; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 02:58: PR do 070 preparado: review 070-v2, QA 070-v2 e revisão de interface v2 aprovados; forge-check pr aprovado na ponta cc03449. DECISÃO TÉCNICA (Jarvis): E1.8 com o tech-lead depois da promoção da release 068 para a homolog: PR do 070 para a develop com a linha teto: excedido, 1482 linhas e os pareceres (review, QA e as revisões de interface em docs/ux/070-selo-simulado), update-branch se a develop andou, merge por squash com a CI verde (test:pg e e2e); se o forge-check pedir parecer novo depois do update-branch, para e relata; a ADR 0028 vai a aceita num PR só de documentação depois.
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` e `api.github.com` em `allowed_domains`; o hook `parecer` exige a branch no `gh pr merge`, não o número; `$?` e `$var` em comando com `gh pr` são barrados. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, os pareceres, a ADR 0028, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees, a `homolog` e a `main`; a develop só muda pelo merge do PR.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/070-simulado-por-cartao --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
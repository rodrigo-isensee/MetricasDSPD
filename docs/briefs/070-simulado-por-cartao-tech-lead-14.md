Agente destino: forge:tech-lead
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-l3-e2e   Base: develop   Base-sha: 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4
Etapa: merge-integracao   Cobre: E1.8

## Objetivo
PR da feature/070-l3-e2e (o lote L3 do 070: os E2E do simulado por cartão T-E1 a T-E3, T-E5 e T-E6, a medição C6 no perf-api e a correção do bug 070-001 da marca d'água) para a develop e merge por squash com a CI verde (pedido 070, E1.8, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-l3-e2e`.

## Ler
- Os pareceres na branch: `docs/reviews/070-v4.md`, `docs/qa/070-v4.md`; a revisão de interface em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/070-selo-simulado/revisao-v4.md`.

## Entregar
- "E1.8 (tech-lead): PR para a develop e merge." (E1.8)
- (E1, E2, E3) (E1.8) começar depois que `docs/reviews/070-v4.md` e `docs/qa/070-v4.md` estiverem no remoto (laços curtos, até 40 minutos; sem eles, pare e relate); `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-l3-e2e`; `forge-check pr 070-simulado-por-cartao --ref origin/feature/070-l3-e2e --base origin/develop` limpo; PR para a develop com título citando o pedido 070, o L3 e o bug 070-001, corpo pelo `--body-file` num arquivo escrito pela ferramenta Write, com o resumo (os E2E, a medição e a correção do 070-001), os pareceres (review e QA 070-v4, revisão de interface v4), a linha `teto: excedido, 190 linhas, E2E e medição C6 do simulado por cartão (T-E1 a T-E3, T-E5, T-E6) com a correção 070-001 que o T-E6 exige, 89% teste` e as dívidas (A-12, A-13 e A-14 da interface, A1 e A2 do review 070-v4, o stub api-stub-065 sem ultimaColeta e versaoCriterio, a ADR 0028 a vigente em PR de documentação); se a develop andou, `gh pr update-branch feature/070-l3-e2e --repo rodrigo-isensee/MetricasDSPD` e esperar de novo; esperar os checks por laço com pausa (sem `--watch`), cada chamada abaixo de 2 minutos, conferindo que o job build (com o gate de fronteiras), o e2e e o banco rodaram e ficaram verdes; com todos verdes, `gh pr merge feature/070-l3-e2e --repo rodrigo-isensee/MetricasDSPD --squash --match-head-commit <sha literal do head do PR>`, sem `--admin`; se um check falhar, o forge-check pedir parecer novo ou o hook recusar, pare e relate a mensagem literal; sem promover para a homolog.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
- DECISÃO DO DONO (2026-11-05): "A" (suposições S1 a S3 do 070, pergunta das 12:28): confirmadas as três: S1 os filtros de equipe, sistema e prioridade não se aplicam ao cartão simulado; S2 a exportação leva só o dado real; S3 as duas tendências do Resumo e o EI_SUST ficam sem simulado; com isso a ADR 0028 pode passar a vigente.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 13:01: Review 070-v4 aprovado: parecer do tech-lead (c5ce5b8a, commit: 3c552b0): E2E conforme a seção 7 do desenho e a decisão A do resumo, fixture só no E2E, color-contrast ativa; teto 190 linhas, 89% teste, exceção aceita com a linha no corpo do PR; A1: a checagem de 320 px em simulado-070-l3.spec.ts:97 passa sem medir se a marca não existir; A2: F6 em 197,04 KB (+2,33 KB vindos do L2), registrar no desenho ou na ADR 0028. DECISÃO TÉCNICA (Jarvis): o PR do L3 (E1.8) sai depois do QA v4 com a linha teto: excedido, 190 linhas, E2E e medição C6 do simulado por cartão (T-E1 a T-E3, T-E5, T-E6) com a correção 070-001 que o T-E6 exige, 89% teste; A1 e A2 viram cartão de melhoria técnica; o A2 entra no PR de documentação da ADR 0028.
- 2026-11-05 13:13: QA 070-v4 aprovado: parecer do qa-engineer (3436d5fd, commit: 3c552b0), 0 bugs: suítes com cobertura 100% (server 1749, contratos 208, metricas 1262, mock 258, web 1471), eslint, prettier e docs:check verdes; os 5 E2E com o stub e Chromium, axe incluído; gate rc 0 (F9 118,31 KB, F8 118,01 KB, F6 sem violação); bug 070-001 verificado corrigido; A1 igual ao do review; A2: C6 não rodado nesta passada. DECISÃO TÉCNICA (Jarvis): E1.8 com o tech-lead (brief 14): PR do L3 para a develop; a develop andou para b8b2a22 (PR 232), então o update-branch é esperado e, se o forge-check pedir parecer novo, o tech-lead para e relata.
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
- "E1.10 (tech-lead): branch nova a partir da develop com a correção da volta 3 aplicada por cherry-pick, depois do merge do PR 230 sem ela." · etapa de outra delegação; continua no pedido
- "E1.11 (tech-lead): branch docs/070-adr-0028-vigente a partir da develop, na worktree 052d (livre depois do merge do PR 232), enviada ao remoto sem commit novo." · etapa de outra delegação; continua no pedido
- "E1.12 (software-architect): ADR 0028 e desenho do 070 para vigente com as suposições S1 a S3 confirmadas pelo dono e a nota do F6 (+2,33 KB, A2 do review 070-v4), na branch docs/070-adr-0028-vigente." · etapa de outra delegação; continua no pedido
- "E1.13 (tech-lead): review, commit e PR só de documentação da ADR 0028 vigente para a develop, merge por squash com a CI verde." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (merge): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/070-l3-e2e --state all --json state` · espera: contém 'MERGED'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
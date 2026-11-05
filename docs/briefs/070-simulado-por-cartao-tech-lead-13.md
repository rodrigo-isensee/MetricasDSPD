Agente destino: forge:tech-lead
Pedido: 070-simulado-por-cartao
Tipo: codigo
Branch: feature/070-l3-e2e   Base: develop   Base-sha: 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4
Etapa: review   Cobre: E1.5

## Objetivo
Code review do lote L3 do 070 (os E2E do simulado por cartão, a medição de desempenho e a correção do bug 070-001 da marca d'água), na ponta 3c552b062392a664b0bbe6a66dbb518b2df7fe61 (pedido 070, E1.5, K-221). Worktree `/home/rodrigoisensee/MetricasDSPD-052f`, branch `feature/070-l3-e2e`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052f diff 0a4f139cc1b03d5720b481ae56e4297c9f49f5b4..3c552b062392a664b0bbe6a66dbb518b2df7fe61` (o L3 inteiro: os E2E em e2e/tests-api/simulado-070-l3.spec.ts, a medição em e2e/perf/perf-api.spec.ts, a fixture e2e/fixtures/referencia-completa.ts, o bug docs/qa/bugs/070-001-marca-dagua-simulado-contraste-axe.md e a correção em web/src/components/ui/SeloSimulado.tsx com o teste).

## Entregar
- "E1.5 (tech-lead): code review." (E1.5)
- (E1, E2, E3) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-l3-e2e`; revisar os E2E (T-E1 a T-E3, T-E5, T-E6) e a medição C6 do perf-api contra o desenho, a fixture de /referencia (só no E2E, sem mudar nada com a API real; o A2 do L3 diz que o stub api-stub-065 devolve /referencia sem ultimaColeta e versaoCriterio), a correção da marca d'água (svg decorativo, aria-hidden, regra color-contrast intacta) e o F6 com +2,33 KB contra a base pré-070 (o desenho dizia que não mudava); o tamanho frente ao teto de PR; parecer em `docs/reviews/070-v4.md`; commit só do parecer; push com `git -C /home/rodrigoisensee/MetricasDSPD-052f push origin HEAD:refs/heads/feature/070-l3-e2e`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "Não consigo deixar os dados reais nas que já são possíveis fazer e nas que não deixar mocado?" e, ao recibo ("vou fazer: painel com dado real só com o real; sem dado real, o simulado com o selo Simulado visível; ADR nova revendo a 0026; não vou fazer: misturar real e simulado no mesmo gráfico, misturar BusinessMap e Acelerato, simulado em métrica individual; a troca é por cartão"), respondeu "Sim": dado simulado por cartão onde ainda não há dado real, com selo visível.
- DECISÃO DO DONO (2026-11-04): "A" (validação do protótipo docs/ux/070-selo-simulado/prototipo.html): protótipo aprovado como está (selo no cabeçalho, faixa com "O que é simulado?", borda tracejada, marca d'água, prefixo "Exemplo:"); ponto de compromisso do 070.
- DECISÃO DO DONO (2026-11-04): "A" (cartão simulado no resumo): o cartão com dado simulado fica fora de "O que pede atenção agora" e da Visão geral; só aparece na própria aba, com o selo; o resumo mostra só dado real.
### ADRs citadas no Histórico deste pedido (não no registro 064)
- ADR 0026 (citada no pedido): revista pela 0028
- ADR 0028 (citada no pedido): a decisão que este lote implementa
- ADR 0021 (citada no pedido): o simulado roda no Web Worker dela, só no navegador; nada muda nela
### Do Histórico deste pedido, docs/pedidos/070-simulado-por-cartao.md (DECISÃO TÉCNICA do Jarvis; contexto)
- 2026-11-05 12:51: Bug 070-001 corrigido: o react-frontend entregou 3c552b062392a664b0bbe6a66dbb518b2df7fe61 em feature/070-l3-e2e: MarcaDaguaSimulado passa a ser svg com text (mesma cor, rotação, opacidade, tamanho e posição; contêiner aria-hidden e data-testid iguais; a regra color-contrast intacta); os 5 E2E do L3 passam, T-E6 (axe) incluído; web 1471 testes com cobertura 100%, eslint, prettier, docs:check e gate verdes (F9 118,31 KB); a fonte do svg é herdada e a aparência contra o protótipo não foi medida. DECISÃO TÉCNICA (Jarvis): review, QA e revisão de interface ao mesmo tempo sobre 3c552b062392a664b0bbe6a66dbb518b2df7fe61, cobrindo o L3 inteiro (os E2E, a fixture de /referencia e a medição) e a correção; pareceres no nome 070-v4 (review e QA na branch; o de interface em docs/ux/070-selo-simulado/revisao-v4.md no clone principal, fora da branch); o QA prova o gate de fronteiras (F6 e F9) por comando; depois o PR do L3 (E1.8).
### Restrições
- O agente não abre, lê nem edita arquivos `.env*`, não chama as APIs externas e não roda nada contra a base real.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- O parecer é gravado inteiro pela ferramenta Write, com `pedido: 070-simulado-por-cartao`, `branch: feature/070-l3-e2e`, `commit: 3c552b062392a664b0bbe6a66dbb518b2df7fe61`, veredito e bloco `## Achados` (até 300 caracteres por achado, severidade só entre parênteses, regra citada só pelo ID); o pre-push e o forge-check docs barram frase de regra copiada.
- Outros pareceres são gravados ao mesmo tempo nesta worktree: `git -C /home/rodrigoisensee/MetricasDSPD-052f pull --ff-only origin feature/070-l3-e2e` antes do commit; `git -C /home/rodrigoisensee/MetricasDSPD-052f add <parecer>` e `git -C /home/rodrigoisensee/MetricasDSPD-052f commit -m <mensagem> -m 'Cartão: K-221' -- <parecer>` (sem heredoc e sem pipe); se der index.lock ou push recusado por estar atrás, espere uns segundos, faça o pull e repita; se o push disser cannot lock ref, confira o `git ls-remote` antes de repetir.
- NÃO tocar: código, testes, os outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho de como o cartão escolhe real ou simulado (quais métricas estão sem dado real hoje, de onde vem o simulado, contrato da API) e a ADR nova que revê a 0026." · etapa de outra delegação; continua no pedido
- "E1.2 (ux-designer): especificação do selo "Simulado" e do texto de explicação, com protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.3 (node-backend): implementação na API." · etapa de outra delegação; continua no pedido
- "E1.4 (react-frontend): implementação nos cartões." · etapa de outra delegação; continua no pedido
- "E1.6 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): trazer a develop para a branch do 070 e resolver o conflito, sem PR, antes do review, do QA e da revisão de interface da volta 1." · etapa de outra delegação; continua no pedido
- "E1.10 (tech-lead): branch nova a partir da develop com a correção da volta 3 aplicada por cherry-pick, depois do merge do PR 230 sem ela." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052f show origin/feature/070-l3-e2e:docs/reviews/070-v4.md` · espera: contém 'commit: 3c552b062392a664b0bbe6a66dbb518b2df7fe61'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
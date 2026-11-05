Agente destino: forge:ux-designer
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.7

## Objetivo
Revisão de interface da parte Sem dado real nos cartões O1, O2 e O5 e na tela de bloqueados, ponta 2050521 (pedido 065, E1.7, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md` (parte do web); `/home/rodrigoisensee/MetricasDSPD-052d/web/src/features/operacional/components/CartaoO1.tsx`, `CartaoO2.tsx`, `/home/rodrigoisensee/MetricasDSPD-052d/web/src/features/complementares/fluxo.tsx` e `CartaoComplementar.tsx`; o padrão de Sem dado real da ADR 0026 em `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/adr/0026-metricas-so-com-dado-real.md` (sem commit).

## Entregar
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." (E1.7)
- (E1) (E2) (E1.7) revisar se a parte de bloqueio aparece como Sem dado real de forma clara e coerente nos três cartões e na tela de bloqueados, sem parecer zero nem erro, sem esconder o resto do cartão, com leitura acessível; avaliar o texto Como se calcula do O5 que ficou igual; parecer em `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/065-revisao-bloqueados.md` pela ferramenta Write com `pedido: 065-bloqueados-sem-dado-real`, `branch: feature/065-bloqueados`, `commit: 205052155dae9ff2e1465841130c197967b3a4d7`, veredito e achados de até 300 caracteres cada; sem commit.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 08:56: E1.3 entregue pelo react-frontend: feature/065-bloqueados enviada inteira em 205052155dae9ff2e1465841130c197967b3a4d7 (4 commits); O1 diz bloqueados: sem dado real e tira a série das barras; O2 mostra Sem dado real na coluna Bloqueado; O5 mostra a nota e o rodapé bloqueio: sem dado real; BLOQUEADOS e a faixa Pede atenção já tratavam o estado; testes W1 a W5 verdes; web 1425 testes, typecheck e lint limpos; o E2E do desenho ficou para o QA. DECISÃO TÉCNICA (Jarvis): a entrega muda interface, então entra a revisão de interface (E1.7) antes do review, sem commit; o tech-lead a commita no começo do review (E1.4); depois o QA (E1.5) com o E2E; sem gatilho de segurança.
- O agente não abre, lê nem edita arquivos `.env*`.
- Regras invioláveis do CLAUDE.md: nada estimado; nenhuma métrica por pessoa.
- NÃO tocar: código, testes, o desenho, outros documentos, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c 'commit: 205052155dae9ff2e1465841130c197967b3a4d7' /home/rodrigoisensee/MetricasDSPD-052d/docs/ux/065-revisao-bloqueados.md` · espera: igual '1'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
Agente destino: forge:software-architect
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: develop   Base: develop   Base-sha: 2b316e5771f1c03de39e0808c165e18132689687
Etapa: codigo   Cobre: E1.1

## Objetivo
Desenho curto de como BLOQUEADOS sai do mapa real e como O1, O2 e O5 mostram a parte de bloqueio como Sem dado real (pedido 065, E1.1, K-205).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/064-lacunas-dado-real.md` (lacuna L1); na worktree de leitura `/home/rodrigoisensee/MetricasDSPD-056d` (develop atual): `server/src/` (origem.ts e o mapa de origem real, as métricas BLOQUEADOS, O1, O2 e O5), `packages/metricas/` e `web/src/` onde O1, O2 e O5 mostram bloqueio; a ADR 0026 em `/home/rodrigoisensee/MetricasDSPD-052b/docs/architecture/adr/0026-metricas-so-com-dado-real.md` (sem commit).

## Entregar
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." (E1.1)
- (E1) (E2) (E1.1) gravar `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-desenho.md` pela ferramenta Write, sem commit: arquivos e funções que mudam no server e no web, como BLOQUEADOS passa a responder Sem dado real (motivo próprio, como o O17), como O1, O2 e O5 marcam só a parte de bloqueio como sem dado sem esconder o resto, o contrato da API que muda (se mudar), os testes que provam, e o que volta quando o K-204 gravar bloqueios; dizer se o web precisa de mudança ou só o server.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- O agente não abre, lê nem edita arquivos `.env*`.
- Regras invioláveis do CLAUDE.md: nenhuma métrica por pessoa; todo cálculo pela biblioteca compartilhada; mudança de critério de cálculo é registrada com data e marcada nos gráficos (T2.6): dizer no desenho como isso se cumpre.
- Sem código: só o desenho.
- NÃO tocar: código, testes, a worktree (só leitura), outros documentos, o `CLAUDE.md`, os arquivos `.env*` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c 'O5' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-desenho.md` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
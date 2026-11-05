Agente destino: forge:react-frontend
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.3

## Objetivo
Ajustar os cartões O1, O2 e O5 do web ao contrato novo (parte de bloqueio Sem dado real) e enviar a branch do 065 (pedido 065, E1.3, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados` (commits locais 5eaf2a0, 9e3c1b6 e 9f63d22, sem push).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md` (parte do web e testes W1-W5 e E2E); `/home/rodrigoisensee/MetricasDSPD-052d/packages/contratos/src/origem.ts` e `schemas.ts` (o contrato novo); `web/src/features/operacional/components/CartaoO1.tsx`, `CartaoO2.tsx` e `fluxo.tsx`.

## Entregar
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." (E1.3)
- (E1) (E2) (E1.3) `git -C /home/rodrigoisensee/MetricasDSPD-052d branch --show-current` deve dar `feature/065-bloqueados`; nos cartões O1, O2 e O5, a parte de bloqueio mostra Sem dado real quando a nota bloqueio-sem-dado-real vem na resposta (null nunca vira 0), sem esconder o resto do cartão; testes W1-W5 do desenho; `pnpm run typecheck` e lint verdes; vitest do web com no máximo 2 workers; commit com `Cartão: K-205`; push da branch inteira com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 08:14: E1.1 cumprida pelo software-architect: desenho em docs/analises/065-desenho.md (sem commit): BLOQUEADOS sai de METRICAS_ORIGEM_REAL com motivo próprio (packages/contratos/src/origem.ts); O1, O2 e O5 mantêm a fórmula e, só na base real, a parte de bloqueio vira null com a nota bloqueio-sem-dado-real (mecanismo de notas do O3, módulo novo server/src/modulos/metricas/parte-sem-dado.ts); contrato: bloqueados do O1 e horasBloqueio do O5 aceitam null, O1/O2/O5 ganham notas; web: CartaoO1, CartaoO2 e fluxo.tsx; T2.6 com a versão de critério criterio-2026-11-04-bloqueio-sem-dado-real; testes C1-C3, S1-S7, W1-W5 e E2E. Pergunta Q-065-1 ao dono (percentual de eficiência do O5 com tempo bloqueado contado como fila ou execução). A ADR 0026 precisa de linha de revisão citando o 065 quando for registrada. DECISÃO TÉCNICA (Jarvis): a implementação segue o desenho com o padrão dele para o O5 (percentual publicado com nota), que é reversível; a Q-065-1 vai ao dono na fila, e a resposta pode mudar só o O5. Worktree 052d (branch de docs do 063 já mesclada) recebe a branch feature/065-bloqueados a partir da origin/develop; back primeiro (contrato), front depois na mesma worktree.
- 2026-11-04 08:36: E1.2 entregue pelo node-backend em 3 commits locais na 052d (5eaf2a0 desenho, 9e3c1b6 contrato e server e testes e docs/api, 9f63d22 ajuste de tipo), sem push: o pre-push barrou porque o typecheck do web quebra em CartaoO1.tsx com bloqueados number|null (mensagem literal: pre-push: lint/typecheck falharam; corrija antes de enviar.); server 1622 testes com cobertura 100%, contratos 204 e metricas 1257 verdes; desvio: o mapa real fica com 18 ids (o desenho contou 20). DECISÃO TÉCNICA (Jarvis): a E1.3 (react-frontend) entra agora na mesma worktree em cima dos commits locais e envia a branch inteira; sem contornar o hook.
- O agente não abre, lê nem edita arquivos `.env*`.
- Não mexa no server nem no contrato; se o contrato precisar mudar, pare e relate.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: `server/`, `packages/`, a ADR 0026, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin feature/065-bloqueados` · espera: linhas=1
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052d/web && pnpm exec vitest run --maxWorkers=2` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
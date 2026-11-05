Agente destino: forge:node-backend
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.2

## Objetivo
Implementar no contrato e no server a saída de BLOQUEADOS do mapa real e a parte de bloqueio do O1, O2 e O5 como Sem dado real, pelo desenho (pedido 065, E1.2, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/065-desenho.md` (o desenho inteiro); no código, os arquivos que ele cita.

## Entregar
- "E1.2 (node-backend): implementação no server e testes." (E1.2)
- (E1) (E2) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052d status --short` vazio; `git -C /home/rodrigoisensee/MetricasDSPD-052d fetch origin develop`; `git -C /home/rodrigoisensee/MetricasDSPD-052d switch -c feature/065-bloqueados origin/develop --no-track`; copiar o desenho para `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md` e commitá-lo; implementar o contrato e o server conforme o desenho (origem.ts, parte-sem-dado.ts, notas, null nunca 0, versão de critério T2.6) com os testes C1-C3 e S1-S7 do desenho; cobertura do server em 100%; vitest com no máximo 2 workers; commits com `Cartão: K-205`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 08:14: E1.1 cumprida pelo software-architect: desenho em docs/analises/065-desenho.md (sem commit): BLOQUEADOS sai de METRICAS_ORIGEM_REAL com motivo próprio (packages/contratos/src/origem.ts); O1, O2 e O5 mantêm a fórmula e, só na base real, a parte de bloqueio vira null com a nota bloqueio-sem-dado-real (mecanismo de notas do O3, módulo novo server/src/modulos/metricas/parte-sem-dado.ts); contrato: bloqueados do O1 e horasBloqueio do O5 aceitam null, O1/O2/O5 ganham notas; web: CartaoO1, CartaoO2 e fluxo.tsx; T2.6 com a versão de critério criterio-2026-11-04-bloqueio-sem-dado-real; testes C1-C3, S1-S7, W1-W5 e E2E. Pergunta Q-065-1 ao dono (percentual de eficiência do O5 com tempo bloqueado contado como fila ou execução). A ADR 0026 precisa de linha de revisão citando o 065 quando for registrada. DECISÃO TÉCNICA (Jarvis): a implementação segue o desenho com o padrão dele para o O5 (percentual publicado com nota), que é reversível; a Q-065-1 vai ao dono na fila, e a resposta pode mudar só o O5. Worktree 052d (branch de docs do 063 já mesclada) recebe a branch feature/065-bloqueados a partir da origin/develop; back primeiro (contrato), front depois na mesma worktree.
- O agente não abre, lê nem edita arquivos `.env*` e não chama as APIs externas.
- Regras invioláveis do CLAUDE.md: todo cálculo pela biblioteca compartilhada; mudança de critério registrada com data (T2.6); nenhuma métrica por pessoa.
- O web fica para a etapa do front: se o tipo novo quebrar a compilação do web, relate sem mexer em `web/`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes; test:pg e pronto ficam com o dono.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: `web/`, a ADR 0026, outros documentos, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (push): `git -C /home/rodrigoisensee/MetricasDSPD-052d ls-remote origin feature/065-bloqueados` · espera: linhas=1
- PQ-2 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052d/server && pnpm exec vitest run --maxWorkers=2 --coverage tests` · espera: rc=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
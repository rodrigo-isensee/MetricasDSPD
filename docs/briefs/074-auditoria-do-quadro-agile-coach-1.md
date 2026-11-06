Agente destino: forge:agile-coach
Pedido: 074-auditoria-do-quadro
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.1

## Objetivo
Levantar o estado real de cada cartão do `KANBAN.md` fora da coluna Pronto, porque o quadro ficou parado com entregas já mescladas (ex.: K-219, K-208 a K-210), para o Jarvis acertá-lo (pedido 074, E1.1). Só leitura, na cópia principal `/home/rodrigoisensee/Metricas/MetricasDSPD`.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/KANBAN.md`: as colunas antes de `## Pronto` (as linhas `| K-` delas).
- Para cada cartão, só a prova necessária: a linha final do `## Histórico` do pedido citado (`docs/pedidos/<NNN>-*.md`, com `tail`), `git log origin/develop --oneline --grep <K-ou-pedido>` e, quando citar PR, `gh pr view <n> --json state,mergedAt` (precisa de `github.com` e `api.github.com` em `allowed_domains`); nunca o pedido inteiro.

## Entregar
- "E1.1 (agile-coach): levantamento só leitura, sem editar o KANBAN.md, gravado em docs/kanban/auditoria-2026-11-06.md, sem commit." (E1.1)
- (E1) (E1.1) Em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/auditoria-2026-11-06.md`, gravado pela ferramenta Write, sem commit: uma tabela com uma linha por cartão fora de Pronto: ID, coluna atual, estado real (entregue, encerrado sem código, aberto, esperando o dono, duplicado), prova (PR e data de merge, commit ou linha do pedido) e coluna proposta.
- (E2) (E1.1) No mesmo arquivo, uma seção com os cartões duplicados, sem dono ou que só fecham com decisão do dono, cada um com o motivo; não decida regra de negócio nem prioridade.

## Decisões e restrições
- O pedido não tem linha `DECISÃO DO DONO`.
- Erro recorrente deste destino (forge-check, 30 dias): escopo em 3 entregas · evita: cada item do Entregar cita a etapa `(E<n>)` do pedido; só corta com a marca de corte (R-BRIEF, R-DECISAO)
- Erro recorrente deste destino (forge-check, 30 dias): decisao em 3 entregas · evita: grave a decisão no pedido antes do brief; o `brief gerar` copia as linhas de decisão do dono (R-BRIEF)
- Erro recorrente deste destino (forge-check, 30 dias): base em 2 entregas · evita: gere o brief de novo com `--branch`, para o Base-sha real (BRIEF-BASE-ATUAL)
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar.
- NÃO tocar: o `KANBAN.md`, `docs/kanban/historico.md`, os pedidos, código, o `CLAUDE.md`, as worktrees, a `develop`, a `homolog` e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- (o pedido não tem outra etapa)

## Pronto quando
- PQ-1 (arquivo): `test -e /home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/auditoria-2026-11-06.md` · a tabela existe com uma linha por cartão fora de Pronto

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).

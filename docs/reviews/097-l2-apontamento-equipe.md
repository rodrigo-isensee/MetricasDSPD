---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l2-apontamento-equipe
commit: 5f4a8f3bad853d083d9cc8c1b68d2302ee9a6043
parecer: aprovado
revisor: tech-lead
data: 2026-11-11
---

# Code review: 097 L2, equipe no Apontamento (parte servidor), volta 2

Revalidação pelo delta `18424b56..5f4a8f3b`. No código, o delta só mexe em dois testes: `server/tests/apontamento-rota.pg.test.ts` (+24) e `server/tests/times-sem-comparacao.test.ts` (+6/-1). Nenhum arquivo de `src/` mudou. Por isso a leitura da volta 1 (`18424b56`, parecer aprovado) continua valendo para o código. O QA já revalidou este mesmo commit (`f1b84f5f`, `docs/qa/097-l2-apontamento-equipe.md`, aprovado), e a segurança está aprovada na volta 1 (`docs/security/097-l2-apontamento-equipe.md`). Como o delta não toca GRANT nem dado de pessoa, não refiz a segurança.

## Execução (`VITEST_MAX_WORKERS=2`, sem `.env`, sem base real)
- `server`: `tests/times-sem-comparacao.test.ts` e `tests/apontamento-rota.test.ts`: `Test Files 2 passed (2)`, `Tests 89 passed (89)`.
- `eslint` nos dois testes tocados e `tsc --noEmit` do `server` passam sem saída.
- `apontamento-rota.pg.test.ts` roda no job banco do CI e não rodou aqui.

## Leitura do delta
- **A1 fechado.** O caso novo do `.pg` grava três eventos `incompleto` em `ctl_apontamento_cobertura`, para FILHO (Time Alfa), OUTRO (Time Beta) e SOLTO (sem time e sem pai), todos com horas em maio de 2031. Depois confere `registroIncompleto.cards` em cinco consultas: sem filtro dá os 3, `time-alfa` dá FILHO, `time-beta` dá OUTRO, `sem-time` dá SOLTO e o slug inexistente dá `[]`. Assim, ponta a ponta, ficam provados o `ANY('{}')` (lista vazia com filtro ativo zera, nunca "todos") e o ramo `IS NULL` do "sem time", que antes só tinham prova pelos parâmetros. O estado atual é lido por `DISTINCT ON (card_id) ... ORDER BY cobertura_sk DESC` (`repositorio.ts:181`). O `finally` grava `completo` para os três, o que respeita o append-only e não vaza para os outros casos. A resposta é validada por `respostaApontamentoSchema.parse`.
- **A3 fechado.** A contagem de `equipe` no texto saiu. Ficou a proibição dos nomes de agrupamento (`porEquipe|porTime|matrizEquipe`), que é ausência de texto e continua válida porque o contrato não traz esses nomes. Entrou a prova pelo schema: o slug é aceito, a lista com `sem-time` é aceita, o rótulo com espaço é recusado, `porEquipe` é recusado pela consulta `.strict()` (`packages/contratos/src/apontamento.ts:153`) e 51 times são recusados pelo teto `lista(idEquipe, 50)` (`:143`). São asserções de comportamento, não leitura da fonte.
- **A2 continua para o PR.** O delta acrescenta 30 linhas de teste. O corpo do PR do lote (E3.4) deve trazer `teto: excedido, <n> linhas, um recorte que cruza contrato, biblioteca, servidor e GRANT`, com o `<n>` medido por `git diff --numstat --no-renames origin/develop...HEAD` na hora do PR.
- **Commits:** `5f4a8f3b` é um commit só, `test(apontamento): ...`, com a mensagem clara.

## Achados
- A2 (recomendado) server/src/modulos/apontamento/servico.ts:1 · acima de 150 linhas de código e teste (195 na volta 1, mais 30 de teste nesta volta): o PR do lote declara `teto: excedido, <n> linhas, <motivo>` medido na hora do PR.

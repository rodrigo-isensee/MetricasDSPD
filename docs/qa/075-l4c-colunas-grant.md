---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l4c-colunas-grant
commit: 17b66fc8e926ee27bc692f065c1f645d17457ea6
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-09
---
# QA: 075-bloqueios-reais, lote 4c (colunas e GRANT de bloqueio, K-204), revalidação

Revalidação incremental depois dos merges da develop e da correção do bloco duplicado. Parecer anterior: e720eeed (e antes ea3b51b5, completo). Head testado: 17b66fc8. Review incremental aprovado.

## Delta e720eeed..17b66fc8

`git diff --name-only e720eeed 17b66fc8` não toca nenhum arquivo do 4c nem do 4b: sem diferença em `server/tests/bloqueio-colunas-grant*`, `projetor*`, `grants.ts`, `lgpd.ts`, `allow-list.ts`, `coleta.ts`, `server/migrations` e `packages/contratos`. Os arquivos do 4c e do 4b seguem iguais aos de e720eeed. O que mudou no servidor veio da develop (6a): `server/src/modulos/metricas/servico.ts`, `parte-sem-dado.ts`, `packages/metricas/src/core/criterios.ts` e `server/tests/corte-serie-o1-075.test.ts`; o resto é web, scripts de lint e docs de outros pedidos.

## Critério → teste → resultado

Os critérios não mudaram; o mapa do parecer completo segue valendo. Evidência desta rodada:

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| CA-075-4 e CA-075-5 (colunas e GRANT) | `bloqueio-colunas-grant.test.ts` | migração nova sobre `evt_bloqueio` e `fato_bloqueio`; papel da API | verde no head |
| DT (3) e (4), projetor | `projetor-businessmap.test.ts` | vigência de `ref_coluna`; filtro `tipo = 'inicio'` e motivo | verde no head |
| integração com a base (6a) | `corte-serie-o1-075.test.ts` | série do O1 com a marca de critério | verde no head; o 4c não quebra |
| SEG-A4, CA-075-1, CA-075-5 no banco | `.pg` do lote | lista exata de colunas; marcador fora de `stg_*`; `42501` | CI banco verde no head |

## Execução

`npx vitest run --maxWorkers=2` em `server/` sobre `bloqueio-colunas-grant.test.ts`, `projetor-businessmap.test.ts` e `corte-serie-o1-075.test.ts`: 3 arquivos, 24 testes, todos passam. CI do head: run 42617957228, `headSha` 17b66fc8e926ee27bc692f065c1f645d17457ea6, `completed` e `success`; jobs `banco`, `testes`, `seguranca`, `build`, `openapi` e `filtro` em `success` (`e2e`, `perf` e `e2e-parte` `skipped` pela configuração do fluxo). Suíte inteira não rodada (instrução da delegação).

## Vermelho antes do verde e mutação

Sem teste novo nesta rodada; a prova do parecer anterior (mutantes G1, G2, G3, S1, M5, M6, M11 e M13 reprovados) vale, porque os arquivos do 4c e do 4b não mudaram.

## Bugs

Nenhum.

## Achados
- A1 (recomendado) server/tests/bloqueio-colunas-grant.test.ts:7 · a regex do CA-075-4 não pega `ALTER TABLE ONLY`, `IF EXISTS` nem lista de tabelas; só o teste do catálogo no `.pg` cobre. Ampliar a regex quando o arquivo for tocado.
- A2 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:114 · a captura de saída do CA-075-1 espia só `process.stdout` e `process.stderr`; espiar também `console.log`, `console.warn` e `console.error`.
- A3 (recomendado) server/tests/projetor-bloqueio.pg.test.ts:135 · o caso que fecha confere só `duracao_horas_uteis` não nulo; fixar o valor pelo calendário do teste.

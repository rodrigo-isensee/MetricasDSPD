---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-o12-responsabilidade
commit: 1561e1b4010956b35837823b33bc9baccc588a70
parecer: aprovado
revisor: tech-lead
data: 2026-11-16
---

# Code review: O12 pela responsabilidade do atraso, campo 51 pelo value_id, E7.214 (revalidação E7.265)

Branch `feature/105-o12-responsabilidade`, head `1561e1b4` (volta 1 de `27453898`). A volta é o merge `243e489d` da `develop` (que agora traz o E7.203, `57989aa0`, #493) com o conflito do arquivo de domínio resolvido, e o merge `1561e1b4` da `develop` em `7d7ea285`. Diff contra a base `7d7ea285`: 18 arquivos, 301+ e 62-, dos quais código e teste 181 linhas (`git diff --numstat --no-renames 7d7ea285 1561e1b4`, fora `.md` e `.json`).

## Parecer
**Aprovado** no head `1561e1b4`. A1 e A2 da rodada anterior (head `27453898`) estão resolvidos; o delta não traz defeito novo.

## Achados

## Revalidação
- Delta lido: `forge-check parecer delta docs/reviews/105-o12-responsabilidade.md`, intervalo `27453898..1561e1b4`, sem o que veio da base. Arquivos do domínio no delta: CHANGELOG.md, docs/api/metricas.md, docs/architecture/fontes/businessmap-causa-raiz-carga.md, docs/architecture/fontes/businessmap-dominio.json, e2e/tests/b12-fluxo.spec.ts, packages/contratos/src/origem.ts e origem.test.ts, packages/metricas/src/businessmap/fixtures.cobertura.test.ts, server/src/modulos/businessmap/dominio-businessmap.ts, server/src/modulos/metricas/mapa.ts, server/tests/dominio-businessmap.test.ts, dominio-businessmap.pg.test.ts e metricas.mapa.test.ts. Fora o que é resolução do merge com a `develop` (régua de tamanho, E7.203), li o que toca A1, A2 e o campo 51.
- A1 resolvido: docs/architecture/fontes/businessmap-dominio.json:8 tem `afeta` `["O8","O14","O17"]`, com `descricao`, `motivo` e `referencia` cobrindo E7.102, E7.203 e E7.214 numa versão só. A `referencia` difere da que está na `develop`, então o `bm:ref-sync` registra versão nova, append-only, e a marca de O8, O14 e O17 não se perde. O O12 segue com a versão própria da biblioteca (`afeta` O12 e VISAO_GERAL). server/tests/dominio-businessmap.test.ts:51 confere `['O8','O14','O17']`.
- A2 resolvido: packages/metricas/src/businessmap/fixtures.cobertura.test.ts:198 chama `calcularO12(..., false)` com vencido classificado e espera `null`, o motivo e `sem-referencia`, e confere que o mesmo dado ligado publica a causa interna.
- Campo 51 no domínio: 3 opções (137 Interno, 138 Solicitante, 139 Terceiro) com o código de `RESPONSABILIDADES_ATRASO`; campo 42 continua fora (teste novo em server/tests/dominio-businessmap.test.ts:54). Teste pg: 3 campos, 45 linhas de campo e 465 no total, e o mapa da coleta liga 137 a 139.
- e2e OP-17 e B3-002 (e2e/tests/b12-fluxo.spec.ts) acompanham a mudança do texto do O12; rodam no CI do PR (no push, e2e fica `skipped`).

## Verificações
- Regras de ferramenta: suíte inteira fica para o CI do PR (sem PR nesta etapa); cito o pronto do autor do histórico do pedido e não afirmo CI verde do PR. CI do push do head `1561e1b4` (run 43915576101): build, rapida, banco, openapi, seguranca e imagem passaram; `testes` foi cancelado pelo push seguinte (parecer de segurança `14de9417`, só doc), e o run desse também (`2a55f7f1`, QA). O CI do código fica com o run do push deste parecer e com o do PR.
- Rodados aqui: `fixtures.cobertura.test.ts` (36 passaram). Mutante sem `comResponsabilidade &&` em packages/metricas/src/businessmap/o12.ts:76: morto (1 falha em 448 testes de `src/businessmap`).
- BusinessMap e Acelerato não se misturam; nenhuma métrica individual (campo 42 proibido no arquivo e no teste).
- Tamanho: 181 linhas de código e teste, acima da orientação de 150; o corpo do PR declara `teto: excedido, 181 linhas, <motivo>` (M14).

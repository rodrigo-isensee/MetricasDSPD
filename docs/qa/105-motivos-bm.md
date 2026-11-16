---
tipo: qa
contrato: 1
pedido: 105-melhorias-15-11
branch: feature/105-motivos-bm
commit: e0fb925f66e710efcd3f150b4385710a87c16407
parecer: reprovado
resultado: reprovado; dois bloqueantes (CI do head vermelho em build e banco) e um recomendado
escopo: completo
bugs_criticos: 0
bugs_altos: 2
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-16
---
# QA: motivos de bloqueio do BusinessMap (pedido 105, E7.184 e E7.210, etapa E7.230)

Head testado: e0fb925f (o `Revisar-sha` do brief, fa1e83e6, é o pai; o E7.210 acrescentou o id 14 e `MOTIVOS_FORNECEDOR`). Diff conferido contra a base 0c989148 (46 arquivos). Decisão B do dono (11 motivos habilitados, ids 1 a 3, 6, 7, 9 a 14), decisão A do T10 (motivos 11 e 14), T12 sem motivo de ida e volta até o dono decidir.

## Critério → teste → resultado

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| MOTIVOS_BLOQUEIO com os 11 habilitados | `contratos/src/motivo-nao-classificado.test.ts`, `server/tests/dominio-motivo-bloqueio.test.ts` | enum fechado, nunca texto livre | passou local |
| Mapa `motivo_bloqueio` preenchido (ids 1-3, 6, 7, 9-14) | `server/tests/dominio-businessmap.pg.test.ts` (linha 66) | contagem de linhas gravadas | **falhou no CI**: `expected 381 to be 370` (A1) |
| "não classificado" para id sem mapa ou nulo | `projetor-bloqueio.pg.test.ts`, `projetor-businessmap.test.ts` | id ausente, nulo | passou local (projetor-businessmap); pg: só o do 66 caiu |
| Teste do projetor com o 14, no CI (banco) | `projetor-bloqueio.pg.test.ts`, caso `E7.210` | id 14 → `Aguardando fornecedor` | existe e roda no job `banco`; o job está vermelho só pelo A1 |
| MOTIVOS_FORNECEDOR = Aguardando fornecedor + Dependência Externa | `packages/mock` (gerador), `bloqueios.test.ts` | lista única | passou local; ver A3 (T10 real não a consome) |
| Versão de critério afeta BLOQUEADOS, O2, O19, T10, T12 | `criterios.ts` (`VERSAO_CRITERIO_MOTIVOS_BLOQUEIO_BM`) | marca no gráfico (T2.6) | presente em `VERSOES_DA_BIBLIOTECA` |
| Nota no briefing; contrato INCOMPATÍVEL | `docs/briefing-execucao-metricas.md`, OpenAPI, snapshots | enum de O2, BLOQUEADOS, O19 | presentes; a decisão do §2 é do arquiteto (E7.231) |
| T12 com `MOTIVOS_IDA_E_VOLTA` vazio | `t12.test.ts` | (a) não conta nada, só (b) vale | passou local (35 linhas novas) |
| Hash da base mock (gate do autor) | `pnpm --filter @metricas-dspd/e2e run gate` | base determinística | **falhou**: referência não regravada (A2) |

## Execução

- Local (`--maxWorkers=2`, e0fb925f): `bloqueios.test.ts`, `t12.test.ts`, `motivo-nao-classificado.test.ts`, `dominio-motivo-bloqueio.test.ts`, `projetor-businessmap.test.ts`: 5 arquivos, 80 de 80.
- Gate local: `FALHOU: difere em hashBase, hashBusinessMap (antes: b6a3c384, 8d47d431; agora: 88a5c095, 08e2b5e2)`; "GATE DO AUTOR: REPROVADO (hash da base mock (vs fase A))".
- CI do head, run 43893195688 (push): `build` X (passo Gate), `banco` X (`test:pg`, um teste), `openapi`, `imagem`, `rapida`, `seguranca` ✓; `testes` ainda em andamento na consulta; `e2e` e `perf` não rodam em push. Sem PR, a suíte inteira e o check `bateria` ficam para o CI do PR; este parecer não afirma CI verde.
- Vermelho antes do verde: o único teste novo de regra é o caso `E7.210` do `projetor-bloqueio.pg.test.ts` (banco, não roda local sem Postgres); o `forge-testes --vermelho` não foi rodado, por depender do banco e da CI. Pendente na revalidação.

## Achados

- A1 (bloqueante) server/tests/dominio-businessmap.pg.test.ts:66 · `expect(esperadas).toBe(370)` não foi atualizado: com os 11 motivos do mapa são 381 linhas; o job `banco` do CI está vermelho (`expected 381 to be 370`). Corrigir para 381 (ou derivar do mapa).
- A2 (bloqueante) docs/qa/evidencias/hash-base-fase-a.json:1 · o gerador do mock mudou (motivos do BusinessMap, `MOTIVOS_FORNECEDOR`), os hashes em `mock.test.ts` foram regravados (88a5c095, 733df187), mas a referência do gate não: o passo Gate do `build` falha. Regravar (`hash-base --salvar`, `docs/qa/gate-do-autor.md`) com a nota `hash-base-fase-a.nota.md`.
- A3 (recomendado) packages/metricas/src/businessmap/t10.ts:13 · a decisão A manda o T10 contar os motivos 11 e 14, mas ele segue por fornecedor informado, de qualquer motivo; MOTIVOS_FORNECEDOR só o mock lê. Confirmar se o consumo fica no PR 487 e registrar.
- A4 (recomendado) packages/metricas/src/core/criterios.ts:142 · a descrição da versão de critério, o CHANGELOG, a nota do briefing e a `regra` de `businessmap-dominio.json` dizem "10 motivos, ids 1 a 3, 6, 7 e 9 a 13", mas o enum e o mapa têm 11 (com o id 14). Texto datado e publicado nos gráficos diverge do critério.

## Bugs

- Sem arquivo em `docs/qa/bugs/`: os dois defeitos são de teste e de referência, resolvidos nos achados A1 e A2.
